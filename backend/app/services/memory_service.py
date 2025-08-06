from typing import Dict, Any, List, Optional
import logging
import os

logger = logging.getLogger(__name__)

# Try to import mem0, gracefully handle if not available
try:
    from mem0 import Memory
    MEM0_AVAILABLE = True
except ImportError as e:
    logger.warning(f"Mem0 not available: {e}")
    MEM0_AVAILABLE = False
    Memory = None

try:
    from app.core.config import settings
except ImportError:
    # Fallback for testing
    class Settings:
        GEMINI_API_KEY = "test-key"
    settings = Settings()

class PersonalizedMemoryService:
    """
    Mem0 kullanarak kişiselleştirilmiş öğrenme belleği yönetimi
    """
    
    def __init__(self):
        if not MEM0_AVAILABLE:
            logger.warning("Mem0 not available, using fallback mode")
            self.memory = None
            return
        
        # Environment variable'ları set et - Mem0 now uses GOOGLE_API_KEY
        api_key = None
        if hasattr(settings, 'GEMINI_API_KEY') and settings.GEMINI_API_KEY:
            api_key = settings.GEMINI_API_KEY
            os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY
        elif hasattr(settings, 'GOOGLE_API_KEY') and settings.GOOGLE_API_KEY:
            api_key = settings.GOOGLE_API_KEY
            os.environ["GOOGLE_API_KEY"] = settings.GOOGLE_API_KEY
        elif os.environ.get("GOOGLE_API_KEY"):
            api_key = os.environ.get("GOOGLE_API_KEY")
        else:
            logger.error("GOOGLE_API_KEY not found in settings or environment")
            self.memory = None
            return
            
        # Mem0 Gemini konfigürasyonu - updated for new google.genai SDK
        self.config = {
            "vector_store": {
                "provider": "chroma",
                "config": {
                    "collection_name": "eduai_memory",
                    "path": "./chroma_db"
                }
            },
            "llm": {
                "provider": "gemini",
                "config": {
                    "model": "gemini-2.0-flash",
                    "api_key": api_key,
                    "temperature": 0.2,
                    "max_tokens": 2000,
                    "top_p": 1.0
                }
            },
            "embedder": {
                "provider": "gemini",
                "config": {
                    "model": "models/text-embedding-004",
                    "api_key": api_key
                }
            },
            "version": "v1.1"
        }
        
        try:
            # Memory'yi lazy loading ile initialize et
            self.memory = Memory.from_config(self.config) if MEM0_AVAILABLE else None
            if self.memory:
                logger.info("Mem0 Memory initialized successfully with Gemini")
            else:
                logger.warning("Mem0 not available, memory features disabled")
        except Exception as e:
            logger.error(f"Failed to initialize Mem0 Memory: {e}")
            logger.warning("Memory features will be disabled")
            self.memory = None
    
    def health_check(self) -> Dict[str, Any]:
        """Memory servis durumunu kontrol et"""
        return {
            "mem0_available": MEM0_AVAILABLE,
            "service_available": self.memory is not None,
            "memory_initialized": self.memory is not None,
            "provider": self.config.get("llm", {}).get("provider", "none") if hasattr(self, 'config') else "none",
            "model": self.config.get("llm", {}).get("config", {}).get("model", "none") if hasattr(self, 'config') else "none"
        }
    
    async def store_learning_session(
        self, 
        user_id: str, 
        session_data: Dict[str, Any]
    ) -> None:
        """
        Öğrenme seansı verilerini hafızaya kaydet
        """
        if not self.memory:
            logger.warning("Memory not available, skipping storage")
            return
            
        try:
            # Performans verilerini metinsel formata çevir
            performance_text = self._format_performance_data(session_data)
            
            # Mem0'a kaydet
            self.memory.add(
                messages=[{
                    "role": "user",
                    "content": performance_text
                }],
                user_id=user_id,
                metadata=self._sanitize_metadata({
                    "session_type": "learning",
                    "subject": session_data.get("subject"),
                    "topic": session_data.get("topic"),
                    "education_level": session_data.get("education_level"),
                    "accuracy": session_data.get("accuracy", 0),
                    "timestamp": session_data.get("timestamp")
                })
            )
            
            logger.info(f"Learning session stored for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing learning session: {e}")
            # Don't raise, just log
    
    async def store_weakness_analysis(
        self, 
        user_id: str, 
        analysis_data: Dict[str, Any]
    ) -> None:
        """
        Zayıflık analizini hafızaya kaydet
        """
        if not self.memory:
            logger.warning("Memory not available, skipping storage")
            return
            
        try:
            analysis_text = f"""
            Zayıflık Analizi:
            - Zayıflık Seviyesi: {analysis_data.get('weakness_level', 0)}/10
            - Zayıf Konular: {', '.join(analysis_data.get('weak_topics', []))}
            - Güçlü Konular: {', '.join(analysis_data.get('strong_topics', []))}
            - Öneriler: {'; '.join(analysis_data.get('recommendations', []))}
            - Detaylı Analiz: {analysis_data.get('detailed_analysis', '')}
            """
            
            self.memory.add(
                messages=[{
                    "role": "assistant", 
                    "content": analysis_text
                }],
                user_id=user_id,
                metadata=self._sanitize_metadata({
                    "session_type": "analysis",
                    "subject": analysis_data.get("subject"),
                    "topic": analysis_data.get("topic"),
                    "weakness_level": analysis_data.get("weakness_level", 0)
                })
            )
            
            logger.info(f"Weakness analysis stored for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing weakness analysis: {e}")
            # Don't raise, just log
    
    async def get_all_memories(
        self, 
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Kullanıcının tüm hafıza kayıtlarını al
        """
        if not self.memory:
            logger.warning("Memory not available, returning empty memories")
            return []
            
        try:
            if hasattr(self.memory, "get_all"):
                memories_raw = self.memory.get_all(user_id=user_id)
            else:
                # Fallback to empty-query search when `get_all` isn't available
                memories_raw = self.memory.search(query="", user_id=user_id, limit=100)
            return self._normalize_memories(memories_raw)
            
        except Exception as e:
            logger.error(f"Error retrieving all memories: {e}")
            return []
    
    async def get_personalized_context(
        self, 
        user_id: str, 
        query: str,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Kullanıcıya özel bağlam bilgilerini al
        """
        if not self.memory:
            logger.warning("Memory not available, returning empty context")
            return []
            
        try:
            memories_raw = self.memory.search(
                query=query,
                user_id=user_id,
                limit=limit
            )
            return self._normalize_memories(memories_raw)
            
        except Exception as e:
            logger.error(f"Error retrieving personalized context: {e}")
            return []
    
    async def get_learning_history(
        self, 
        user_id: str,
        subject: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Kullanıcının öğrenme geçmişini al
        """
        if not self.memory:
            logger.warning("Memory not available, returning empty history")
            return []
            
        try:
            query = f"öğrenme performansı {subject}" if subject else "öğrenme performansı"
            
            memories_raw = self.memory.search(
                query=query,
                user_id=user_id,
                limit=10
            )
            return self._normalize_memories(memories_raw)
            
        except Exception as e:
            logger.error(f"Error retrieving learning history: {e}")
            return []
    
    async def update_user_profile(
        self, 
        user_id: str, 
        profile_updates: Dict[str, Any]
    ) -> None:
        """
        Kullanıcı profilini güncelle
        """
        if not self.memory:
            logger.warning("Memory not available, skipping profile update")
            return
            
        try:
            profile_text = f"""
            Kullanıcı Profil Güncellemesi:
            - Öğrenme Tercihleri: {profile_updates.get('learning_preferences', {})}
            - Güçlü Alanlar: {profile_updates.get('strong_areas', [])}
            - Gelişim Alanları: {profile_updates.get('improvement_areas', [])}
            - Öğrenme Stili: {profile_updates.get('learning_style', '')}
            """
            
            self.memory.add(
                messages=[{
                    "role": "user",
                    "content": profile_text
                }],
                user_id=user_id,
                metadata=self._sanitize_metadata({
                    "session_type": "profile_update",
                    "timestamp": profile_updates.get("timestamp")
                })
            )
            
            logger.info(f"User profile updated for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            # Don't raise, just log
    
    def _format_performance_data(self, session_data: Dict[str, Any]) -> str:
        """
        Performans verilerini metinsel formata çevir
        """
        return f"""
        Öğrenme Seansı:
        - Ders: {session_data.get('subject', 'Bilinmiyor')}
        - Konu: {session_data.get('topic', 'Bilinmiyor')}
        - Eğitim Seviyesi: {session_data.get('education_level', 'lise')}
        - Toplam Soru: {session_data.get('total_questions', 0)}
        - Doğru Cevap: {session_data.get('correct_answers', 0)}
        - Başarı Oranı: {session_data.get('accuracy', 0)}%
        - Yanlış Cevaplanan Sorular: {session_data.get('wrong_answers', [])}
        - Zor Geçen Konular: {session_data.get('difficult_topics', [])}
        """
    
    async def get_personalized_recommendations(
        self, 
        user_id: str, 
        current_topic: str,
        subject: str
    ) -> Dict[str, Any]:
        """
        Geçmiş performansa dayalı kişiselleştirilmiş öneriler al
        """
        try:
            # Kullanıcının geçmiş performansını ara
            query = f"{subject} {current_topic} zayıflık performans"
            memories = await self.get_personalized_context(user_id, query, limit=10)
            
            # Hafıza verilerini analiz et
            historical_weaknesses = []
            historical_strengths = []
            
            for memory in memories:
                content = memory.get('memory', '')
                if 'Zayıf Konular:' in content:
                    # Zayıf konuları çıkar
                    pass
                if 'Güçlü Konular:' in content:
                    # Güçlü konuları çıkar
                    pass
            
            return {
                "historical_weaknesses": historical_weaknesses,
                "historical_strengths": historical_strengths,
                "personalization_score": len(memories) / 10.0,  # 0-1 arası
                "memory_count": len(memories)
            }
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {e}")
            return {
                "historical_weaknesses": [],
                "historical_strengths": [],
                "personalization_score": 0.0,
                "memory_count": 0
            }
    
    async def generate_ai_response(self, prompt: str) -> Optional[str]:
        """
        Question agent ile AI yanıt oluştur
        """
        try:
            # Question agent'ı kullan (concrete implementation)
            from app.agents.question_agent import QuestionAgent
            from langchain_google_genai import ChatGoogleGenerativeAI
            from app.core.config import settings
            
            # Direkt ChatGoogleGenerativeAI kullan
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.7
            )
            
            # Prompt'u invoke et
            response = await llm.ainvoke(prompt)
            
            if response and hasattr(response, 'content'):
                return response.content
            elif isinstance(response, str):
                return response
            else:
                logger.warning("No valid response generated from AI model")
                return None
                
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return None
    
    def _normalize_memory_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure every memory record has a `memory` key that contains the text content so that
        downstream agents can rely on it safely, regardless of Mem0's exact output schema."""
        if isinstance(record, dict):
            if "memory" not in record:
                content = record.get("content") or record.get("message") or ""
                record["memory"] = content
            return record
        # Fallback when Mem0 returns bare strings or unexpected types
        return {"memory": str(record)}

    def _normalize_memories(self, memories_raw: Any) -> List[Dict[str, Any]]:
        """Normalize raw Mem0 output (it can be list or dict{"results": [...]}) into list of
        dictionaries bearing a `memory` key."""
        if isinstance(memories_raw, dict) and "results" in memories_raw:
            memories_raw = memories_raw.get("results", [])
        if memories_raw is None:
            memories_raw = []
        return [self._normalize_memory_record(rec) for rec in memories_raw]

    # ------------------------------------------------------------------
    # Metadata sanitation helpers (Mem0 accepts only primitive types / no None)
    # ------------------------------------------------------------------
    def _sanitize_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Convert unsupported or None metadata values to safe strings / primitives."""
        clean: Dict[str, Any] = {}
        for k, v in metadata.items():
            if v is None:
                continue  # skip Nones – they crash Mem0
            if isinstance(v, (str, int, float, bool)):
                clean[k] = v
            else:
                # Convert lists/dicts/other to JSON-style string for storage
                try:
                    import json
                    clean[k] = json.dumps(v, ensure_ascii=False)
                except Exception:
                    clean[k] = str(v)
        return clean

# Global instance
memory_service = PersonalizedMemoryService()
