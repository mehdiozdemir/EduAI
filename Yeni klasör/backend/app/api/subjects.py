from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"]
)

@router.post("/", response_model=schemas.Subject)
def create_subject(subject: schemas.SubjectCreate, db: Session = Depends(get_db)):
    # Check if subject already exists
    db_subject = db.query(models.Subject).filter(
        models.Subject.name == subject.name
    ).first()
    
    if db_subject:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject already exists"
        )
    
    # Create new subject
    db_subject = models.Subject(**subject.dict())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    
    return db_subject

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

@router.post("/{subject_id}/topics", response_model=schemas.Topic)
def create_topic(subject_id: int, topic: schemas.TopicCreate, db: Session = Depends(get_db)):
    # Check if subject exists
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    
    if not db_subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subject not found"
        )
    
    # Check if topic already exists for this subject
    db_topic = db.query(models.Topic).filter(
        models.Topic.subject_id == subject_id,
        models.Topic.name == topic.name
    ).first()
    
    if db_topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Topic already exists for this subject"
        )
    
    # Create new topic
    db_topic = models.Topic(**topic.dict())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    
    return db_topic

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
