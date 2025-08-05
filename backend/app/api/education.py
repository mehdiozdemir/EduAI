from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.education_service import EducationLevelService, CourseService, CourseTopicService
from app.schemas.education_level import (
    EducationLevel, EducationLevelWithCourses,
    Course, CourseWithEducationLevel, CourseWithTopics,
    CourseTopic, CourseTopicWithCourse,
    EducationSystemOverview, CourseListResponse, TopicListResponse
)
from app.agents.question_agent import QuestionAgent
from pydantic import BaseModel

router = APIRouter()

# ========== EDUCATION LEVELS ==========
@router.get("/education-levels", response_model=List[EducationLevel])
async def get_education_levels(
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=1000, description="Getirilecek kayıt sayısı"),
    db: Session = Depends(get_db)
):
    """Tüm eğitim seviyelerini getir"""
    return EducationLevelService.get_all(db, skip=skip, limit=limit)

@router.get("/education-levels/{level_id}", response_model=EducationLevel)
async def get_education_level(level_id: int, db: Session = Depends(get_db)):
    """Belirli bir eğitim seviyesini getir"""
    level = EducationLevelService.get_by_id(db, level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")
    return level

@router.get("/education-levels/{level_id}/with-courses", response_model=EducationLevelWithCourses)
async def get_education_level_with_courses(level_id: int, db: Session = Depends(get_db)):
    """Eğitim seviyesini dersleriyle birlikte getir"""
    level = EducationLevelService.get_by_id(db, level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")
    return level

# ========== COURSES ==========
@router.get("/courses", response_model=CourseListResponse)
async def get_courses(
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=1000, description="Getirilecek kayıt sayısı"),
    education_level_id: Optional[int] = Query(None, description="Eğitim seviyesi filtresi"),
    search: Optional[str] = Query(None, description="Arama terimi"),
    db: Session = Depends(get_db)
):
    """Dersleri getir"""
    if search:
        courses = CourseService.search_courses(db, search, education_level_id)
    else:
        courses = CourseService.get_all(db, skip=skip, limit=limit, education_level_id=education_level_id)
    
    total = len(courses)
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return CourseListResponse(
        courses=courses,
        total=total,
        page=page,
        page_size=limit
    )

@router.get("/courses/{course_id}", response_model=CourseWithEducationLevel)
async def get_course(course_id: int, db: Session = Depends(get_db)):
    """Belirli bir dersi getir"""
    course = CourseService.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    return course

@router.get("/courses/{course_id}/with-topics", response_model=CourseWithTopics)
async def get_course_with_topics(course_id: int, db: Session = Depends(get_db)):
    """Dersi konularıyla birlikte getir"""
    course = CourseService.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    return course

@router.get("/education-levels/{level_id}/courses", response_model=List[Course])
async def get_courses_by_education_level(level_id: int, db: Session = Depends(get_db)):
    """Eğitim seviyesine göre dersleri getir"""
    # Eğitim seviyesi kontrolü
    level = EducationLevelService.get_by_id(db, level_id)
    if not level:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")
    
    return CourseService.get_by_education_level(db, level_id)

# ========== COURSE TOPICS ==========
# Topics endpoint moved to admin routes for proper management

@router.get("/topics", response_model=TopicListResponse)
async def get_topics(
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=1000, description="Getirilecek kayıt sayısı"),
    course_id: Optional[int] = Query(None, description="Ders filtresi"),
    search: Optional[str] = Query(None, description="Arama terimi"),
    difficulty_level: Optional[int] = Query(None, ge=1, le=3, description="Zorluk seviyesi (1-3)"),
    db: Session = Depends(get_db)
):
    """Tüm konuları getir (Public access)"""
    if search:
        topics = CourseTopicService.search_topics(db, search, course_id)
    elif difficulty_level:
        topics = CourseTopicService.get_by_difficulty(db, difficulty_level, course_id)
    else:
        topics = CourseTopicService.get_all(db, skip=skip, limit=limit, course_id=course_id)
    
    total = len(topics)
    page = (skip // limit) + 1 if limit > 0 else 1
    
    return TopicListResponse(
        topics=topics,
        total=total,
        page=page,
        page_size=limit
    )

@router.get("/topics/{topic_id}", response_model=CourseTopicWithCourse)
async def get_topic(topic_id: int, db: Session = Depends(get_db)):
    """Belirli bir konuyu getir"""
    topic = CourseTopicService.get_by_id(db, topic_id)
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    return topic

@router.get("/courses/{course_id}/topics", response_model=List[CourseTopic])
async def get_topics_by_course(course_id: int, db: Session = Depends(get_db)):
    """Derse göre konuları getir"""
    # Ders kontrolü
    course = CourseService.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    return CourseTopicService.get_by_course(db, course_id)

# ========== SYSTEM OVERVIEW ==========
@router.get("/education-system/overview", response_model=EducationSystemOverview)
async def get_education_system_overview(db: Session = Depends(get_db)):
    """Tüm eğitim sistemi özeti"""
    education_levels = EducationLevelService.get_all(db)
    total_courses = len(CourseService.get_all(db, limit=10000))
    total_topics = len(CourseTopicService.get_all(db, limit=10000))
    
    return EducationSystemOverview(
        education_levels=education_levels,
        total_levels=len(education_levels),
        total_courses=total_courses,
        total_topics=total_topics
    )

# ========== QUIZ GENERATION ==========
class QuizGenerationRequest(BaseModel):
    course_id: int
    topic_ids: List[int]
    difficulty: str  # 'kolay', 'orta', 'zor'
    question_count: int

@router.post("/generate-quiz")
async def generate_quiz(
    request: QuizGenerationRequest,
    db: Session = Depends(get_db)
):
    """Quiz sorularını oluştur"""
    try:
        # Ders kontrolü
        course = CourseService.get_by_id(db, request.course_id)
        if not course:
            raise HTTPException(status_code=404, detail="Ders bulunamadı")
        
        # Konu kontrolü
        topics = []
        for topic_id in request.topic_ids:
            topic = CourseTopicService.get_by_id(db, topic_id)
            if not topic:
                raise HTTPException(status_code=404, detail=f"Konu bulunamadı: {topic_id}")
            if topic.course_id != request.course_id:
                raise HTTPException(status_code=400, detail=f"Konu {topic_id} bu derse ait değil")
            topics.append(topic)
        
        # Zorluk seviyesi çevirisi
        difficulty_map = {
            'kolay': 'easy',
            'orta': 'medium', 
            'zor': 'hard'
        }
        difficulty_en = difficulty_map.get(request.difficulty, 'medium')
        
        # Question agent ile sorular oluştur
        question_agent = QuestionAgent()
        
        # Her konu için soru sayısını dağıt
        questions_per_topic = request.question_count // len(topics)
        remaining_questions = request.question_count % len(topics)
        
        all_questions = []
        
        for i, topic in enumerate(topics):
            topic_question_count = questions_per_topic
            if i < remaining_questions:
                topic_question_count += 1
            
            if topic_question_count > 0:
                input_data = {
                    "subject": course.name,
                    "topic": topic.name,
                    "difficulty": difficulty_en,
                    "count": topic_question_count,
                    "education_level": course.education_level.name.lower()
                }
                
                result = await question_agent.process(input_data)
                
                if result["status"] == "success":
                    topic_questions = result["data"]["questions"]
                    # Her soruya topic bilgisini ekle
                    for question in topic_questions:
                        question["topic_id"] = topic.id
                        question["topic_name"] = topic.name
                    all_questions.extend(topic_questions)
                else:
                    raise HTTPException(status_code=500, detail=f"Soru oluşturma hatası: {result.get('error', 'Bilinmeyen hata')}")
        
        return {
            "status": "success",
            "quiz": {
                "course": {
                    "id": course.id,
                    "name": course.name,
                    "education_level": course.education_level.name
                },
                "topics": [{"id": t.id, "name": t.name} for t in topics],
                "difficulty": request.difficulty,
                "question_count": len(all_questions),
                "questions": all_questions
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz oluşturma hatası: {str(e)}")
