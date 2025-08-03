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
@router.get("/exam-types", response_model=List[dict])
async def get_exam_types(db: Session = Depends(get_db)):
    """Mevcut sınav türlerini listele"""
    exam_agent = ExamAgent()
    return exam_agent.get_exam_types(db)

@router.get("/exam-types/{exam_type_id}/sections", response_model=List[dict])  
async def get_exam_sections(exam_type_id: int, db: Session = Depends(get_db)):
    """Sınav türüne ait bölümleri getir"""
    exam_agent = ExamAgent()
    return exam_agent.get_exam_sections(db, exam_type_id)

@router.get("/sections/{section_id}/questions", response_model=List[dict])
async def get_section_questions(section_id: int, db: Session = Depends(get_db)):
    """Bölüme ait soruları getir"""
    exam_agent = ExamAgent()
    return exam_agent.get_section_questions(db, section_id)

# ========== PRACTICE EXAM ==========
@router.post("/practice-exam/start", response_model=dict, status_code=201)
async def start_practice_exam(
    exam_data: PracticeExamCreate,
    use_existing: bool = True,  # Varsayılan: mevcut examlardan seç
    force_new: bool = False,    # Zorla yeni exam üret
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deneme sınavı başlat - Mevcut examlardan rastgele seç veya yeni üret"""
    exam_agent = ExamAgent()
    return exam_agent.start_practice_exam(db, current_user.id, exam_data, use_existing, force_new)

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

@router.get("/practice-exam/{exam_id}/results")
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

@router.get("/practice-exam/{exam_id}/details", response_model=dict)
async def get_practice_exam_details(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Detaylı sınav bilgisi al"""
    exam_agent = ExamAgent()
    return exam_agent.get_practice_exam_details(db, exam_id, current_user.id)

@router.get("/practice-exam/{exam_id}/questions", response_model=List[dict])
async def get_practice_exam_questions(
    exam_id: int,
    include_answers: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sınavdaki soruları getir (cevaplar dahil edilebilir)"""
    exam_agent = ExamAgent()
    return exam_agent.get_practice_exam_questions(db, exam_id, current_user.id, include_answers)

@router.get("/statistics", response_model=dict)
async def get_exam_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Kullanıcının sınav istatistiklerini al"""
    exam_agent = ExamAgent()
    return exam_agent.get_exam_statistics(db, current_user.id)

@router.get("/questions/search", response_model=List[dict])
async def search_questions(
    exam_type_id: int = None,
    section_id: int = None,
    difficulty_level: int = None,
    created_by: str = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Kriterlere göre soruları ara"""
    exam_agent = ExamAgent()
    return exam_agent.get_questions_by_criteria(
        db, exam_type_id, section_id, difficulty_level, created_by, limit
    )

@router.get("/practice-exam/{exam_id}/review", response_model=dict)
async def review_practice_exam(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tamamlanmış sınavı incele (soru-cevap detayları ile)"""
    exam_agent = ExamAgent()
    
    # Sınav detaylarını al
    exam_details = exam_agent.get_practice_exam_details(db, exam_id, current_user.id)
    
    # Eğer sınav tamamlanmışsa, soruları da cevapları ile al
    if exam_details.get("status") == "completed":
        questions_with_answers = exam_agent.get_practice_exam_questions(db, exam_id, current_user.id, include_answers=True)
        exam_details["detailed_questions"] = questions_with_answers
    else:
        exam_details["detailed_questions"] = []
        exam_details["message"] = "Sınav henüz tamamlanmamış, cevaplar görüntülenemez"
    
    return exam_details

@router.get("/user/exam-memory", response_model=dict)
async def get_user_exam_memory(
    subject: str = None,
    limit: int = 10,
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının sınav memory geçmişini getir"""
    from app.services.memory_service import memory_service
    
    try:
        # Sınav geçmişini al
        history = await memory_service.get_learning_history(
            user_id=str(current_user.id),
            subject=subject
        )
        
        # Memory'den sınav verilerini filtrele
        exam_memories = []
        for memory in history[:limit]:
            content = memory.get('memory', '')
            if 'Deneme Sınavı' in content or 'Sınav' in content or 'exam_completion' in str(memory.get('metadata', {})):
                exam_memories.append(memory)
        
        return {
            "status": "success",
            "data": {
                "user_id": current_user.id,
                "exam_history": exam_memories,
                "total_records": len(exam_memories),
                "subject_filter": subject
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "data": {
                "exam_history": [],
                "total_records": 0
            }
        }

@router.get("/user/exam-recommendations", response_model=dict)
async def get_user_exam_recommendations(
    current_topic: str = None,
    subject: str = None,
    current_user: User = Depends(get_current_user)
):
    """Kullanıcıya sınav geçmişine dayalı kişiselleştirilmiş öneriler getir"""
    from app.services.memory_service import memory_service
    
    try:
        # Kişiselleştirilmiş öneriler al
        recommendations = await memory_service.get_personalized_recommendations(
            user_id=str(current_user.id),
            current_topic=current_topic or "genel",
            subject=subject or "genel"
        )
        
        # Memory'den exam-specific bağlam al
        exam_context = await memory_service.get_personalized_context(
            user_id=str(current_user.id),
            query=f"sınav deneme {subject or ''} {current_topic or ''}",
            limit=5
        )
        
        return {
            "status": "success", 
            "data": {
                "user_id": current_user.id,
                "current_topic": current_topic,
                "subject": subject,
                "recommendations": recommendations,
                "exam_context": exam_context,
                "memory_available": len(exam_context) > 0
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "data": {
                "recommendations": {},
                "exam_context": []
            }
        }
