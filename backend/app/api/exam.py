from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.agents.exam_agent import ExamAgent
from app.schemas.exam import (
    ExamType, ExamSection, ExamQuestion,
    PracticeExamCreate, PracticeExamResult
)
from app.models import exam as exam_models
from app.models.performance import PerformanceAnalysis, ResourceRecommendation
from app.core.auth_deps import get_current_user
from app.models.user import User

router = APIRouter()

async def save_recommendations_to_db(db: Session, user_id: int, parallel_results: dict, exam_result: dict):
    """Sınav sonrası önerileri database'e kaydet"""
    try:
        # Performance analysis oluştur
        performance_analysis = PerformanceAnalysis(
            user_id=user_id,
            total_questions=exam_result.get("total_questions", 0),
            correct_answers=exam_result.get("correct_answers", 0),
            accuracy=exam_result.get("percentage", 0.0),
            weakness_level=5  # Default
        )
        
        # Analysis data varsa weakness_level'ı güncelle
        if "analysis_agent" in parallel_results:
            analysis_data = parallel_results["analysis_agent"]
            if analysis_data.get("status") == "success":
                agent_data = analysis_data.get("data", {})
                if "data" in agent_data:
                    agent_data = agent_data["data"]
                performance_analysis.weakness_level = agent_data.get("weakness_level", 5)
        
        db.add(performance_analysis)
        db.commit()
        db.refresh(performance_analysis)
        
        # YouTube önerilerini kaydet
        if "youtube_agent" in parallel_results:
            youtube_data = parallel_results["youtube_agent"]
            if youtube_data.get("status") == "success":
                data_content = youtube_data.get("data", {})
                if "data" in data_content:
                    data_content = data_content["data"]
                youtube_recs = data_content.get("recommendations", [])
                for video in youtube_recs:
                    rec = ResourceRecommendation(
                        user_id=user_id,
                        performance_analysis_id=performance_analysis.id,
                        resource_type="youtube",
                        title=video.get("title", ""),
                        url=video.get("video_url", video.get("url", "")),
                        description=video.get("why_recommended", video.get("description", "")),
                        relevance_score=8.0,
                        category="video"
                    )
                    db.add(rec)
        
        # Kitap önerilerini kaydet
        if "book_agent" in parallel_results:
            book_data = parallel_results["book_agent"]
            if book_data.get("status") == "success":
                data_content = book_data.get("data", {})
                if "data" in data_content:
                    data_content = data_content["data"]
                book_recs = data_content.get("recommendations", [])
                for book in book_recs:
                    book_url = book.get("url", "")
                    if hasattr(book_url, '__str__'):
                        book_url = str(book_url)
                    rec = ResourceRecommendation(
                        user_id=user_id,
                        performance_analysis_id=performance_analysis.id,
                        resource_type="book",
                        title=book.get("title", ""),
                        url=book_url,
                        description=book.get("description", ""),
                        relevance_score=float(book.get("relevance_score", 7.0)),
                        category="books"
                    )
                    db.add(rec)
        
        # AI Analysis önerilerini kaydet
        if "analysis_agent" in parallel_results:
            analysis_data = parallel_results["analysis_agent"]
            if analysis_data.get("status") == "success":
                agent_data = analysis_data.get("data", {})
                if "data" in agent_data:
                    agent_data = agent_data["data"]
                
                ai_recommendations = agent_data.get("recommendations", [])
                for idx, recommendation in enumerate(ai_recommendations):
                    rec = ResourceRecommendation(
                        user_id=user_id,
                        performance_analysis_id=performance_analysis.id,
                        resource_type="ai_advice",
                        title=f"AI Önerisi {idx + 1}",
                        url="",
                        description=str(recommendation),
                        relevance_score=9.0,
                        category="ai_tips"
                    )
                    db.add(rec)
        
        db.commit()
        print(f"✅ Recommendations saved for performance analysis {performance_analysis.id}")
        
    except Exception as e:
        print(f"❌ Error saving recommendations to DB: {e}")
        db.rollback()

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
    result = exam_agent.submit_practice_exam(db, exam_id, current_user.id, answers)
    
    # Paralel analiz ve öneri sistemi
    try:
        from app.services.parallel_agent_service import parallel_agent_service
        
        # Paralel agent servisi ile analiz ve önerileri çalıştır
        parallel_result = await parallel_agent_service.process_exam_results_parallel(
            db=db,
            exam_id=exam_id,
            user_id=current_user.id
        )
        
        # Sonuçları birleştir
        if parallel_result.get("status") == "success":
            parallel_results = parallel_result.get("results", {})
            
            # Analiz sonucunu ekle
            if "analysis_agent" in parallel_results:
                analysis_data = parallel_results["analysis_agent"]
                analysis_result = analysis_data.get("data", {}) if analysis_data.get("status") == "success" else {}
                
                # YouTube önerilerini analiz verisine ekle
                if "youtube_agent" in parallel_results:
                    youtube_data = parallel_results["youtube_agent"]
                    if youtube_data.get("status") == "success":
                        analysis_result["youtube_recommendations"] = youtube_data.get("data", {})
                
                # Kitap önerilerini analiz verisine ekle
                if "book_agent" in parallel_results:
                    book_data = parallel_results["book_agent"]
                    if book_data.get("status") == "success":
                        analysis_result["book_recommendations"] = book_data.get("data", {})
                
                result["analysis"] = analysis_result
                result["analysis_status"] = analysis_data.get("status", "error")
                if analysis_data.get("status") == "error":
                    result["analysis_error"] = analysis_data.get("error", "Bilinmeyen hata")
            
            # Ayrıca backward compatibility için ayrı alanlar da ekle
            if "youtube_agent" in parallel_results:
                youtube_data = parallel_results["youtube_agent"]
                result["youtube_recommendations"] = youtube_data.get("data", {}) if youtube_data.get("status") == "success" else None
                result["youtube_status"] = youtube_data.get("status", "error")
            
            if "book_agent" in parallel_results:
                book_data = parallel_results["book_agent"]
                result["book_recommendations"] = book_data.get("data", {}) if book_data.get("status") == "success" else None
                result["book_status"] = book_data.get("status", "error")
            
            # Önerileri database'e kaydet
            await save_recommendations_to_db(db, current_user.id, parallel_results, result)
            
            # Paralel işlem bilgilerini ekle
            result["parallel_processing"] = {
                "enabled": True,
                "execution_summary": parallel_result.get("execution_summary", {}),
                "processing_time": "paralel"
            }
        else:
            # Paralel sistem başarısız olursa fallback olarak eski sistemi kullan
            from app.api.performance import analyze_exam_performance
            analysis_result = await analyze_exam_performance(exam_id, current_user.id, db)
            result["analysis"] = analysis_result.get("data", {}) if analysis_result.get("status") == "success" else None
            result["analysis_status"] = analysis_result.get("status", "error")
            result["parallel_processing"] = {
                "enabled": False,
                "error": parallel_result.get("error", "Paralel sistem kullanılamadı"),
                "fallback": True
            }
        
    except Exception as e:
        print(f"⚠️ Paralel agent sistemi hatası: {e}")
        # Fallback: Eski sistem
        try:
            from app.api.performance import analyze_exam_performance
            analysis_result = await analyze_exam_performance(exam_id, current_user.id, db)
            result["analysis"] = analysis_result.get("data", {}) if analysis_result.get("status") == "success" else None
            result["analysis_status"] = analysis_result.get("status", "error")
        except Exception as fallback_error:
            result["analysis"] = None
            result["analysis_status"] = "error"
            result["analysis_error"] = str(fallback_error)
        
        result["parallel_processing"] = {
            "enabled": False,
            "error": str(e),
            "fallback": True
        }
    
    return result

