from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from app.models.exam import ExamType, ExamSection, ExamQuestion, PracticeExam, PracticeQuestionResult
from app.schemas.exam import PracticeExamCreate, PracticeExamResult
from app.agents.base_agent import BaseAgent
from app.services.memory_service import memory_service
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import random
import json
import os
import asyncio
import concurrent.futures
from datetime import datetime, timedelta

# Pydantic Models for AI Question Generation
class ExamQuestionOption(BaseModel):
    letter: str = Field(description="Seçenek harfi (A, B, C, D)")
    text: str = Field(description="Seçenek metni")

class AIGeneratedExamQuestion(BaseModel):
    question: str = Field(description="Soru metni")
    options: List[ExamQuestionOption] = Field(description="Çoktan seçmeli seçenekler")
    correct_answer: str = Field(description="Doğru cevap harfi (A, B, C, D)")
    explanation: str = Field(description="Doğru cevabın açıklaması")
    difficulty: int = Field(description="Zorluk seviyesi (1: kolay, 2: orta, 3: zor)")

class ExamQuestionGenerationResponse(BaseModel):
    section_name: str = Field(description="Bölüm adı")
    exam_type: str = Field(description="Sınav tipi")
    questions: List[AIGeneratedExamQuestion] = Field(description="Üretilen sorular")

