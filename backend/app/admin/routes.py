from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.database import get_db
from app.models.exam import ExamType, ExamSection, ExamQuestion, PracticeExam
from app.models.user import User
from app.models.subject import Subject, Topic
from app.services.education_service import EducationLevelService, CourseService, CourseTopicService
from app.schemas.admin import (
    AdminStatsResponse, ExamTypeAdmin, ExamSectionAdmin, 
    ExamQuestionAdmin, UserAdmin, PracticeExamAdmin,
    UserCreate, UserUpdate, SubjectAdmin, SubjectCreate, SubjectUpdate,
    TopicAdmin, TopicCreate, TopicUpdate, ExamTypeCreate, ExamTypeUpdate,
    EducationLevel, EducationLevelCreate, EducationLevelUpdate,
    Course, CourseCreate, CourseUpdate,
    CourseTopic, CourseTopicCreate, CourseTopicUpdate
)
from app.core.auth import get_current_user, require_admin_access
from app.agents.exam_agent import ExamAgent
from datetime import datetime, timedelta
from sqlalchemy import func, desc

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Admin dashboard istatistikleri"""
    
    # Toplam kullanıcı sayısı
    total_users = db.query(User).count()
    
    # Toplam sınav türü sayısı
    total_exam_types = db.query(ExamType).filter(ExamType.is_active == True).count()
    
    # Toplam soru sayısı
    total_questions = db.query(ExamQuestion).filter(ExamQuestion.is_active == True).count()
    
    # Bu ay oluşturulan deneme sınavları
    current_month = datetime.now().replace(day=1)
    monthly_exams = db.query(PracticeExam).filter(
        PracticeExam.created_at >= current_month
    ).count()
    
    # Son 7 günde aktif kullanıcılar
    week_ago = datetime.now() - timedelta(days=7)
    active_users = db.query(User).filter(
        User.last_login >= week_ago
    ).count() if hasattr(User, 'last_login') else 0
    
    # En popüler sınav türleri
    popular_exam_types = db.query(
        ExamType.name,
        func.count(PracticeExam.id).label('exam_count')
    ).join(
        PracticeExam, ExamType.id == PracticeExam.exam_type_id
    ).group_by(
        ExamType.name
    ).order_by(
        desc('exam_count')
    ).limit(5).all()
    
    return AdminStatsResponse(
        total_users=total_users,
        total_exam_types=total_exam_types,
        total_questions=total_questions,
        monthly_exams=monthly_exams,
        active_users=active_users,
        popular_exam_types=[
            {"name": name, "count": count} 
            for name, count in popular_exam_types
        ]
    )

@router.get("/users", response_model=List[UserAdmin])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcı listesi"""
    query = db.query(User)
    
    if search:
        query = query.filter(
            User.email.contains(search) | 
            User.full_name.contains(search)
        )
    
    users = query.offset(skip).limit(limit).all()
    
    return [
        UserAdmin(
            id=user.id,
            email=user.email,
            full_name=f"{user.first_name} {user.last_name}",
            is_active=user.is_active,
            is_admin=user.is_admin,
            created_at=user.created_at,
            last_login=getattr(user, 'last_login', None)
        )
        for user in users
    ]

@router.get("/practice-exams", response_model=List[PracticeExamAdmin])
async def get_practice_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Deneme sınavları listesi"""
    query = db.query(PracticeExam)
    
    if status:
        query = query.filter(PracticeExam.status == status)
    
    exams = query.order_by(desc(PracticeExam.created_at)).offset(skip).limit(limit).all()
    
    return [
        PracticeExamAdmin(
            id=exam.id,
            name=exam.name,
            user_id=exam.user_id,
            user_email=exam.user.email if exam.user else "",
            exam_type_name=exam.exam_type.name if exam.exam_type else "",
            status=exam.status,
            score=exam.score,
            total_questions=exam.total_questions,
            created_at=exam.created_at,
            start_time=exam.start_time,
            end_time=exam.end_time
        )
        for exam in exams
    ]

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Soru silme"""
    question = db.query(ExamQuestion).filter(ExamQuestion.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Soru bulunamadı")
    
    question.is_active = False
    db.commit()
    
    return {"message": "Soru başarıyla silindi"}

@router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcı durumunu aktif/pasif yap"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {
        "message": f"Kullanıcı durumu {'aktif' if user.is_active else 'pasif'} yapıldı",
        "user_id": user_id,
        "is_active": user.is_active
    }

