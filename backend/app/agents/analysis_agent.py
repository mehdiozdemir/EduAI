from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.services.memory_service import memory_service
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
import logging

logger = logging.getLogger(__name__)

class WeaknessAnalysis(BaseModel):
    """Weakness analysis result with personalization"""
    weakness_level: int = Field(..., description="Weakness level from 0-10")
    weak_topics: List[str] = Field(..., description="List of weak topics")
    strong_topics: List[str] = Field(..., description="List of strong topics")
    recommendations: List[str] = Field(..., description="Recommendations for improvement")
    detailed_analysis: str = Field(..., description="Detailed analysis of performance")
    personalized_insights: List[str] = Field(default=[], description="Personalized insights based on history")
    improvement_trend: str = Field(default="", description="Learning trend based on historical data")

class AnalysisAgent(BaseAgent):
    """Agent responsible for analyzing student weaknesses"""
    
    def __init__(self):
        super().__init__(
            name="Analysis Agent",
            description="Analyzes student performance and identifies weaknesses"
        )
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze student performance data with personalized memory"""
        performance_data = input_data.get("performance_data", {})
        subject = input_data.get("subject", "Unknown")
        topic = input_data.get("topic", "Unknown") 
        education_level = input_data.get("education_level", "lise")
        user_id = input_data.get("user_id", "anonymous")  # Kullanıcı ID'si eklendi
        
        try:
            # 1. Mem0'dan kişiselleştirilmiş bağlam al
            historical_context = await self._get_personalized_context(user_id, subject, topic)
            
            # 2. Mevcut performansı analiz et
            analysis_result = await self._analyze_current_performance(
                performance_data, subject, topic, education_level, historical_context
            )
            
            # 3. Mem0'a bu analizi kaydet
            await self._store_analysis_to_memory(user_id, analysis_result, subject, topic)
            
            # 4. Öğrenme seansını da kaydet
            await self._store_learning_session(user_id, performance_data, subject, topic, education_level)
            
            return {
                "status": "success",
                "agent": str(self.name),
                "data": analysis_result.model_dump()  # Updated to model_dump()
            }
            
        except Exception as e:
            logger.error(f"Error in personalized analysis: {e}")
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
    
    async def _get_personalized_context(
        self, 
        user_id: str, 
        subject: str, 
        topic: str
    ) -> Dict[str, Any]:
        """Kullanıcıya özel geçmiş performans verilerini al"""
        try:
            # Konu-specific hafıza ara
            topic_memories = await memory_service.get_personalized_context(
                user_id=user_id,
                query=f"{subject} {topic} performans zayıflık",
                limit=5
            )
            
            # Genel subject hafızası ara  
            subject_memories = await memory_service.get_personalized_context(
                user_id=user_id,
                query=f"{subject} öğrenme geçmiş",
                limit=3
            )
            
            # Genel öğrenme trendleri
            trend_memories = await memory_service.get_personalized_context(
                user_id=user_id,
                query="öğrenme trendi gelişim",
                limit=2
            )
            
            return {
                "topic_specific": topic_memories,
                "subject_general": subject_memories, 
                "learning_trends": trend_memories,
                "has_history": len(topic_memories) > 0 or len(subject_memories) > 0
            }
            
        except Exception as e:
            logger.error(f"Error getting personalized context: {e}")
            return {
                "topic_specific": [],
                "subject_general": [],
                "learning_trends": [],
                "has_history": False
            }
    
    async def _analyze_current_performance(
        self,
        performance_data: Dict[str, Any],
        subject: str,
        topic: str, 
        education_level: str,
        historical_context: Dict[str, Any]
    ) -> WeaknessAnalysis:
        """Mevcut performansı geçmiş verilerle birlikte analiz et"""
        
        # Create parser for structured output
        parser = PydanticOutputParser(pydantic_object=WeaknessAnalysis)
        format_instructions = parser.get_format_instructions()
        
        # Geçmiş bağlamı metne çevir
        history_text = self._format_historical_context(historical_context)
        
        # Create enhanced analysis prompt with historical context
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", """Sen bir yapay zeka destekli eğitim uzmanısın. 
            Öğrencinin mevcut performansını analiz ederken, geçmiş öğrenme verilerini de dikkate alıyorsun.
            Kişiselleştirilmiş ve gelişime odaklı analizler yapıyorsun."""),
            ("human", """
Öğrenci performansını kişiselleştirilmiş şekilde analiz et:

=== MEVCUT PERFORMANS ===
Ders: {subject}
Konu: {topic}
Eğitim Seviyesi: {education_level}

Performans Verisi:
- Toplam Soru: {total_questions}
- Doğru Cevap: {correct_answers}
- Yanlış Cevap: {incorrect_answers}
- Başarı Oranı: {success_rate}%

Detaylı Sorular ve Cevaplar:
{detailed_answers}

=== GEÇMİŞ ÖĞRENME VERİLERİ ===
{historical_context}

=== ANALİZ GÖREVİ ===
Bu verilere dayanarak kişiselleştirilmiş analiz yap:

