from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PerformanceAnalysisBase(BaseModel):
    user_id: int
    subject_id: Optional[int] = None
    topic_id: Optional[int] = None
    total_questions: int = 0
    correct_answers: int = 0
    accuracy: float = 0.0
    weakness_level: int = 0

class PerformanceAnalysisCreate(PerformanceAnalysisBase):
    pass

class PerformanceAnalysisUpdate(PerformanceAnalysisBase):
    pass

class PerformanceAnalysisInDBBase(PerformanceAnalysisBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PerformanceAnalysis(PerformanceAnalysisInDBBase):
    pass

class ResourceRecommendationBase(BaseModel):
    performance_analysis_id: int
    resource_type: str
    title: str
    url: str
    description: Optional[str] = None
    relevance_score: float

class ResourceRecommendationCreate(ResourceRecommendationBase):
    pass

class ResourceRecommendationUpdate(ResourceRecommendationBase):
    pass

class ResourceRecommendationInDBBase(ResourceRecommendationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ResourceRecommendation(ResourceRecommendationInDBBase):
    pass
