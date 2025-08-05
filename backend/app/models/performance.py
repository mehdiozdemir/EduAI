from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Enum as SQLAlchemyEnum
from sqlalchemy.sql import func
from app.database import Base
import enum

class RecommendationStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    DELETED = "deleted"

class PerformanceAnalysis(Base):
    __tablename__ = "performance_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True, nullable=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), index=True, nullable=True)
    total_questions = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    weakness_level = Column(Integer, default=0)  # 0-10 scale
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ResourceRecommendation(Base):
    __tablename__ = "resource_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)  # Direct user relation
    performance_analysis_id = Column(Integer, ForeignKey("performance_analyses.id"), index=True, nullable=True)
    resource_type = Column(String)  # "youtube", "book", "ai_advice"
    title = Column(String)
    url = Column(String)
    description = Column(Text)
    relevance_score = Column(Float)  # 0-1 scale
    status = Column(SQLAlchemyEnum(RecommendationStatus), default=RecommendationStatus.ACTIVE)
    category = Column(String, default="general")  # "video", "books", "ai_tips"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
