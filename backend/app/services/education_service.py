from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional
from app.models.education_level import EducationLevel, Course, CourseTopic
from app.schemas.education_level import (
    EducationLevelCreate, EducationLevelUpdate,
    CourseCreate, CourseUpdate,
    CourseTopicCreate, CourseTopicUpdate
)

class EducationLevelService:
    """Eğitim seviyesi servisi"""
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[EducationLevel]:
        """Tüm eğitim seviyelerini getir"""
        return db.query(EducationLevel).order_by(EducationLevel.sort_order).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, level_id: int) -> Optional[EducationLevel]:
        """ID'ye göre eğitim seviyesi getir"""
        return db.query(EducationLevel).filter(EducationLevel.id == level_id).first()
    
    @staticmethod
    def get_by_name(db: Session, name: str) -> Optional[EducationLevel]:
        """İsme göre eğitim seviyesi getir"""
        return db.query(EducationLevel).filter(EducationLevel.name == name).first()
    
    @staticmethod
    def create(db: Session, level_data: EducationLevelCreate) -> EducationLevel:
        """Yeni eğitim seviyesi oluştur"""
        db_level = EducationLevel(**level_data.dict())
        db.add(db_level)
        db.commit()
        db.refresh(db_level)
        return db_level
    
    @staticmethod
    def update(db: Session, level_id: int, level_data: EducationLevelUpdate) -> Optional[EducationLevel]:
        """Eğitim seviyesini güncelle"""
        db_level = db.query(EducationLevel).filter(EducationLevel.id == level_id).first()
        if not db_level:
            return None
        
        update_data = level_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_level, field, value)
        
        db.commit()
        db.refresh(db_level)
        return db_level
    
    @staticmethod
    def delete(db: Session, level_id: int) -> bool:
        """Eğitim seviyesini sil"""
        db_level = db.query(EducationLevel).filter(EducationLevel.id == level_id).first()
        if not db_level:
            return False
        
        db.delete(db_level)
        db.commit()
        return True

class CourseService:
    """Ders servisi"""
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, education_level_id: Optional[int] = None) -> List[Course]:
        """Tüm dersleri getir"""
        query = db.query(Course)
        if education_level_id:
            query = query.filter(Course.education_level_id == education_level_id)
        return query.filter(Course.is_active == 1).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, course_id: int) -> Optional[Course]:
        """ID'ye göre ders getir"""
        return db.query(Course).filter(and_(Course.id == course_id, Course.is_active == 1)).first()
    
    @staticmethod
    def get_by_code(db: Session, code: str) -> Optional[Course]:
        """Koda göre ders getir"""
        return db.query(Course).filter(and_(Course.code == code, Course.is_active == 1)).first()
    
    @staticmethod
    def get_by_education_level(db: Session, education_level_id: int) -> List[Course]:
        """Eğitim seviyesine göre dersleri getir"""
        return db.query(Course).filter(
            and_(Course.education_level_id == education_level_id, Course.is_active == 1)
        ).all()
    
    @staticmethod
    def search_courses(db: Session, search_term: str, education_level_id: Optional[int] = None) -> List[Course]:
        """Ders ara"""
        query = db.query(Course).filter(Course.is_active == 1)
        
        if education_level_id:
            query = query.filter(Course.education_level_id == education_level_id)
        
        query = query.filter(
            or_(
                Course.name.ilike(f"%{search_term}%"),
                Course.description.ilike(f"%{search_term}%"),
                Course.code.ilike(f"%{search_term}%")
            )
        )
        
        return query.all()
    
    @staticmethod
    def create(db: Session, course_data: CourseCreate) -> Course:
        """Yeni ders oluştur"""
        # Otomatik kod oluştur
        if not course_data.code:
            education_level = db.query(EducationLevel).filter(EducationLevel.id == course_data.education_level_id).first()
            if education_level:
                level_abbr = education_level.name[:3].upper()  # İlk 3 harf
                course_abbr = course_data.name[:3].upper()  # İlk 3 harf
                course_data.code = f"{course_abbr}_{level_abbr}"
        
        db_course = Course(**course_data.dict())
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course
    
    @staticmethod
    def update(db: Session, course_id: int, course_data: CourseUpdate) -> Optional[Course]:
        """Dersi güncelle"""
        db_course = db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return None
        
        update_data = course_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_course, field, value)
        
        db.commit()
        db.refresh(db_course)
        return db_course
    
    @staticmethod
    def delete(db: Session, course_id: int) -> bool:
        """Dersi sil (soft delete)"""
        db_course = db.query(Course).filter(Course.id == course_id).first()
        if not db_course:
            return False
        
        db_course.is_active = 0
        db.commit()
        return True

