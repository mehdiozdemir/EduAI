from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.exam import ExamType, ExamSection, ExamQuestion, PracticeExam, PracticeQuestionResult
from app.schemas.exam import PracticeExamCreate, PracticeExamResult
from app.agents.base_agent import BaseAgent
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field
import random
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

class ExamAgent(BaseAgent):
    """Sınav yönetimi ve soru üretimi için AI destekli agent"""
    
    def __init__(self):
        super().__init__(
            name="ExamAgent",
            description="AI destekli sınav yönetimi ve soru üretimi agent"
        )
        
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """BaseAgent abstract metodunu implement et"""
        return {"status": "processed", "data": input_data}
        
    def _generate_questions_from_templates(self, db: Session, section_name: str, exam_section_id: int, count: int = 10) -> List[ExamQuestion]:
        """Template'lerden soru üret (AI fallback için)"""
        question_templates = self._get_question_templates(section_name)
        
        generated_questions = []
        for i in range(min(count, len(question_templates))):
            template = question_templates[i]
            
            # Soru oluştur
            question = ExamQuestion(
                question_text=template["question"],
                option_a=template["options"]["A"],
                option_b=template["options"]["B"], 
                option_c=template["options"]["C"],
                option_d=template["options"]["D"],
                option_e=template["options"].get("E", ""),
                correct_answer=template["correct"],
                explanation=template["explanation"],
                difficulty_level=random.choice([1, 2, 3]),
                exam_section_id=exam_section_id,
                is_active=True,
                created_by="TEMPLATE_FALLBACK"
            )
            
            db.add(question)
            generated_questions.append(question)
        
        db.commit()
        return generated_questions

    def generate_questions(self, db: Session, exam_section_id: int, count: int = 10) -> List[ExamQuestion]:
        """Bölüm için AI destekli soru üret (sync wrapper için async metod)"""
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
        """Bölüm için AI destekli soru üret"""
        # Bölümü bul
        section = db.query(ExamSection).filter(ExamSection.id == exam_section_id).first()
        if not section:
            return []

        # Exam type'ı bul
        exam_type = db.query(ExamType).filter(ExamType.id == section.exam_type_id).first()
        exam_type_name = exam_type.name if exam_type else "Genel"

        try:
            # AI ile soru üret
            ai_questions = await self._generate_questions_with_ai(section.name, exam_type_name, count)
            
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
            return generated_questions
            
        except Exception as e:
            print(f"AI soru üretimi başarısız, template'lere geri dönülüyor: {e}")
            import traceback
            traceback.print_exc()
            # AI başarısız ise template'lere geri dön
            return self._generate_questions_from_templates(db, section.name, exam_section_id, count)

    async def _generate_questions_with_ai(self, section_name: str, exam_type: str, count: int) -> ExamQuestionGenerationResponse:
        """Gemini AI ile soru üret"""
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

        system_msg = (
            f"Sen bir {section_name} uzmanısın ve {education_level} seviyesinde "
            f"{exam_type} sınav soruları oluşturuyorsun. Türkiye'deki resmi sınav formatına uygun sorular hazırla."
        )

        human_msg = (
            f"{exam_type} sınavı için {section_name} alanında {count} adet soru oluştur.\n\n"
            "Soru gereksinimleri:\n"
            f"1. Türkiye'deki resmi {exam_type} sınav formatına uygun olmalı\n"
            "2. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı\n"
            "3. Akademik ve düşünmeyi gerektiren sorular olmalı\n"
            "4. Doğru cevabın açık açıklaması olmalı\n"
            "5. Zorluk seviyesi 1 (kolay), 2 (orta), 3 (zor) olmalı\n"
            "6. Türkçe dilbilgisi kurallarına uygun olmalı\n\n"
            f"{format_instructions}\n\n"
            "Sadece JSON formatında cevap ver."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_msg),
            ("human", human_msg),
        ])

        # Temperature'ı artır çeşitlilik için
        original_temp = self.temperature
        self.temperature = 0.7

        chain = prompt | self.llm | parser

        try:
            result = await chain.ainvoke({})
            self.temperature = original_temp
            print(f"🔍 AI Ham Cevap: {result}")
            return result
        except Exception as e:
            self.temperature = original_temp
            print(f"❌ AI Chain Hatası: {e}")
            import traceback
            traceback.print_exc()
            # Fallback için basit response döndür
            return ExamQuestionGenerationResponse(
                section_name=section_name,
                exam_type=exam_type,
                questions=[]
            )
    
    def create_practice_exam(self, db: Session, exam_data: PracticeExamCreate, user_id: int) -> PracticeExam:
        """Deneme sınavı oluştur"""
        # Exam section'ı bul
        exam_section = db.query(ExamSection).filter(ExamSection.id == exam_data.exam_section_id).first()
        if not exam_section:
            raise ValueError("Geçersiz sınav bölümü")
        
        # Exam type'ı bul
        exam_type = db.query(ExamType).filter(ExamType.id == exam_section.exam_type_id).first()
        if not exam_type:
            raise ValueError("Geçersiz sınav tipi")
        
        # AI soruları öncelik ver - tüm ihtiyacı AI ile karşılamaya çalış
        print(f"🔄 {exam_data.question_count} AI sorusu üretiliyor...")
        print("🤖 Yeni AI soruları üretiliyor...")
        
        # Tüm soruları AI ile üret
        questions = self.generate_questions(db, exam_data.exam_section_id, exam_data.question_count)
        
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
    
    def submit_practice_exam(self, db: Session, exam_id: int, user_id: int, answers: dict) -> Dict:
        """Deneme sınavı sonuçlarını değerlendir"""
        # Practice exam'ı bul
        practice_exam = db.query(PracticeExam).filter(
            PracticeExam.id == exam_id,
            PracticeExam.user_id == user_id
        ).first()
        
        if not practice_exam:
            raise ValueError("Deneme sınavı bulunamadı")
        
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
        
        for question in questions:
            user_answer = answers.get(str(question.id))
            is_correct = user_answer == question.correct_answer
            
            if is_correct:
                correct_count += 1
            
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
        
        # Sonuç döndür
        return {
            "exam_id": exam_id,
            "score": score_percentage,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "time_spent": 0,  # Şimdilik 0
            "percentage": score_percentage
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
                "description": s.description,
                "question_count": s.question_count,
                "duration_minutes": s.duration_minutes
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
    
    def start_practice_exam(self, db: Session, user_id: int, exam_data: PracticeExamCreate) -> Dict:
        """Deneme sınavı başlat"""
        practice_exam = self.create_practice_exam(db, exam_data, user_id)
        
        # Yeni oluşturulan practice exam için en son eklenen AI sorularını getir
        # Son eklenen soruları al (yeni üretilen sorular en son ID'lere sahip olacak)
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == exam_data.exam_section_id,  
            ExamQuestion.is_active == True,
            ExamQuestion.created_by == "AI_EXAM_AGENT"
        ).order_by(ExamQuestion.id.desc()).limit(exam_data.question_count).all()
        
        # Eğer yeterli AI sorusu yoksa, tümünü al
        if len(questions) < exam_data.question_count:
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,
                ExamQuestion.is_active == True
            ).order_by(ExamQuestion.id.desc()).limit(exam_data.question_count).all()
        
        question_data = []
        for q in questions:
            question_data.append({
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "option_e": q.option_e,
                "difficulty_level": q.difficulty_level
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

    def _get_question_templates(self, section_name: str) -> List[Dict]:
        """Bölüm için soru şablonları (AI fallback için)"""
        templates = {
            "Türkçe": [
                {
                    "question": "Aşağıdaki cümlelerin hangisinde yazım yanlışı vardır?",
                    "options": {
                        "A": "Kitabı okumaya başladı.",
                        "B": "Yarınki toplantıya katılacak.",
                        "C": "Bugünkü gazetede haberi gördüm.",
                        "D": "Geçenki konuşmayı hatırlıyor."
                    },
                    "correct": "B",
                    "explanation": "Yarınki değil 'yarınki' doğru yazımı 'yarın' + '-ki' eki ile 'yarınki' olmalıdır."
                },
                {
                    "question": "Aşağıdaki cümlelerin hangisinde noktalama hatası vardır?",
                    "options": {
                        "A": "Ali, Veli ve Ayşe geldi.",
                        "B": "Ne zaman; geleceksin?",
                        "C": "Kitap okudum, ders çalıştım.",
                        "D": "Merhaba! Nasılsın?"
                    },
                    "correct": "B",
                    "explanation": "Soru cümlesinde noktalı virgül kullanılmaz, sadece virgül kullanılır: 'Ne zaman geleceksin?'"
                },
                {
                    "question": "Hangi seçenekte eş anlamlı kelimeler verilmiştir?",
                    "options": {
                        "A": "Büyük - Küçük",
                        "B": "Güzel - Çirkin", 
                        "C": "Hızlı - Süratli",
                        "D": "Sıcak - Soğuk"
                    },
                    "correct": "C",
                    "explanation": "Hızlı ve süratli aynı anlamda kullanılan eş anlamlı kelimelerdir."
                },
                {
                    "question": "Aşağıdaki cümlelerin hangisinde mecaz anlamlı bir söz vardır?",
                    "options": {
                        "A": "Kedisi çok sevimli.",
                        "B": "Kalbi taş gibi sert.",
                        "C": "Masanın üzerinde kitap var.",
                        "D": "Bugün hava çok güzel."
                    },
                    "correct": "B",
                    "explanation": "'Kalbi taş gibi sert' ifadesi mecazi anlamda kullanılmış, duygusuz anlamında kullanılmıştır."
                },
                {
                    "question": "Hangi seçenekte ünlü düşmesi olayı görülür?",
                    "options": {
                        "A": "kitap + ı = kitabı",
                        "B": "kalem + i = kalemi",
                        "C": "masa + ya = masaya", 
                        "D": "ev + e = eve"
                    },
                    "correct": "A",
                    "explanation": "Kitap kelimesinin sonundaki 'p' harfinden önce bulunan 'a' ünlüsü, ek alırken düşer: kitabı."
                }
            ],
            "Matematik": [
                {
                    "question": "2x + 5 = 11 denkleminin çözümü nedir?",
                    "options": {
                        "A": "x = 2",
                        "B": "x = 3", 
                        "C": "x = 4",
                        "D": "x = 5"
                    },
                    "correct": "B",
                    "explanation": "2x + 5 = 11 → 2x = 6 → x = 3"
                },
                {
                    "question": "√16 + √9 işleminin sonucu kaçtır?",
                    "options": {
                        "A": "5",
                        "B": "6",
                        "C": "7", 
                        "D": "8"
                    },
                    "correct": "C",
                    "explanation": "√16 = 4, √9 = 3 olduğu için 4 + 3 = 7"
                }
            ],
            "Fen": [
                {
                    "question": "Suyun kaynama noktası kaç santigrat derecedir?",
                    "options": {
                        "A": "90°C",
                        "B": "95°C",
                        "C": "100°C",
                        "D": "105°C"
                    },
                    "correct": "C",
                    "explanation": "Su deniz seviyesinde 100°C'de kaynar."
                }
            ],
            "Sosyal": [
                {
                    "question": "Türkiye Cumhuriyeti hangi yılda kurulmuştur?",
                    "options": {
                        "A": "1920",
                        "B": "1921",
                        "C": "1922",
                        "D": "1923"
                    },
                    "correct": "D", 
                    "explanation": "Türkiye Cumhuriyeti 29 Ekim 1923'te ilan edilmiştir."
                }
            ]
        }
        
        return templates.get(section_name, [
            {
                "question": f"{section_name} alanında örnek soru",
                "options": {
                    "A": "Seçenek A",
                    "B": "Seçenek B", 
                    "C": "Seçenek C",
                    "D": "Seçenek D"
                },
                "correct": "A",
                "explanation": "Bu örnek bir açıklamadır."
            }
        ])
