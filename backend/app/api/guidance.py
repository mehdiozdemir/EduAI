from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.auth_deps import get_current_user
from app.models.user import User
from app.services.ai_guidance_service import ai_guidance_service
from pydantic import BaseModel
from typing import Optional

router = APIRouter(
    prefix="/guidance",
    tags=["ai-guidance"]
)

class GuidanceRequest(BaseModel):
    question: str

class QuestionResultRequest(BaseModel):
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    subject: str
    topic: str
    difficulty: Optional[str] = "orta"
    education_level: Optional[str] = "lise"

@router.post("/ask", response_model=dict)
async def ask_guidance(
    request: GuidanceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI rehberden kişiselleştirilmiş rehberlik al
    """
    try:
        guidance_response = await ai_guidance_service.get_user_guidance(
            user_id=str(current_user.id),
            question=request.question,
            db=db
        )
        
        if guidance_response.get("status") == "success":
            return {
                "status": "success",
                "data": guidance_response.get("data"),
                "message": "Rehberlik başarıyla oluşturuldu"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=guidance_response.get("message", "Rehberlik oluşturulamadı")
            )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Rehberlik servisi hatası: {str(e)}"
        )

@router.post("/store-question-result", response_model=dict)
async def store_question_result(
    request: QuestionResultRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Soru çözüm sonucunu memory'e kaydet
    """
    try:
        question_data = {
            "question": request.question,
            "correct_answer": request.correct_answer,
            "difficulty": request.difficulty,
            "education_level": request.education_level
        }
        
        await ai_guidance_service.store_question_result(
            user_id=str(current_user.id),
            question_data=question_data,
            user_answer=request.user_answer,
            is_correct=request.is_correct,
            subject=request.subject,
            topic=request.topic
        )
        
        return {
            "status": "success",
            "message": "Soru sonucu başarıyla kaydedildi"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Soru sonucu kaydedilemedi: {str(e)}"
        )

@router.get("/profile", response_model=dict)
async def get_user_learning_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kullanıcının öğrenme profilini al
    """
    try:
        # Boş soru ile profil bilgilerini al
        profile_response = await ai_guidance_service.get_user_guidance(
            user_id=str(current_user.id),
            question="Profilimi göster",
            db=db
        )
        
        if profile_response.get("status") == "success":
            data = profile_response.get("data", {})
            return {
                "status": "success",
                "data": {
                    "user_profile": data.get("user_profile", {}),
                    "learning_summary": {
                        "total_sessions": data.get("user_profile", {}).get("total_sessions", 0),
                        "avg_accuracy": data.get("user_profile", {}).get("avg_accuracy", 0),
                        "learning_level": data.get("user_profile", {}).get("learning_level", "başlangıç"),
                        "strong_subjects": data.get("user_profile", {}).get("strong_subjects", []),
                        "weak_subjects": data.get("user_profile", {}).get("weak_subjects", [])
                    }
                }
            }
        else:
            return {
                "status": "success",
                "data": {
                    "user_profile": {
                        "name": current_user.first_name,
                        "learning_level": "başlangıç",
                        "total_sessions": 0,
                        "avg_accuracy": 0
                    },
                    "learning_summary": {
                        "total_sessions": 0,
                        "avg_accuracy": 0,
                        "learning_level": "başlangıç",
                        "strong_subjects": [],
                        "weak_subjects": []
                    }
                }
            }
    
    except Exception as e:
        # Hata durumunda varsayılan profil dön
        return {
            "status": "success", 
            "data": {
                "user_profile": {
                    "name": current_user.first_name,
                    "learning_level": "başlangıç",
                    "total_sessions": 0,
                    "avg_accuracy": 0
                },
                "learning_summary": {
                    "total_sessions": 0,
                    "avg_accuracy": 0,
                    "learning_level": "başlangıç",
                    "strong_subjects": [],
                    "weak_subjects": []
                }
            }
        }
