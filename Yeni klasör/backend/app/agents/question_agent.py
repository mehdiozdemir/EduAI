from typing import Dict, Any, List
from app.agents.base_agent import BaseAgent
from app.core.langchain_integration import langchain_integration
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class QuestionAgent(BaseAgent):
    """Agent responsible for generating educational questions"""
    
    def __init__(self):
        super().__init__(
            name="Question Agent",
            description="Generates customized educational questions based on subject, topic, and education level"
        )
        self._question_generator = langchain_integration
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate questions based on input parameters"""
        subject = input_data.get("subject")
        topic = input_data.get("topic")
        difficulty = input_data.get("difficulty", "medium")
        count = input_data.get("count", 5)
        education_level = input_data.get("education_level", "lise")
        
        try:
            # Use existing question generation logic
            questions = await self._question_generator.generate_questions(
                subject=subject,
                topic=topic,
                difficulty=difficulty,
                count=count,
                education_level=education_level
            )
            
            return {
                "status": "success",
                "agent": str(self.name),
                "data": questions.dict() if hasattr(questions, 'dict') else questions
            }
        except Exception as e:
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
    
    async def evaluate_answer(self, question: str, correct_answer: str, user_answer: str) -> Dict[str, Any]:
        """Evaluate user's answer"""
        try:
            evaluation = self._question_generator.evaluate_answer(
                question=question,
                correct_answer=correct_answer,
                user_answer=user_answer
            )
            
            return {
                "status": "success",
                "agent": str(self.name),
                "data": evaluation
            }
        except Exception as e:
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
