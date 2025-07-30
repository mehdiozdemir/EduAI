from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.agents.exam_agent import ExamAgent
from app.schemas.exam import (
    ExamType, ExamSection, ExamQuestion,
    PracticeExamCreate, PracticeExamResult
)
from app.models import exam as exam_models
from app.core.auth_deps import get_current_user
from app.models.user import User

router = APIRouter()

# ========== EXAM SYSTEM ==========
@router.get("/exam-types", response_model=List[ExamType])
async def get_exam_types(db: Session = Depends(get_db)):
    """Mevcut sınav türlerini listele"""
    exam_agent = ExamAgent()
    return exam_agent.get_exam_types(db)

@router.get("/exam-types/{exam_type_id}/sections", response_model=List[ExamSection])  
async def get_exam_sections(exam_type_id: int, db: Session = Depends(get_db)):
    """Sınav türüne ait bölümleri getir"""
    exam_agent = ExamAgent()
    return exam_agent.get_exam_sections(db, exam_type_id)

@router.get("/sections/{section_id}/questions", response_model=List[ExamQuestion])
async def get_section_questions(section_id: int, db: Session = Depends(get_db)):
    """Bölüme ait soruları getir"""
    exam_agent = ExamAgent()
    return exam_agent.get_section_questions(db, section_id)

# ========== PRACTICE EXAM ==========
@router.post("/practice-exam/start", response_model=dict, status_code=201)
async def start_practice_exam(
    exam_data: PracticeExamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deneme sınavı başlat"""
    exam_agent = ExamAgent()
    return exam_agent.start_practice_exam(db, current_user.id, exam_data)

@router.post("/quick-exam/{section_id}", response_model=dict, status_code=201)
async def start_quick_exam(
    section_id: int,
    question_count: int = 10,
    db: Session = Depends(get_db)
):
    """Hızlı deneme sınavı başlat (auth olmadan test için)"""
    exam_agent = ExamAgent()
    
    # Test kullanıcısı ID'si (geçici)
    test_user_id = 1
    
    exam_data = PracticeExamCreate(
        exam_section_id=section_id,
        question_count=question_count
    )
    
    return exam_agent.start_practice_exam(db, test_user_id, exam_data)

@router.post("/practice-exam/{exam_id}/submit")
async def submit_practice_exam(
    exam_id: int,
    answers: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deneme sınavını tamamla ve sonuçları al"""
    exam_agent = ExamAgent()
    return exam_agent.submit_practice_exam(db, exam_id, current_user.id, answers)

@router.post("/quick-exam/{exam_id}/submit")
async def submit_quick_exam(
    exam_id: int,
    answers: dict,
    db: Session = Depends(get_db)
):
    """Hızlı deneme sınavını tamamla (auth olmadan test için)"""
    exam_agent = ExamAgent()
    
    # Test kullanıcısı ID'si (geçici)
    test_user_id = 1
    
    return exam_agent.submit_practice_exam(db, exam_id, test_user_id, answers)

@router.get("/practice-exam/{exam_id}/results", response_model=PracticeExamResult)
async def get_exam_results(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sınav sonuçlarını getir"""
    exam_agent = ExamAgent()
    return exam_agent.get_exam_results(db, exam_id, current_user.id)

@router.get("/user/practice-exams", response_model=List[dict])
async def get_user_exams(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının sınavlarını listele"""
    exam_agent = ExamAgent()
    return exam_agent.get_user_exams(db, current_user.id)
