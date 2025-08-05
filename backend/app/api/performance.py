from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.core.auth_deps import get_current_user
from app.models.user import User
from app.models.performance import PerformanceAnalysis, ResourceRecommendation, RecommendationStatus
from app.agents.master_agent import MasterAgent, AgentAction

router = APIRouter(
    prefix="/performance",
    tags=["performance"]
)

# Initialize master agent for performance analysis
master_agent = MasterAgent()

@router.post("/analyze", response_model=dict)
async def analyze_performance(
    subject: str,
    topic: str,
    education_level: str = "lise",
    performance_data: dict = None
):
    """Analyze performance using the agent system"""
    try:
        input_data = {
            "action": AgentAction.ANALYZE_PERFORMANCE.value,
            "subject": subject,
            "topic": topic,
            "education_level": education_level,
            "performance_data": performance_data or {}
        }
        
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing performance: {str(e)}"
        )

@router.post("/analyze-exam", response_model=dict)
async def analyze_exam_performance(
    exam_id: int,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Sınav sonucu için paralel analiz ve öneri sistemi"""
    try:
        from app.services.parallel_agent_service import parallel_agent_service
        from app.models.exam import PracticeExam, PracticeQuestionResult, ExamQuestion, ExamSection, ExamType
        
        # Sınav bilgilerini al
        practice_exam = db.query(PracticeExam).filter(
            PracticeExam.id == exam_id,
            PracticeExam.user_id == user_id
        ).first()
        
        if not practice_exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Sınav bulunamadı"
            )
        
        # Sınav section ve type bilgilerini al
        exam_section = db.query(ExamSection).filter(
            ExamSection.id == practice_exam.exam_section_id
        ).first()
        
        exam_type = None
        if exam_section:
            exam_type = db.query(ExamType).filter(
                ExamType.id == exam_section.exam_type_id
            ).first()
        
        # Soru sonuçlarını al
        question_results = db.query(PracticeQuestionResult).filter(
            PracticeQuestionResult.practice_exam_id == exam_id
        ).all()
        
        # Yanlış cevaplanan soruların topic'lerini topla
        wrong_topics = []
        questions_with_topics = []
        
        for result in question_results:
            if not result.is_correct:
                question = db.query(ExamQuestion).filter(
                    ExamQuestion.id == result.question_id
                ).first()
                
                if question and question.topic_id:
                    from app.models.education_level import CourseTopic
                    topic = db.query(CourseTopic).filter(
                        CourseTopic.id == question.topic_id
                    ).first()
                    
                    if topic:
                        wrong_topics.append(topic.name)
                        questions_with_topics.append({
                            "question_id": question.id,
                            "topic_name": topic.name,
                            "user_answer": result.user_answer,
                            "correct_answer": question.correct_answer,
                            "is_correct": result.is_correct
                        })
        
        # Exam result verisi hazırla
        exam_result = {
            "totalQuestions": practice_exam.total_questions,
            "correctAnswers": practice_exam.correct_answers,
            "wrongAnswers": practice_exam.wrong_answers,
            "emptyAnswers": practice_exam.empty_answers,
            "accuracy": practice_exam.score,
            "score": practice_exam.score,
            "weak_topics": list(set(wrong_topics)),
            "exam_section": exam_section.name if exam_section else "Genel",
            "exam_type": exam_type.name if exam_type else "Deneme Sınavı",
            "detailedAnswers": f"Toplam: {practice_exam.total_questions}, Doğru: {practice_exam.correct_answers}, Yanlış: {practice_exam.wrong_answers}, Boş: {practice_exam.empty_answers}",
            "questionsWithTopics": questions_with_topics
        }
        
        # Paralel agent servisi ile analiz ve önerileri al
        parallel_result = await parallel_agent_service.process_exam_results_parallel(
            db=db,
            user_id=user_id,
            exam_id=exam_id,
            exam_result=exam_result
        )
        
        if parallel_result.get("status") == "success":
            results = parallel_result.get("results", {})
            
            # Base analysis data structure oluştur
            analysis_data = {
                "weakness_level": 5,  # Default value
                "weak_topics": list(set(wrong_topics)),
                "strong_topics": [],
                "recommendations": [],
                "detailed_analysis": "Analiz tamamlanıyor...",
                "personalized_insights": [],
                "improvement_trend": "Veri analiz ediliyor..."
            }
            
            # Analiz sonucunu al ve merge et
            if "analysis_agent" in results:
                analysis_result = results["analysis_agent"]
                if analysis_result.get("status") == "success":
                    agent_data = analysis_result.get("data", {})
                    # Nested data varsa içini al
                    if "data" in agent_data:
                        agent_data = agent_data["data"]
                    
                    # Merge analysis data
                    analysis_data.update({
                        "weakness_level": agent_data.get("weakness_level", 5),
                        "weak_topics": agent_data.get("weak_topics", list(set(wrong_topics))),
                        "strong_topics": agent_data.get("strong_topics", []),
                        "recommendations": agent_data.get("recommendations", []),
                        "detailed_analysis": agent_data.get("detailed_analysis", "Analiz tamamlandı."),
                        "personalized_insights": agent_data.get("personalized_insights", []),
                        "improvement_trend": agent_data.get("improvement_trend", "Veri yetersiz.")
                    })
            
            # YouTube önerilerini ekle ve JSON-safe formata çevir
            if "youtube_agent" in results:
                youtube_result = results["youtube_agent"]
                print(f"🔍 YouTube result: {youtube_result}")
                if youtube_result.get("status") == "success":
                    youtube_agent_data = youtube_result.get("data", {})
                    # Nested data varsa içini al
                    if "data" in youtube_agent_data:
                        youtube_data = youtube_agent_data["data"]
                    else:
                        youtube_data = youtube_agent_data
                    
                    # JSON-safe formata çevir
                    if "recommendations" in youtube_data:
                        safe_videos = []
                        for video in youtube_data["recommendations"]:
                            safe_video = {
                                "title": str(video.get("title", "")),
                                "channel": str(video.get("channel", "")),
                                "duration": str(video.get("duration", "")),
                                "level": str(video.get("level", "lise")),
                                "video_url": str(video.get("video_url", "")),
                                "topics_covered": video.get("topics_covered", []),
                                "why_recommended": str(video.get("why_recommended", "Bu video zayıf konularınız için önerilmiştir.")),
                                "thumbnail_url": str(video.get("thumbnail_url", "")) if video.get("thumbnail_url") else None,
                                "channel_url": str(video.get("channel_url", "")) if video.get("channel_url") else None
                            }
                            safe_videos.append(safe_video)
                        
                        analysis_data["youtube_recommendations"] = {
                            "recommendations": safe_videos,
                            "search_strategy": youtube_data.get("search_strategy", "YouTube videolar bulundu.")
                        }
            
                        # Kitap önerilerini ekle ve JSON-safe formata çevir
            if "book_agent" in results:
                book_result = results["book_agent"]
                print(f"🔍 Book result: {book_result}")
                if book_result.get("status") == "success":
                    book_agent_data = book_result.get("data", {})
                    # Nested data varsa içini al
                    if "data" in book_agent_data:
                        book_data = book_agent_data["data"]
                    else:
                        book_data = book_agent_data
                    
                    # JSON-safe formata çevir
                    if "recommendations" in book_data:
                        safe_books = []
                        for book in book_data["recommendations"]:
                            safe_book = {
                                "title": str(book.get("title", "")),
                                "author": str(book.get("author", "")),
                                "publisher": str(book.get("publisher", "")),
                                "year": 2024,  # Default year
                                "price": str(book.get("price", "")) if book.get("price") else None,
                                "stock_status": str(book.get("stock_status", "")).replace("<StockStatus.", "").replace(">", "").split(":")[0] if book.get("stock_status") else "available",
                                "purchase_links": [str(book.get("url", ""))] if book.get("url") else [],
                                "topics_covered": book.get("key_topics", []),
                                "difficulty_level": book.get("target_audience", "Lise"),
                                "why_recommended": book.get("description", "Bu kitap zayıf konularınız için önerilmiştir."),
                                "cover_image": None
                            }
                            safe_books.append(safe_book)
                        
                        analysis_data["book_recommendations"] = {
                            "recommendations": safe_books,
                            "search_summary": book_data.get("search_summary", "Kitap önerileri bulundu.")
                        }
            
            # Exam bilgilerini ekle
            analysis_data["exam_info"] = {
                "exam_id": exam_id,
                "exam_type": exam_type.name if exam_type else "Bilinmiyor",
                "exam_section": exam_section.name if exam_section else "Bilinmiyor", 
                "score": practice_exam.score,
                "completion_date": practice_exam.end_time.isoformat() if practice_exam.end_time else None
            }
            
            # İşlem bilgilerini ekle
            analysis_data["parallel_processing"] = {
                "enabled": True,
                "execution_summary": parallel_result.get("execution_summary", {}),
                "processing_time": "paralel"
            }
            
            # Önerileri database'e kaydet
            try:
                from app.api.exam import save_recommendations_to_db
                exam_result_data = {
                    "total_questions": exam_result.get("total_questions", 0),
                    "correct_answers": exam_result.get("correct_answers", 0),
                    "percentage": exam_result.get("percentage", 0.0)
                }
                await save_recommendations_to_db(db, user_id, results, exam_result_data)
                analysis_data["recommendations_saved"] = True
            except Exception as e:
                print(f"❌ Error saving recommendations: {e}")
                analysis_data["recommendations_saved"] = False
                analysis_data["save_error"] = str(e)
            
            return {
                "status": "success",
                "data": analysis_data
            }
        else:
            # Paralel işlem başarısız oldu, fallback olarak normal analiz yap
            from app.agents.analysis_agent import AnalysisAgent
            analysis_agent = AnalysisAgent()
            
            input_data = {
                "user_id": str(user_id),
                "subject": exam_section.name if exam_section else "Genel",
                "topic": exam_type.name if exam_type else "Deneme Sınavı",
                "education_level": "lise",
                "performance_data": exam_result
            }
            
            result = await analysis_agent.process(input_data)
            
            # Exam bilgilerini ekle
            if result.get("status") == "success":
                result["data"]["exam_info"] = {
                    "exam_id": exam_id,
                    "exam_type": exam_type.name if exam_type else "Bilinmiyor",
                    "exam_section": exam_section.name if exam_section else "Bilinmiyor",
                    "score": practice_exam.score,
                    "completion_date": practice_exam.end_time.isoformat() if practice_exam.end_time else None
                }
            
            return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Sınav analizi hatası: {str(e)}"
        )

@router.post("/", response_model=schemas.PerformanceAnalysis)
def create_performance_analysis(
    analysis: schemas.PerformanceAnalysisCreate,
    db: Session = Depends(get_db)
):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.id == analysis.user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if subject exists (if provided)
    if analysis.subject_id is not None:
        db_subject = db.query(models.Subject).filter(models.Subject.id == analysis.subject_id).first()
        
        if not db_subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found"
            )
    
    # Check if topic exists (if provided)
    if analysis.topic_id is not None:
        db_topic = db.query(models.Topic).filter(models.Topic.id == analysis.topic_id).first()
        
        if not db_topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found"
            )
    
    # Create new performance analysis
    db_analysis = PerformanceAnalysis(**analysis.dict())
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    return db_analysis

@router.get("/trends")
def get_performance_trends(
    user_id: int,
    period: str = "month",
    subject_id: int | None = None,
    topic_id: int | None = None,
    db: Session = Depends(get_db),
):
    """Return chronological accuracy data for charts.

    Current implementation returns raw analysis records filtered by params.
    Future improvement: aggregate by week/month/quarter/year.
    """

    # Validate user
    if not db.query(models.User.id).filter(models.User.id == user_id).first():
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(PerformanceAnalysis).filter(
        PerformanceAnalysis.user_id == user_id
    )

    if subject_id is not None:
        query = query.filter(PerformanceAnalysis.subject_id == subject_id)

    if topic_id is not None:
        query = query.filter(PerformanceAnalysis.topic_id == topic_id)

    analyses = query.order_by(PerformanceAnalysis.created_at.asc()).all()

    return [
        {"date": a.created_at.isoformat(), "accuracy": a.accuracy} for a in analyses
    ]

@router.get("/{analysis_id}", response_model=schemas.PerformanceAnalysis)
def get_performance_analysis(analysis_id: int, db: Session = Depends(get_db)):
    db_analysis = db.query(PerformanceAnalysis).filter(
        PerformanceAnalysis.id == analysis_id
    ).first()
    
    if not db_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance analysis not found"
        )
    
    return db_analysis

@router.get("/user/all-recommendations")
async def get_user_all_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all recommendations for the current user from exam analyses"""
    try:
        # Get all performance analyses for the user
        # Get active recommendations for user, grouped by category
        
        active_recs = db.query(ResourceRecommendation).filter(
            ResourceRecommendation.user_id == current_user.id,
            ResourceRecommendation.status == RecommendationStatus.ACTIVE
        ).order_by(
            ResourceRecommendation.category,
            ResourceRecommendation.relevance_score.desc(),
            ResourceRecommendation.created_at.desc()
        ).all()
        
        # Group by category
        recommendations_by_category = {}
        for rec in active_recs:
            category = rec.category or "general"
            if category not in recommendations_by_category:
                recommendations_by_category[category] = []
            
            recommendations_by_category[category].append({
                "id": rec.id,
                "resource_type": rec.resource_type,
                "title": rec.title,
                "url": rec.url,
                "description": rec.description,
                "relevance_score": rec.relevance_score,
                "category": rec.category,
                "created_at": rec.created_at.isoformat() if rec.created_at else None
            })
        
        return {
            "status": "success",
            "data": {
                "total_recommendations": len(active_recs),
                "categories": recommendations_by_category
            }
        }
        
    except Exception as e:
        print(f"Error getting user recommendations: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Öneriler alınırken hata oluştu: {str(e)}"
        )

@router.patch("/recommendation/{recommendation_id}/status")
async def update_recommendation_status(
    recommendation_id: int,
    status_param: str,  # "completed" or "deleted"
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update recommendation status (complete or delete)"""
    try:
        
        # Validate status
        if status_param not in ["completed", "deleted"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid status. Use 'completed' or 'deleted'"
            )
        
        # Find recommendation
        recommendation = db.query(ResourceRecommendation).filter(
            ResourceRecommendation.id == recommendation_id,
            ResourceRecommendation.user_id == current_user.id
        ).first()
        
        if not recommendation:
            raise HTTPException(
                status_code=404,
                detail="Recommendation not found"
            )
        
        # Update status
        if status_param == "completed":
            recommendation.status = RecommendationStatus.COMPLETED
        elif status_param == "deleted":
            recommendation.status = RecommendationStatus.DELETED
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Recommendation marked as {status_param}",
            "data": {
                "id": recommendation.id,
                "status": recommendation.status.value
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating recommendation status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating recommendation: {str(e)}"
        )

@router.get("/recommendations/stats")
async def get_recommendations_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recommendation statistics for user"""
    try:
        from sqlalchemy import func, text
        
        # Get count by status - using raw SQL to handle string/enum conversion
        stats = db.execute(text("""
            SELECT status, COUNT(*) as count 
            FROM resource_recommendations 
            WHERE user_id = :user_id 
            GROUP BY status
        """), {"user_id": current_user.id}).fetchall()
        
        # Get count by category (only active) - using raw SQL
        category_stats = db.execute(text("""
            SELECT category, COUNT(*) as count 
            FROM resource_recommendations 
            WHERE user_id = :user_id AND status = 'active'
            GROUP BY category
        """), {"user_id": current_user.id}).fetchall()
        
        stats_dict = {
            "active": 0,
            "completed": 0,
            "deleted": 0,
            "total": 0
        }
        
        for stat in stats:
            # stat is now a raw SQL result with .status and .count attributes
            status_key = str(stat.status)
            stats_dict[status_key] = stat.count
            stats_dict["total"] += stat.count
        
        categories_dict = {}
        for cat_stat in category_stats:
            # cat_stat is now a raw SQL result
            categories_dict[cat_stat.category] = cat_stat.count
        
        return {
            "status": "success",
            "data": {
                "by_status": stats_dict,
                "by_category": categories_dict,
                "total_active": stats_dict["active"],
                "completion_rate": round((stats_dict["completed"] / stats_dict["total"] * 100), 1) if stats_dict["total"] > 0 else 0
            }
        }
        
    except Exception as e:
        print(f"Error getting recommendation stats: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting stats: {str(e)}"
        )

@router.get("/user/{user_id}", response_model=list[schemas.PerformanceAnalysis])
def get_user_performance_analyses(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    analyses = db.query(PerformanceAnalysis).filter(
        PerformanceAnalysis.user_id == user_id
    ).offset(skip).limit(limit).all()
    
    return analyses

@router.post("/{analysis_id}/recommendations", response_model=schemas.ResourceRecommendation)
def create_resource_recommendation(
    analysis_id: int,
    recommendation: schemas.ResourceRecommendationCreate,
    db: Session = Depends(get_db)
):
    # Check if performance analysis exists
    db_analysis = db.query(PerformanceAnalysis).filter(
        PerformanceAnalysis.id == analysis_id
    ).first()
    
    if not db_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance analysis not found"
        )
    
    # Create new resource recommendation
    db_recommendation = ResourceRecommendation(**recommendation.dict())
    db.add(db_recommendation)
    db.commit()
    db.refresh(db_recommendation)
    
    return db_recommendation

@router.get("/{analysis_id}/recommendations", response_model=list[schemas.ResourceRecommendation])
def get_resource_recommendations(
    analysis_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Check if performance analysis exists
    db_analysis = db.query(PerformanceAnalysis).filter(
        PerformanceAnalysis.id == analysis_id
    ).first()
    
    if not db_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance analysis not found"
        )
    
    recommendations = db.query(ResourceRecommendation).filter(
        ResourceRecommendation.performance_analysis_id == analysis_id
    ).offset(skip).limit(limit).all()
    
    return recommendations

# ---------------------------------------------------------------
# Dashboard endpoint
# ---------------------------------------------------------------

from sqlalchemy import func


@router.get("/dashboard/{user_id}")
def get_performance_dashboard(user_id: int, db: Session = Depends(get_db)):
    """Aggregated statistics for the React dashboard."""

    # Verify user exists
    user_exists = db.query(models.User.id).filter(models.User.id == user_id).first()
    if not user_exists:
        raise HTTPException(status_code=404, detail="User not found")

    # Overall stats
    overall = db.query(
        func.coalesce(func.sum(PerformanceAnalysis.total_questions), 0),
        func.coalesce(func.sum(PerformanceAnalysis.correct_answers), 0),
        func.count(PerformanceAnalysis.id),
    ).filter(PerformanceAnalysis.user_id == user_id).one()

    total_questions, total_correct, session_count = overall
    overall_accuracy = (
        (total_correct / total_questions) * 100 if total_questions > 0 else 0.0
    )

    # Recent performance (last 10 analyses)
    recent = (
        db.query(PerformanceAnalysis)
        .filter(PerformanceAnalysis.user_id == user_id)
        .order_by(PerformanceAnalysis.created_at.desc())
        .limit(10)
        .all()
    )

    # Subject breakdown
    subject_stats = (
        db.query(
            models.Subject.name.label("subject_name"),
            func.coalesce(func.sum(PerformanceAnalysis.correct_answers), 0).label("correct"),
            func.coalesce(func.sum(PerformanceAnalysis.total_questions), 0).label("total"),
        )
        .join(models.Subject, models.Subject.id == PerformanceAnalysis.subject_id)
        .filter(PerformanceAnalysis.user_id == user_id)
        .group_by(models.Subject.name)
        .all()
    )

    subject_breakdown = [
        {
            "subject_name": s.subject_name,
            "accuracy": (s.correct / s.total) * 100 if s.total else 0.0,
            "question_count": s.total,
        }
        for s in subject_stats
    ]

    # Weakness areas (top 5 highest weakness_level)
    weak_areas = (
        db.query(
            models.Topic.name.label("topic_name"),
            models.Subject.name.label("subject_name"),
            PerformanceAnalysis.weakness_level,
        )
        .join(models.Topic, models.Topic.id == PerformanceAnalysis.topic_id)
        .join(models.Subject, models.Subject.id == PerformanceAnalysis.subject_id)
        .filter(PerformanceAnalysis.user_id == user_id)
        .order_by(PerformanceAnalysis.weakness_level.desc())
        .limit(5)
        .all()
    )

    weakness_areas = [
        {
            "topic_name": w.topic_name,
            "subject_name": w.subject_name,
            "weakness_level": w.weakness_level,
            "recommendation_count": 0,
        }
        for w in weak_areas
    ]

    # Progress chart (last 20 analyses)
    progress = (
        db.query(
            PerformanceAnalysis.created_at.label("date"),
            PerformanceAnalysis.accuracy.label("accuracy"),
        )
        .filter(PerformanceAnalysis.user_id == user_id)
        .order_by(PerformanceAnalysis.created_at.asc())
        .limit(20)
        .all()
    )

    progress_chart = [
        {"date": p.date.isoformat(), "accuracy": p.accuracy} for p in progress
    ]

    return {
        "overall_stats": {
            "total_questions": total_questions,
            "total_correct": total_correct,
            "overall_accuracy": overall_accuracy,
            "total_sessions": session_count,
        },
        "recent_performance": recent,
        "subject_breakdown": subject_breakdown,
        "weakness_areas": weakness_areas,
        "progress_chart": progress_chart,
    }
