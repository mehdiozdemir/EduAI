from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ExamType(Base):
    """Sınav türleri: LGS, TYT, AYT"""
    __tablename__ = "exam_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, index=True, nullable=False)  # LGS, TYT, AYT
    description = Column(Text)
    education_level_id = Column(Integer, ForeignKey("education_levels.id"), nullable=False)
    duration_minutes = Column(Integer, default=120)  # Sınav süresi (dakika)
    total_questions = Column(Integer, default=40)  # Toplam soru sayısı
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    education_level = relationship("EducationLevel")
    exam_sections = relationship("ExamSection", back_populates="exam_type", cascade="all, delete-orphan")
    practice_exams = relationship("PracticeExam", back_populates="exam_type", cascade="all, delete-orphan")

class ExamSection(Base):
    """Sınav bölümleri: Matematik, Fen, Sosyal, Türkçe"""
    __tablename__ = "exam_sections"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)  # Matematik, Fen, Sosyal, Türkçe
    exam_type_id = Column(Integer, ForeignKey("exam_types.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    question_count = Column(Integer, default=10)  # Bu bölümdeki soru sayısı
    sort_order = Column(Integer, index=True)
    color = Column(String(7))  # Bölüm rengi
    icon = Column(String(50))  # Bölüm ikonu
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    exam_type = relationship("ExamType", back_populates="exam_sections")
    course = relationship("Course")
    questions = relationship("ExamQuestion", back_populates="exam_section", cascade="all, delete-orphan")

class ExamQuestion(Base):
    """Sınav soruları"""
    __tablename__ = "exam_questions"

    id = Column(Integer, primary_key=True, index=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    option_e = Column(String(500))  # E şıkkı opsiyonel (TYT/AYT için)
    correct_answer = Column(String(1), nullable=False)  # A, B, C, D, E
    explanation = Column(Text)  # Soru çözümü
    difficulty_level = Column(Integer, default=2)  # 1: Kolay, 2: Orta, 3: Zor
    exam_section_id = Column(Integer, ForeignKey("exam_sections.id"), nullable=False)
    topic_id = Column(Integer, ForeignKey("course_topics.id"))  # İlgili konu
    is_active = Column(Boolean, default=True)
    created_by = Column(String(50), default="AI_AGENT")  # Soruyu kim oluşturdu
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    exam_section = relationship("ExamSection", back_populates="questions")
    topic = relationship("CourseTopic")
    practice_question_results = relationship("PracticeQuestionResult", back_populates="question")

class PracticeExam(Base):
    """Deneme sınavları"""
    __tablename__ = "practice_exams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)  # "TYT Matematik Denemesi #1"
    exam_type_id = Column(Integer, ForeignKey("exam_types.id"), nullable=False)
    exam_section_id = Column(Integer, ForeignKey("exam_sections.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="not_started")  # not_started, in_progress, completed
    start_time = Column(DateTime(timezone=True))
    end_time = Column(DateTime(timezone=True))
    duration_minutes = Column(Integer)  # Gerçek süre
    total_questions = Column(Integer, default=40)
    correct_answers = Column(Integer, default=0)
    wrong_answers = Column(Integer, default=0)
    empty_answers = Column(Integer, default=0)
    score = Column(Float, default=0.0)  # Puan
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    exam_type = relationship("ExamType", back_populates="practice_exams")
    exam_section = relationship("ExamSection")
    user = relationship("User")
    question_results = relationship("PracticeQuestionResult", back_populates="practice_exam", cascade="all, delete-orphan")

class PracticeQuestionResult(Base):
    """Deneme sınavı soru sonuçları"""
    __tablename__ = "practice_question_results"

    id = Column(Integer, primary_key=True, index=True)
    practice_exam_id = Column(Integer, ForeignKey("practice_exams.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("exam_questions.id"), nullable=False)
    user_answer = Column(String(1))  # A, B, C, D, E veya None (boş)
    is_correct = Column(Boolean)
    time_spent_seconds = Column(Integer)  # Bu soruya harcanan süre
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    practice_exam = relationship("PracticeExam", back_populates="question_results")
    question = relationship("ExamQuestion", back_populates="practice_question_results")
