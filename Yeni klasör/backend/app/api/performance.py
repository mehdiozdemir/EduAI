from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.core.langchain_integration import langchain_integration

router = APIRouter(
    prefix="/performance",
    tags=["performance"]
)

@router.post("/analyze", response_model=dict)
def analyze_performance(
    subject: str,
    topic: str,
    correct_answers: int,
    total_questions: int
):
    try:
        # Analyze performance using LangChain
        analysis = langchain_integration.analyze_performance(
            subject=subject,
            topic=topic,
            correct_answers=correct_answers,
            total_questions=total_questions
        )
        
        return analysis
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing performance: {str(e)}"
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
    
    # Check if subject exists
    db_subject = db.query(models.Subject).filter(models.Subject.id == analysis.subject_id).first()
    
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Check if topic exists
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
