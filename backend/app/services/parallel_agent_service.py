"""
Parallel Agent Service - Birden fazla agent'i paralel çalıştırmak için servis
"""

import asyncio
import time
from typing import Dict, Any, List
from sqlalchemy.orm import Session
import logging

from app.agents.analysis_agent import AnalysisAgent
from app.agents.book_agent import BookAgent
from app.agents.youtube_agent import YouTubeAgent

logger = logging.getLogger(__name__)

class ParallelAgentService:
    """Birden fazla agent'i paralel çalıştıran servis"""
    
    def __init__(self):
        self.analysis_agent = AnalysisAgent()
        self.book_agent = BookAgent()
        self.youtube_agent = YouTubeAgent()
    
    async def process_exam_results_parallel(
        self,
        db: Session,
        user_id: int,
        exam_id: int,
        exam_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Sınav sonuçlarını paralel olarak analiz eder ve öneri getirir
        """
        try:
            start_time = time.time()
            
            # Önce analiz agent'ini çalıştır
            analysis_input = {
                "performance_data": exam_result,
                "subject": exam_result.get("exam_section", "Genel"),
                "topic": exam_result.get("exam_section", "Genel"),
                "education_level": "lise",
                "user_id": str(user_id),  # String'e çevir
                "exam_id": str(exam_id)   # String'e çevir
            }
            
            analysis_result = await self._run_agent_safely(
                self.analysis_agent, 
                analysis_input,
                "Analysis Agent"
            )
            
            # Sonuçları organize et
            organized_results = {"analysis_agent": analysis_result}
            
            # Zayıf konuları belirle
            weak_topics = exam_result.get("weak_topics", [])
            print(f"🔍 Exam result'tan gelen zayıf konular: {weak_topics}")
            
            # Analiz sonucundan da zayıf konuları al
            if analysis_result.get("status") == "success":
                analysis_data = analysis_result.get("data", {})
                print(f"🔍 Analysis data: {analysis_data}")
                
                # Analysis data yapısından weak_topics'i al
                if isinstance(analysis_data, dict) and "data" in analysis_data:
                    inner_data = analysis_data["data"]
                    analysis_weak_topics = inner_data.get("weak_topics", [])
                else:
                    analysis_weak_topics = analysis_data.get("weak_topics", [])
                    
                print(f"🔍 Analysis'tan gelen zayıf konular: {analysis_weak_topics}")
                if analysis_weak_topics:
                    weak_topics.extend(analysis_weak_topics)
                    weak_topics = list(set(weak_topics))  # Dublikatlari temizle
            
            print(f"🎯 Final zayıf konular tespit edildi: {weak_topics}")
            
            if weak_topics:
                # Öneri agent'lerini paralel çalıştır
                tasks = []
                
                # Book agent
                book_input = {
                    "weak_topics": weak_topics,
                    "education_level": "lise",
                    "user_id": str(user_id)  # String'e çevir
                }
                tasks.append(self._run_agent_safely(
                    self.book_agent,
                    book_input,
                    "Book Agent"
                ))
                
                # YouTube agent
                youtube_input = {
                    "weak_topics": weak_topics,
                    "subject": exam_result.get("exam_section", "Genel"),
                    "education_level": "lise",
                    "language": "Turkish",
                    "user_id": str(user_id)  # String'e çevir
                }
                tasks.append(self._run_agent_safely(
                    self.youtube_agent,
                    youtube_input,
                    "YouTube Agent"  
                ))
                
                # Paralel çalıştır
                recommendation_results = await asyncio.gather(*tasks, return_exceptions=True)
                
                # Sonuçları ekle
                organized_results["book_agent"] = recommendation_results[0] if len(recommendation_results) > 0 else {"status": "error", "error": "Book agent çalışmadı"}
                organized_results["youtube_agent"] = recommendation_results[1] if len(recommendation_results) > 1 else {"status": "error", "error": "YouTube agent çalışmadı"}
                
            else:
                print("⚠️ Zayıf konu bulunamadı, öneri agent'ları çalıştırılmayacak")
            
            end_time = time.time()
            
            return {
                "status": "success",
                "results": organized_results,
                "execution_summary": {
                    "total_time": end_time - start_time,
                    "agents_run": len(organized_results),
                    "successful_agents": sum(1 for r in organized_results.values() if r.get("status") == "success"),
                    "failed_agents": sum(1 for r in organized_results.values() if r.get("status") == "error")
                }
            }
            
        except Exception as e:
            logger.error(f"Parallel agent processing failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "status": "error",
                "error": str(e),
                "results": {}
            }
    
    async def get_recommendations_for_weak_topics(
        self,
        weak_topics: List[str],
        user_id: int,
        subject: str = "Genel"
    ) -> Dict[str, Any]:
        """
        Zayıf konular için paralel öneri getirir
        """
        try:
            if not weak_topics:
                return {
                    "status": "success",
                    "book_recommendations": None,
                    "youtube_recommendations": None,
                    "message": "Zayıf konu bulunamadı"
                }
            
            start_time = time.time()
            
            # Paralel tasklar
            book_input = {
                "weak_topics": weak_topics,
                "education_level": "lise",
                "user_id": user_id
            }
            
            youtube_input = {
                "weak_topics": weak_topics,
                "subject": subject,
                "education_level": "lise", 
                "language": "Turkish",
                "user_id": user_id
            }
            
            # Paralel çalıştır
            book_task = self._run_agent_safely(self.book_agent, book_input, "Book Agent")
            youtube_task = self._run_agent_safely(self.youtube_agent, youtube_input, "YouTube Agent")
            
            book_result, youtube_result = await asyncio.gather(
                book_task, youtube_task, return_exceptions=True
            )
            
            # Sonuçları organize et
            result = {
                "status": "success",
                "execution_time": time.time() - start_time
            }
            
            if isinstance(book_result, Exception):
                result["book_recommendations"] = None
                result["book_error"] = str(book_result)
            else:
                result["book_recommendations"] = book_result.get("data")
                result["book_status"] = book_result.get("status")
            
            if isinstance(youtube_result, Exception):
                result["youtube_recommendations"] = None
                result["youtube_error"] = str(youtube_result)
            else:
                result["youtube_recommendations"] = youtube_result.get("data")
                result["youtube_status"] = youtube_result.get("status")
            
            return result
            
        except Exception as e:
            logger.error(f"Recommendation processing failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "book_recommendations": None,
                "youtube_recommendations": None
            }
    
    async def _run_agent_safely(
        self, 
        agent, 
        input_data: Dict[str, Any], 
        agent_name: str
    ) -> Dict[str, Any]:
        """
        Agent'i güvenli şekilde çalıştırır ve sonucu standart formatta döner
        """
        try:
            start_time = time.time()
            result = await agent.process(input_data)
            end_time = time.time()
            
            return {
                "status": "success",
                "data": result,
                "agent_name": agent_name,
                "execution_time": end_time - start_time
            }
            
        except Exception as e:
            logger.error(f"{agent_name} failed: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "agent_name": agent_name,
                "data": None
            }
    
    async def get_existing_analysis(
        self,
        db: Session,
        user_id: int,
        exam_id: int
    ) -> Dict[str, Any]:
        """
        Mevcut analiz verilerini database'den getir
        """
        try:
            from app.models.performance import PerformanceAnalysis, ResourceRecommendation
            from datetime import datetime, timedelta
            
            # Son 7 gün içinde bu kullanıcı için analiz var mı kontrol et
            week_ago = datetime.now() - timedelta(days=7)
            
            performance_analysis = db.query(PerformanceAnalysis).filter(
                PerformanceAnalysis.user_id == user_id,
                PerformanceAnalysis.created_at >= week_ago
            ).order_by(PerformanceAnalysis.created_at.desc()).first()
            
            if not performance_analysis:
                return {"status": "not_found", "results": {}}
            
            # Recommendations'ları al
            recommendations = db.query(ResourceRecommendation).filter(
                ResourceRecommendation.performance_analysis_id == performance_analysis.id
            ).all()
            
            # Analysis agent formatında data hazırla
            analysis_data = {
                "weakness_level": performance_analysis.weakness_level or 0,
                "weak_topics": [],
                "strong_topics": [],
                "recommendations": [],
                "detailed_analysis": f"Doğruluk oranı: %{performance_analysis.accuracy:.1f}",
                "personalized_insights": [
                    f"Toplam {performance_analysis.total_questions} sorudan {performance_analysis.correct_answers} tanesini doğru cevapladınız",
                    f"Analiz tarihi: {performance_analysis.created_at.strftime('%d.%m.%Y %H:%M')}"
                ],
                "improvement_trend": "stable"
            }
            
            youtube_recs = []
            book_recs = []
            ai_recommendations = []
            
            for rec in recommendations:
                if rec.resource_type == "youtube":
                    youtube_recs.append({
                        "title": rec.title,
                        "video_url": rec.url,
                        "why_recommended": rec.description,
                        "channel": "Unknown",
                        "duration": "Unknown",
                        "level": "intermediate",
                        "topics_covered": [],
                        "thumbnail_url": "",
                        "channel_url": ""
                    })
                elif rec.resource_type == "book":
                    book_recs.append({
                        "title": rec.title,
                        "url": rec.url,
                        "description": rec.description,
                        "why_recommended": rec.description,
                        "price": "Unknown",
                        "stock_status": "AVAILABLE"
                    })
                elif rec.resource_type == "ai_advice":
                    ai_recommendations.append(rec.description)
            
            analysis_data["recommendations"] = ai_recommendations
            
            # Results formatında döndür
            results = {}
            
            if analysis_data:
                results["analysis_agent"] = {
                    "status": "success",
                    "data": analysis_data
                }
            
            if youtube_recs:
                results["youtube_agent"] = {
                    "status": "success", 
                    "data": {"recommendations": youtube_recs}
                }
            
            if book_recs:
                results["book_agent"] = {
                    "status": "success",
                    "data": {"recommendations": book_recs}
                }
            
            return {
                "status": "success",
                "results": results
            }
            
        except Exception as e:
            logger.error(f"Error getting existing analysis: {e}")
            return {
                "status": "error",
                "error": str(e),
                "results": {}
            }

# Global instance
parallel_agent_service = ParallelAgentService()
