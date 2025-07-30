from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class EducationLevel(Base):
    """Eğitim seviyeleri: İlkokul, Ortaokul, Lise"""
    __tablename__ = "education_levels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)  # İlkokul, Ortaokul, Lise
    description = Column(Text)
    sort_order = Column(Integer, index=True)  # Sıralama için (1: İlkokul, 2: Ortaokul, 3: Lise)
    grade_range = Column(String(20))  # Örnek: "1-4", "5-8", "9-12"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    courses = relationship("Course", back_populates="education_level", cascade="all, delete-orphan")

class Course(Base):
    """Dersler: Matematik, Türkçe, Fen Bilgisi vs."""
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)  # Matematik, Türkçe, Fen Bilgisi
    description = Column(Text)
    education_level_id = Column(Integer, ForeignKey("education_levels.id"), nullable=False)
    code = Column(String(20), unique=True, index=True)  # Örnek: MAT_ILK, MAT_ORT, MAT_LIS
    color = Column(String(7))  # Hex renk kodu: #FF5733
    icon = Column(String(50))  # Icon class veya emoji
    is_active = Column(Integer, default=1)  # Aktif/Pasif durumu
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    education_level = relationship("EducationLevel", back_populates="courses")
    topics = relationship("CourseTopic", back_populates="course", cascade="all, delete-orphan")

class CourseTopic(Base):
    """Ders konuları: Matematik altında Cebir, Geometri vs."""
    __tablename__ = "course_topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), index=True, nullable=False)
    description = Column(Text)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    sort_order = Column(Integer, index=True)  # Konuların sırası
    difficulty_level = Column(Integer, default=1)  # 1: Kolay, 2: Orta, 3: Zor
    estimated_duration = Column(Integer)  # Tahmini süre (dakika)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    course = relationship("Course", back_populates="topics")
