from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
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
    """Sınav sonucu için analiz yap"""
    try:
        from app.agents.analysis_agent import AnalysisAgent
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
        
        # Analiz agentını çağır
        analysis_agent = AnalysisAgent()
        
        input_data = {
            "user_id": str(user_id),
            "subject": exam_section.name if exam_section else "Genel",
            "topic": exam_type.name if exam_type else "Deneme Sınavı",
            "education_level": "lise",
            "performance_data": {
                "totalQuestions": practice_exam.total_questions,
                "correctAnswers": practice_exam.correct_answers,
                "wrongAnswers": practice_exam.wrong_answers,
                "emptyAnswers": practice_exam.empty_answers,
                "accuracy": practice_exam.score,
                "wrongTopics": list(set(wrong_topics)),
                "detailedAnswers": f"Toplam: {practice_exam.total_questions}, Doğru: {practice_exam.correct_answers}, Yanlış: {practice_exam.wrong_answers}, Boş: {practice_exam.empty_answers}",
                "questionsWithTopics": questions_with_topics
            }
        }
        
        result = await analysis_agent.process(input_data)
        
        # Sonuca exam bilgilerini de ekle
        if result.get("status") == "success":
            result["exam_info"] = {
                "exam_id": exam_id,
                "exam_type": exam_type.name if exam_type else "Bilinmiyor",
                "exam_section": exam_section.name if exam_section else "Bilinmiyor",
                "score": practice_exam.score,
                "completion_date": practice_exam.end_time.isoformat() if practice_exam.end_time else None
            }
        
        return result
        
    except Exception as e:
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
    db_analysis = models.PerformanceAnalysis(**analysis.dict())
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

    query = db.query(models.PerformanceAnalysis).filter(
        models.PerformanceAnalysis.user_id == user_id
    )

    if subject_id is not None:
        query = query.filter(models.PerformanceAnalysis.subject_id == subject_id)

    if topic_id is not None:
        query = query.filter(models.PerformanceAnalysis.topic_id == topic_id)

    analyses = query.order_by(models.PerformanceAnalysis.created_at.asc()).all()

    return [
        {"date": a.created_at.isoformat(), "accuracy": a.accuracy} for a in analyses
    ]

@router.get("/{analysis_id}", response_model=schemas.PerformanceAnalysis)
def get_performance_analysis(analysis_id: int, db: Session = Depends(get_db)):
    db_analysis = db.query(models.PerformanceAnalysis).filter(
        models.PerformanceAnalysis.id == analysis_id
    ).first()
    
    if not db_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance analysis not found"
        )
    
    return db_analysis

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
    
    analyses = db.query(models.PerformanceAnalysis).filter(
        models.PerformanceAnalysis.user_id == user_id
    ).offset(skip).limit(limit).all()
    
    return analyses

@router.post("/{analysis_id}/recommendations", response_model=schemas.ResourceRecommendation)
def create_resource_recommendation(
    analysis_id: int,
    recommendation: schemas.ResourceRecommendationCreate,
    db: Session = Depends(get_db)
):
    # Check if performance analysis exists
    db_analysis = db.query(models.PerformanceAnalysis).filter(
        models.PerformanceAnalysis.id == analysis_id
    ).first()
    
    if not db_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance analysis not found"
        )
    
    # Create new resource recommendation
    db_recommendation = models.ResourceRecommendation(**recommendation.dict())
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
    db_analysis = db.query(models.PerformanceAnalysis).filter(
        models.PerformanceAnalysis.id == analysis_id
    ).first()
    
    if not db_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance analysis not found"
        )
    
    recommendations = db.query(models.ResourceRecommendation).filter(
        models.ResourceRecommendation.performance_analysis_id == analysis_id
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
        func.coalesce(func.sum(models.PerformanceAnalysis.total_questions), 0),
        func.coalesce(func.sum(models.PerformanceAnalysis.correct_answers), 0),
        func.count(models.PerformanceAnalysis.id),
    ).filter(models.PerformanceAnalysis.user_id == user_id).one()

    total_questions, total_correct, session_count = overall
    overall_accuracy = (
        (total_correct / total_questions) * 100 if total_questions > 0 else 0.0
    )

    # Recent performance (last 10 analyses)
    recent = (
        db.query(models.PerformanceAnalysis)
        .filter(models.PerformanceAnalysis.user_id == user_id)
        .order_by(models.PerformanceAnalysis.created_at.desc())
        .limit(10)
        .all()
    )

    # Subject breakdown
    subject_stats = (
        db.query(
            models.Subject.name.label("subject_name"),
            func.coalesce(func.sum(models.PerformanceAnalysis.correct_answers), 0).label("correct"),
            func.coalesce(func.sum(models.PerformanceAnalysis.total_questions), 0).label("total"),
        )
        .join(models.Subject, models.Subject.id == models.PerformanceAnalysis.subject_id)
        .filter(models.PerformanceAnalysis.user_id == user_id)
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
            models.PerformanceAnalysis.weakness_level,
        )
        .join(models.Topic, models.Topic.id == models.PerformanceAnalysis.topic_id)
        .join(models.Subject, models.Subject.id == models.PerformanceAnalysis.subject_id)
        .filter(models.PerformanceAnalysis.user_id == user_id)
        .order_by(models.PerformanceAnalysis.weakness_level.desc())
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
            models.PerformanceAnalysis.created_at.label("date"),
            models.PerformanceAnalysis.accuracy.label("accuracy"),
        )
        .filter(models.PerformanceAnalysis.user_id == user_id)
        .order_by(models.PerformanceAnalysis.created_at.asc())
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
