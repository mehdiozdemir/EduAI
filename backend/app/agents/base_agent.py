from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.config import settings

class BaseAgent(ChatGoogleGenerativeAI):
    """Base class for all agents in the system - extends ChatGoogleGenerativeAI"""
    
    def __init__(self, name: str, description: str, **kwargs):
        # Initialize the parent ChatGoogleGenerativeAI class
        super().__init__(
            model="gemini-2.0-flash",
            google_api_key=settings.GEMINI_API_KEY or "dummy-key",
            temperature=0.7,
            **kwargs
        )
        # Store agent metadata separately (not as Pydantic fields)
        self._agent_name = name
        self._agent_description = description
    
    @property
    def name(self) -> str:
        return self._agent_name
    
    @property
    def description(self) -> str:
        return self._agent_description
    
    @abstractmethod
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process the input and return results"""
        pass
    
    def get_info(self) -> Dict[str, str]:
        """Get agent information"""
        return {
            "name": str(self.name),
            "description": str(self.description)
        }