1. Mevcut zayıflık seviyesini belirle (0-10, 10 en zayıf)
2. Zayıf ve güçlü konuları tespit et
3. Geçmiş performansla karşılaştırma yap
4. Kişiselleştirilmiş öneriler sun
5. Öğrenme trendini değerlendir (gelişiyor/sabit/geriliyor)
6. Kişiye özel içgörüler ver

{format_instructions}
""")
        ])
        
        # Calculate performance metrics
        total_questions = performance_data.get("totalQuestions", 0)
        correct_answers = performance_data.get("correctAnswers", 0)
        incorrect_answers = total_questions - correct_answers
        success_rate = (correct_answers / total_questions * 100) if total_questions > 0 else 0
        
        # Get detailed answers if available
        detailed_answers = performance_data.get("detailedAnswers", "Detaylı cevap verisi mevcut değil")
        
        # Create chain and invoke
        chain = prompt_template | self.llm | parser
        
        analysis_result = await chain.ainvoke({
            "subject": subject,
            "topic": topic,
            "education_level": education_level,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "incorrect_answers": incorrect_answers,
            "success_rate": success_rate,
            "detailed_answers": detailed_answers,
            "historical_context": history_text,
            "format_instructions": format_instructions
        })
        
        return analysis_result
    
    def _format_historical_context(self, context: Dict[str, Any]) -> str:
        """Geçmiş bağlam verilerini metinsel formata çevir"""
        if not context.get("has_history", False):
            return "Bu kullanıcı için geçmiş öğrenme verisi bulunmamaktadır. İlk kez analiz yapılıyor."
        
        formatted_text = "GEÇMİŞ ÖĞRENME VERİLERİ:\n\n"
        
        # Konu-specific hafıza
        if context.get("topic_specific"):
            formatted_text += "Bu Konudaki Geçmiş Performans:\n"
            for memory in context["topic_specific"][:3]:  # İlk 3 hafıza
                formatted_text += f"- {memory.get('memory', '')}\n"
            formatted_text += "\n"
        
        # Subject-general hafıza
        if context.get("subject_general"):
            formatted_text += "Bu Dersteki Genel Performans:\n"
            for memory in context["subject_general"][:2]:  # İlk 2 hafıza
                formatted_text += f"- {memory.get('memory', '')}\n"
            formatted_text += "\n"
        
        # Learning trends
        if context.get("learning_trends"):
            formatted_text += "Genel Öğrenme Eğilimleri:\n"
            for memory in context["learning_trends"][:2]:  # İlk 2 hafıza
                formatted_text += f"- {memory.get('memory', '')}\n"
        
        return formatted_text
    
    async def _store_analysis_to_memory(
        self,
        user_id: str,
        analysis: WeaknessAnalysis,
        subject: str,
        topic: str
    ) -> None:
        """Analiz sonucunu Mem0'a kaydet"""
        try:
            analysis_data = {
                "subject": subject,
                "topic": topic,
                "weakness_level": analysis.weakness_level,
                "weak_topics": analysis.weak_topics,
                "strong_topics": analysis.strong_topics,
                "recommendations": analysis.recommendations,
                "detailed_analysis": analysis.detailed_analysis,
                "personalized_insights": analysis.personalized_insights,
                "improvement_trend": analysis.improvement_trend,
                "timestamp": "current"  # timestamp eklenecek
            }
            
            await memory_service.store_weakness_analysis(user_id, analysis_data)
            logger.info(f"Analysis stored to memory for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing analysis to memory: {e}")
    
    async def _store_learning_session(
        self,
        user_id: str,
        performance_data: Dict[str, Any],
        subject: str,
        topic: str,
        education_level: str
    ) -> None:
        """Öğrenme seansını Mem0'a kaydet"""
        try:
            session_data = {
                "subject": subject,
                "topic": topic,
                "education_level": education_level,
                "total_questions": performance_data.get("totalQuestions", 0),
                "correct_answers": performance_data.get("correctAnswers", 0),
                "accuracy": (performance_data.get("correctAnswers", 0) / 
                           performance_data.get("totalQuestions", 1) * 100),
                "wrong_answers": performance_data.get("wrongAnswers", []),
                "difficult_topics": performance_data.get("difficultTopics", []),
                "timestamp": "current"  # timestamp eklenecek
            }
            
            await memory_service.store_learning_session(user_id, session_data)
            logger.info(f"Learning session stored to memory for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing learning session to memory: {e}")
    
    async def analyze_multiple_sessions(self, sessions_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance across multiple sessions"""
        try:
            prompt_template = ChatPromptTemplate.from_messages([
                ("system", "Sen bir eğitim uzmanısın ve öğrencinin birden fazla oturumdaki performansını analiz ediyorsun."),
                ("human", """
Öğrencinin birden fazla oturumdaki performansını analiz et:

Oturum Verileri:
{sessions_data}

Genel eğilimler, gelişim alanları ve öneriler sun.
""")
            ])
            
            chain = prompt_template | self.llm
            
            analysis = await chain.ainvoke({
                "sessions_data": str(sessions_data)
            })
            
            return {
                "status": "success",
                "agent": str(self.name),
                "data": {
                    "trend_analysis": analysis.content
                }
            }
        except Exception as e:
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
