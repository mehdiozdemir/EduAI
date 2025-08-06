from typing import Dict, Any, List, Optional
import logging
import re
from datetime import datetime
from sqlalchemy.orm import Session
from app.services.memory_service import PersonalizedMemoryService
from app.models.user import User
from app.models.education_level import Course, CourseTopic
import json

logger = logging.getLogger(__name__)

class AIGuidanceService:
    """
    AI Rehberlik Servisi - Kullanıcılara kişiselleştirilmiş rehberlik sağlar
    """
    
    def __init__(self):
        self.memory_service = PersonalizedMemoryService()
    
    async def get_user_guidance(
        self, 
        user_id: str, 
        question: str,
        db: Session
    ) -> Dict[str, Any]:
        """
        Kullanıcının sorusuna göre kişiselleştirilmiş rehberlik sağla
        """
        try:
            # Kullanıcının tüm hafıza verilerini al
            memories = await self.memory_service.get_all_memories(user_id)
            
            # Kullanıcı bilgilerini al
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {
                    "status": "error",
                    "message": "Kullanıcı bulunamadı"
                }
            
            # Kullanıcının öğrenme geçmişini analiz et
            learning_summary = self._analyze_learning_history(memories)
            
            # Kişiselleştirilmiş rehberlik oluştur
            guidance = await self._generate_personalized_guidance(
                user_id=user_id,
                user_name=user.first_name,
                question=question,
                learning_summary=learning_summary,
                memories=memories
            )
            
            return {
                "status": "success",
                "data": {
                    "guidance": guidance,
                    "user_profile": {
                        "name": user.first_name,
                        "learning_level": learning_summary.get("level", "başlangıç"),
                        "strong_subjects": learning_summary.get("strong_subjects", []),
                        "weak_subjects": learning_summary.get("weak_subjects", []),
                        "total_sessions": learning_summary.get("total_sessions", 0),
                        "avg_accuracy": learning_summary.get("avg_accuracy", 0)
                    },
                    "recommendations": guidance.get("recommendations", []),
                    "next_steps": guidance.get("next_steps", [])
                }
            }
            
        except Exception as e:
            logger.error(f"Error in get_user_guidance: {e}")
            return {
                "status": "error",
                "message": f"Rehberlik oluşturulurken hata: {str(e)}"
            }
    
    def _analyze_learning_history(self, memories: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Öğrenme geçmişini analiz et
        """
        if not memories:
            return {
                "level": "başlangıç",
                "strong_subjects": [],
                "weak_subjects": [],
                "total_sessions": 0,
                "avg_accuracy": 0
            }
        
        total_sessions = 0
        accuracies = []
        subject_performance = {}
        weak_topics = []
        
        for memory in memories:
            content = memory.get("text", "")
            metadata = memory.get("metadata", {})
            
            # Session tipini kontrol et
            if metadata.get("session_type") == "learning":
                total_sessions += 1
                accuracy = metadata.get("accuracy", 0)
                if accuracy > 0:
                    accuracies.append(accuracy)
                
                subject = metadata.get("subject", "")
                if subject:
                    if subject not in subject_performance:
                        subject_performance[subject] = []
                    subject_performance[subject].append(accuracy)
            
            # Zayıflık analizlerinden bilgi çıkar
            elif metadata.get("session_type") == "analysis":
                if "zayıf konular:" in content.lower():
                    # Zayıf konuları çıkar
                    lines = content.split('\n')
                    for line in lines:
                        if "zayıf konular:" in line.lower():
                            topics = line.split(':')[1].strip()
                            weak_topics.extend([t.strip() for t in topics.split(',') if t.strip()])
        
        # Güçlü ve zayıf dersleri belirle
        strong_subjects = []
        weak_subjects = []
        
        for subject, scores in subject_performance.items():
            avg_score = sum(scores) / len(scores)
            if avg_score >= 70:
                strong_subjects.append(subject)
            elif avg_score < 50:
                weak_subjects.append(subject)
        
        avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else 0
        
        # Seviye belirleme
        if avg_accuracy >= 80:
            level = "ileri"
        elif avg_accuracy >= 60:
            level = "orta"
        else:
            level = "başlangıç"
        
        return {
            "level": level,
            "strong_subjects": strong_subjects,
            "weak_subjects": weak_subjects,
            "weak_topics": list(set(weak_topics)),
            "total_sessions": total_sessions,
            "avg_accuracy": avg_accuracy
        }
    
    async def _generate_personalized_guidance(
        self,
        user_id: str,
        user_name: str,
        question: str,
        learning_summary: Dict[str, Any],
        memories: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Kişiselleştirilmiş rehberlik oluştur
        """
        # Memory servisinden ilgili bağlamı al
        relevant_memories = await self.memory_service.get_personalized_context(
            user_id=user_id,
            query=question,
            limit=10
        )
        
        # Rehberlik promptu oluştur
        context = self._build_guidance_context(
            user_name=user_name,
            question=question,
            learning_summary=learning_summary,
            relevant_memories=relevant_memories
        )
        
        # AI ile rehberlik oluştur (Memory'e dayalı gerçek AI yanıt)
        guidance_response = await self._generate_ai_guidance(
            user_name=user_name,
            question=question,
            learning_summary=learning_summary,
            context=context,
            relevant_memories=relevant_memories
        )
        
        return guidance_response
    
    def _build_guidance_context(
        self,
        user_name: str,
        question: str,
        learning_summary: Dict[str, Any],
        relevant_memories: List[Dict[str, Any]]
    ) -> str:
        """
        Rehberlik için bağlam oluştur
        """
        context = f"""
🎓 Kullanıcı: {user_name}
📊 Seviye: {learning_summary.get('level', 'başlangıç')} 
📈 Toplam Seans: {learning_summary.get('total_sessions', 0)}
💯 Ortalama Başarı: {learning_summary.get('avg_accuracy', 0):.1f}%

💪 Güçlü Dersler: {', '.join(learning_summary.get('strong_subjects', [])) or 'Henüz belirlenmedi'}
⚠️  Zayıf Dersler: {', '.join(learning_summary.get('weak_subjects', [])) or 'Henüz belirlenmedi'}
📝 Zayıf Konular: {', '.join(learning_summary.get('weak_topics', [])) or 'Henüz belirlenmedi'}

📚 Son Öğrenme Aktiviteleri:"""
        
        # Relevant memories'i daha detaylı göster
        if relevant_memories:
            for i, memory in enumerate(relevant_memories[:3], 1):
                memory_text = memory.get('text', '')
                metadata = memory.get('metadata', {})
                
                # Memory'den önemli bilgileri çıkar
                subject = metadata.get('subject', 'Bilinmeyen')
                accuracy = metadata.get('accuracy', 0)
                
                context += f"""
{i}. Ders: {subject} | Başarı: {accuracy}% | {memory_text[:100]}..."""
        else:
            context += "\nHenüz quiz çözme geçmişi yok - ilk adımları atmaya hazır!"

        return context
    
    async def _generate_ai_guidance(
        self,
        user_name: str,
        question: str,
        learning_summary: Dict[str, Any],
        context: str,
        relevant_memories: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Memory'e dayalı gerçek AI rehberlik oluştur
        """
        if not self.memory_service.memory:
            # Fallback to template guidance if memory is not available
            return await self._generate_template_guidance(
                user_name=user_name,
                question=question,
                learning_summary=learning_summary,
                context=context
            )

        try:
            # Memory'den elde edilen bilgileri analiz et
            memory_insights = self._analyze_memory_insights(relevant_memories)
            
            # AI prompt hazırla - Memory bilgileri daha vurgulu
            ai_prompt = f"""
Sen bir kişiselleştirilmiş eğitim rehberisin. Kullanıcının sorusunu cevaplarken MUTLAKA aşağıdaki memory verilerini kullan.

=== KULLANICI PROFİLİ ===
{context}

=== MEMORY'DEN ÖNEMLİ BİLGİLER ===
{memory_insights}

=== KULLANICININ SORUSU ===
"{question}"

ÖNEMLİ KURALLAR:
1. Soruyu direkt cevapla, memory'deki bilgilere dayanarak
2. Kullanıcının zayıf/güçlü alanlarından örnekler ver
3. Geçmiş performansına göre özel önerilerde bulun
4. Memory'de yoksa "henüz bu konuda veri yok" de
5. Kullanıcının adını ({user_name}) kullan

CEVAP FORMATI:
1. Ana Cevap: (Soruya direkt cevap, memory bilgileriyle desteklenmiş)
2. Öneriler: (Memory'ye dayalı 3-5 spesifik öneri)
3. Sonraki Adımlar: (Kullanıcının durumuna özel 2-3 adım)
4. Motivasyon: (Kişiye özel motivasyon mesajı)

Cevabın tamamen Türkçe olsun ve memory verilerini kullanarak soruya odaklan.
"""

            # Memory servisi ile AI yanıt oluştur - Direkt AI model çağrısı yap
            try:
                # Gemini model ile direkt yanıt al
                ai_response_text = await self.memory_service.generate_ai_response(ai_prompt)
                
                if ai_response_text:
                    # AI yanıtını parse et
                    return self._parse_ai_response_text(ai_response_text, user_name, learning_summary)
                else:
                    # AI yanıt alamazsak template'e geri dön
                    return await self._generate_template_guidance(
                        user_name=user_name,
                        question=question,
                        learning_summary=learning_summary,
                        context=context
                    )
            except Exception as inner_e:
                logger.error(f"Direct AI response failed: {inner_e}")
                # AI yanıt alamazsak template'e geri dön
                return await self._generate_template_guidance(
                    user_name=user_name,
                    question=question,
                    learning_summary=learning_summary,
                    context=context
                )

        except Exception as e:
            logger.error(f"Error generating AI guidance: {e}")
            # Hata durumunda template guidance kullan
            return await self._generate_template_guidance(
                user_name=user_name,
                question=question,
                learning_summary=learning_summary,
                context=context
            )

    def _analyze_memory_insights(self, memories: List[Dict[str, Any]]) -> str:
        """
        Memory verilerinden öngörüler çıkar - daha detaylı analiz
        """
        if not memories:
            return "❌ Henüz yeterli öğrenme verisi yok. İlk quiz'leri çözmeye başlayın!"

        insights = []
        
        # Detaylı performans analizi
        recent_sessions = []
        weak_topics = set()
        strong_subjects = set()
        total_accuracy = 0
        session_count = 0
        subject_performance = {}
        
        for memory in memories:
            text = memory.get("text", "").lower()
            metadata = memory.get("metadata", {})
            
            # Performans verilerini analiz et
            if "performans" in text or "accuracy" in text or "başarı" in text:
                recent_sessions.append(text)
                
                # Accuracy değerini çıkar
                accuracy = metadata.get("accuracy", 0)
                if accuracy > 0:
                    total_accuracy += accuracy
                    session_count += 1
            
            # Zayıf konuları topla
            if "zayıf" in text:
                lines = text.split('\n')
                for line in lines:
                    if "zayıf konular:" in line and ":" in line:
                        topics = line.split(':')[1].strip()
                        weak_topics.update([t.strip() for t in topics.split(',') if t.strip()])
                    elif "zayıf" in line and any(konu in line for konu in ['matematik', 'fen', 'türkçe', 'tarih', 'coğrafya']):
                        weak_topics.add(line.strip())
            
            # Ders performansını analiz et
            subject = metadata.get("subject", "")
            if subject:
                accuracy = metadata.get("accuracy", 0)
                if subject not in subject_performance:
                    subject_performance[subject] = []
                subject_performance[subject].append(accuracy)
                
                if accuracy > 70:
                    strong_subjects.add(subject)
        
        # Öngörüler oluştur
        if recent_sessions:
            avg_accuracy = total_accuracy / session_count if session_count > 0 else 0
            insights.append(f"📊 Son {len(recent_sessions)} seansta ortalama başarı: {avg_accuracy:.1f}%")
        
        if weak_topics:
            insights.append(f"⚠️ Zayıf konular: {', '.join(list(weak_topics)[:3])}")
        
        if strong_subjects:
            insights.append(f"✅ Güçlü dersler: {', '.join(list(strong_subjects)[:3])}")
        
        # Ders bazında detaylar
        for subject, scores in subject_performance.items():
            if len(scores) >= 2:
                avg_score = sum(scores) / len(scores)
                trend = "📈 yükselişte" if scores[-1] > scores[0] else "📉 düşüşte" if scores[-1] < scores[0] else "➡️ sabit"
                insights.append(f"📚 {subject}: {avg_score:.1f}% ({trend})")
        
        if not insights:
            insights.append("📈 Öğrenme verisi analiz ediliyor, daha fazla quiz çözün!")

        return "\n".join(insights)

    def _parse_ai_response_text(self, response_text: str, user_name: str, learning_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        AI'ın direkt text yanıtını parse et
        """
        lines = response_text.split('\n')
        
        main_message = f"Merhaba {user_name}! "
        recommendations = []
        next_steps = []
        motivational_message = "Başarılı olacağına inanıyorum! 💪"
        
        current_section = "main"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Section belirleme
            if any(word in line.lower() for word in ['öneri', 'tavsiye', 'recommendation']) or line.startswith("2."):
                current_section = "recommendations"
                continue
            elif any(word in line.lower() for word in ['adım', 'step', 'sonraki']) or line.startswith("3."):
                current_section = "next_steps"
                continue
            elif any(word in line.lower() for word in ['motivasyon', 'motivational']) or line.startswith("4."):
                current_section = "motivational"
                continue
            
            # İçerik ekle
            if current_section == "main" and len(main_message) < 400:
                main_message += line + " "
            elif current_section == "recommendations":
                if line.startswith(('-', '•', '*', '1.', '2.', '3.', '4.', '5.')) or any(char.isdigit() for char in line[:3]):
                    clean_rec = re.sub(r'^[-•*\d.\s]+', '', line).strip()
                    if clean_rec and len(clean_rec) > 5:
                        recommendations.append(clean_rec)
            elif current_section == "next_steps":
                if line.startswith(('-', '•', '*', '1.', '2.', '3.')) or any(char.isdigit() for char in line[:3]):
                    clean_step = re.sub(r'^[-•*\d.\s]+', '', line).strip()
                    if clean_step and len(clean_step) > 5:
                        next_steps.append(clean_step)
            elif current_section == "motivational":
                if len(line) > 10:  # Sadece anlamlı motivasyon mesajları
                    motivational_message = line

        # Minimum içerik garantisi
        if len(recommendations) < 3:
            level = learning_summary.get('level', 'başlangıç')
            weak_subjects = learning_summary.get('weak_subjects', [])
            
            if level == 'başlangıç':
                recommendations.extend([
                    "Temel konuları düzenli tekrar edin",
                    "Günde 20-30 dakika çalışma yapın", 
                    "Kolay sorulardan başlayıp zorlaştırın"
                ][:3-len(recommendations)])
            elif level == 'orta':
                recommendations.extend([
                    "Zayıf konularınıza odaklanın",
                    "Daha fazla soru çözüm pratiği yapın",
                    "Deneme sınavları çözün"
                ][:3-len(recommendations)])
            else:
                recommendations.extend([
                    "İleri seviye kaynaklardan çalışın",
                    "Farklı soru tiplerini deneyin",
                    "Öğreticilik yaparak pekiştirin"
                ][:3-len(recommendations)])
        
        if len(next_steps) < 2:
            next_steps.extend([
                "Bu hafta için çalışma planı yapın",
                "Zayıf konularınızı belirleyin", 
                "İlerlemenizi takip edin"
            ][:2-len(next_steps)])
        
        return {
            "main_message": main_message.strip(),
            "recommendations": recommendations[:5],
            "next_steps": next_steps[:3],
            "motivational_message": motivational_message
        }

    def _parse_ai_response(self, ai_response: Dict[str, Any], user_name: str, learning_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        AI yanıtını parse et
        """
        response_text = ai_response.get("text", "")
        
        # Basit parsing - gerçek implementasyonda daha gelişmiş olabilir
        lines = response_text.split('\n')
        
        main_message = f"Merhaba {user_name}! "
        recommendations = []
        next_steps = []
        motivational_message = "Başarılı olacağına inanıyorum! 💪"
        
        current_section = "main"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            if "öneri" in line.lower() or line.startswith("2."):
                current_section = "recommendations"
                continue
            elif "adım" in line.lower() or line.startswith("3."):
                current_section = "next_steps"
                continue
            elif "motivasyon" in line.lower() or line.startswith("4."):
                current_section = "motivational"
                continue
            
            if current_section == "main" and len(main_message) < 500:
                main_message += line + " "
            elif current_section == "recommendations" and line.startswith("-") or line.startswith("•"):
                recommendations.append(line[1:].strip())
            elif current_section == "next_steps" and (line.startswith("-") or line.startswith("•")):
                next_steps.append(line[1:].strip())
            elif current_section == "motivational":
                motivational_message = line

        # Fallback değerler
        if len(recommendations) < 3:
            level = learning_summary.get('level', 'başlangıç')
            if level == 'başlangıç':
                recommendations.extend([
                    "Temel konuları tekrar gözden geçirin",
                    "Günde 20-30 dakika düzenli çalışma yapın",
                    "Yanlış sorularınızı not alın ve tekrar edin"
                ])
            elif level == 'orta':
                recommendations.extend([
                    "Daha fazla soru çözüm pratiği yapın",
                    "Zayıf konularınıza odaklanın",
                    "Sınav simülasyonları çözün"
                ])
            else:
                recommendations.extend([
                    "İleri seviye sorulara geçin",
                    "Farklı soru tiplerini deneyin",
                    "Öğrendiğinizi başkalarına anlatmaya çalışın"
                ])

        if len(next_steps) < 2:
            next_steps.extend([
                "Bu hafta için bir çalışma planı oluşturun",
                "Hedeflerinizi belirleyin ve takip edin"
            ])

        return {
            "main_message": main_message.strip(),
            "recommendations": recommendations[:5],  # Max 5 öneri
            "next_steps": next_steps[:3],  # Max 3 adım
            "motivational_message": motivational_message
        }
    
    async def _generate_template_guidance(
        self,
        user_name: str,
        question: str,
        learning_summary: Dict[str, Any],
        context: str
    ) -> Dict[str, Any]:
        """
        AI tabanlı rehberlik oluştur (Template artık sadece fallback)
        """
        try:
            # AI'dan gerçek rehberlik al
            ai_guidance_prompt = f"""
Sen bir eğitim rehberi AI'ısın. Aşağıdaki bilgilere dayanarak kullanıcıya kişiselleştirilmiş rehberlik ver:

{context}

Kullanıcının sorusu: "{question}"

Lütfen şu JSON formatında cevap ver:
{{
    "main_message": "Kullanıcıya özel ana mesaj (motivasyonlu, samimi, Türkçe)",
    "recommendations": ["öneri1", "öneri2", "öneri3", "öneri4", "öneri5"],
    "next_steps": ["adım1", "adım2", "adım3"],
    "motivational_message": "Motivasyon mesajı"
}}

Önemli kurallar:
- Kullanıcının adını ({user_name}) kullan
- Memory verilerini dikkate al
- Türkçe ve samimi bir dil kullan
- Emoji kullanabilirsin
- Spesifik ve uygulanabilir öneriler ver
"""

            # AI'dan yanıt al
            ai_responses = await self.memory_service.get_personalized_context(
                user_id="guidance_system",
                query=ai_guidance_prompt,
                limit=1
            )

            if ai_responses and len(ai_responses) > 0:
                # AI yanıtını parse et
                ai_response_text = ai_responses[0].get("text", "")
                
                # JSON parse etmeye çalış
                try:
                    import json
                    import re
                    
                    # JSON kısmını bul
                    json_match = re.search(r'\{.*\}', ai_response_text, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(0)
                        ai_data = json.loads(json_str)
                        
                        return {
                            "main_message": ai_data.get("main_message", f"Merhaba {user_name}! Size yardımcı olmaya hazırım."),
                            "recommendations": ai_data.get("recommendations", [])[:5],
                            "next_steps": ai_data.get("next_steps", [])[:3],
                            "motivational_message": ai_data.get("motivational_message", "Başarıya ulaşacağına inanıyorum! 💪")
                        }
                except:
                    # JSON parse edilemezse text'i parse et
                    return self._parse_ai_text_response(ai_response_text, user_name, learning_summary)
            
            # AI yanıt alamazsak basit fallback
            return self._generate_simple_fallback(user_name, question, learning_summary)

        except Exception as e:
            logger.error(f"Error in AI guidance generation: {e}")
            # Hata durumunda basit fallback
            return self._generate_simple_fallback(user_name, question, learning_summary)
    
    def _parse_ai_text_response(self, response_text: str, user_name: str, learning_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        AI'ın text yanıtını parse et
        """
        lines = response_text.split('\n')
        
        main_message = f"Merhaba {user_name}! "
        recommendations = []
        next_steps = []
        motivational_message = "Başarılı olacağına inanıyorum! 💪"
        
        current_section = "main"
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Section belirleme
            if any(word in line.lower() for word in ['öneri', 'tavsiye', 'recommendation']):
                current_section = "recommendations"
                continue
            elif any(word in line.lower() for word in ['adım', 'step', 'sonraki']):
                current_section = "next_steps"  
                continue
            elif any(word in line.lower() for word in ['motivasyon', 'motivational']):
                current_section = "motivational"
                continue
            
            # İçerik ekle
            if current_section == "main" and len(main_message) < 300:
                main_message += line + " "
            elif current_section == "recommendations":
                if line.startswith(('-', '•', '*', '1.', '2.', '3.', '4.', '5.')):
                    clean_rec = re.sub(r'^[-•*\d.\s]+', '', line).strip()
                    if clean_rec:
                        recommendations.append(clean_rec)
            elif current_section == "next_steps":
                if line.startswith(('-', '•', '*', '1.', '2.', '3.')):
                    clean_step = re.sub(r'^[-•*\d.\s]+', '', line).strip()
                    if clean_step:
                        next_steps.append(clean_step)
            elif current_section == "motivational":
                motivational_message = line
        
        # Minimum içerik garantisi
        if not recommendations:
            level = learning_summary.get('level', 'başlangıç')
            if level == 'başlangıç':
                recommendations = [
                    "Temel konuları düzenli tekrar edin",
                    "Günde 20-30 dakika çalışma yapın", 
                    "Kolay sorulardan başlayıp zorlaştırın"
                ]
            elif level == 'orta':
                recommendations = [
                    "Zayıf konularınıza odaklanın",
                    "Daha fazla soru çözüm pratiği yapın",
                    "Deneme sınavları çözün"
                ]
            else:
                recommendations = [
                    "İleri seviye kaynaklardan çalışın",
                    "Farklı soru tiplerini deneyin",
                    "Öğreticilik yaparak pekiştirin"
                ]
        
        if not next_steps:
            next_steps = [
                "Bu hafta için çalışma planı yapın",
                "Zayıf konularınızı belirleyin", 
                "İlerlemenizi takip edin"
            ]
        
        return {
            "main_message": main_message.strip(),
            "recommendations": recommendations[:5],
            "next_steps": next_steps[:3],
            "motivational_message": motivational_message
        }
    
    def _generate_simple_fallback(self, user_name: str, question: str, learning_summary: Dict[str, Any]) -> Dict[str, Any]:
        """
        Basit fallback rehberlik
        """
        level = learning_summary.get('level', 'başlangıç')
        avg_accuracy = learning_summary.get('avg_accuracy', 0)
        
        main_message = f"Merhaba {user_name}! Size yardımcı olmaya hazırım. "
        
        if level == 'ileri':
            main_message += "Harika performans gösteriyorsunuz! 🌟"
        elif level == 'orta':
            main_message += "İyi gidiyorsunuz, biraz daha çaba ile mükemmel olacak! 💪"
        else:
            main_message += "Yeni başlıyorsunuz, adım adım ilerleyeceğiz! 🚀"
        
        recommendations = [
            "Düzenli çalışma alışkanlığı geliştirin",
            "Zayıf konularınıza odaklanın", 
            "Yanlış sorularınızı tekrar edin",
            "Kendinizi test etmeyi unutmayın"
        ]
        
        next_steps = [
            "Günlük çalışma planı oluşturun",
            "Hedeflerinizi belirleyin",
            "İlerlemenizi takip edin"
        ]
        
        motivational_message = self._get_motivational_message(level, avg_accuracy)
        
        return {
            "main_message": main_message,
            "recommendations": recommendations,
            "next_steps": next_steps,
            "motivational_message": motivational_message
        }
    
    def _get_motivational_message(self, level: str, avg_accuracy: float) -> str:
        """
        Motivasyon mesajı oluştur
        """
        if level == 'ileri':
            return "🌟 Harika gidiyorsun! Hedeflerine çok yakınsın. Devam et!"
        elif level == 'orta':
            return "💪 Her geçen gün daha da iyileşiyorsun. Kararlılığını koru!"
        else:
            return "🚀 Her büyük yolculuk bir adımla başlar. Sen de harika bir başlangıç yaptın!"
    
    async def store_question_result(
        self,
        user_id: str,
        question_data: Dict[str, Any],
        user_answer: str,
        is_correct: bool,
        subject: str,
        topic: str
    ) -> None:
        """
        Soru çözüm sonucunu memory'e kaydet
        """
        try:
            # Performans verisi hazırla
            session_data = {
                "subject": subject,
                "topic": topic,
                "question": question_data.get("question", ""),
                "user_answer": user_answer,
                "correct_answer": question_data.get("correct_answer", ""),
                "is_correct": is_correct,
                "accuracy": 100 if is_correct else 0,
                "timestamp": datetime.now().isoformat(),
                "difficulty": question_data.get("difficulty", "orta"),
                "education_level": question_data.get("education_level", "lise")
            }
            
            # Memory'e kaydet
            await self.memory_service.store_learning_session(
                user_id=str(user_id),
                session_data=session_data
            )
            
            logger.info(f"Question result stored in memory for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing question result to memory: {e}")
            # Don't raise, just log the error
    
    async def store_session_summary(
        self,
        user_id: str,
        session_summary: Dict[str, Any]
    ) -> None:
        """
        Oturum özetini memory'e kaydet
        """
        try:
            await self.memory_service.store_learning_session(
                user_id=str(user_id),
                session_data=session_summary
            )
            
            logger.info(f"Session summary stored for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing session summary: {e}")

# Global instance
ai_guidance_service = AIGuidanceService()
