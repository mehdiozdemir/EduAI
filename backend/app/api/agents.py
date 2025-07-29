from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.agents.master_agent import MasterAgent, AgentAction
from app.services.memory_service import memory_service
from app.core.auth_deps import get_current_user, get_current_user_optional, security as bearer_scheme
from app.models import User


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
async def process_request(
    request: AgentRequest,
    current_user: User = Depends(get_current_user)
):
    """Process a request through the master agent"""
    try:
        # Get user_id from authenticated user
        user_id = str(current_user.id)
        input_data = {
            "user_id": user_id,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing request: {str(e)}"
        )

@router.post("/analyze", 
    dependencies=[Depends(get_current_user)],
    responses={
        403: {"description": "Not authenticated"},
        200: {"description": "Analysis completed successfully"}
    }
)
async def analyze_performance(
    request: AnalysisRequest, 
    current_user: User = Depends(get_current_user),
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """Analyze student performance - Requires JWT authentication"""
    try:
        # Get user_id from authenticated user
        user_id = str(current_user.id)
        
        input_data = {
            "action": AgentAction.ANALYZE_PERFORMANCE.value,
            "user_id": user_id,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing performance: {str(e)}"
        )

@router.post("/recommend/youtube", 
    dependencies=[Depends(get_current_user)],
    responses={403: {"description": "Not authenticated"}}
)
async def recommend_youtube_videos(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    token: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    """Get YouTube video recommendations - Requires JWT authentication"""
    try:
        # Get user_id from authenticated user
        user_id = str(current_user.id)
        input_data = {
            "action": AgentAction.RECOMMEND_YOUTUBE.value,
            "user_id": user_id,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting YouTube recommendations: {str(e)}"
        )

@router.post("/recommend/books", dependencies=[Depends(get_current_user)])
async def recommend_books(
    request: RecommendationRequest,
    current_user: User = Depends(get_current_user)
):
    """Get book recommendations - Requires JWT authentication"""
    try:
        # Get user_id from authenticated user
        user_id = str(current_user.id)
        input_data = {
            "action": AgentAction.RECOMMEND_BOOKS.value,
            "user_id": user_id,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting book recommendations: {str(e)}"
        )

@router.get("/memory/records")
async def get_memory_records(
    current_user: User = Depends(get_current_user)
):
    """Get user's memory records"""
    try:
        # use the shared singleton memory_service imported at module level
        
        # Get all memories for this user
        memories = await memory_service.get_all_memories(str(current_user.id))
        
        # Extract just the memory texts for simpler response
        if isinstance(memories, dict) and 'results' in memories:
            memory_texts = [record['memory'] for record in memories['results']]
            return {
                "status": "success",
                "data": {
                    "user_id": str(current_user.id),
                    "username": current_user.username,
                    "memories": memory_texts,
                    "total_records": len(memory_texts)
                }
            }
        return memories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting memory records: {str(e)}"
        )

@router.post("/learning-cycle")
async def complete_learning_cycle(
    request: AgentRequest,
    current_user: User = Depends(get_current_user)
):
    """Execute complete learning cycle"""
    try:
        # Get user_id from authenticated user
        user_id = str(current_user.id)
        input_data = {
            "action": AgentAction.COMPLETE_LEARNING_CYCLE.value,
            "user_id": user_id,
            **request.dict()
        }
        result = await master_agent.process(input_data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing learning cycle: {str(e)}"
        )

# ===== MEM0 MEMORY ENDPOINTS =====

@router.get("/memory/history")
async def get_learning_history(
    subject: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının öğrenme geçmişini getir"""
    try:
        user_id = str(current_user.id)
        history = await memory_service.get_learning_history(user_id, subject)
        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "username": current_user.username,
                "history": history,
                "total_records": len(history)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving learning history: {str(e)}"
        )

@router.get("/memory/context")
async def get_personalized_context(
    query: str,
    limit: int = 5,
    current_user: User = Depends(get_current_user)
):
    """Kullanıcıya özel bağlam bilgilerini getir"""
    try:
        user_id = str(current_user.id)
        context = await memory_service.get_personalized_context(user_id, query, limit)
        return {
            "status": "success", 
            "data": {
                "user_id": user_id,
                "username": current_user.username,
                "query": query,
                "context": context,
                "total_results": len(context)
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving personalized context: {str(e)}"
        )

@router.get("/memory/recommendations")
async def get_personalized_recommendations(
    current_topic: str,
    subject: str,
    current_user: User = Depends(get_current_user)
):
    """Geçmiş performansa dayalı kişiselleştirilmiş öneriler"""
    try:
        user_id = str(current_user.id)
        recommendations = await memory_service.get_personalized_recommendations(
            user_id, current_topic, subject
        )
        return {
            "status": "success",
            "data": {
                "user_id": user_id,
                "username": current_user.username,
                "current_topic": current_topic,
                "subject": subject,
                **recommendations
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting personalized recommendations: {str(e)}"
        )

class ProfileUpdateRequest(BaseModel):
    learning_preferences: Optional[Dict[str, Any]] = {}
    strong_areas: Optional[list] = []
    improvement_areas: Optional[list] = []
    learning_style: Optional[str] = ""

@router.post("/memory/profile/update")
async def update_user_profile(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user)
):
    """Kullanıcı öğrenme profilini güncelle"""
    try:
        user_id = str(current_user.id)
        profile_updates = {
            "learning_preferences": request.learning_preferences,
            "strong_areas": request.strong_areas,
            "improvement_areas": request.improvement_areas,
            "learning_style": request.learning_style,
            "timestamp": "current"  # timestamp eklenecek
        }
        
        await memory_service.update_user_profile(user_id, profile_updates)
        
        return {
            "status": "success",
            "message": f"Profile updated for user {current_user.username}",
            "data": {
                "user_id": user_id,
                "username": current_user.username,
                **profile_updates
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user profile: {str(e)}"
        )
