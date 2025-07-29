from typing import Dict, Any, List, Optional
from app.agents.base_agent import BaseAgent
from app.agents.question_agent import QuestionAgent
from app.agents.analysis_agent import AnalysisAgent
from app.agents.youtube_agent import YouTubeAgent
from app.agents.book_agent import BookAgent
from langchain.prompts import ChatPromptTemplate
from enum import Enum

class AgentAction(Enum):
    GENERATE_QUESTIONS = "generate_questions"
    ANALYZE_PERFORMANCE = "analyze_performance"
    RECOMMEND_YOUTUBE = "recommend_youtube"
    RECOMMEND_BOOKS = "recommend_books"
    COMPLETE_LEARNING_CYCLE = "complete_learning_cycle"

class MasterAgent(BaseAgent):
    """Master orchestrator agent that coordinates all other agents"""
    
    def __init__(self):
        super().__init__(
            name="Master Agent",
            description="Orchestrates all learning assistant agents and manages the learning workflow"
        )
        
        # Initialize sub-agents with underscore prefix
        self._question_agent = QuestionAgent()
        self._analysis_agent = AnalysisAgent()
        self._youtube_agent = YouTubeAgent()
        self._book_agent = BookAgent()
        
        self._agents = {
            "question": self._question_agent,
            "analysis": self._analysis_agent,
            "youtube": self._youtube_agent,
            "book": self._book_agent
        }
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process user request and orchestrate appropriate agents"""
        action = input_data.get("action", AgentAction.GENERATE_QUESTIONS.value)
        
        if action == AgentAction.GENERATE_QUESTIONS.value:
            return await self._handle_question_generation(input_data)
        elif action == AgentAction.ANALYZE_PERFORMANCE.value:
            return await self._handle_performance_analysis(input_data)
        elif action == AgentAction.RECOMMEND_YOUTUBE.value:
            return await self._handle_youtube_recommendations(input_data)
        elif action == AgentAction.RECOMMEND_BOOKS.value:
            return await self._handle_book_recommendations(input_data)
        elif action == AgentAction.COMPLETE_LEARNING_CYCLE.value:
            return await self._handle_complete_learning_cycle(input_data)
        else:
            return await self._handle_general_query(input_data)
    
    async def _handle_question_generation(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle question generation request"""
        # Ensure user_id is passed through
        return await self._question_agent.process(input_data)
    
    async def _handle_performance_analysis(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle performance analysis request"""
        # Analysis agent already handles user_id properly
        return await self._analysis_agent.process(input_data)
    
    async def _handle_youtube_recommendations(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle YouTube recommendation request"""
        # First analyze if we don't have weak topics
        if "weak_topics" not in input_data and "performance_data" in input_data:
            analysis_result = await self._analysis_agent.process(input_data)
            if analysis_result["status"] == "success":
                input_data["weak_topics"] = analysis_result["data"]["weak_topics"]
        
        # Pass user_id to YouTube agent for memory integration
        return await self._youtube_agent.process(input_data)
    
    async def _handle_book_recommendations(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle book recommendation request"""
        # First analyze if we don't have weak topics
        if "weak_topics" not in input_data and "performance_data" in input_data:
            analysis_result = await self._analysis_agent.process(input_data)
            if analysis_result["status"] == "success":
                input_data["weak_topics"] = analysis_result["data"]["weak_topics"]
        
        # Pass user_id to book agent for memory integration
        return await self._book_agent.process(input_data)
    
    async def _handle_complete_learning_cycle(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle complete learning cycle: questions -> analysis -> recommendations"""
        results = {
            "status": "success",
            "agent": str(self.name),
            "workflow": "complete_learning_cycle",
            "steps": {}
        }
        
        try:
            # Step 1: Generate questions
            question_result = await self._question_agent.process(input_data)
            results["steps"]["questions"] = question_result
            
            # Step 2: If performance data is provided, analyze it
            if "performance_data" in input_data:
                analysis_result = await self._analysis_agent.process(input_data)
                results["steps"]["analysis"] = analysis_result
                
                # Step 3: Get recommendations based on analysis
                if analysis_result["status"] == "success":
                    weak_topics = analysis_result["data"]["weak_topics"]
                    recommendation_input = {
                        **input_data,
                        "weak_topics": weak_topics
                    }
                    
                    # Get YouTube recommendations
                    youtube_result = await self._youtube_agent.process(recommendation_input)
                    results["steps"]["youtube_recommendations"] = youtube_result
                    
                    # Get book recommendations
                    book_result = await self._book_agent.process(recommendation_input)
                    results["steps"]["book_recommendations"] = book_result
            
            return results
            
        except Exception as e:
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
    
    async def _handle_general_query(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle general queries by determining the best agent to use"""
        query = input_data.get("query", "")
        
        # Create a prompt to determine which agent to use
        prompt_template = ChatPromptTemplate.from_messages([
            ("system", "Sen bir eğitim asistanı yöneticisisin. Kullanıcının isteğine göre hangi ajanın kullanılacağını belirle."),
            ("human", """
Kullanıcı isteği: {query}

Mevcut ajanlar:
1. question: Soru oluşturma ve cevap değerlendirme
2. analysis: Performans analizi ve zayıflık tespiti
3. youtube: YouTube video önerileri
4. book: Kitap önerileri

Hangi ajan kullanılmalı? Sadece ajan adını döndür (question, analysis, youtube, book).
""")
        ])
        
        try:
            chain = prompt_template | self.llm
            result = await chain.ainvoke({"query": query})
            
            agent_name = result.content.strip().lower()
            
            if agent_name in self._agents:
                return await self._agents[agent_name].process(input_data)
            else:
                return {
                    "status": "error",
                    "agent": str(self.name),
                    "error": f"Unknown agent: {agent_name}"
                }
        except Exception as e:
            return {
                "status": "error",
                "agent": str(self.name),
                "error": str(e)
            }
    
    def get_available_actions(self) -> List[str]:
        """Get list of available actions"""
        return [action.value for action in AgentAction]
    
    def get_agents_info(self) -> Dict[str, Dict[str, str]]:
        """Get information about all sub-agents"""
        return {
            name: agent.get_info() 
            for name, agent in self._agents.items()
        }
