from typing import Dict, Any, List

from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_tavily import TavilySearch

from app.agents.base_agent import BaseAgent
from app.models.book_recommendation import BookRecommendationList
from app.models.book_recommendation import StockStatus, BookRecommendation

import aiohttp
from bs4 import BeautifulSoup
import asyncio


class BookAgent(BaseAgent):
    """Agent responsible for recommending books based on weak topics using Tavily search"""

    def __init__(self):
        super().__init__(
            name="Book Agent",
            description="Recommends relevant Turkish educational books using Tavily web search"
        )
        # Tavily search tool – ensure API key is supplied
        from app.core.config import settings

        self._api_key_available = bool(settings.TAVILY_API_KEY)
        
        if self._api_key_available:
            self._search_tool = TavilySearch(
                max_results=35,  # Daha fazla sonuç al
                topic="general",
                tavily_api_key=settings.TAVILY_API_KEY,
            )
        else:
            print("⚠️ TAVILY_API_KEY bulunamadı. BookAgent mock modda çalışacak.")
            self._search_tool = None

    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Return book recommendations structured as BookRecommendationList.

        Expected ``input_data`` keys:
        - ``weak_topics``: optional List[str] – topics the student is weak at.
        - ``search_query``: optional str – custom query override.
        - ``education_level``: optional str – descriptive education level (used for prompt context only).
        """
        weak_topics: List[str] = input_data.get("weak_topics", [])
        custom_query: str | None = input_data.get("search_query")
        education_level: str = input_data.get("education_level", "lise")

        try:
            # API key yoksa mock data döndür
            if not self._api_key_available:
                return self._get_mock_book_recommendations(weak_topics, education_level)
            
            # -----------------------------
            # 1. Build multiple search queries for better coverage
            # -----------------------------
            search_queries = []
            
            if custom_query:
                search_queries.append(custom_query)
            else:
                # Education level mapping
                level_terms = {
                    "lise": ["lise", "yks", "tyt", "ayt"],
                    "ortaokul": ["ortaokul", "8. sınıf", "lgs"],
                    "ilkokul": ["ilkokul", "matematik temeli"]
                }
                
                level_keywords = level_terms.get(education_level.lower(), ["lise"])
                
                # Create multiple targeted queries
                if weak_topics:
                    for topic in weak_topics[:3]:  # İlk 3 zayıf konu için
                        for level_keyword in level_keywords[:3]:  # İlk 3 seviye terimi için
                            # Çeşitli arama kombinasyonları
                            search_queries.append(f"{topic} {level_keyword} soru bankası Trendyol")
                            search_queries.append(f"{topic} {level_keyword} konu anlatımı kitap Trendyol")
                            search_queries.append(f"{topic} {level_keyword} test kitabı Trendyol")
                            search_queries.append(f"{topic} {level_keyword} deneme sınavı Trendyol")
                
                # Ek genel aramalar
                main_topic = weak_topics[0] if weak_topics else "matematik"
                search_queries.append(f"{main_topic} kitap önerisi Trendyol")
                search_queries.append(f"{main_topic} kaynak kitap Trendyol")
                search_queries.append(f"{main_topic} kurs kitabı Trendyol")

            # -----------------------------
            # 2. Execute multiple Tavily searches and combine results
            # -----------------------------
            all_search_results = []
            used_queries = []
            
            for query in search_queries[:6]:  # Maksimum 6 farklı arama
                try:
                    tavily_response = self._search_tool.invoke({"query": query})
                    search_results = tavily_response.get("results", [])
                    all_search_results.extend(search_results)
                    used_queries.append(query)
                    
                    # Rate limiting için kısa bekleme
                    await asyncio.sleep(0.5)
                except Exception as e:
                    print(f"Search failed for query '{query}': {e}")
                    continue

            # Remove duplicates based on URL
            seen_urls = set()
            unique_results = []
            for result in all_search_results:
                url = result.get("url", "")
                if url not in seen_urls:
                    seen_urls.add(url)
                    unique_results.append(result)

            # Keep only Trendyol product URLs and expand to 8 results
            trendy_results = [
                item for item in unique_results
                if ("-p-" in item.get("url", "") or "/pd/" in item.get("url", ""))
            ]
            
            if len(trendy_results) > 8:
                trendy_results = trendy_results[:8]  # En fazla 8 kitap
            
            if not trendy_results:
                # still if empty return graceful
                return {
                    "status": "success",
                    "agent": "Book Agent",
                    "data": {
                        "recommendations": [],
                        "search_query": " | ".join(used_queries),
                        "search_summary": f"Arama yapıldı ama {education_level} seviyesinde uygun kitap bulunamadı.",
                        "total_found": 0,
                    },
                }

            # -----------------------------
            # 3. Feed search results to LLM for structured parsing
            # -----------------------------
            parser = PydanticOutputParser(pydantic_object=BookRecommendationList)
            format_instructions = parser.get_format_instructions()
            escaped_format_instructions = format_instructions.replace("{", "{{").replace("}", "}}")

            # Prepare prompt messages
            prompt_template = ChatPromptTemplate.from_messages([
                (
                    "system",
                    (
                        "Sen bir kitap öneri asistanısın. Tavily arama sonuçlarını kullanarak "
                        "öğrencinin zayıf olduğu konulara yönelik Trendyol kitap linkleri öner. "
                        "Yalnızca Trendyol ürün sayfası URL'lerini kullan (\"-p-\" veya '/pd/' içerir). "
                        "Her öneri BookRecommendation şemasına tam uymalı. "
                        "Özellikle \"description\" alanı 400 karakteri ASLA geçmemeli. "
                        "MÜMKÜİN OLDUĞUNCA ÇOK KİTAP ÖNERİSİ YAPMAYA ÇALIŞ (minimum 6-8 adet). "
                        "MUTLAKA 'url' alanını doldur - bu alan boş OLMAMALI!"
                    ),
                ),
                (
                    "human",
                    (
                        "Eğitim Seviyesi: {education_level}\n"
                        "Zayıf Konular: {weak_topics}\n"
                        "Arama Sorgusu: {query}\n"
                        "\n"
                        "Tavily Sonuçları (title | url):\n{search_results}\n"
                        "\n"
                        "ÖNEMLİ: Her kitap için 'url' alanına mutlaka Trendyol URL'sini koy! "
                        "URL boş olmamalı, tam Trendyol ürün linkini içermeli. "
                        "\n"
                        f"{escaped_format_instructions}"
                    ),
                ),
            ])

            # Build a string representation for search results (title | url)
            formatted_results = "\n".join(
                f"- {item.get('title', '[no-title]')} | {item.get('url')}" for item in trendy_results
            )

            # Chain execution
            chain = prompt_template | self.llm | parser
            try:
                recommendations: BookRecommendationList = await chain.ainvoke(
                    {
                        "education_level": education_level,
                        "weak_topics": ", ".join(weak_topics) if weak_topics else "Genel",
                        "query": query,
                        "search_results": formatted_results,
                    }
                )

                # -----------------------------
                # 4. Perform real-time stock check and update recommendations
                # -----------------------------
                updated_recs = await self._update_stock_info(recommendations.recommendations)

                available_recs = [r for r in updated_recs if r.stock_status == StockStatus.AVAILABLE]

                return {
                    "status": "success",
                    "agent": "Book Agent",
                    "data": {
                        **recommendations.model_dump(),  # Updated to model_dump()
                        "recommendations": [rec.model_dump() for rec in available_recs],  # Updated to model_dump()
                        "total_found": len(available_recs),
                    },
                }
            except Exception:
                # Fallback if parsing fails – return unstructured but useful info
                return {
                    "status": "success",
                    "agent": "Book Agent",
                    "data": {
                        "recommendations": [],
                        "search_query": query,
                        "total_found": len(search_results),
                        "note": "Structured parse failed; please refine your query.",
                    },
                }
        except Exception as e:
            # Graceful error handling
            return {
                "status": "error",
                "agent": "Book Agent",
                "error": str(e),
            }

    # -------------------------------------------------
    # Helper: Stock checking
    # -------------------------------------------------
    async def _update_stock_info(self, recs: List[BookRecommendation]) -> List[BookRecommendation]:
        async def _check(rec: BookRecommendation) -> BookRecommendation:
            try:
                async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
                    async with session.get(str(rec.url), headers={"User-Agent": "Mozilla/5.0"}) as resp:
                        html = await resp.text()
                        in_stock, conf = self._parse_stock(html)
                        rec.stock_status = StockStatus.AVAILABLE if in_stock else StockStatus.OUT_OF_STOCK
                        rec.stock_confidence = conf
                        rec.availability_note = (
                            "Stokta mevcut" if in_stock else "Ürün muhtemelen tükenmiş"
                        )
            except Exception:
                # On error mark as CHECK_REQUIRED
                rec.stock_status = StockStatus.CHECK_REQUIRED
                rec.stock_confidence = 3
                rec.availability_note = "Stok durumu doğrulanamadı, manuel kontrol önerilir"
            return rec

        return await asyncio.gather(*[_check(r) for r in recs])

    def _parse_stock(self, html: str) -> tuple[bool, int]:
        """Basic heuristics: returns (in_stock, confidence)"""
        soup = BeautifulSoup(html, "lxml")
        text = soup.get_text(" ", strip=True).lower()
        # trend words
        if any(kw in text for kw in ["tükendi", "stokta yok", "satıcıdan temin edilemez","tükendi!","stoklar tükendi"]):
            return False, 9
        if "sepete ekle" in text or "sepete" in text or "satın al" in text:
            return True, 8
        return True, 5
