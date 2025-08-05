from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "EduAI - Intelligent Learning Platform"
    PROJECT_DESCRIPTION: str = "An AI-powered learning platform that generates personalized questions and recommends resources"
    PROJECT_VERSION: str = "1.0.0"
    
    # Database
    DATABASE_URL: str = "sqlite:///./eduai.db"
    
    # API Keys
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None  # New Google GenAI SDK uses GOOGLE_API_KEY
    YOUTUBE_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None
    
    # JWT Authentication
    JWT_SECRET_KEY: str = "your-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