@router.get("/practice-exam/{exam_id}/results")
async def get_exam_results(
    exam_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sınav sonuçlarını getir - analiz verileriyle birlikte"""
    try:
        exam_agent = ExamAgent()
        result = exam_agent.get_exam_results(db, exam_id, current_user.id)
        
        # Eğer mevcut analiz yoksa, parallel agent service'ten kontrol et
        if not result.get("analysis") or not result.get("analysis_status"):
            try:
                from app.services.parallel_agent_service import parallel_agent_service
                
                # Paralel servisten existing results'ı kontrol et
                existing_data = await parallel_agent_service.get_existing_analysis(
                    db=db,
                    user_id=current_user.id,
                    exam_id=exam_id
                )
                
                if existing_data and existing_data.get("status") == "success":
                    results = existing_data.get("results", {})
                    
                    # Analiz verilerini result'a ekle
                    if "analysis_agent" in results:
                        analysis_result = results["analysis_agent"]
                        if analysis_result.get("status") == "success":
                            result["analysis"] = analysis_result.get("data", {})
                            result["analysis_status"] = "success"
                    
                    # YouTube ve Book önerilerini ekle
                    if "youtube_agent" in results:
                        youtube_data = results["youtube_agent"]
                        if youtube_data.get("status") == "success":
                            result["youtube_recommendations"] = youtube_data.get("data", {})
                            result["youtube_status"] = "success"
                    
                    if "book_agent" in results:
                        book_data = results["book_agent"]
                        if book_data.get("status") == "success":
                            result["book_recommendations"] = book_data.get("data", {})
                            result["book_status"] = "success"
                    
                    # Parallel processing info ekle
                    if any(key in results for key in ["analysis_agent", "youtube_agent", "book_agent"]):
                        result["parallel_processing"] = {
                            "enabled": True,
                            "execution_summary": {
                                "total_agents": len(results),
                                "successful_agents": len([r for r in results.values() if r.get("status") == "success"]),
                                "failed_agents": len([r for r in results.values() if r.get("status") != "success"])
                            }
                        }
                        
            except Exception as e:
                print(f"🚨 Error fetching existing analysis: {e}")
                # Hata olursa normal result'ı döndür
                pass
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching exam results: {str(e)}"
        )

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
    
    if not exam_details or exam_details.get("status") == "error":
        raise HTTPException(status_code=404, detail="Sınav bulunamadı")
    
    # Sınav sorularını ve cevapları al
    questions = exam_agent.get_practice_exam_questions(db, exam_id, current_user.id, include_answers=True)
    
    return {
        "exam": exam_details,
        "detailed_questions": questions,
        "message": "Sınav detayları başarıyla alındı"
    }

@router.post("/weak-topics/recommendations")
async def get_weak_topic_recommendations(
    weak_topics: List[str],
    subject: str,
    education_level: str = "lise",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Zayıf konular için paralel öneri sistemi"""
    
    if not weak_topics:
        raise HTTPException(status_code=400, detail="En az bir zayıf konu belirtilmelidir")
    
    try:
        from app.services.parallel_agent_service import parallel_agent_service
        
        # Paralel öneri sistemini çalıştır
        recommendations = await parallel_agent_service.get_recommendations_for_weak_topics(
            user_id=current_user.id,
            weak_topics=weak_topics,
            subject=subject,
            education_level=education_level
        )
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Öneri sistemi hatası: {str(e)}"
        )

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
