from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional, Dict, Any
from app.models.exam import ExamType, ExamSection, ExamQuestion, PracticeExam, PracticeQuestionResult
from app.models.education_level import CourseTopic, Course
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
    topic_name: str = Field(description="Bu sorunun ait olduğu spesifik konu adı")

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
        """Bölüm için AI destekli soru üret - Top-off ile tam sayıyı garanti et.

        Davranış:
        - İlk AI çağrısı eksik dönerse (ör. 36/40), eksik kadar ek üretim yapılır.
        - Duplikasyon kontrolü yapılır; deduplikasyon sonrası eksik varsa tekrar üstüne üretim yapılır.
        - Maksimum güvenli deneme sayısı uygulanır.
        """
        # Bölümü bul
        section = db.query(ExamSection).filter(ExamSection.id == exam_section_id).first()
        if not section:
            raise ValueError("Geçersiz sınav bölümü")

        # Exam type'ı bul
        exam_type = db.query(ExamType).filter(ExamType.id == section.exam_type_id).first()
        exam_type_name = exam_type.name if exam_type else "Genel"

        target_count = int(count)
        print(f"🤖 {target_count} adet AI sorusu üretiliyor... (Top-off aktif, template fallback KAPALI)")

        # Biriktirilecek ham AI soruları (DB'ye yazmadan önce)
        accumulated = []
        seen_texts = set()

        max_attempts = 6  # ilk deneme + en fazla 5 top-off
        attempt = 0

        while len(accumulated) < target_count and attempt < max_attempts:
            remaining = target_count - len(accumulated)
            request_count = remaining

            # İlk denemede model bazen eksik döndüğü için, eksik kadar istemek mantıklı.
            # İkinci/sonraki denemelerde de sadece kalan kadar iste.
            print(f"🔄 AI çağrısı (deneme {attempt + 1}/{max_attempts}) - istenen: {request_count}")
            ai_resp = await self._generate_questions_with_ai(section.name, exam_type_name, request_count)

            if not ai_resp or not getattr(ai_resp, "questions", None):
                print("⚠️  AI boş döndü, bir sonraki denemeye geçiliyor")
                attempt += 1
                continue

            # Gelenleri dedup ederek biriktir
            added_this_round = 0
            for ai_q in ai_resp.questions:
                q_text = ai_q.question.strip() if hasattr(ai_q, "question") and ai_q.question else ""
                if not q_text or q_text in seen_texts:
                    continue
                accumulated.append(ai_q)
                seen_texts.add(q_text)
                added_this_round += 1
                if len(accumulated) == target_count:
                    break

            print(f"✅ Bu tur eklenen (unique) soru: {added_this_round} | Toplam: {len(accumulated)}/{target_count}")
            attempt += 1

        if len(accumulated) < target_count:
            raise ValueError(f"AI soru üretimi hedefe ulaşılamadı: {len(accumulated)}/{target_count}")

        # Toplamı tam hedefe kırp (güvenlik için; teorik olarak zaten eşit)
        accumulated = accumulated[:target_count]

        # DB'ye persist et
        generated_questions: List[ExamQuestion] = []
        for ai_q in accumulated:
            # Topic ID'yi bulmaya çalış
            topic_id = None
            if hasattr(ai_q, 'topic_name') and ai_q.topic_name:
                topic_id = self._find_topic_id(db, ai_q.topic_name, exam_section_id)
            
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
                topic_id=topic_id,  # Topic ID'yi ekle
                is_active=True,
                created_by="AI_EXAM_AGENT"
            )
            db.add(question)
            generated_questions.append(question)

        db.commit()
        print(f"🎯 Nihai üretilen soru sayısı: {len(generated_questions)} (hedef: {target_count})")
        return generated_questions

    async def _generate_questions_with_ai(self, section_name: str, exam_type: str, count: int) -> ExamQuestionGenerationResponse:
        """Gemini AI ile soru üret - 2 parça halinde güvenli üretim ile farklı sorular garantili"""
        
        # 6'dan fazla soru için 2 parçaya böl (JSON parsing hatalarını azaltmak için)
        if count > 6:
            part1_count = count // 2
            part2_count = count - part1_count
            
            print(f"🔄 Güvenli üretim: {count} soru 2 parçaya bölünüyor: {part1_count} + {part2_count}")
            
            # İlk parça - temel ve orta zorluk odaklı
            part1 = await self._generate_question_batch_internal(
                section_name, exam_type, part1_count, 
                batch_type="first_half", 
                avoid_keywords=set()
            )
            
            # İkinci parça için kullanılan anahtar kelimeleri topla
            used_keywords = set()
            for q in part1.questions:
                # Soru metninden anahtar kelimeler çıkar
                words = q.question.lower().split()
                used_keywords.update([w for w in words if len(w) > 4])
            
            # İkinci parça - orta ve ileri zorluk odaklı, farklı kelimelerle
            part2 = await self._generate_question_batch_internal(
                section_name, exam_type, part2_count, 
                batch_type="second_half",
                avoid_keywords=used_keywords
            )
            
            # Birleştir ve duplikasyon kontrolü
            all_questions = part1.questions[:]
            seen_questions = {q.question.strip().lower() for q in part1.questions}
            
            for q in part2.questions:
                q_text = q.question.strip().lower()
                if q_text not in seen_questions:
                    all_questions.append(q)
                    seen_questions.add(q_text)
                else:
                    print(f"⚠️ Duplikasyon önlendi: {q.question[:50]}...")
            
            print(f"✅ Toplamda {len(all_questions)} benzersiz soru üretildi")
            
            return ExamQuestionGenerationResponse(
                section_name=section_name,
                exam_type=exam_type,
                questions=all_questions
            )
        else:
            # Küçük setler tek seferde
            return await self._generate_question_batch_internal(section_name, exam_type, count, "single", set())
    
    async def _generate_question_batch_internal(self, section_name: str, exam_type: str, count: int, batch_type: str, avoid_keywords: set) -> ExamQuestionGenerationResponse:
        """İç batch üretim fonksiyonu - Konu bazlı detaylı prompt sistemi + sağlamlaştırılmış parsing/onarım"""
        parser = PydanticOutputParser(pydantic_object=ExamQuestionGenerationResponse)
        format_instructions = parser.get_format_instructions()

        # JSON şemasındaki { } karakterlerini escape et
        format_instructions = format_instructions.replace("{", "{{").replace("}", "}}")

        # Ek ve katı format gereksinimleri (parser öncesi model çıktısını daha stabil hale getirmek için)
        strict_format_requirements = (
            "ÇIKIŞ FORMAT KURALLARI (ÇOK ÖNEMLİ):\\n"
            "• Sadece geçerli JSON üret (başta/sonda/metin aralarında yorum yok)\\n"
            "• Kök alanlar: section_name (string), exam_type (string), questions (array)\\n"
            "• questions dizisindeki her öğe zorunlu alanlara sahip olmalı:\\n"
            "   - question (string, boş olamaz)\\n"
            "   - options (tam 4 eleman). Her option nesnesi: {{ letter: 'A'|'B'|'C'|'D', text: string }}\\n"
            "   - correct_answer (yalnızca 'A'|'B'|'C'|'D')\\n"
            "   - explanation (string)\\n"
            "   - difficulty (integer; 1, 2 veya 3)\\n"
            "   - topic_name (string, sorunun hangi konuyla ilgili olduğunu belirtir)\\n"
            "• options dizisi DAİMA 4 öğe içermeli ve letter sırası [A,B,C,D] olmalı\\n"
            "• topic_name alanı zorunludur ve boş bırakılamaz\\n"
            "• Boş obje ({{}}) veya eksik alan bırakmayın. Tüm alanları doldurun\\n"
            "• JSON dışında hiçbir şey yazma; kod bloğu, markdown, metin ekleme.\\n"
        )

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
        
        # Batch type'a göre özel instructions
        batch_instructions = self._get_batch_instructions(batch_type, count, avoid_keywords)

        system_msg = (
            f"Sen bir {section_name} uzmanısın ve {education_level} seviyesinde "
            f"{exam_type} sınav soruları oluşturuyorsun. Türkiye'deki resmi sınav formatına uygun sorular hazırla.\n\n"
            f"KONU DAĞILIMI VE GEREKSİNİMLER:\n{detailed_requirements}\n\n"
            f"{strict_format_requirements}"
        )

        human_msg = (
            f"{exam_type} sınavı için {section_name} alanında {count} adet soru oluştur.\n\n"
            f"{batch_instructions}\n\n"
            "Soru gereksinimleri:\n"
            f"1. Türkiye'deki resmi {exam_type} sınav formatına uygun olmalı\n"
            "2. Tam olarak 4 çoktan seçmeli seçenek (A, B, C, D) olmalı\n"
            "3. Yukarıda belirtilen konu dağılımına uygun olmalı\n"
            "4. Her konudan belirtilen sayıda soru olmalı\n"
            "5. Akademik ve düşünmeyi gerektiren sorular olmalı\n"
            "6. Doğru cevabın açık açıklaması olmalı\n"
            "7. Zorluk seviyesi 1 (kolay), 2 (orta), 3 (zor) olmalı\n"
            "8. Türkçe dilbilgisi kurallarına uygun olmalı\n"
            "9. Gerçek sınav seviyesinde olmalı\n"
            "10. Her soru için topic_name alanında hangi konuyla ilgili olduğunu belirt\n\n"
            "FORMAT HATIRLATICI:\\n"
            "- Sadece JSON döndür\\n"
            "- options tam 4 madde olmalı ve letter alanları 'A','B','C','D' olmalı\\n"
            "- correct_answer sadece 'A'|'B'|'C'|'D' olabilir\\n"
            "- topic_name alanı zorunludur ve sorunun hangi konuyla ilgili olduğunu belirtmeli\\n"
            "- Boş obje veya eksik alan bırakma\\n\\n"
            f"{format_instructions}\\n\\n"
            "ÖNEMLI: Sadece JSON formatında cevap ver. Yorum ya da ek açıklama ekleme."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_msg),
            ("human", human_msg),
        ])

        # Temperature'ı artır çeşitlilik için
        original_temp = self.temperature
        self.temperature = 0.0

        # Yardımcı: LLM metninden JSON'ı çıkar
        def _extract_json(text: str) -> str:
            t = (text or "").strip()
            if not t:
                return t
            # Kod bloklarını temizle
            if t.startswith("```"):
                # ilk '{' ile son '}' aralığını al
                i = t.find("{")
                j = t.rfind("}")
                if i != -1 and j != -1 and j > i:
                    return t[i:j+1]
            # Genel durum: ilk '{' ile son '}' arası
            i = t.find("{")
            j = t.rfind("}")
            if i != -1 and j != -1 and j > i:
                return t[i:j+1]
            return t

        # Yardımcı: JSON'u normalize et ve eksik alanları doldur
        def _normalize_payload(payload: Dict) -> Dict:
            payload = dict(payload or {})
            payload.setdefault("section_name", section_name)
            payload.setdefault("exam_type", exam_type)

            questions = payload.get("questions")
            if not isinstance(questions, list):
                payload["questions"] = []
                return payload

            fixed = []
            for q in questions:
                if not isinstance(q, dict):
                    continue
                qq = dict(q)

                # question metni zorunlu
                qtext = str(qq.get("question", "")).strip()
                if not qtext:
                    continue

                # options: tam 4 adet, letters A-D
                letters = ["A", "B", "C", "D"]
                norm_opts = []
                raw_opts = qq.get("options", [])
                if not isinstance(raw_opts, list):
                    raw_opts = []
                for i, opt in enumerate(raw_opts[:4]):
                    if isinstance(opt, dict):
                        letter = str(opt.get("letter") or "").strip().upper()
                        text = str(opt.get("text") or "").strip()
                        letter = letter if letter in letters else letters[i] if i < 4 else "A"
                        norm_opts.append({"letter": letter, "text": text})
                    else:
                        norm_opts.append({"letter": letters[i], "text": str(opt)})
                # doldur, eksikse boş metinle tamamla
                for i in range(len(norm_opts), 4):
                    norm_opts.append({"letter": letters[i], "text": ""})
                # en az 2 dolu metin kontrolü, aksi halde atla
                if sum(1 for o in norm_opts if o["text"]) < 2:
                    continue
                qq["options"] = norm_opts[:4]

                # correct_answer doğrula
                valid_letters = {o["letter"] for o in qq["options"]}
                ca = str(qq.get("correct_answer", "")).strip().upper()
                if ca not in valid_letters:
                    ca = next(iter(valid_letters)) if valid_letters else "A"
                qq["correct_answer"] = ca

                # explanation zorunlu: yoksa kısa bir açıklama koy
                expl = qq.get("explanation")
                if not isinstance(expl, str) or not expl.strip():
                    qq["explanation"] = "Doğru cevap çözüm akışıyla doğrulanır."
                else:
                    qq["explanation"] = expl.strip()

                # difficulty zorunlu ve 1-3
                diff = qq.get("difficulty")
                try:
                    diff_int = int(diff)
                except Exception:
                    diff_int = 2
                if diff_int not in (1, 2, 3):
                    diff_int = 2
                qq["difficulty"] = diff_int

                # topic_name zorunlu
                topic_name = qq.get("topic_name")
                if not isinstance(topic_name, str) or not topic_name.strip():
                    qq["topic_name"] = "Genel"  # Varsayılan topic
                else:
                    qq["topic_name"] = topic_name.strip()

                fixed.append(qq)

            payload["questions"] = fixed
            return payload

        chain = prompt | self.llm

        import json as _json

        # JSON sanitize: BOM/null, code-fence artıkları ve yaygın trailing virgüllerini temizle
        def _sanitize_json(s: str) -> str:
            s2 = (s or "").replace("\ufeff", "").replace("\x00", "")
            s2 = s2.replace("END_OF_JSON", "").strip()
            # Yaygın trailing comma hatalarını basitçe düzelt
            s2 = s2.replace(",]", "]").replace(",}", "}")
            return s2

        # 3 deneme hakkı ver
        max_retries = 3
        last_error = None
        for attempt in range(max_retries):
            try:
                print(f"🔄 AI soru üretimi denemesi {attempt + 1}/{max_retries}")
                raw_text_msg = await chain.ainvoke({})  # ham metin veya mesaj
                # Her denemede sıcaklığı eski haline getir
                self.temperature = original_temp

                raw_text = raw_text_msg.content if hasattr(raw_text_msg, "content") else str(raw_text_msg)
                raw_json_str = _extract_json(str(raw_text))
                sanitized = _sanitize_json(raw_json_str)

                data = _json.loads(sanitized)

                # Onarım ve normalizasyon
                safe = _normalize_payload(data)

                # Pydantic'e geçir
                result = ExamQuestionGenerationResponse(**safe)

                # Ek geçerlilik kontrolü
                def _is_valid_output(res: ExamQuestionGenerationResponse) -> tuple[bool, str]:
                    if not res.questions or len(res.questions) == 0:
                        return False, "boş soru listesi"
                    for idx, q in enumerate(res.questions):
                        if not getattr(q, "question", "").strip():
                            return False, f"soru {idx} question boş"
                        opts = getattr(q, "options", None)
                        if not opts or len(opts) != 4:
                            return False, f"soru {idx} options!=4"
                        letters = [getattr(o, "letter", "") for o in opts]
                        texts = [getattr(o, "text", "").strip() for o in opts]
                        if letters != ["A", "B", "C", "D"]:
                            return False, f"soru {idx} letters!=A,B,C,D"
                        if any(t == "" for t in texts):
                            return False, f"soru {idx} boş option metni"
                        ca = getattr(q, "correct_answer", "").strip().upper()
                        if ca not in ("A", "B", "C", "D"):
                            return False, f"soru {idx} correct_answer geçersiz"
                        diff = getattr(q, "difficulty", None)
                        if diff not in (1, 2, 3):
                            return False, f"soru {idx} difficulty geçersiz"
                        if not getattr(q, "explanation", "").strip():
                            return False, f"soru {idx} explanation boş"
                    return True, ""

                ok, reason = _is_valid_output(result)
                if ok:
                    print(f"✅ AI başarıyla {len(result.questions)} geçerli soru üretti!")
                    return result
                else:
                    last_error = f"Geçersiz çıktı: {reason}"
                    print(f"⚠️  {last_error} (deneme {attempt + 1})")

            except Exception as e:
                last_error = f"{type(e).__name__}: {e}"
                print(f"❌ AI deneme {attempt + 1} başarısız: {last_error}")
                # Sonraki denemeye geç

        # Son durumda temperature'ı garanti geri al
        self.temperature = original_temp
        raise ValueError(f"AI soru üretimi {max_retries} denemede başarısız oldu: {last_error or 'bilinmeyen hata'}")

    def get_topic_distribution(self, exam_type: str, section_name: str, total_count: int) -> Dict:
        """Belirtilen bölüm için konu dağılımını al ve toplamı tam olarak total_count yap.

        Yöntem:
        - Oranları hesapla (float).
        - Aşağı doğru taban (floor) ile ilk atama yap.
        - Kalan (remainder) kadar en büyük küsuratlılara +1 dağıt (largest remainder).
        """
        distribution_data = self.get_subject_question_distribution_data()
        if exam_type in distribution_data and section_name in distribution_data[exam_type]:
            distribution = distribution_data[exam_type][section_name]

            original_total = max(1, int(distribution.get("total_questions", total_count)))
            ratio = float(total_count) / float(original_total)

            # İlk geçiş: taban atama ve küsuratları tut
            tmp = []
            floor_sum = 0
            for topic_name, topic_info in distribution["topics"].items():
                raw = (topic_info["question_count"] * ratio)
                base = int(raw)  # floor
                frac = raw - base
                # En az 0 olsun; +1 dağıtımı sonra yapacağız
                tmp.append((topic_name, base, frac, topic_info["subtopics"]))
                floor_sum += base

            # Kalanı hesapla
            remainder = total_count - floor_sum
            # En büyük küsuratlıları seç
            tmp.sort(key=lambda x: x[2], reverse=True)

            adjusted_topics = {}
            for idx, (topic_name, base, _frac, subtopics) in enumerate(tmp):
                add = 1 if idx < remainder else 0
                adjusted_topics[topic_name] = {
                    "question_count": base + add,
                    "subtopics": subtopics
                }

            return {"topics": adjusted_topics, "total_questions": total_count}

        # Varsayılan dağılım (tek grup)
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
        """Deneme sınavı oluştur - Kullanıcı başına tek sınav kaydı yaklaşımı"""
        print(f"🏗️  Create Practice Exam Debug:")
        print(f"   - User ID: {user_id}")
        print(f"   - Exam Section ID: {exam_data.exam_section_id}")
        print(f"   - Use Existing: {use_existing}")
        print(f"   - Force New: {force_new}")
        
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
        
        # Eğer force_new değilse, bu kullanıcının bu bölümde mevcut bir sınavı var mı kontrol et
        if not force_new:
            existing_user_exam = db.query(PracticeExam).filter(
                PracticeExam.exam_section_id == exam_data.exam_section_id,
                PracticeExam.user_id == user_id,
                PracticeExam.status.in_(["not_started", "in_progress"])  # Sadece tamamlanmamış sınavlar
            ).first()
            
            if existing_user_exam:
                print(f"♻️  Kullanıcının mevcut sınavı bulundu: {existing_user_exam.name} (ID: {existing_user_exam.id})")
                return existing_user_exam
        
        # Force_new ise veya havuzda yeterli soru yoksa yeni AI soruları üret
        available_count = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == exam_data.exam_section_id,
            ExamQuestion.is_active == True
        ).count()
        
        if force_new:
            # Yeni sınav üretimi zorlandıysa her zaman AI ile yeni sorular üret
            print("✨ Yeni sınav üretimi istendi, AI ile fresh sorular üretiliyor...")
            questions = self.generate_questions(db, exam_data.exam_section_id, question_count)
        elif available_count >= question_count:
            # Havuz yeterli ise AI üretimine gerek yok; sadece exam kaydı oluştur
            print(f"📚 Mevcut soru havuzu yeterli ({available_count} >= {question_count}), yeni exam kaydı oluşturuluyor.")
            practice_exam = PracticeExam(
                name=f"{exam_type.name} {exam_section.name} Denemesi",
                exam_type_id=exam_section.exam_type_id,
                exam_section_id=exam_data.exam_section_id,
                user_id=user_id,
                total_questions=question_count,
                duration_minutes=exam_type.duration_minutes or 60,
                status="not_started",
                start_time=datetime.utcnow()
            )
            db.add(practice_exam)
            db.commit()
            db.refresh(practice_exam)
            return practice_exam
        else:
            # Havuz yetersizse yeni AI soruları üret
            print("🤖 Mevcut soru havuzu yetersiz, yeni AI soruları üretiliyor...")
            questions = self.generate_questions(db, exam_data.exam_section_id, question_count)
        
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
        """Belirtilen bölümden rastgele mevcut bir exam döndür.
        
        GÜNCELLEME: Artık klonlama yapmıyoruz, sadece None döndürüp yeni exam oluşturulmasını sağlıyoruz.
        Bu sayede havuzda aynı sınavların çoğalması önlenir.
        """
        # Artık klonlama yapmıyoruz, direkt None döndür ki yeni exam oluşturulsun
        return None
    
    def submit_practice_exam(self, db: Session, exam_id: int, user_id: int, answers: dict) -> Dict:
        """Deneme sınavı sonuçlarını değerlendir - boş/yanlış ayrımı doğru hesaplanır"""
        print(f"🔍 Submit Practice Exam Debug:")
        print(f"   - Exam ID: {exam_id}")
        print(f"   - User ID: {user_id}")
        print(f"   - Answers received: {answers}")
        
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
        total_questions = len(questions)
        correct_count = 0
        answered_count = 0
        wrong_topics = []
        
        for question in questions:
            # user_answer yoksa boş kabul edilir
            user_answer = answers.get(str(question.id))
            print(f"   Question {question.id}: correct={question.correct_answer}, user={user_answer}")
            
            if user_answer is not None and str(user_answer).strip() != "":
                answered_count += 1
                is_correct = (str(user_answer).strip().upper() == str(question.correct_answer).strip().upper())
                print(f"      -> Answered: {user_answer}, Correct: {is_correct}")
            else:
                is_correct = False  # boş soruların is_correct False tutulur
                print(f"      -> Empty answer")

            if is_correct:
                correct_count += 1
            else:
                # Yanlış cevap veya boş cevap için topic bilgisini topla
                if question.topic_id:
                    try:
                        topic = db.query(CourseTopic).filter(CourseTopic.id == question.topic_id).first()
                        if topic:
                            wrong_topics.append(topic.name)
                            print(f"      -> Wrong topic added: {topic.name}")
                    except Exception as e:
                        print(f"      -> Topic query error: {e}")
                        
            # Her soru için sonuç kaydet
            question_result = PracticeQuestionResult(
                practice_exam_id=exam_id,
                question_id=question.id,
                user_answer=(str(user_answer).strip().upper() if user_answer is not None and str(user_answer).strip() != "" else None),
                is_correct=is_correct,
                time_spent_seconds=0  # Şimdilik 0, gelecekte timer eklenebilir
            )
            db.add(question_result)
        
        empty_count = max(0, total_questions - answered_count)
        wrong_count = max(0, answered_count - correct_count)
        
        print(f"🔍 Final Results:")
        print(f"   - Total Questions: {total_questions}")
        print(f"   - Answered: {answered_count}")
        print(f"   - Correct: {correct_count}")
        print(f"   - Wrong: {wrong_count}")
        print(f"   - Empty: {empty_count}")
        print(f"   - Questions examined: {[q.id for q in questions]}")
        print(f"   - Answers keys: {list(answers.keys())}")
        
        # Practice exam'ı güncelle
        score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
        print(f"   - Score: {score_percentage}%")
        practice_exam.correct_answers = correct_count
        practice_exam.wrong_answers = wrong_count
        practice_exam.empty_answers = empty_count
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
                    "wrong_topics": list(set(wrong_topics)),
                    "accuracy": score_percentage,
                    "timestamp": practice_exam.end_time.isoformat() if practice_exam.end_time else datetime.utcnow().isoformat()
                }
            ))
        except Exception as e:
            print(f"⚠️ Memory kaydı sırasında hata: {e}")
            # Memory hatası sınav sonucunu etkilemesin
        
        # 🔍 Analiz agentını çağır - yanlış cevaplar için topic analizi
        try:
            analysis_result = asyncio.create_task(self._trigger_analysis_agent(
                user_id=user_id,
                exam_data={
                    "exam_id": exam_id,
                    "exam_type": exam_type.name if exam_type else "Bilinmiyor",
                    "exam_section": exam_section.name if exam_section else "Bilinmiyor",
                    "score": score_percentage,
                    "correct_answers": correct_count,
                    "total_questions": total_questions,
                    "wrong_answers": wrong_count,
                    "empty_answers": empty_count,
                    "wrong_topics": list(set(wrong_topics)),
                    "detailed_answers": self._collect_detailed_answers(questions, answers),
                    "questions_with_topics": self._get_questions_with_topics(db, questions)
                },
                subject=exam_section.name if exam_section else "Genel",
                topic=exam_type.name if exam_type else "Deneme Sınavı"
            ))
            print(f"✅ Analiz agenti tetiklendi")
        except Exception as e:
            print(f"⚠️ Analiz agenti tetikleme hatası: {e}")
            # Analiz hatası sınav sonucunu etkilemesin
 
        # Sonuç döndür
        return {
            "exam_id": exam_id,
            "score": score_percentage,
            "correct_answers": correct_count,
            "total_questions": total_questions,
            "time_spent": 0,  # Şimdilik 0
            "percentage": score_percentage,
            "wrong_answers": wrong_count,
            "empty_answers": empty_count,
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
        print(f"🚀 Start Practice Exam Debug:")
        print(f"   - User ID: {user_id}")
        print(f"   - Exam Section ID: {exam_data.exam_section_id}")
        print(f"   - Use Existing: {use_existing}")
        print(f"   - Force New: {force_new}")
        
        practice_exam = self.create_practice_exam(db, exam_data, user_id, use_existing, force_new)
        
        # Sabit soru sayısını belirle
        exam_section = db.query(ExamSection).filter(ExamSection.id == exam_data.exam_section_id).first()
        exam_type = db.query(ExamType).filter(ExamType.id == exam_section.exam_type_id).first()
        question_count = self.get_fixed_question_count(exam_type.name, exam_section.name, db)
        
        # Soruları getir
        if force_new:
            # Force_new ise en son üretilen AI sorularını kullan (en yeni olan)
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,  
                ExamQuestion.is_active == True,
                ExamQuestion.created_by == "AI_EXAM_AGENT"
            ).order_by(ExamQuestion.id.desc()).limit(question_count).all()
            print(f"✨ Force_new: En son üretilen {len(questions)} AI sorusu kullanılıyor")
        elif not use_existing:
            # Yeni oluşturulan exam için en son eklenen AI sorularını getir
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,  
                ExamQuestion.is_active == True,
                ExamQuestion.created_by == "AI_EXAM_AGENT"
            ).order_by(ExamQuestion.id.asc()).limit(question_count).all()
        else:
            # Mevcut examlardan geliyorsa, rastgele sorular al (status bağımsız, soru havuzundan)
            questions = db.query(ExamQuestion).filter(
                ExamQuestion.exam_section_id == exam_data.exam_section_id,
                ExamQuestion.is_active == True
            ).order_by(text("RANDOM()")).limit(question_count).all()
        
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
        """Sınav sonuçlarını getir - kesin wrong/empty hesaplanmış alanlarla"""
        practice_exam = db.query(PracticeExam).filter(
            PracticeExam.id == exam_id,
            PracticeExam.user_id == user_id
        ).first()
        
        if not practice_exam:
            raise ValueError("Sınav sonucu bulunamadı")
        
        # Exam section ve type bilgilerini al
        exam_section = db.query(ExamSection).filter(
            ExamSection.id == practice_exam.exam_section_id
        ).first()
        
        exam_type = None
        if exam_section:
            exam_type = db.query(ExamType).filter(
                ExamType.id == exam_section.exam_type_id
            ).first()
        
        # Soru sonuçlarını al
        question_results = db.query(PracticeQuestionResult).filter(
            PracticeQuestionResult.practice_exam_id == exam_id
        ).all()
        
        # Soruları al zorluk seviyesi için
        questions = db.query(ExamQuestion).filter(
            ExamQuestion.exam_section_id == practice_exam.exam_section_id,
            ExamQuestion.is_active == True
        ).limit(practice_exam.total_questions).all()
        
        # Question ID'den zorluk seviyesine mapping
        question_difficulty_map = {q.id: q.difficulty_level for q in questions}
        
        # Zorluk seviyesi performansını hesapla
        difficulty_performance = {1: {"total": 0, "correct": 0}, 2: {"total": 0, "correct": 0}, 3: {"total": 0, "correct": 0}}
        
        total_questions = practice_exam.total_questions or len(question_results) or 0
        # Kesin sayımlar
        answered = 0
        correct_val = 0
        wrong_val = 0
        for r in question_results:
            # Zorluk seviyesi performance'ı için
            question_difficulty = question_difficulty_map.get(r.question_id, 2)  # Default orta zorluk
            difficulty_performance[question_difficulty]["total"] += 1
            
            # user_answer null/None/'' ise cevaplanmamış
            if r.user_answer is not None and str(r.user_answer).strip() != "":
                answered += 1
                if r.is_correct is True:
                    correct_val += 1
                    difficulty_performance[question_difficulty]["correct"] += 1
                else:
                    wrong_val += 1
        empty_val = max(0, total_questions - answered)
        
        # Zorluk seviyesi yüzdelerini hesapla
        difficulty_percentages = {}
        difficulty_labels = {1: "easy", 2: "medium", 3: "hard"}
        for level, stats in difficulty_performance.items():
            if stats["total"] > 0:
                percentage = (stats["correct"] / stats["total"]) * 100
                difficulty_percentages[difficulty_labels[level]] = round(percentage, 1)
        
        score_val = float(practice_exam.score or 0)
        
        # time_spent: saniye
        if practice_exam.start_time and practice_exam.end_time:
            time_spent_seconds = int((practice_exam.end_time - practice_exam.start_time).total_seconds())
        else:
            time_spent_seconds = 0
        
        percentage_val = float(score_val)  # score 0-100
        
        # Not: FastAPI response model PracticeExamResult yalnızca
        # exam_id, score, correct_answers, total_questions, time_spent, percentage alanlarını bekliyor.
        # İsteminiz doğrultusunda wrong/empty da döndürelim; model katıysa exam.py şemasını da genişletmek gerekir.
        result = {
            "exam_id": exam_id,
            "score": score_val,
            "correct_answers": int(correct_val),
            "total_questions": int(total_questions),
            "time_spent": time_spent_seconds,
            "percentage": percentage_val,
        }
        # Ek alanları da ekle (frontend kullanacak)
        result.update({
            "wrong_answers": int(wrong_val),
            "empty_answers": int(empty_val),
            "exam_type": exam_type.name if exam_type else "Bilinmiyor",
            "exam_section": exam_section.name if exam_section else "Bilinmiyor",
            "difficulty_performance": difficulty_percentages
        })
        
        print(f"🔍 Get Exam Results - Returning: {result}")
        return result
    
    def get_user_exams(self, db: Session, user_id: int) -> List[Dict]:
        """Kullanıcının sınavlarını listele"""
        exams = db.query(PracticeExam).filter(
            PracticeExam.user_id == user_id
        ).order_by(PracticeExam.created_at.desc()).all()
        
        result = []
        for exam in exams:
            # Exam type ve section bilgilerini al
            exam_type = db.query(ExamType).filter(ExamType.id == exam.exam_type_id).first()
            exam_section = db.query(ExamSection).filter(ExamSection.id == exam.exam_section_id).first()
            
            exam_data = {
                "id": exam.id,
                "name": exam.name,
                "exam_type_id": exam.exam_type_id,
                "exam_section_id": exam.exam_section_id,
                "user_id": exam.user_id,
                "status": exam.status,
                "start_time": exam.start_time.isoformat() if exam.start_time else None,
                "end_time": exam.end_time.isoformat() if exam.end_time else None,
                "duration_minutes": exam.duration_minutes,
                "total_questions": exam.total_questions,
                "correct_answers": exam.correct_answers or 0,
                "wrong_answers": exam.wrong_answers or 0,
                "empty_answers": exam.empty_answers or 0,
                "score": exam.score or 0,
                "created_at": exam.created_at.isoformat(),
                "exam_type_name": exam_type.name if exam_type else "Bilinmeyen",
                "exam_section_name": exam_section.name if exam_section else "Bilinmeyen"
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
    
    def delete_practice_exam(self, db: Session, exam_id: int, user_id: int = None, admin_delete: bool = False) -> bool:
        """Deneme sınavını sil"""
        query = db.query(PracticeExam).filter(PracticeExam.id == exam_id)
        
        # Admin silme işleminde user_id kontrolü yapma
        if user_id and not admin_delete:
            query = query.filter(PracticeExam.user_id == user_id)
        
        exam = query.first()
        if not exam:
            if admin_delete:
                raise ValueError("Sınav bulunamadı")
            else:
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
            ExamQuestion.id.asc()
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
            ExamQuestion.id.asc()
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
    
    def _get_batch_instructions(self, batch_type: str, count: int, avoid_keywords: set) -> str:
        """Batch tipine göre farklı soru üretim talimatları"""
        
        avoid_instruction = ""
        if avoid_keywords:
            # Anahtar kelimeler listesini string haline getir
            keywords_str = ", ".join(list(avoid_keywords)[:10])  # İlk 10 kelime
            avoid_instruction = f"\n⚠️ ÖNEMLI: Bu kelimelerle AYNI soruları üretme: {keywords_str}\n"
        
        if batch_type == "first_half":
            return (
                f"🎯 BU İLK PARÇA: {count} soru - TEMEL VE ORTA SEVİYE odaklı\n"
                "ZORLUK DAĞILIMI: Çoğunlukla zorluk 1-2, az sayıda zorluk 3\n"
                "SORU TİPLERİ: Temel kavram soruları, standart formül uygulamaları, basit hesaplamalar\n"
                "YAKLAŞIM: Tanım soruları, doğrudan hesap, temel analiz, kolay örnekler\n"
                "ANAHTAR KELİMELER: basit, temel, direkt, kolay, standart, normal"
                f"{avoid_instruction}"
            )
        elif batch_type == "second_half":
            return (
                f"🎯 BU İKİNCİ PARÇA: {count} soru - ORTA VE İLERİ SEVİYE odaklı\n"
                "ZORLUK DAĞILIMI: Çoğunlukla zorluk 2-3, az sayıda zorluk 1\n"  
                "SORU TİPLERİ: Karmaşık analiz, çok aşamalı çözüm, eleştirel düşünme\n"
                "YAKLAŞIM: Sentez soruları, problem çözme, derinlemesine analiz, karşılaştırma\n"
                "ANAHTAR KELİMELER: karmaşık, detaylı, analiz, sentez, ileri, zorlu"
                f"{avoid_instruction}"
            )
        else:  # single
            return (
                f"🎯 TEK PARÇA ÜRETIM: {count} soru - DENGELİ DAĞILIM\n"
                "ZORLUK DAĞILIMI: Eşit oranda zorluk 1, 2, 3\n"
                "SORU TİPLERİ: Çeşitli zorluk seviyelerinde kapsamlı soru seti\n"
                "YAKLAŞIM: Temel'den ileri seviyeye dengeli dağılım"
                f"{avoid_instruction}"
            )
    
    def _find_topic_id(self, db: Session, topic_name: str, exam_section_id: int) -> Optional[int]:
        """Topic adından topic_id bulmaya çalış"""
        try:
            # Önce exam section'dan course'u bul
            exam_section = db.query(ExamSection).filter(ExamSection.id == exam_section_id).first()
            if not exam_section:
                return None
            
            # Course'dan topic'leri ara
            course_id = exam_section.course_id if hasattr(exam_section, 'course_id') else None
            if not course_id:
                return None
            
            # Tam eşleşme ara
            topic = db.query(CourseTopic).filter(
                CourseTopic.course_id == course_id,
                CourseTopic.name.ilike(f"%{topic_name}%")
            ).first()
            
            if topic:
                return topic.id
                
            # Eğer bulunamazsa, genel topic olarak kaydet
            # Yeni topic oluştur
            new_topic = CourseTopic(
                name=topic_name,
                course_id=course_id,
                description=f"AI tarafından üretilen topic: {topic_name}",
                difficulty_level=2,
                is_active=1
            )
            db.add(new_topic)
            db.flush()  # ID'yi al ama henüz commit etme
            return new_topic.id
            
        except Exception as e:
            print(f"⚠️ Topic ID bulunamadı: {topic_name} - {e}")
            return None
    
    async def _trigger_analysis_agent(self, user_id: int, exam_data: Dict, subject: str, topic: str) -> Dict:
        """Analiz agentını tetikle"""
        try:
            from app.agents.analysis_agent import AnalysisAgent
            
            analysis_agent = AnalysisAgent()
            
            input_data = {
                "user_id": str(user_id),
                "subject": subject,
                "topic": topic,
                "education_level": "lise",  # Varsayılan
                "performance_data": {
                    "totalQuestions": exam_data.get("total_questions", 0),
                    "correctAnswers": exam_data.get("correct_answers", 0),
                    "wrongAnswers": exam_data.get("wrong_answers", 0),
                    "emptyAnswers": exam_data.get("empty_answers", 0),
                    "accuracy": exam_data.get("score", 0),
                    "wrongTopics": exam_data.get("wrong_topics", []),
                    "detailedAnswers": exam_data.get("detailed_answers", ""),
                    "questionsWithTopics": exam_data.get("questions_with_topics", [])
                }
            }
            
            result = await analysis_agent.process(input_data)
            print(f"🎯 Analiz agenti sonucu: {result.get('status', 'unknown')}")
            return result
            
        except Exception as e:
            print(f"⚠️ Analiz agenti çağırma hatası: {e}")
            return {"status": "error", "error": str(e)}
    
    def _collect_detailed_answers(self, questions: List, answers: Dict) -> str:
        """Detaylı cevap analizi için metin oluştur"""
        try:
            details = []
            for question in questions:
                user_answer = answers.get(str(question.id))
                is_correct = (
                    user_answer is not None and 
                    str(user_answer).strip().upper() == str(question.correct_answer).strip().upper()
                ) if user_answer else False
                
                status = "Doğru" if is_correct else ("Yanlış" if user_answer else "Boş")
                
                details.append(
                    f"Soru {question.id}: {status} "
                    f"(Kullanıcı: {user_answer or 'Boş'}, Doğru: {question.correct_answer})"
                )
            
            return "\n".join(details)
        except Exception as e:
            return f"Detaylı cevap analizi hatası: {e}"
    
    def _get_questions_with_topics(self, db: Session, questions: List) -> List[Dict]:
        """Soruları topic bilgileriyle birlikte döndür"""
        try:
            result = []
            for question in questions:
                topic_name = "Bilinmiyor"
                if question.topic_id:
                    topic = db.query(CourseTopic).filter(CourseTopic.id == question.topic_id).first()
                    if topic:
                        topic_name = topic.name
                
                result.append({
                    "question_id": question.id,
                    "topic_name": topic_name,
                    "topic_id": question.topic_id,
                    "difficulty": question.difficulty_level,
                    "question_text": question.question_text[:100] + "..." if len(question.question_text) > 100 else question.question_text
                })
            
            return result
        except Exception as e:
            print(f"⚠️ Topic bilgisi toplama hatası: {e}")
            return []
