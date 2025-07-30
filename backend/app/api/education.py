from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.education_service import EducationLevelService, CourseService, CourseTopicService
from app.schemas.education_level import (
    EducationLevel, EducationLevelCreate, EducationLevelUpdate, EducationLevelWithCourses,
    Course, CourseCreate, CourseUpdate, CourseWithEducationLevel, CourseWithTopics,
    CourseTopic, CourseTopicCreate, CourseTopicUpdate, CourseTopicWithCourse,
    EducationSystemOverview, CourseListResponse, TopicListResponse
)

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

@router.post("/education-levels", response_model=EducationLevel, status_code=201)
async def create_education_level(level_data: EducationLevelCreate, db: Session = Depends(get_db)):
    """Yeni eğitim seviyesi oluştur"""
    # İsim kontrolü
    existing_level = EducationLevelService.get_by_name(db, level_data.name)
    if existing_level:
        raise HTTPException(status_code=400, detail="Bu isimde bir eğitim seviyesi zaten mevcut")
    
    return EducationLevelService.create(db, level_data)

@router.put("/education-levels/{level_id}", response_model=EducationLevel)
async def update_education_level(
    level_id: int, 
    level_data: EducationLevelUpdate, 
    db: Session = Depends(get_db)
):
    """Eğitim seviyesini güncelle"""
    level = EducationLevelService.update(db, level_id, level_data)
    if not level:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")
    return level

@router.delete("/education-levels/{level_id}", status_code=204)
async def delete_education_level(level_id: int, db: Session = Depends(get_db)):
    """Eğitim seviyesini sil"""
    success = EducationLevelService.delete(db, level_id)
    if not success:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")

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

@router.post("/courses", response_model=Course, status_code=201)
async def create_course(course_data: CourseCreate, db: Session = Depends(get_db)):
    """Yeni ders oluştur"""
    # Eğitim seviyesi kontrolü
    level = EducationLevelService.get_by_id(db, course_data.education_level_id)
    if not level:
        raise HTTPException(status_code=400, detail="Geçersiz eğitim seviyesi")
    
    # Kod kontrolü
    if course_data.code:
        existing_course = CourseService.get_by_code(db, course_data.code)
        if existing_course:
            raise HTTPException(status_code=400, detail="Bu kod zaten kullanımda")
    
    return CourseService.create(db, course_data)

@router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: int, course_data: CourseUpdate, db: Session = Depends(get_db)):
    """Dersi güncelle"""
    course = CourseService.update(db, course_id, course_data)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    return course

@router.delete("/courses/{course_id}", status_code=204)
async def delete_course(course_id: int, db: Session = Depends(get_db)):
    """Dersi sil"""
    success = CourseService.delete(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")

# ========== COURSE TOPICS ==========
@router.get("/topics", response_model=TopicListResponse)
async def get_topics(
    skip: int = Query(0, ge=0, description="Atlanacak kayıt sayısı"),
    limit: int = Query(100, ge=1, le=1000, description="Getirilecek kayıt sayısı"),
    course_id: Optional[int] = Query(None, description="Ders filtresi"),
    difficulty_level: Optional[int] = Query(None, ge=1, le=3, description="Zorluk seviyesi filtresi"),
    search: Optional[str] = Query(None, description="Arama terimi"),
    db: Session = Depends(get_db)
):
    """Konuları getir"""
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

@router.post("/topics", response_model=CourseTopic, status_code=201)
async def create_topic(topic_data: CourseTopicCreate, db: Session = Depends(get_db)):
    """Yeni konu oluştur"""
    # Ders kontrolü
    course = CourseService.get_by_id(db, topic_data.course_id)
    if not course:
        raise HTTPException(status_code=400, detail="Geçersiz ders")
    
    return CourseTopicService.create(db, topic_data)

@router.put("/topics/{topic_id}", response_model=CourseTopic)
async def update_topic(topic_id: int, topic_data: CourseTopicUpdate, db: Session = Depends(get_db)):
    """Konuyu güncelle"""
    topic = CourseTopicService.update(db, topic_id, topic_data)
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    return topic

@router.delete("/topics/{topic_id}", status_code=204)
async def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    """Konuyu sil"""
    success = CourseTopicService.delete(db, topic_id)
    if not success:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")

@router.put("/courses/{course_id}/topics/reorder")
async def reorder_topics(
    course_id: int,
    topic_orders: List[dict],
    db: Session = Depends(get_db)
):
    """Konuları yeniden sırala"""
    # Ders kontrolü
    course = CourseService.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    success = CourseTopicService.reorder_topics(db, course_id, topic_orders)
    if not success:
        raise HTTPException(status_code=400, detail="Sıralama güncellenemedi")
    
    return {"message": "Konular başarıyla sıralandı"}

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
