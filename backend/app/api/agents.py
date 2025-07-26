from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.agents.master_agent import MasterAgent, AgentAction

class AgentRequest(BaseModel):
    action: str
    subject: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = "medium"
    count: Optional[int] = 5
    education_level: Optional[str] = "lise"
    performance_data: Optional[Dict[str, Any]] = None
    weak_topics: Optional[list] = None
    query: Optional[str] = None

class AnalysisRequest(BaseModel):
    subject: str
    topic: str
    education_level: str = "lise"
    performance_data: Dict[str, Any]

class RecommendationRequest(BaseModel):
    subject: str
    weak_topics: list
    education_level: str = "lise"

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

# Initialize master agent
master_agent = MasterAgent()

@router.get("/info")
async def get_agents_info():
    """Get information about all available agents"""
    try:
        # Manually construct the response to avoid property serialization issues
        master_info = {
            "name": str(master_agent.name),
            "description": str(master_agent.description)
        }
        
        sub_agents_info = {}
        for name, agent in master_agent._agents.items():
            sub_agents_info[name] = {
                "name": str(agent.name),
                "description": str(agent.description)
            }
        
        return {
            "master_agent": master_info,
            "sub_agents": sub_agents_info,
            "available_actions": master_agent.get_available_actions()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting agent info: {str(e)}"
        )

@router.post("/process")
async def process_request(request: AgentRequest):
    """Process a request through the master agent"""
    try:
        result = await master_agent.process(request.dict())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )

@router.post("/analyze")
async def analyze_performance(request: AnalysisRequest):
    """Analyze student performance"""
    try:
        input_data = {
            "action": AgentAction.ANALYZE_PERFORMANCE.value,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing performance: {str(e)}"
        )

@router.post("/recommend/youtube")
async def recommend_youtube_videos(request: RecommendationRequest):
    """Get YouTube video recommendations"""
    try:
        input_data = {
            "action": AgentAction.RECOMMEND_YOUTUBE.value,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting YouTube recommendations: {str(e)}"
        )

@router.post("/recommend/books")
async def recommend_books(request: RecommendationRequest):
    """Get book recommendations"""
    try:
        input_data = {
            "action": AgentAction.RECOMMEND_BOOKS.value,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting book recommendations: {str(e)}"
        )

@router.post("/learning-cycle")
async def complete_learning_cycle(request: AgentRequest):
    """Execute complete learning cycle"""
    try:
        input_data = {
            "action": AgentAction.COMPLETE_LEARNING_CYCLE.value,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing learning cycle: {str(e)}"
        )
