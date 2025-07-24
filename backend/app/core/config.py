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
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()