# JSON dosyalarını okuma fonksiyonları
def load_json_data(filename: str) -> Dict:
    """JSON dosyasından verileri yükle"""
    try:
        # exam_agent.py dosyasının bulunduğu klasörü bul
        current_file = os.path.abspath(__file__)
        current_dir = os.path.dirname(current_file)
        # app/agents -> app -> app/data
        app_dir = os.path.dirname(current_dir)
        data_dir = os.path.join(app_dir, "data")
        file_path = os.path.join(data_dir, filename)
        
        print(f"📁 JSON dosyası okunuyor: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            print(f"✅ JSON dosyası başarıyla okundu: {filename} ({len(data)} keys)")
            return data
    except FileNotFoundError:
        print(f"⚠️  JSON dosyası bulunamadı: {file_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON format hatası: {filename} - {e}")
        return {}
    except Exception as e:
        print(f"⚠️  JSON okuma hatası: {filename} - {e}")
        return {}

def get_exam_question_counts() -> Dict:
    """Sabit soru sayıları konfigürasyonunu yükle"""
    return load_json_data("exam_question_counts.json")

def get_subject_question_distribution() -> Dict:
    """Konu bazlı soru dağılımı konfigürasyonunu yükle"""
    return load_json_data("subject_question_distribution.json")

def get_ai_prompts() -> Dict:
    """AI prompt talimatlarını yükle"""
    return load_json_data("ai_prompts.json")

class ExamAgent(BaseAgent):
    """Sınav yönetimi ve soru üretimi için AI destekli agent"""
    
    def __init__(self):
        super().__init__(
            name="ExamAgent",
            description="AI destekli sınav yönetimi ve soru üretimi agent"
        )
    
    def get_exam_question_counts(self) -> Dict:
        """Sabit soru sayıları konfigürasyonunu al"""
        return get_exam_question_counts()
    
    def get_subject_question_distribution_data(self) -> Dict:
        """Konu bazlı soru dağılımı konfigürasyonunu al"""
        return get_subject_question_distribution()
    
    def get_ai_prompts_data(self) -> Dict:
        """AI prompt talimatlarını al"""
        return get_ai_prompts()
    """Sınav yönetimi ve soru üretimi için AI destekli agent"""
    
    def __init__(self):
        super().__init__(
            name="ExamAgent",
            description="AI destekli sınav yönetimi ve soru üretimi agent"
        )
        
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """BaseAgent abstract metodunu implement et"""
        return {"status": "processed", "data": input_data}

    def generate_questions(self, db: Session, exam_section_id: int, count: int = None, difficulty_level: int = None) -> List[ExamQuestion]:
        """Bölüm için AI destekli soru üret - Sabit soru sayısı kullanır veya count parametresi kullanır"""
        
        # Önce section bilgilerini al
        section = db.query(ExamSection).filter(ExamSection.id == exam_section_id).first()
        if not section:
            raise ValueError("Geçersiz sınav bölümü")
        
        exam_type = db.query(ExamType).filter(ExamType.id == section.exam_type_id).first()
        exam_type_name = exam_type.name if exam_type else "Genel"
        
        # Soru sayısını belirle
        if count is None:
            # Sabit soru sayısını al - Veritabanından
            count = self.get_fixed_question_count(exam_type_name, section.name, db)
            print(f"🎯 {exam_type_name} {section.name} için sabit soru sayısı: {count}")
        else:
            print(f"🎯 {exam_type_name} {section.name} için belirtilen soru sayısı: {count}")
        
        import asyncio
        
        try:
            # Mevcut event loop'u kontrol et
            loop = asyncio.get_running_loop()
            # Eğer zaten bir loop çalışıyorsa, task olarak çalıştır
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as executor:
                future = executor.submit(self._sync_generate_questions, db, exam_section_id, count)
                return future.result()
        except RuntimeError:
            # Hiç event loop çalışmıyorsa, yeni bir tane oluştur
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                return loop.run_until_complete(self.generate_ai_questions_async(db, exam_section_id, count))
            finally:
                loop.close()
    
    def _sync_generate_questions(self, db: Session, exam_section_id: int, count: int = 10) -> List[ExamQuestion]:
        """Sync wrapper for async question generation"""
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(self.generate_ai_questions_async(db, exam_section_id, count))
        finally:
            loop.close()

    async def generate_ai_questions_async(self, db: Session, exam_section_id: int, count: int = 10) -> List[ExamQuestion]:
        """Bölüm için AI destekli soru üret - SADECE AI, fallback yok"""
        # Bölümü bul
        section = db.query(ExamSection).filter(ExamSection.id == exam_section_id).first()
        if not section:
            raise ValueError("Geçersiz sınav bölümü")

        # Exam type'ı bul
        exam_type = db.query(ExamType).filter(ExamType.id == section.exam_type_id).first()
        exam_type_name = exam_type.name if exam_type else "Genel"

        # AI ile soru üret - Fallback YOK!
        print(f"🤖 {count} adet AI sorusu üretiliyor... (Template fallback KAPALI)")
        ai_questions = await self._generate_questions_with_ai(section.name, exam_type_name, count)
        
        if not ai_questions.questions:
            raise ValueError(f"AI soru üretimi başarısız oldu. Bölüm: {section.name}, Tip: {exam_type_name}")
        
        generated_questions = []
        for ai_q in ai_questions.questions:
            # Database'e kaydet
            question = ExamQuestion(
                question_text=ai_q.question,
                option_a=next((opt.text for opt in ai_q.options if opt.letter == "A"), ""),
                option_b=next((opt.text for opt in ai_q.options if opt.letter == "B"), ""), 
                option_c=next((opt.text for opt in ai_q.options if opt.letter == "C"), ""),
                option_d=next((opt.text for opt in ai_q.options if opt.letter == "D"), ""),
                option_e="",  # E seçeneği yok
                correct_answer=ai_q.correct_answer,
                explanation=ai_q.explanation,
                difficulty_level=ai_q.difficulty,
                exam_section_id=exam_section_id,
                is_active=True,
                created_by="AI_EXAM_AGENT"
            )
            
            db.add(question)
            generated_questions.append(question)
        
        db.commit()
        print(f"✅ {len(generated_questions)} adet AI sorusu başarıyla oluşturuldu!")
        return generated_questions

    async def _generate_questions_with_ai(self, section_name: str, exam_type: str, count: int) -> ExamQuestionGenerationResponse:
        """Gemini AI ile soru üret - Konu bazlı detaylı prompt sistemi"""
        parser = PydanticOutputParser(pydantic_object=ExamQuestionGenerationResponse)
        format_instructions = parser.get_format_instructions()
        
        # JSON şemasındaki { } karakterlerini escape et
        format_instructions = format_instructions.replace("{", "{{").replace("}", "}}")

        # Sınav tipine göre eğitim seviyesini belirle
        education_mapping = {
            "LGS": "ortaokul (11-14 yaş)",
            "TYT": "lise (14-18 yaş)",
            "AYT": "lise son sınıf (17-18 yaş)"
        }
        education_level = education_mapping.get(exam_type, "lise")

        # Konu bazlı soru dağılımını al
        topic_distribution = self.get_topic_distribution(exam_type, section_name, count)
        
        # Detaylı prompt oluştur
        detailed_requirements = self.create_detailed_prompt(exam_type, section_name, topic_distribution, education_level)

        system_msg = (
            f"Sen bir {section_name} uzmanısın ve {education_level} seviyesinde "
            f"{exam_type} sınav soruları oluşturuyorsun. Türkiye'deki resmi sınav formatına uygun sorular hazırla.\n\n"
            f"KONU DAĞILIMI VE GEREKSİNİMLER:\n{detailed_requirements}"
        )

        human_msg = (
            f"{exam_type} sınavı için {section_name} alanında {count} adet soru oluştur.\n\n"
            "Soru gereksinimleri:\n"
            f"1. Türkiye'deki resmi {exam_type} sınav formatına uygun olmalı\n"
            "2. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı\n"
            "3. Yukarıda belirtilen konu dağılımına uygun olmalı\n"
            "4. Her konudan belirtilen sayıda soru olmalı\n"
            "5. Akademik ve düşünmeyi gerektiren sorular olmalı\n"
            "6. Doğru cevabın açık açıklaması olmalı\n"
            "7. Zorluk seviyesi 1 (kolay), 2 (orta), 3 (zor) olmalı\n"
            "8. Türkçe dilbilgisi kurallarına uygun olmalı\n"
            "9. Gerçek sınav seviyesinde olmalı\n\n"
            f"{format_instructions}\n\n"
            "ÖNEMLI: Sadece JSON formatında cevap ver. Yorum ya da ek açıklama ekleme."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_msg),
            ("human", human_msg),
        ])

        # Temperature'ı artır çeşitlilik için
        original_temp = self.temperature
        self.temperature = 0.7

        chain = prompt | self.llm | parser

        # 3 deneme hakkı ver
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"🔄 AI soru üretimi denemesi {attempt + 1}/{max_retries}")
                result = await chain.ainvoke({})
                self.temperature = original_temp
                
                if result.questions and len(result.questions) > 0:
                    print(f"✅ AI başarıyla {len(result.questions)} soru üretti!")
                    return result
                else:
                    print(f"⚠️  AI boş soru listesi döndürdü (deneme {attempt + 1})")
                    
            except Exception as e:
                print(f"❌ AI deneme {attempt + 1} başarısız: {e}")
                if attempt == max_retries - 1:  # Son deneme
                    self.temperature = original_temp
                    raise ValueError(f"AI soru üretimi {max_retries} denemede başarısız oldu: {e}")
        
        self.temperature = original_temp
        raise ValueError("AI soru üretimi tüm denemelerde başarısız oldu")

    def get_topic_distribution(self, exam_type: str, section_name: str, total_count: int) -> Dict:
        """Belirtilen bölüm için konu dağılımını al"""
        distribution_data = self.get_subject_question_distribution_data()
        if exam_type in distribution_data and section_name in distribution_data[exam_type]:
            distribution = distribution_data[exam_type][section_name]
            
            # Oransal dağılım yap
            original_total = distribution["total_questions"]
            ratio = total_count / original_total
            
            adjusted_topics = {}
            for topic_name, topic_info in distribution["topics"].items():
                adjusted_count = max(1, round(topic_info["question_count"] * ratio))
                adjusted_topics[topic_name] = {
                    "question_count": adjusted_count,
                    "subtopics": topic_info["subtopics"]
                }
            
            return {"topics": adjusted_topics, "total_questions": total_count}
        
        # Varsayılan dağılım
        return {
            "topics": {
                "Genel Konular": {
                    "question_count": total_count,
                    "subtopics": [f"{section_name} genel konuları"]
                }
            },
            "total_questions": total_count
        }

    def create_detailed_prompt(self, exam_type: str, section_name: str, topic_distribution: Dict, education_level: str) -> str:
        """Konu dağılımına göre detaylı prompt oluştur"""
        prompt_parts = []
        
        prompt_parts.append(f"🎯 {exam_type} {section_name} Sınav Soruları ({education_level} seviyesi):")
        prompt_parts.append(f"Toplam Soru Sayısı: {topic_distribution['total_questions']}")
        prompt_parts.append("")
        
        for topic_name, topic_info in topic_distribution["topics"].items():
            prompt_parts.append(f"📚 {topic_name}: {topic_info['question_count']} soru")
            
            if topic_info["subtopics"]:
                prompt_parts.append("   Konular:")
                for subtopic in topic_info["subtopics"]:
                    prompt_parts.append(f"   • {subtopic}")
            
            prompt_parts.append("")
        
        # AI prompt talimatlarını JSON'dan al
        ai_prompts = self.get_ai_prompts_data()
        if exam_type in ai_prompts and section_name in ai_prompts[exam_type]:
            prompt_parts.extend([
                "🔍 ÖZEL TALİMATLAR:",
                f"• {ai_prompts[exam_type][section_name]}",
                ""
            ])
        
        return "\n".join(prompt_parts)
    
    def create_practice_exam(self, db: Session, exam_data: PracticeExamCreate, user_id: int, 
                           use_existing: bool = True, force_new: bool = False) -> PracticeExam:
        """Deneme sınavı oluştur - Mevcut examlardan rastgele seç veya yeni üret"""
        # Exam section'ı bul
        exam_section = db.query(ExamSection).filter(ExamSection.id == exam_data.exam_section_id).first()
        if not exam_section:
            raise ValueError("Geçersiz sınav bölümü")
        
        # Exam type'ı bul
        exam_type = db.query(ExamType).filter(ExamType.id == exam_section.exam_type_id).first()
        if not exam_type:
            raise ValueError("Geçersiz sınav tipi")
        
        # Sabit soru sayısını belirle
        question_count = self.get_fixed_question_count(exam_type.name, exam_section.name, db)
        
        # Eğer force_new değilse ve use_existing True ise, mevcut examlardan rastgele seç
        if not force_new and use_existing:
            existing_exam = self.get_random_existing_exam(db, exam_data.exam_section_id, user_id)
            if existing_exam:
                print(f"🎲 Mevcut examlardan rastgele seçildi: {existing_exam.name}")
                return existing_exam
        
        # Yeni exam üret
        print("🤖 Yeni AI soruları üretiliyor (sabit soru sayısı kullanılıyor)...")
        
        # Sabit sayıda soru üret - artık count parametresi gerekmez
        questions = self.generate_questions(db, exam_data.exam_section_id)
        
        # Practice exam oluştur
        practice_exam = PracticeExam(
            name=f"{exam_type.name} {exam_section.name} Denemesi",
            exam_type_id=exam_section.exam_type_id,
            exam_section_id=exam_data.exam_section_id,
            user_id=user_id,
            total_questions=len(questions),
            duration_minutes=exam_type.duration_minutes or 60,  # ExamType'dan duration al
            status="not_started",
            start_time=datetime.utcnow()
        )
        
        db.add(practice_exam)
        db.commit()
        db.refresh(practice_exam)
        
        return practice_exam

    def get_fixed_question_count(self, exam_type_name: str, section_name: str, db: Session = None) -> int:
        """Exam türü ve bölüme göre sabit soru sayısını döndür - Veritabanından"""
        if db is None:
            # Fallback: JSON'dan al
            question_counts = self.get_exam_question_counts()
            if exam_type_name in question_counts:
                section_counts = question_counts[exam_type_name]
                # Tam eşleşme ara
                if section_name in section_counts:
                    return section_counts[section_name]
                
                # Kısmi eşleşme ara
                for key, count in section_counts.items():
                    if section_name.lower() in key.lower() or key.lower() in section_name.lower():
                        return count
            return 20  # Varsayılan soru sayısı
        
        # Veritabanından al
        try:
            # Önce exam type'ı bul
            exam_type = db.query(ExamType).filter(ExamType.name == exam_type_name).first()
            if not exam_type:
                print(f"⚠️  Exam type bulunamadı: {exam_type_name}")
                return 20
            
            # Exam section'ı bul
            exam_section = db.query(ExamSection).filter(
                ExamSection.exam_type_id == exam_type.id,
                ExamSection.name == section_name,
                ExamSection.is_active == True
            ).first()
            
            if exam_section and exam_section.question_count:
                print(f"✅ Veritabanından soru sayısı alındı: {exam_type_name} {section_name} = {exam_section.question_count}")
                return exam_section.question_count
            
            # Kısmi eşleşme denemeye
            exam_sections = db.query(ExamSection).filter(
                ExamSection.exam_type_id == exam_type.id,
                ExamSection.is_active == True
            ).all()
            
            for section in exam_sections:
                if (section_name.lower() in section.name.lower() or 
                    section.name.lower() in section_name.lower()):
                    if section.question_count:
                        print(f"✅ Kısmi eşleşme ile soru sayısı alındı: {section.name} = {section.question_count}")
                        return section.question_count
            
            print(f"⚠️  Veritabanında section bulunamadı: {exam_type_name} {section_name}")
            return 20  # Varsayılan soru sayısı
            
        except Exception as e:
            print(f"⚠️  Veritabanı sorgusu hatası: {e}")
            return 20

    def get_random_existing_exam(self, db: Session, exam_section_id: int, user_id: int) -> Optional[PracticeExam]:
        """Belirtilen bölümden rastgele mevcut bir exam döndür"""
        # User'ın bu bölümde daha önce çözdüğü examları bul
        existing_exams = db.query(PracticeExam).filter(
            PracticeExam.exam_section_id == exam_section_id,
            PracticeExam.user_id == user_id,
            PracticeExam.status == "completed"  # Sadece tamamlanmış examlardan seç
        ).all()
        
        if not existing_exams:
            # Bu kullanıcının tamamlanmış exami yoksa, diğer kullanıcıların examlarından seç
            existing_exams = db.query(PracticeExam).filter(
                PracticeExam.exam_section_id == exam_section_id,
                PracticeExam.status == "completed"
            ).limit(50).all()  # Performans için limit koy
        
        if existing_exams:
            # Rastgele bir exam seç ve kopyala
            original_exam = random.choice(existing_exams)
            return self.clone_exam_for_user(db, original_exam, user_id)
        
        return None

    def clone_exam_for_user(self, db: Session, original_exam: PracticeExam, new_user_id: int) -> PracticeExam:
        """Mevcut bir exami yeni kullanıcı için klonla"""
        # Yeni exam oluştur
        cloned_exam = PracticeExam(
            name=f"{original_exam.name} (Rastgele)",
            exam_type_id=original_exam.exam_type_id,
            exam_section_id=original_exam.exam_section_id,
            user_id=new_user_id,
            total_questions=original_exam.total_questions,
            duration_minutes=original_exam.duration_minutes,
            status="not_started",
            start_time=datetime.utcnow()
        )
        
        db.add(cloned_exam)
        db.commit()
        db.refresh(cloned_exam)
        
        return cloned_exam
    
    def submit_practice_exam(self, db: Session, exam_id: int, user_id: int, answers: dict) -> Dict:
        """Deneme sınavı sonuçlarını değerlendir"""
        # Practice exam'ı bul
        practice_exam = db.query(PracticeExam).filter(
            PracticeExam.id == exam_id,
            PracticeExam.user_id == user_id
        ).first()
        
        if not practice_exam:
            raise ValueError("Deneme sınavı bulunamadı")

        # Exam section bilgilerini al
        exam_section = db.query(ExamSection).filter(
            ExamSection.id == practice_exam.exam_section_id
        ).first()
        
        exam_type = None
        if exam_section:
            exam_type = db.query(ExamType).filter(
                ExamType.id == exam_section.exam_type_id
            ).first()
        
        # Soruları al
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.id.in_(practice_exam.questions if hasattr(practice_exam, 'questions') and practice_exam.questions else [])
        ).all()
        
        if not questions:
            # Fallback: exam_section_id'den sorular al
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == practice_exam.exam_section_id,
                ExamQuestion.is_active == True
            ).limit(practice_exam.total_questions).all()
        
        # Cevapları değerlendir ve sonuçları kaydet
        correct_count = 0
        total_questions = len(questions)
        wrong_topics = []
        difficult_topics = []
        
        for question in questions:
            user_answer = answers.get(str(question.id))
            is_correct = user_answer == question.correct_answer
            
            if is_correct:
                correct_count += 1
            else:
                # Yanlış cevaplanan soruların topic'lerini topla
                if hasattr(question, 'topic') and question.topic:
                    wrong_topics.append(question.topic)
                elif hasattr(question, 'content') and question.content:
                    # Content'ten topic çıkarmaya çalış
                    content_lower = question.content.lower()
                    if any(word in content_lower for word in ['polinom', 'faktör']):
                        wrong_topics.append('polinom')
                    elif any(word in content_lower for word in ['geometri', 'alan', 'çevre']):
                        wrong_topics.append('geometri')
                    elif any(word in content_lower for word in ['trigonometri', 'sinüs', 'kosinüs']):
                        wrong_topics.append('trigonometri')
                    else:
                        wrong_topics.append('genel')
            
            # Her soru için sonuç kaydet
            question_result = PracticeQuestionResult(
                practice_exam_id=exam_id,
                question_id=question.id,
                user_answer=user_answer,
                is_correct=is_correct,
                time_spent_seconds=0  # Şimdilik 0, gelecekte timer eklenebilir
            )
            db.add(question_result)
        
        # Practice exam'ı güncelle
        score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        practice_exam.correct_answers = correct_count
        practice_exam.wrong_answers = total_questions - correct_count
        practice_exam.score = score_percentage
        practice_exam.status = "completed"
        practice_exam.end_time = datetime.utcnow()
        
        db.commit()
        
        # 🧠 Memory'e sınav sonucunu kaydet
        try:
            asyncio.create_task(self._store_exam_memory(
                user_id=str(user_id),
                exam_data={
                    "exam_id": exam_id,
                    "exam_type": exam_type.name if exam_type else "Bilinmiyor",
                    "exam_section": exam_section.name if exam_section else "Bilinmiyor", 
                    "score": score_percentage,
                    "correct_answers": correct_count,
                    "total_questions": total_questions,
                    "wrong_topics": list(set(wrong_topics)),  # Unique topics
                    "accuracy": score_percentage,
                    "timestamp": practice_exam.end_time.isoformat() if practice_exam.end_time else datetime.utcnow().isoformat()
                }
            ))
        except Exception as e:
            print(f"⚠️ Memory kaydı sırasında hata: {e}")
            # Memory hatası sınav sonucunu etkilemesin
        
        # Sonuç döndür
        return {
            "exam_id": exam_id,
            "score": score_percentage,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "time_spent": 0,  # Şimdilik 0
            "percentage": score_percentage,
            "wrong_topics": list(set(wrong_topics)),  # Unique topics
            "exam_type": exam_type.name if exam_type else "Bilinmiyor",
            "exam_section": exam_section.name if exam_section else "Bilinmiyor"
        }
    
    def get_exam_types(self, db: Session) -> List[Dict]:
        """Mevcut sınav türlerini listele"""
        exam_types = db.query(ExamType).filter(ExamType.is_active == True).all()
        return [
            {
                "id": et.id,
                "name": et.name,
                "description": et.description,
                "duration_minutes": et.duration_minutes
            }
            for et in exam_types
        ]
    
    def get_exam_sections(self, db: Session, exam_type_id: int) -> List[Dict]:
        """Sınav türüne ait bölümleri getir"""
        sections = db.query(ExamSection).filter(
            ExamSection.exam_type_id == exam_type_id,
            ExamSection.is_active == True
        ).all()
        return [
            {
                "id": s.id,
                "name": s.name,
                "question_count": s.question_count,
                "sort_order": s.sort_order,
                "color": s.color,
                "icon": s.icon,
                "is_active": s.is_active
            }
            for s in sections
        ]
    
    def get_section_questions(self, db: Session, section_id: int) -> List[Dict]:
        """Bölüme ait soruları getir"""
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == section_id,
            ExamQuestion.is_active == True
        ).all()
        return [
            {
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "option_e": q.option_e,
                "difficulty_level": q.difficulty_level
            }
            for q in questions
        ]
    
    def start_practice_exam(self, db: Session, user_id: int, exam_data: PracticeExamCreate, 
                          use_existing: bool = True, force_new: bool = False) -> Dict:
        """Deneme sınavı başlat - Mevcut examlardan rastgele seç veya yeni üret"""
        practice_exam = self.create_practice_exam(db, exam_data, user_id, use_existing, force_new)
        
        # Sabit soru sayısını belirle
        exam_section = db.query(ExamSection).filter(ExamSection.id == exam_data.exam_section_id).first()
        exam_type = db.query(ExamType).filter(ExamType.id == exam_section.exam_type_id).first()
        question_count = self.get_fixed_question_count(exam_type.name, exam_section.name, db)
        
        # Soruları getir
        if not force_new and use_existing:
            # Mevcut examlardan geliyorsa, rastgele sorular al
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,  
                ExamQuestion.is_active == True
            ).order_by(text("RANDOM()")).limit(question_count).all()
        else:
            # Yeni oluşturulan exam için en son eklenen AI sorularını getir
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,  
                ExamQuestion.is_active == True,
                ExamQuestion.created_by == "AI_EXAM_AGENT"
            ).order_by(ExamQuestion.id.desc()).limit(question_count).all()
        
        # Eğer yeterli soru yoksa, tümünü al
        if len(questions) < question_count:
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,
                ExamQuestion.is_active == True
            ).limit(question_count).all()
        
        question_data = []
        for i, q in enumerate(questions):
            question_data.append({
                "question_number": i + 1,
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "option_e": q.option_e if q.option_e else "",
                "difficulty_level": q.difficulty_level,
                "created_by": q.created_by,
                "options_formatted": {
                    "A": q.option_a,
                    "B": q.option_b,
                    "C": q.option_c,
                    "D": q.option_d,
                    "E": q.option_e if q.option_e else ""
                }
            })
        
        # Sınav durumunu başlatıldı olarak güncelle
        practice_exam.status = "in_progress"
        practice_exam.start_time = datetime.utcnow()
        db.commit()
        
        return {
            "exam_id": practice_exam.id,
            "title": practice_exam.name,
            "total_questions": practice_exam.total_questions,
            "duration_minutes": practice_exam.duration_minutes,
            "questions": question_data,
            "started_at": practice_exam.start_time.isoformat()
        }
    
    def get_exam_results(self, db: Session, exam_id: int, user_id: int) -> Dict:
        """Sınav sonuçlarını getir"""
        practice_exam = db.query(PracticeExam).filter(
            PracticeExam.id == exam_id,
            PracticeExam.user_id == user_id
        ).first()
        
        if not practice_exam:
            raise ValueError("Sınav sonucu bulunamadı")
        
        # Soru sonuçlarını al
        question_results = db.query(PracticeQuestionResult).filter(
            PracticeQuestionResult.practice_exam_id == exam_id
        ).all()
        
        return {
            "exam_id": exam_id,
            "score": practice_exam.score or 0,
            "correct_answers": practice_exam.correct_answers or 0,
            "total_questions": practice_exam.total_questions or 0,
            "completed_at": practice_exam.end_time.isoformat() if practice_exam.end_time else None
        }
    
    def get_user_exams(self, db: Session, user_id: int) -> List[Dict]:
        """Kullanıcının sınavlarını listele"""
        exams = db.query(PracticeExam).filter(
            PracticeExam.user_id == user_id
        ).order_by(PracticeExam.created_at.desc()).all()
        
        result = []
        for exam in exams:
            exam_data = {
                "id": exam.id,
                "title": exam.name,
                "total_questions": exam.total_questions,
                "duration_minutes": exam.duration_minutes,
                "created_at": exam.created_at.isoformat(),
                "completed_at": exam.end_time.isoformat() if exam.end_time else None,
                "is_completed": exam.status == "completed",
                "score": exam.score or 0,
                "correct_answers": exam.correct_answers or 0
            }
            
            result.append(exam_data)
        return result
    
    # ========== EXAM MANAGEMENT METHODS ==========
    
    def get_all_practice_exams(self, db: Session, user_id: int = None, status: str = None) -> List[Dict]:
        """Tüm deneme sınavlarını listele (admin için) veya kullanıcıya özel"""
        query = db.query(PracticeExam)
        
        if user_id:
            query = query.filter(PracticeExam.user_id == user_id)
        
        if status:
            query = query.filter(PracticeExam.status == status)
        
        exams = query.order_by(PracticeExam.created_at.desc()).all()
        
        result = []
        for exam in exams:
            # Exam type ve section bilgilerini al
            exam_type = db.query(ExamType).filter(ExamType.id == exam.exam_type_id).first()
            exam_section = db.query(ExamSection).filter(ExamSection.id == exam.exam_section_id).first()
            
            exam_data = {
                "id": exam.id,
                "name": exam.name,
                "exam_type": exam_type.name if exam_type else "Bilinmeyen",
                "exam_section": exam_section.name if exam_section else "Bilinmeyen",
                "user_id": exam.user_id,
                "total_questions": exam.total_questions,
                "duration_minutes": exam.duration_minutes,
                "status": exam.status,
                "score": exam.score or 0,
                "correct_answers": exam.correct_answers or 0,
                "wrong_answers": exam.wrong_answers or 0,
                "created_at": exam.created_at.isoformat(),
                "start_time": exam.start_time.isoformat() if exam.start_time else None,
                "end_time": exam.end_time.isoformat() if exam.end_time else None
            }
            result.append(exam_data)
        
        return result
    
    def get_practice_exam_details(self, db: Session, exam_id: int, user_id: int = None) -> Dict:
        """Detaylı sınav bilgisi al"""
        query = db.query(PracticeExam).filter(PracticeExam.id == exam_id)
        
        if user_id:
            query = query.filter(PracticeExam.user_id == user_id)
        
        exam = query.first()
        if not exam:
            raise ValueError("Sınav bulunamadı veya erişim izniniz yok")
        
        # Exam type ve section bilgilerini al
        exam_type = db.query(ExamType).filter(ExamType.id == exam.exam_type_id).first()
        exam_section = db.query(ExamSection).filter(ExamSection.id == exam.exam_section_id).first()
        
        # Sınav sorularını al
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == exam.exam_section_id,
            ExamQuestion.is_active == True
        ).limit(exam.total_questions).all()
        
        # Cevapları al (eğer tamamlanmışsa)
        answers = []
        if exam.status == "completed":
            question_results = db.query(PracticeQuestionResult).filter(
                PracticeQuestionResult.practice_exam_id == exam_id
            ).all()
            
            for result in question_results:
                question = next((q for q in questions if q.id == result.question_id), None)
                if question:
                    answers.append({
                        "question_id": result.question_id,
                        "question_text": question.question_text,
                        "user_answer": result.user_answer,
                        "correct_answer": question.correct_answer,
                        "is_correct": result.is_correct,
                        "explanation": question.explanation
                    })
        
        return {
            "id": exam.id,
            "name": exam.name,
            "exam_type": exam_type.name if exam_type else "Bilinmeyen",
            "exam_section": exam_section.name if exam_section else "Bilinmeyen",
            "user_id": exam.user_id,
            "total_questions": exam.total_questions,
            "duration_minutes": exam.duration_minutes,
            "status": exam.status,
            "score": exam.score or 0,
            "correct_answers": exam.correct_answers or 0,
            "wrong_answers": exam.wrong_answers or 0,
            "created_at": exam.created_at.isoformat(),
            "start_time": exam.start_time.isoformat() if exam.start_time else None,
            "end_time": exam.end_time.isoformat() if exam.end_time else None,
            "questions_count": len(questions),
            "answers": answers
        }
    
    def delete_practice_exam(self, db: Session, exam_id: int, user_id: int = None) -> bool:
        """Deneme sınavını sil"""
        query = db.query(PracticeExam).filter(PracticeExam.id == exam_id)
        
        if user_id:
            query = query.filter(PracticeExam.user_id == user_id)
        
        exam = query.first()
        if not exam:
            raise ValueError("Sınav bulunamadı veya erişim izniniz yok")
        
        # İlgili soru sonuçlarını da sil
        db.query(PracticeQuestionResult).filter(
            PracticeQuestionResult.practice_exam_id == exam_id
        ).delete()
        
        # Sınavı sil
        db.delete(exam)
        db.commit()
        
        return True
    
    def update_practice_exam_status(self, db: Session, exam_id: int, new_status: str, user_id: int = None) -> Dict:
        """Sınav durumunu güncelle"""
        valid_statuses = ["not_started", "in_progress", "completed", "cancelled"]
        if new_status not in valid_statuses:
            raise ValueError(f"Geçersiz durum. Geçerli durumlar: {valid_statuses}")
        
        query = db.query(PracticeExam).filter(PracticeExam.id == exam_id)
        
        if user_id:
            query = query.filter(PracticeExam.user_id == user_id)
        
        exam = query.first()
        if not exam:
            raise ValueError("Sınav bulunamadı veya erişim izniniz yok")
        
        exam.status = new_status
        
        # Durum güncellemelerine göre zaman damgaları
        if new_status == "in_progress" and not exam.start_time:
            exam.start_time = datetime.utcnow()
        elif new_status == "completed" and not exam.end_time:
            exam.end_time = datetime.utcnow()
        elif new_status == "cancelled":
            exam.end_time = datetime.utcnow()
        
        db.commit()
        db.refresh(exam)
        
        return {
            "id": exam.id,
            "status": exam.status,
            "start_time": exam.start_time.isoformat() if exam.start_time else None,
            "end_time": exam.end_time.isoformat() if exam.end_time else None
        }
    
    def get_exam_statistics(self, db: Session, user_id: int = None) -> Dict:
        """Sınav istatistiklerini al"""
        query = db.query(PracticeExam)
        
        if user_id:
            query = query.filter(PracticeExam.user_id == user_id)
        
        exams = query.all()
        
        total_exams = len(exams)
        completed_exams = len([e for e in exams if e.status == "completed"])
        in_progress_exams = len([e for e in exams if e.status == "in_progress"])
        cancelled_exams = len([e for e in exams if e.status == "cancelled"])
        
        # Ortalama skor hesapla
        completed_scores = [e.score for e in exams if e.status == "completed" and e.score is not None]
        avg_score = sum(completed_scores) / len(completed_scores) if completed_scores else 0
        
        # En yüksek skor
        max_score = max(completed_scores) if completed_scores else 0
        
        # Sınav türü bazında istatistikler
        type_stats = {}
        for exam in exams:
            exam_type = db.query(ExamType).filter(ExamType.id == exam.exam_type_id).first()
            type_name = exam_type.name if exam_type else "Bilinmeyen"
            
            if type_name not in type_stats:
                type_stats[type_name] = {
                    "total": 0,
                    "completed": 0,
                    "avg_score": 0,
                    "scores": []
                }
            
            type_stats[type_name]["total"] += 1
            if exam.status == "completed":
                type_stats[type_name]["completed"] += 1
                if exam.score is not None:
                    type_stats[type_name]["scores"].append(exam.score)
        
        # Her tip için ortalama hesapla
        for type_name in type_stats:
            scores = type_stats[type_name]["scores"]
            type_stats[type_name]["avg_score"] = sum(scores) / len(scores) if scores else 0
            del type_stats[type_name]["scores"]  # Scores listesini kaldır
        
        return {
            "total_exams": total_exams,
            "completed_exams": completed_exams,
            "in_progress_exams": in_progress_exams,
            "cancelled_exams": cancelled_exams,
            "completion_rate": (completed_exams / total_exams * 100) if total_exams > 0 else 0,
            "average_score": round(avg_score, 2),
            "max_score": max_score,
            "exam_type_statistics": type_stats
        }
    
    def get_questions_by_criteria(self, db: Session, exam_type_id: int = None, section_id: int = None, 
                                 difficulty_level: int = None, created_by: str = None, limit: int = 50) -> List[Dict]:
        """Kriterlere göre soruları getir"""
        query = db.query(ExamQuestion).filter(ExamQuestion.is_active == True)
        
        if section_id:
            query = query.filter(ExamQuestion.exam_section_id == section_id)
        elif exam_type_id:
            # Section üzerinden exam_type'a ulaş
            sections = db.query(ExamSection).filter(ExamSection.exam_type_id == exam_type_id).all()
            section_ids = [s.id for s in sections]
            query = query.filter(ExamQuestion.exam_section_id.in_(section_ids))
        
        if difficulty_level:
            query = query.filter(ExamQuestion.difficulty_level == difficulty_level)
        
        if created_by:
            query = query.filter(ExamQuestion.created_by == created_by)
        
        questions = query.limit(limit).all()
        
        result = []
        for q in questions:
            # Section ve exam type bilgilerini al
            section = db.query(ExamSection).filter(ExamSection.id == q.exam_section_id).first()
            exam_type = db.query(ExamType).filter(ExamType.id == section.exam_type_id).first() if section else None
            
            result.append({
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "option_e": q.option_e,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "difficulty_level": q.difficulty_level,
                "created_by": q.created_by,
                "exam_section": section.name if section else "Bilinmeyen",
                "exam_type": exam_type.name if exam_type else "Bilinmeyen",
                "created_at": q.created_at.isoformat() if hasattr(q, 'created_at') else None
            })
        
        return result
    
    def get_practice_exam_questions(self, db: Session, exam_id: int, user_id: int = None, include_answers: bool = False) -> List[Dict]:
        """Belirli bir sınavın sorularını getir"""
        query = db.query(PracticeExam).filter(PracticeExam.id == exam_id)
        
        if user_id:
            query = query.filter(PracticeExam.user_id == user_id)
        
        exam = query.first()
        if not exam:
            raise ValueError("Sınav bulunamadı veya erişim izniniz yok")
        
        # Sınavda kullanılan soruları al
        # Önce AI soruları, sonra diğerleri
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == exam.exam_section_id,
            ExamQuestion.is_active == True
        ).order_by(
            ExamQuestion.created_by.desc(),  # AI_EXAM_AGENT önce gelsin
            ExamQuestion.id.desc()
        ).limit(exam.total_questions).all()
        
        result = []
        for i, q in enumerate(questions):
            question_data = {
                "question_number": i + 1,
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "option_e": q.option_e if q.option_e else "",
                "difficulty_level": q.difficulty_level,
                "created_by": q.created_by
            }
            
            # Eğer cevapları da dahil et denirse (sınav tamamlandıysa)
            if include_answers and exam.status == "completed":
                question_data.update({
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation
                })
                
                # Kullanıcının verdiği cevabı bul
                user_result = db.query(PracticeQuestionResult).filter(
                    PracticeQuestionResult.practice_exam_id == exam_id,
                    PracticeQuestionResult.question_id == q.id
                ).first()
                
                if user_result:
                    question_data.update({
                        "user_answer": user_result.user_answer,
                        "is_correct": user_result.is_correct,
                        "time_spent_seconds": user_result.time_spent_seconds
                    })
            
            result.append(question_data)
        
        return result

    def get_practice_exam_questions_with_answers(self, db: Session, exam_id: int) -> List[Dict]:
        """Admin için sınav sorularını doğru cevaplarla birlikte getir"""
        exam = db.query(PracticeExam).filter(PracticeExam.id == exam_id).first()
        if not exam:
            raise ValueError("Sınav bulunamadı")
        
        # Sınavda kullanılan soruları al
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == exam.exam_section_id,
            ExamQuestion.is_active == True
        ).order_by(
            ExamQuestion.created_by.desc(),  # AI_EXAM_AGENT önce gelsin
            ExamQuestion.id.desc()
        ).limit(exam.total_questions).all()
        
        result = []
        for i, q in enumerate(questions):
            question_data = {
                "question_number": i + 1,
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "option_e": q.option_e if q.option_e else "",
                "difficulty_level": q.difficulty_level,
                "created_by": q.created_by,
                "correct_answer": q.correct_answer,  # Admin için her zaman dahil et
                "explanation": q.explanation if hasattr(q, 'explanation') else None,
                "topic_name": q.topic_name if hasattr(q, 'topic_name') else None,
                "subject_name": q.subject_name if hasattr(q, 'subject_name') else None
            }
            
            result.append(question_data)
        
        return result

    async def _store_exam_memory(self, user_id: str, exam_data: Dict[str, Any]) -> None:
        """
        Sınav sonucunu kullanıcı memory'sine kaydet
        """
        try:
            # Sınav session verilerini hazırla
            session_data = {
                "subject": exam_data.get("exam_type", "Genel"),
                "topic": exam_data.get("exam_section", "Deneme Sınavı"), 
                "education_level": "lise",  # Default olarak lise
                "total_questions": exam_data.get("total_questions", 0),
                "correct_answers": exam_data.get("correct_answers", 0),
                "accuracy": exam_data.get("accuracy", 0),
                "wrong_answers": exam_data.get("wrong_topics", []),
                "difficult_topics": exam_data.get("wrong_topics", []),
                "timestamp": exam_data.get("timestamp"),
                "session_type": "exam_completion",
                "exam_id": exam_data.get("exam_id")
            }
            
            # Memory service'e kaydet
            await memory_service.store_learning_session(user_id, session_data)
            
            # Eğer performans düşükse zayıflık analizi de kaydet
            if exam_data.get("accuracy", 0) < 60:
                analysis_data = {
                    "subject": exam_data.get("exam_type", "Genel"),
                    "topic": exam_data.get("exam_section", "Deneme Sınavı"),
                    "weakness_level": max(1, 10 - int(exam_data.get("accuracy", 0) / 10)),
                    "weak_topics": exam_data.get("wrong_topics", []),
                    "strong_topics": [],  # Güçlü konular analizi gelecekte eklenebilir
                    "recommendations": [
                        f"{topic} konusunu tekrar çalış" for topic in exam_data.get("wrong_topics", [])
                    ],
                    "detailed_analysis": f"Deneme sınavında %{exam_data.get('accuracy', 0):.1f} başarı elde edildi. Geliştirilmesi gereken alanlar var.",
                    "timestamp": exam_data.get("timestamp")
                }
                await memory_service.store_weakness_analysis(user_id, analysis_data)
            
            print(f"✅ Sınav sonucu memory'e kaydedildi - User: {user_id}, Score: {exam_data.get('accuracy', 0)}%")
            
        except Exception as e:
            print(f"❌ Memory kaydetme hatası: {e}")
            # Memory hatası ana işlemi etkilemesin

    def generate_exam_structure(self, db: Session, education_level: str) -> Dict[str, Any]:
        """Eğitim seviyesine göre sınav yapısını oluştur"""
        
        if education_level.lower() == "ortaokul":
            return {
                "exam_type": {
                    "name": "LGS",
                    "description": "Liselere Geçiş Sınavı",
                    "duration_minutes": 165,
                    "total_questions": 90
                },
                "sections": [
                    {
                        "name": "Türkçe",
                        "question_count": 20,
                        "color": "#E53E3E",
                        "icon": "📝"
                    },
                    {
                        "name": "Matematik",
                        "question_count": 20,
                        "color": "#3182CE",
                        "icon": "🔢"
                    },
                    {
                        "name": "Fen Bilimleri",
                        "question_count": 20,
                        "color": "#38A169",
                        "icon": "🔬"
                    },
                    {
                        "name": "T.C. İnkılap Tarihi ve Atatürkçülük",
                        "question_count": 10,
                        "color": "#D69E2E",
                        "icon": "🏛️"
                    },
                    {
                        "name": "Din Kültürü ve Ahlak Bilgisi",
                        "question_count": 10,
                        "color": "#805AD5",
                        "icon": "📿"
                    },
                    {
                        "name": "İngilizce",
                        "question_count": 10,
                        "color": "#319795",
                        "icon": "🌍"
                    }
                ]
            }
        
        elif education_level.lower() == "lise":
            return {
                "tyt": {
                    "exam_type": {
                        "name": "TYT",
                        "description": "Temel Yeterlilik Testi",
                        "duration_minutes": 165,
                        "total_questions": 120
                    },
                    "sections": [
                        {
                            "name": "Türkçe",
                            "question_count": 40,
                            "color": "#E53E3E",
                            "icon": "📝"
                        },
                        {
                            "name": "Matematik",
                            "question_count": 40,
                            "color": "#3182CE",
                            "icon": "🔢"
                        },
                        {
                            "name": "Fen Bilimleri",
                            "question_count": 20,
                            "color": "#38A169",
                            "icon": "🔬"
                        },
                        {
                            "name": "Sosyal Bilimler",
                            "question_count": 20,
                            "color": "#D69E2E",
                            "icon": "🏛️"
                        }
                    ]
                },
                "ayt": {
                    "exam_type": {
                        "name": "AYT",
                        "description": "Alan Yeterlilik Testi",
                        "duration_minutes": 180,
                        "total_questions": 80
                    },
                    "sections": [
                        {
                            "name": "Matematik",
                            "question_count": 40,
                            "color": "#3182CE",
                            "icon": "🔢"
                        },
                        {
                            "name": "Fizik",
                            "question_count": 14,
                            "color": "#9F7AEA",
                            "icon": "⚡"
                        },
                        {
                            "name": "Kimya",
                            "question_count": 13,
                            "color": "#48BB78",
                            "icon": "🧪"
                        },
                        {
                            "name": "Biyoloji",
                            "question_count": 13,
                            "color": "#4FD1C7",
                            "icon": "🧬"
                        }
                    ]
                }
            }
        
        else:
            # Varsayılan yapı
            return {
                "exam_type": {
                    "name": "Genel Sınav",
                    "description": "Genel sınav yapısı",
                    "duration_minutes": 120,
                    "total_questions": 50
                },
                "sections": [
                    {
                        "name": "Genel Sorular",
                        "question_count": 50,
                        "color": "#4F46E5",
                        "icon": "📚"
                    }
                ]
            }

    # Template sistemi tamamen kaldırıldı - Sadece AI üretimi!
