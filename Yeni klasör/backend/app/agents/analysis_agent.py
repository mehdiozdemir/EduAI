from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser

class WeaknessAnalysis(BaseModel):
    """Weakness analysis result"""
    weakness_level: int = Field(..., description="Weakness level from 0-10")
    weak_topics: List[str] = Field(..., description="List of weak topics")
    strong_topics: List[str] = Field(..., description="List of strong topics")
    recommendations: List[str] = Field(..., description="Recommendations for improvement")
    detailed_analysis: str = Field(..., description="Detailed analysis of performance")

class AnalysisAgent(BaseAgent):
    """Agent responsible for analyzing student weaknesses"""
    
    def __init__(self):
        super().__init__(
            name="Analysis Agent",
            description="Analyzes student performance and identifies weaknesses"
        )
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze student performance data"""
        performance_data = input_data.get("performance_data", {})
        subject = input_data.get("subject", "Unknown")
        topic = input_data.get("topic", "Unknown")
        education_level = input_data.get("education_level", "lise")
        
        # Create parser for structured output
        parser = PydanticOutputParser(pydantic_object=WeaknessAnalysis)
        format_instructions = parser.get_format_instructions()
        
        # Create analysis prompt
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "Sen bir eğitim uzmanısın ve öğrenci performansını analiz ediyorsun."),
            ("human", """
Öğrenci performansını analiz et:

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

Bu verilere dayanarak:
1. Öğrencinin zayıflık seviyesini belirle (0-10, 10 en zayıf)
2. Zayıf olduğu konuları listele
3. Güçlü olduğu konuları listele
4. İyileştirme için öneriler sun
5. Detaylı performans analizi yap

{format_instructions}
""")
        ])
        
        try:
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
                "format_instructions": format_instructions
            })
            
            return {
                "status": "success",
                "agent": str(self.name),
                "data": analysis_result.dict()
            }
        except Exception as e:
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
    
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
