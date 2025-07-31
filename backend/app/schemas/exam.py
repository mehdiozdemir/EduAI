from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ExamType Schemas
class ExamTypeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Sınav türü adı")
    description: Optional[str] = Field(None, description="Sınav açıklaması")
    education_level_id: int = Field(..., description="Eğitim seviyesi ID")
    duration_minutes: Optional[int] = Field(120, ge=30, le=480, description="Sınav süresi (dakika)")
    total_questions: Optional[int] = Field(40, ge=1, le=200, description="Toplam soru sayısı")
    is_active: Optional[bool] = Field(True, description="Aktif durumu")

class ExamTypeCreate(ExamTypeBase):
    pass

class ExamTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    education_level_id: Optional[int] = None
    duration_minutes: Optional[int] = Field(None, ge=30, le=480)
    total_questions: Optional[int] = Field(None, ge=1, le=200)
    is_active: Optional[bool] = None

class ExamType(ExamTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# ExamSection Schemas
class ExamSectionBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Bölüm adı")
    exam_type_id: int = Field(..., description="Sınav türü ID")
    course_id: int = Field(..., description="Ders ID")
    question_count: Optional[int] = Field(10, ge=1, le=50, description="Soru sayısı")
    sort_order: Optional[int] = Field(None, description="Sıralama")
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$', description="Renk kodu")
    icon: Optional[str] = Field(None, max_length=50, description="İkon")
    is_active: Optional[bool] = Field(True, description="Aktif durumu")

class ExamSectionCreate(ExamSectionBase):
    pass

class ExamSectionUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    exam_type_id: Optional[int] = None
    course_id: Optional[int] = None
    question_count: Optional[int] = Field(None, ge=1, le=50)
    sort_order: Optional[int] = None
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)
    is_active: Optional[bool] = None

class ExamSection(ExamSectionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExamSectionWithCourse(ExamSection):
    course: "Course"

# ExamQuestion Schemas
class ExamQuestionBase(BaseModel):
    question_text: str = Field(..., min_length=10, description="Soru metni")
    option_a: str = Field(..., min_length=1, max_length=500, description="A şıkkı")
    option_b: str = Field(..., min_length=1, max_length=500, description="B şıkkı")
    option_c: str = Field(..., min_length=1, max_length=500, description="C şıkkı")
    option_d: str = Field(..., min_length=1, max_length=500, description="D şıkkı")
    option_e: Optional[str] = Field(None, max_length=500, description="E şıkkı")
    correct_answer: str = Field(..., pattern=r'^[A-E]$', description="Doğru cevap")
    explanation: Optional[str] = Field(None, description="Çözüm açıklaması")
    difficulty_level: Optional[int] = Field(2, ge=1, le=3, description="Zorluk seviyesi")
    exam_section_id: int = Field(..., description="Sınav bölümü ID")
    topic_id: Optional[int] = Field(None, description="İlgili konu ID")
    is_active: Optional[bool] = Field(True, description="Aktif durumu")
    created_by: Optional[str] = Field("AI_AGENT", max_length=50, description="Oluşturan")

class ExamQuestionCreate(ExamQuestionBase):
    pass

class ExamQuestionUpdate(BaseModel):
    question_text: Optional[str] = Field(None, min_length=10)
    option_a: Optional[str] = Field(None, min_length=1, max_length=500)
    option_b: Optional[str] = Field(None, min_length=1, max_length=500)
    option_c: Optional[str] = Field(None, min_length=1, max_length=500)
    option_d: Optional[str] = Field(None, min_length=1, max_length=500)
    option_e: Optional[str] = Field(None, max_length=500)
    correct_answer: Optional[str] = Field(None, pattern=r'^[A-E]$')
    explanation: Optional[str] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=3)
    exam_section_id: Optional[int] = None
    topic_id: Optional[int] = None
    is_active: Optional[bool] = None

