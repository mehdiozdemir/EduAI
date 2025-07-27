from typing import Dict, Any, List

from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_tavily import TavilySearch

from app.agents.base_agent import BaseAgent
from app.models.book_recommendation import BookRecommendationList


class BookAgent(BaseAgent):
    """Agent responsible for recommending books based on weak topics using Tavily search"""

    def __init__(self):
        super().__init__(
            name="Book Agent",
            description="Recommends relevant Turkish educational books using Tavily web search"
        )
        # Tavily search tool – ensure API key is supplied
        from app.core.config import settings

        if not settings.TAVILY_API_KEY:
            raise ValueError(
                "TAVILY_API_KEY is not set. Add it to your .env or environment variables "
                "so BookAgent can perform web searches."
            )

        self._search_tool = TavilySearch(
            max_results=15,
            topic="general",
            tavily_api_key=settings.TAVILY_API_KEY,
        )

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
            # -----------------------------
            # 1. Build a single search query
            # -----------------------------
            if custom_query:
                query = custom_query
            else:
                # Fallback to derived query from weak topics
                joined_topics = ", ".join(weak_topics[:3]) if weak_topics else "genel konu"
                query = f"{joined_topics} konu anlatımı soru bankası kitap Trendyol"

            # -----------------------------
            # 2. Execute Tavily search
            # -----------------------------
            tavily_response = self._search_tool.invoke({"query": query})  # type: ignore[arg-type]
            search_results: List[dict] = tavily_response.get("results", [])  # list[dict]

            # If no Trendyol product URLs found, try a fallback query pattern
            found_trendyol = any(
                ("-p-" in r.get("url", "") or "/pd/" in r.get("url", "")) for r in search_results
            )

            if not found_trendyol and weak_topics:
                fallback_query = f"{weak_topics[0]} soru bankası Trendyol"
                tavily_response2 = self._search_tool.invoke({"query": fallback_query})  # type: ignore[arg-type]
                search_results.extend(tavily_response2.get("results", []))

            # Keep only Trendyol product URLs and limit to first 3 for prompt brevity
            trendy_results = [
                item for item in search_results
                if ("-p-" in item.get("url", "") or "/pd/" in item.get("url", ""))
            ]
            if len(trendy_results) >= 3:
                trendy_results = trendy_results[:3]
            elif not trendy_results:
                # still if empty return graceful
                return {
                    "status": "success",
                    "agent": "Book Agent",
                    "data": {
                        "recommendations": [],
                        "search_query": query,
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
                        "Özellikle \"description\" alanı 400 karakteri ASLA geçmemeli."
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

                return {
                    "status": "success",
                    "agent": "Book Agent",
                    "data": recommendations.dict(),
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
