from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# EducationLevel Schemas
class EducationLevelBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Eğitim seviyesi adı")
    description: Optional[str] = Field(None, description="Eğitim seviyesi açıklaması")
    sort_order: Optional[int] = Field(None, description="Sıralama")
    grade_range: Optional[str] = Field(None, max_length=20, description="Sınıf aralığı")

class EducationLevelCreate(EducationLevelBase):
    pass

class EducationLevelUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    sort_order: Optional[int] = None
    grade_range: Optional[str] = Field(None, max_length=20)

class EducationLevel(EducationLevelBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EducationLevelWithCourses(EducationLevel):
    courses: List["Course"] = []

# Course Schemas
class CourseBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Ders adı")
    description: Optional[str] = Field(None, description="Ders açıklaması")
    education_level_id: int = Field(..., description="Eğitim seviyesi ID")
    code: Optional[str] = Field(None, max_length=20, description="Ders kodu")
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$', description="Hex renk kodu")
    icon: Optional[str] = Field(None, max_length=50, description="Icon")
    is_active: Optional[int] = Field(1, description="Aktif durumu")

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    education_level_id: Optional[int] = None
    code: Optional[str] = Field(None, max_length=20)
    color: Optional[str] = Field(None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: Optional[str] = Field(None, max_length=50)
    is_active: Optional[int] = None

class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CourseWithEducationLevel(Course):
    education_level: EducationLevel

class CourseWithTopics(Course):
    topics: List["CourseTopic"] = []

# CourseTopic Schemas
class CourseTopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Konu adı")
    description: Optional[str] = Field(None, description="Konu açıklaması")
    course_id: int = Field(..., description="Ders ID")
    sort_order: Optional[int] = Field(None, description="Konu sırası")
    difficulty_level: Optional[int] = Field(1, ge=1, le=3, description="Zorluk seviyesi (1-3)")
    estimated_duration: Optional[int] = Field(None, ge=0, description="Tahmini süre (dakika)")
    is_active: Optional[int] = Field(1, description="Aktif durumu")

class CourseTopicCreate(CourseTopicBase):
    pass

class CourseTopicUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    course_id: Optional[int] = None
    sort_order: Optional[int] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=3)
    estimated_duration: Optional[int] = Field(None, ge=0)
    is_active: Optional[int] = None

class CourseTopic(CourseTopicBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CourseTopicWithCourse(CourseTopic):
    course: Course

# Response Models
class EducationSystemOverview(BaseModel):
    """Tüm eğitim sistemi özeti"""
    education_levels: List[EducationLevelWithCourses]
    total_levels: int
    total_courses: int
    total_topics: int

class CourseListResponse(BaseModel):
    """Ders listesi response"""
    courses: List[CourseWithEducationLevel]
    total: int
    page: int
    page_size: int

class TopicListResponse(BaseModel):
    """Konu listesi response"""
    topics: List[CourseTopicWithCourse]
    total: int
    page: int
    page_size: int