class ExamQuestion(ExamQuestionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExamQuestionWithDetails(ExamQuestion):
    exam_section: ExamSection
    topic: Optional["CourseTopic"] = None

# PracticeExam Schemas
class PracticeExamBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Deneme sınavı adı")
    exam_type_id: int = Field(..., description="Sınav türü ID")
    exam_section_id: int = Field(..., description="Sınav bölümü ID")
    user_id: int = Field(..., description="Kullanıcı ID")
    # total_questions kaldırıldı - sabit soru sayıları kullanılıyor

class PracticeExamCreate(PracticeExamBase):
    pass

class PracticeExam(PracticeExamBase):
    id: int
    status: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    correct_answers: int
    wrong_answers: int
    empty_answers: int
    score: float
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PracticeExamWithDetails(PracticeExam):
    exam_type: ExamType
    exam_section: ExamSection
    user: "User"

# PracticeQuestionResult Schemas
class PracticeQuestionResultBase(BaseModel):
    practice_exam_id: int = Field(..., description="Deneme sınavı ID")
    question_id: int = Field(..., description="Soru ID")
    user_answer: Optional[str] = Field(None, pattern=r'^[A-E]$', description="Kullanıcı cevabı")
    time_spent_seconds: Optional[int] = Field(None, ge=0, description="Harcanan süre")

class PracticeQuestionResultCreate(PracticeQuestionResultBase):
    pass

class PracticeQuestionResult(PracticeQuestionResultBase):
    id: int
    is_correct: Optional[bool] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PracticeQuestionResultWithDetails(PracticeQuestionResult):
    question: ExamQuestion

# Response Models
class ExamSystemOverview(BaseModel):
    """Sınav sistemi özeti"""
    exam_types: List[ExamType]
    total_exam_types: int
    total_sections: int
    total_questions: int
    total_practice_exams: int

class QuestionGenerationRequest(BaseModel):
    """Soru üretme isteği"""
    exam_section_id: int = Field(..., description="Sınav bölümü ID")
    topic_ids: Optional[List[int]] = Field(None, description="Konu ID'leri")
    question_count: int = Field(..., ge=1, le=40, description="Üretilecek soru sayısı")
    difficulty_level: Optional[int] = Field(None, ge=1, le=3, description="Zorluk seviyesi")

class QuestionGenerationResponse(BaseModel):
    """Soru üretme yanıtı"""
    success: bool
    message: str
    generated_count: int
    questions: List[ExamQuestion]

class PracticeExamStartRequest(BaseModel):
    """Deneme sınavı başlatma isteği"""
    exam_section_id: int = Field(..., description="Sınav bölümü ID")
    question_count: Optional[int] = Field(40, ge=1, le=40, description="Soru sayısı")

class PracticeExamAnswerRequest(BaseModel):
    """Deneme sınavı cevap verme isteği"""
    question_id: int = Field(..., description="Soru ID")
    user_answer: Optional[str] = Field(None, pattern=r'^[A-E]$', description="Kullanıcı cevabı")
    time_spent_seconds: Optional[int] = Field(None, ge=0, description="Harcanan süre")

class PracticeExamResults(BaseModel):
    """Deneme sınavı sonuçları"""
    practice_exam: PracticeExam
    question_results: List[PracticeQuestionResultWithDetails]
    statistics: dict
    performance_analysis: dict

# Basit Practice Exam Schemas
class PracticeExamCreate(BaseModel):
    exam_section_id: int = Field(..., description="Sınav bölümü ID")
    # question_count parametresi tamamen kaldırıldı - sabit soru sayıları kullanılıyor

class PracticeExamResult(BaseModel):
    exam_id: int
    score: float = Field(..., description="Puan (0-100)")
    correct_answers: int = Field(..., description="Doğru cevap sayısı")
    total_questions: int = Field(..., description="Toplam soru sayısı")
    time_spent: int = Field(..., description="Geçen süre (saniye)")
    percentage: float = Field(..., description="Başarı yüzdesi")
    
    class Config:
        from_attributes = True

# Import edilecek modeller
from app.schemas.education_level import Course, CourseTopic
from app.schemas.user import User
