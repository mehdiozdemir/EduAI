from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"]
)


@router.get("/", response_model=list[schemas.Subject])
def get_subjects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    subjects = db.query(models.Subject).offset(skip).limit(limit).all()
    return subjects

@router.get("/{subject_id}", response_model=schemas.Subject)
def get_subject(subject_id: int, db: Session = Depends(get_db)):
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    return db_subject


@router.get("/{subject_id}/topics", response_model=list[schemas.Topic])
def get_topics(subject_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Check if subject exists
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    topics = db.query(models.Topic).filter(
        models.Topic.subject_id == subject_id
    ).offset(skip).limit(limit).all()
    
    return topics