@router.get("/system-health")
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Sistem sağlık durumu"""
    try:
        # Database bağlantı testi
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # ExamAgent testi
    try:
        agent = ExamAgent()
        agent_counts = agent.get_exam_question_counts()
        agent_status = "healthy" if agent_counts else "unhealthy"
    except Exception:
        agent_status = "unhealthy"
    
    return {
        "timestamp": datetime.now(),
        "database": db_status,
        "exam_agent": agent_status,
        "overall_status": "healthy" if db_status == "healthy" and agent_status == "healthy" else "unhealthy"
    }

# ============ USER MANAGEMENT ENDPOINTS ============

@router.post("/users", response_model=UserAdmin)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni kullanıcı oluştur"""
    # Email kontrolü
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Username kontrolü
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Yeni kullanıcı oluştur
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        is_admin=user_data.is_admin
    )
    db_user.set_password(user_data.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserAdmin(
        id=db_user.id,
        email=db_user.email,
        full_name=f"{db_user.first_name} {db_user.last_name}",
        is_active=db_user.is_active,
        is_admin=db_user.is_admin,
        created_at=db_user.created_at
    )

@router.put("/users/{user_id}", response_model=UserAdmin)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcı güncelle"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Email güncellemesi varsa kontrol et
    if user_data.email and user_data.email != db_user.email:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(status_code=400, detail="Email already exists")
    
    # Username güncellemesi varsa kontrol et
    if user_data.username and user_data.username != db_user.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(status_code=400, detail="Username already exists")
    
    # Güncelleme
    for field, value in user_data.dict(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    db.commit()
    db.refresh(db_user)
    
    return UserAdmin(
        id=db_user.id,
        email=db_user.email,
        full_name=f"{db_user.first_name} {db_user.last_name}",
        is_active=db_user.is_active,
        is_admin=db_user.is_admin,
        created_at=db_user.created_at
    )

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcı sil"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    db.commit()
    
    return {"message": "User deleted successfully"}

@router.post("/users/{user_id}/activate")
async def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcıyı aktifleştir"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcıyı pasifleştir"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.post("/users/{user_id}/make-admin")
async def make_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcıyı admin yap"""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.is_admin = True
    db.commit()
    
    return {"message": "User made admin successfully"}

@router.post("/users/{user_id}/remove-admin")
async def remove_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Kullanıcının admin yetkisini kaldır"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot remove admin rights from yourself")
        
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_user.is_admin = False
    db.commit()
    
    return {"message": "Admin rights removed successfully"}

# ============ SUBJECT MANAGEMENT ENDPOINTS ============

@router.get("/subjects", response_model=List[SubjectAdmin])
async def get_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Ders listesi"""
    subjects = db.query(Subject).all()
    
    return [
        SubjectAdmin(
            id=subject.id,
            name=subject.name,
            description=subject.description,
            created_at=subject.created_at,
            topics_count=db.query(Topic).filter(Topic.subject_id == subject.id).count()
        )
        for subject in subjects
    ]

@router.post("/subjects", response_model=SubjectAdmin)
async def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni ders oluştur"""
    # Ders adı kontrolü
    if db.query(Subject).filter(Subject.name == subject_data.name).first():
        raise HTTPException(status_code=400, detail="Subject name already exists")
    
    db_subject = Subject(
        name=subject_data.name,
        description=subject_data.description
    )
    
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    
    return SubjectAdmin(
        id=db_subject.id,
        name=db_subject.name,
        description=db_subject.description,
        created_at=db_subject.created_at,
        topics_count=0
    )

@router.put("/subjects/{subject_id}", response_model=SubjectAdmin)
async def update_subject(
    subject_id: int,
    subject_data: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Ders güncelle"""
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Ders adı güncellemesi varsa kontrol et
    if subject_data.name and subject_data.name != db_subject.name:
        if db.query(Subject).filter(Subject.name == subject_data.name).first():
            raise HTTPException(status_code=400, detail="Subject name already exists")
    
    # Güncelleme
    for field, value in subject_data.dict(exclude_unset=True).items():
        setattr(db_subject, field, value)
    
    db.commit()
    db.refresh(db_subject)
    
    return SubjectAdmin(
        id=db_subject.id,
        name=db_subject.name,
        description=db_subject.description,
        created_at=db_subject.created_at,
        topics_count=db.query(Topic).filter(Topic.subject_id == db_subject.id).count()
    )

@router.delete("/subjects/{subject_id}")
async def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Ders sil"""
    db_subject = db.query(Subject).filter(Subject.id == subject_id).first()
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # İlgili konuları da sil
    db.query(Topic).filter(Topic.subject_id == subject_id).delete()
    db.delete(db_subject)
    db.commit()
    
    return {"message": "Subject deleted successfully"}

# ============ TOPIC MANAGEMENT ENDPOINTS ============

@router.get("/topics", response_model=List[TopicAdmin])
async def get_topics(
    subject_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Konu listesi"""
    query = db.query(Topic)
    
    if subject_id:
        query = query.filter(Topic.subject_id == subject_id)
    
    topics = query.all()
    
    return [
        TopicAdmin(
            id=topic.id,
            subject_id=topic.subject_id,
            subject_name=db.query(Subject).filter(Subject.id == topic.subject_id).first().name if db.query(Subject).filter(Subject.id == topic.subject_id).first() else "Unknown",
            name=topic.name,
            description=topic.description,
            created_at=topic.created_at
        )
        for topic in topics
    ]

@router.post("/topics", response_model=TopicAdmin)
async def create_topic(
    topic_data: TopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni konu oluştur"""
    # Subject var mı kontrol et
    subject = db.query(Subject).filter(Subject.id == topic_data.subject_id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    db_topic = Topic(
        subject_id=topic_data.subject_id,
        name=topic_data.name,
        description=topic_data.description
    )
    
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    
    return TopicAdmin(
        id=db_topic.id,
        subject_id=db_topic.subject_id,
        subject_name=subject.name,
        name=db_topic.name,
        description=db_topic.description,
        created_at=db_topic.created_at
    )

@router.put("/topics/{topic_id}", response_model=TopicAdmin)
async def update_topic(
    topic_id: int,
    topic_data: TopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Konu güncelle"""
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Subject değişecekse kontrol et
    if topic_data.subject_id and topic_data.subject_id != db_topic.subject_id:
        subject = db.query(Subject).filter(Subject.id == topic_data.subject_id).first()
        if not subject:
            raise HTTPException(status_code=404, detail="Subject not found")
    
    # Güncelleme
    for field, value in topic_data.dict(exclude_unset=True).items():
        setattr(db_topic, field, value)
    
    db.commit()
    db.refresh(db_topic)
    
    subject = db.query(Subject).filter(Subject.id == db_topic.subject_id).first()
    
    return TopicAdmin(
        id=db_topic.id,
        subject_id=db_topic.subject_id,
        subject_name=subject.name if subject else "Unknown",
        name=db_topic.name,
        description=db_topic.description,
        created_at=db_topic.created_at
    )

@router.delete("/topics/{topic_id}")
async def delete_topic(
    topic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Konu sil"""
    db_topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    db.delete(db_topic)
    db.commit()
    
    return {"message": "Topic deleted successfully"}

# ============ EXAM TYPE MANAGEMENT ENDPOINTS ============

@router.post("/exam-types", response_model=ExamTypeAdmin)
async def create_exam_type(
    exam_type_data: ExamTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni sınav türü oluştur"""
    # Sınav türü adı kontrolü
    if db.query(ExamType).filter(ExamType.name == exam_type_data.name).first():
        raise HTTPException(status_code=400, detail="Exam type name already exists")
    
    db_exam_type = ExamType(
        name=exam_type_data.name,
        description=exam_type_data.description,
        duration_minutes=exam_type_data.duration_minutes
    )
    
    db.add(db_exam_type)
    db.commit()
    db.refresh(db_exam_type)
    
    return ExamTypeAdmin(
        id=db_exam_type.id,
        name=db_exam_type.name,
        description=db_exam_type.description,
        duration_minutes=db_exam_type.duration_minutes,
        is_active=db_exam_type.is_active,
        sections_count=0
    )

@router.put("/exam-types/{exam_type_id}", response_model=ExamTypeAdmin)
async def update_exam_type(
    exam_type_id: int,
    exam_type_data: ExamTypeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Sınav türü güncelle"""
    db_exam_type = db.query(ExamType).filter(ExamType.id == exam_type_id).first()
    if not db_exam_type:
        raise HTTPException(status_code=404, detail="Exam type not found")
    
    # Sınav türü adı güncellemesi varsa kontrol et
    if exam_type_data.name and exam_type_data.name != db_exam_type.name:
        if db.query(ExamType).filter(ExamType.name == exam_type_data.name).first():
            raise HTTPException(status_code=400, detail="Exam type name already exists")
    
    # Güncelleme
    for field, value in exam_type_data.dict(exclude_unset=True).items():
        setattr(db_exam_type, field, value)
    
    db.commit()
    db.refresh(db_exam_type)
    
    return ExamTypeAdmin(
        id=db_exam_type.id,
        name=db_exam_type.name,
        description=db_exam_type.description,
        duration_minutes=db_exam_type.duration_minutes,
        is_active=db_exam_type.is_active,
        sections_count=len(db_exam_type.sections) if db_exam_type.sections else 0
    )

@router.delete("/exam-types/{exam_type_id}")
async def delete_exam_type(
    exam_type_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Sınav türü sil"""
    db_exam_type = db.query(ExamType).filter(ExamType.id == exam_type_id).first()
    if not db_exam_type:
        raise HTTPException(status_code=404, detail="Exam type not found")
    
    # İlgili bölümleri ve soruları da sil
    sections = db.query(ExamSection).filter(ExamSection.exam_type_id == exam_type_id).all()
    for section in sections:
        db.query(ExamQuestion).filter(ExamQuestion.exam_section_id == section.id).delete()
    
    db.query(ExamSection).filter(ExamSection.exam_type_id == exam_type_id).delete()
    db.delete(db_exam_type)
    db.commit()
    
    return {"message": "Exam type deleted successfully"}

# ============ EDUCATION LEVEL MANAGEMENT ENDPOINTS ============

@router.post("/education-levels", response_model=EducationLevel, status_code=201)
async def create_education_level_admin(
    level_data: EducationLevelCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni eğitim seviyesi oluştur (Admin)"""
    # İsim kontrolü
    existing_level = EducationLevelService.get_by_name(db, level_data.name)
    if existing_level:
        raise HTTPException(status_code=400, detail="Bu isimde bir eğitim seviyesi zaten mevcut")
    
    return EducationLevelService.create(db, level_data)

@router.put("/education-levels/{level_id}", response_model=EducationLevel)
async def update_education_level_admin(
    level_id: int, 
    level_data: EducationLevelUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Eğitim seviyesini güncelle (Admin)"""
    level = EducationLevelService.update(db, level_id, level_data)
    if not level:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")
    return level

@router.delete("/education-levels/{level_id}", status_code=204)
async def delete_education_level_admin(
    level_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Eğitim seviyesini sil (Admin)"""
    success = EducationLevelService.delete(db, level_id)
    if not success:
        raise HTTPException(status_code=404, detail="Eğitim seviyesi bulunamadı")

# ============ COURSE MANAGEMENT ENDPOINTS ============

@router.post("/courses", response_model=Course, status_code=201)
async def create_course_admin(
    course_data: CourseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni ders oluştur (Admin)"""
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
async def update_course_admin(
    course_id: int, 
    course_data: CourseUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Dersi güncelle (Admin)"""
    course = CourseService.update(db, course_id, course_data)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    return course

@router.delete("/courses/{course_id}", status_code=204)
async def delete_course_admin(
    course_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Dersi sil (Admin)"""
    success = CourseService.delete(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")

# ============ COURSE TOPIC MANAGEMENT ENDPOINTS ============

@router.post("/course-topics", response_model=CourseTopic, status_code=201)
async def create_course_topic_admin(
    topic_data: CourseTopicCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Yeni konu oluştur (Admin)"""
    # Ders kontrolü
    course = CourseService.get_by_id(db, topic_data.course_id)
    if not course:
        raise HTTPException(status_code=400, detail="Geçersiz ders")
    
    return CourseTopicService.create(db, topic_data)

@router.put("/course-topics/{topic_id}", response_model=CourseTopic)
async def update_course_topic_admin(
    topic_id: int, 
    topic_data: CourseTopicUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Konuyu güncelle (Admin)"""
    topic = CourseTopicService.update(db, topic_id, topic_data)
    if not topic:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")
    return topic

@router.delete("/course-topics/{topic_id}", status_code=204)
async def delete_course_topic_admin(
    topic_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Konuyu sil (Admin)"""
    success = CourseTopicService.delete(db, topic_id)
    if not success:
        raise HTTPException(status_code=404, detail="Konu bulunamadı")

@router.put("/courses/{course_id}/topics/reorder")
async def reorder_course_topics_admin(
    course_id: int,
    topic_orders: List[dict],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Konuları yeniden sırala (Admin)"""
    # Ders kontrolü
    course = CourseService.get_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Ders bulunamadı")
    
    success = CourseTopicService.reorder_topics(db, course_id, topic_orders)
    if not success:
        raise HTTPException(status_code=400, detail="Sıralama güncellenemedi")
    
    return {"message": "Konular başarıyla sıralandı"}

# ============ EXAM MANAGEMENT ENDPOINTS ============

@router.delete("/practice-exams/{exam_id}", status_code=204)
async def delete_practice_exam_admin(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Deneme sınavını sil (Admin)"""
    from app.agents.exam_agent import ExamAgent
    exam_agent = ExamAgent()
    success = exam_agent.delete_practice_exam(db, exam_id, user_id=None, admin_delete=True)
    if not success:
        raise HTTPException(status_code=404, detail="Sınav bulunamadı")

@router.patch("/practice-exams/{exam_id}/status")
async def update_practice_exam_status_admin(
    exam_id: int,
    status_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Sınav durumunu güncelle (Admin)"""
    from app.agents.exam_agent import ExamAgent
    exam_agent = ExamAgent()
    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status gerekli")
    
    success = exam_agent.update_practice_exam_status(db, exam_id, new_status, user_id=None, admin_update=True)
    if not success:
        raise HTTPException(status_code=404, detail="Sınav bulunamadı")
    
    return {"message": "Sınav durumu başarıyla güncellendi"}

@router.get("/system-exam-statistics", response_model=Dict[str, Any])
async def get_admin_exam_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_access)
):
    """Tüm sistem sınav istatistiklerini al (Admin)"""
    from app.agents.exam_agent import ExamAgent
    exam_agent = ExamAgent()
    return exam_agent.get_exam_statistics(db, user_id=None)
