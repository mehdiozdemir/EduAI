from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionBase(BaseModel):
    topic_id: int
    content: str
    difficulty: DifficultyLevel

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(QuestionBase):
    pass

class QuestionInDBBase(QuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Question(QuestionInDBBase):
    pass

class UserAnswerBase(BaseModel):
    user_id: int
    question_id: int
    answer_content: str
    is_correct: int
    feedback: Optional[str] = None

class UserAnswerCreate(UserAnswerBase):
    pass

class UserAnswerUpdate(UserAnswerBase):
    pass

class UserAnswerInDBBase(UserAnswerBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserAnswer(UserAnswerInDBBase):
    pass

# Question Generation Schemas
class QuestionOption(BaseModel):
    """Single option for multiple choice questions"""
    letter: str = Field(..., description="Option letter (A, B, C, D)")
    text: str = Field(..., description="Option text")

class GeneratedQuestion(BaseModel):
    """Individual question with structured format"""
    question: str = Field(..., description="Question text")
    options: List[QuestionOption] = Field(..., description="Multiple choice options")
    correct_answer: str = Field(..., description="Correct option letter")
    explanation: str = Field(..., description="Explanation why this answer is correct")
    topic: str = Field(..., description="Specific subtopic this question covers")
    keywords: List[str] = Field(..., description="Key concepts tested")

class QuestionGenerationResponse(BaseModel):
    """Complete response for question generation"""
    subject: str = Field(..., description="Main subject")
    topic: str = Field(..., description="Topic requested")
    difficulty: str = Field(..., description="Difficulty level")
    questions: List[GeneratedQuestion] = Field(..., description="Generated questions")