class CourseTopicService:
    """Ders konusu servisi"""
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, course_id: Optional[int] = None) -> List[CourseTopic]:
        """Tüm konuları getir"""
        query = db.query(CourseTopic)
        if course_id:
            query = query.filter(CourseTopic.course_id == course_id)
        return query.filter(CourseTopic.is_active == 1).order_by(CourseTopic.sort_order).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, topic_id: int) -> Optional[CourseTopic]:
        """ID'ye göre konu getir"""
        return db.query(CourseTopic).filter(and_(CourseTopic.id == topic_id, CourseTopic.is_active == 1)).first()
    
    @staticmethod
    def get_by_course(db: Session, course_id: int) -> List[CourseTopic]:
        """Derse göre konuları getir"""
        return db.query(CourseTopic).filter(
            and_(CourseTopic.course_id == course_id, CourseTopic.is_active == 1)
        ).order_by(CourseTopic.sort_order).all()
    
    @staticmethod
    def get_by_difficulty(db: Session, difficulty_level: int, course_id: Optional[int] = None) -> List[CourseTopic]:
        """Zorluk seviyesine göre konuları getir"""
        query = db.query(CourseTopic).filter(
            and_(CourseTopic.difficulty_level == difficulty_level, CourseTopic.is_active == 1)
        )
        if course_id:
            query = query.filter(CourseTopic.course_id == course_id)
        return query.order_by(CourseTopic.sort_order).all()
    
    @staticmethod
    def search_topics(db: Session, search_term: str, course_id: Optional[int] = None) -> List[CourseTopic]:
        """Konu ara"""
        query = db.query(CourseTopic).filter(CourseTopic.is_active == 1)
        
        if course_id:
            query = query.filter(CourseTopic.course_id == course_id)
        
        query = query.filter(
            or_(
                CourseTopic.name.ilike(f"%{search_term}%"),
                CourseTopic.description.ilike(f"%{search_term}%")
            )
        )
        
        return query.order_by(CourseTopic.sort_order).all()
    
    @staticmethod
    def create(db: Session, topic_data: CourseTopicCreate) -> CourseTopic:
        """Yeni konu oluştur"""
        # Otomatik sıra numarası ata
        if not topic_data.sort_order:
            max_order = db.query(CourseTopic).filter(CourseTopic.course_id == topic_data.course_id).count()
            topic_data.sort_order = max_order + 1
        
        db_topic = CourseTopic(**topic_data.dict())
        db.add(db_topic)
        db.commit()
        db.refresh(db_topic)
        return db_topic
    
    @staticmethod
    def update(db: Session, topic_id: int, topic_data: CourseTopicUpdate) -> Optional[CourseTopic]:
        """Konuyu güncelle"""
        db_topic = db.query(CourseTopic).filter(CourseTopic.id == topic_id).first()
        if not db_topic:
            return None
        
        update_data = topic_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_topic, field, value)
        
        db.commit()
        db.refresh(db_topic)
        return db_topic
    
    @staticmethod
    def delete(db: Session, topic_id: int) -> bool:
        """Konuyu sil (soft delete)"""
        db_topic = db.query(CourseTopic).filter(CourseTopic.id == topic_id).first()
        if not db_topic:
            return False
        
        db_topic.is_active = 0
        db.commit()
        return True
    
    @staticmethod
    def reorder_topics(db: Session, course_id: int, topic_orders: List[dict]) -> bool:
        """Konuları yeniden sırala"""
        try:
            for item in topic_orders:
                topic_id = item.get('topic_id')
                new_order = item.get('sort_order')
                
                db_topic = db.query(CourseTopic).filter(
                    and_(CourseTopic.id == topic_id, CourseTopic.course_id == course_id)
                ).first()
                
                if db_topic:
                    db_topic.sort_order = new_order
            
            db.commit()
            return True
        except Exception:
            db.rollback()
            return False
