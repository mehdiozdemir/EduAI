from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.core.langchain_integration import langchain_integration
from pydantic import BaseModel
from typing import List, Optional

# Evaluation request model
class EvaluateRequest(BaseModel):
    question: str
    correct_answer: str
    user_answer: str

router = APIRouter(
    prefix="/questions",
    tags=["questions"]
)

@router.post("/generate", response_model=schemas.QuestionGenerationResponse)
async def generate_questions(
    subject: str = Query(...),
    topic: str = Query(...),
    difficulty: str = Query(...),
    count: int = Query(5, ge=1, le=20, description="Number of questions to generate"),
    education_level: str = Query("high", description="Education level: middle, high, or university"),
    db: Session = Depends(get_db)
):
    try:
        # Generate questions using LangChain
        question_data = await langchain_integration.generate_questions(
            subject=subject,
            topic=topic,
            difficulty=difficulty,
            count=count,
            education_level=education_level
        )
        
        return question_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating questions: {str(e)}"
        )

@router.post("/", response_model=schemas.Question)
def create_question(question: schemas.QuestionCreate, db: Session = Depends(get_db)):
    # Check if topic exists
    db_topic = db.query(models.Topic).filter(models.Topic.id == question.topic_id).first()
    
    if not db_topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    # Create new question
    db_question = models.Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    return db_question

@router.get("/{question_id}", response_model=schemas.Question)
def get_question(question_id: int, db: Session = Depends(get_db)):
    db_question = db.query(models.Question).filter(models.Question.id == question_id).first()
    
    if not db_question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found"
        )
    
    return db_question

@router.post("/evaluate", response_model=dict)
def evaluate_answer(
    request: EvaluateRequest
):
    try:
        # Evaluate answer using LangChain
        evaluation = langchain_integration.evaluate_answer(
            question=request.question,
            correct_answer=request.correct_answer,
            user_answer=request.user_answer
        )
        
        return evaluation
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating answer: {str(e)}"
        )
