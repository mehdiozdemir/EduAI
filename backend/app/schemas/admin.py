from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class AdminStatsResponse(BaseModel):
    total_users: int
    total_exam_types: int
    total_questions: int
    monthly_exams: int
    active_users: int
    popular_exam_types: List[Dict[str, Any]]

class UserAdmin(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    first_name: str
    last_name: str
    password: str
    is_admin: bool = False

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class SubjectAdmin(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    topics_count: int = 0

    class Config:
        from_attributes = True

class SubjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TopicAdmin(BaseModel):
    id: int
    subject_id: int
    subject_name: str
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TopicCreate(BaseModel):
    subject_id: int
    name: str
    description: Optional[str] = None

class TopicUpdate(BaseModel):
    subject_id: Optional[int] = None
    name: Optional[str] = None
    description: Optional[str] = None

class ExamTypeAdmin(BaseModel):
    id: int
    name: str
    description: Optional[str]
    duration_minutes: Optional[int]
    is_active: bool
    sections_count: int

    class Config:
        from_attributes = True

class ExamTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    education_level_id: int

class ExamTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None

class ExamSectionAdmin(BaseModel):
    id: int
    name: str
    exam_type_id: int
    exam_type_name: str
    question_count: Optional[int]
    is_active: bool
    questions_count: int

    class Config:
        from_attributes = True

class ExamQuestionAdmin(BaseModel):
    id: int
    question_text: str
    exam_section_id: int
    section_name: str
    difficulty_level: Optional[int]
    correct_answer: str
    created_by: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PracticeExamAdmin(BaseModel):
    id: int
    name: str
    user_id: int
    user_email: str
    exam_type_name: str
    status: str
    score: Optional[float]
    total_questions: int
    created_at: datetime
    start_time: Optional[datetime]
    end_time: Optional[datetime]

    class Config:
        from_attributes = True

# ============ EDUCATION SCHEMAS ============

class EducationLevelBase(BaseModel):
    name: str
    description: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None

class EducationLevelCreate(EducationLevelBase):
    pass

class EducationLevelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    min_age: Optional[int] = None
    max_age: Optional[int] = None

class EducationLevel(EducationLevelBase):
    id: int
    created_at: datetime
    courses_count: int = 0

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    education_level_id: int

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    education_level_id: Optional[int] = None

class Course(CourseBase):
    id: int
    created_at: datetime
    topics_count: int = 0

    class Config:
        from_attributes = True

class CourseTopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    course_id: int
    sort_order: Optional[int] = None
    difficulty_level: Optional[int] = 1
    estimated_duration: Optional[int] = None

class CourseTopicCreate(CourseTopicBase):
    pass

class CourseTopicUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
    sort_order: Optional[int] = None
    difficulty_level: Optional[int] = None
    estimated_duration: Optional[int] = None

class CourseTopic(CourseTopicBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
