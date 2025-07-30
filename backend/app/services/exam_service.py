from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import random

from app.models.exam import ExamType, ExamSection, ExamQuestion, PracticeExam, PracticeQuestionResult
from app.models.education_level import EducationLevel, Course, CourseTopic
from app.schemas.exam import (
    ExamTypeCreate, ExamTypeUpdate,
    ExamSectionCreate, ExamSectionUpdate,
    ExamQuestionCreate, ExamQuestionUpdate,
    PracticeExamCreate, PracticeQuestionResultCreate,
    QuestionGenerationRequest, PracticeExamStartRequest, PracticeExamAnswerRequest
)

class ExamTypeService:
    """Sınav türü servisi"""
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[ExamType]:
        return db.query(ExamType).filter(ExamType.is_active == True).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, exam_type_id: int) -> Optional[ExamType]:
        return db.query(ExamType).filter(and_(ExamType.id == exam_type_id, ExamType.is_active == True)).first()
    
    @staticmethod
    def get_by_education_level(db: Session, education_level_id: int) -> List[ExamType]:
        return db.query(ExamType).filter(
            and_(ExamType.education_level_id == education_level_id, ExamType.is_active == True)
        ).all()
    
    @staticmethod
    def create(db: Session, exam_type_data: ExamTypeCreate) -> ExamType:
        db_exam_type = ExamType(**exam_type_data.dict())
        db.add(db_exam_type)
        db.commit()
        db.refresh(db_exam_type)
        return db_exam_type
    
    @staticmethod
    def update(db: Session, exam_type_id: int, exam_type_data: ExamTypeUpdate) -> Optional[ExamType]:
        db_exam_type = db.query(ExamType).filter(ExamType.id == exam_type_id).first()
        if not db_exam_type:
            return None
        
        update_data = exam_type_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_exam_type, field, value)
        
        db.commit()
        db.refresh(db_exam_type)
        return db_exam_type
    
    @staticmethod
    def delete(db: Session, exam_type_id: int) -> bool:
        db_exam_type = db.query(ExamType).filter(ExamType.id == exam_type_id).first()
        if not db_exam_type:
            return False
        
        db_exam_type.is_active = False
        db.commit()
        return True

class ExamSectionService:
    """Sınav bölümü servisi"""
    
    @staticmethod
    def get_all(db: Session, exam_type_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[ExamSection]:
        query = db.query(ExamSection).filter(ExamSection.is_active == True)
        if exam_type_id:
            query = query.filter(ExamSection.exam_type_id == exam_type_id)
        return query.order_by(ExamSection.sort_order).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, section_id: int) -> Optional[ExamSection]:
        return db.query(ExamSection).filter(and_(ExamSection.id == section_id, ExamSection.is_active == True)).first()
    
    @staticmethod
    def get_by_exam_type(db: Session, exam_type_id: int) -> List[ExamSection]:
        return db.query(ExamSection).filter(
            and_(ExamSection.exam_type_id == exam_type_id, ExamSection.is_active == True)
        ).order_by(ExamSection.sort_order).all()
    
    @staticmethod
    def create(db: Session, section_data: ExamSectionCreate) -> ExamSection:
        # Otomatik sıra numarası
        if not section_data.sort_order:
            max_order = db.query(ExamSection).filter(ExamSection.exam_type_id == section_data.exam_type_id).count()
            section_data.sort_order = max_order + 1
        
        db_section = ExamSection(**section_data.dict())
        db.add(db_section)
        db.commit()
        db.refresh(db_section)
        return db_section
    
    @staticmethod
    def update(db: Session, section_id: int, section_data: ExamSectionUpdate) -> Optional[ExamSection]:
        db_section = db.query(ExamSection).filter(ExamSection.id == section_id).first()
        if not db_section:
            return None
        
        update_data = section_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_section, field, value)
        
        db.commit()
        db.refresh(db_section)
        return db_section
    
    @staticmethod
    def delete(db: Session, section_id: int) -> bool:
        db_section = db.query(ExamSection).filter(ExamSection.id == section_id).first()
        if not db_section:
            return False
        
        db_section.is_active = False
        db.commit()
        return True

class ExamQuestionService:
    """Sınav sorusu servisi"""
    
    @staticmethod
    def get_all(db: Session, exam_section_id: Optional[int] = None, skip: int = 0, limit: int = 100) -> List[ExamQuestion]:
        query = db.query(ExamQuestion).filter(ExamQuestion.is_active == True)
        if exam_section_id:
            query = query.filter(ExamQuestion.exam_section_id == exam_section_id)
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, question_id: int) -> Optional[ExamQuestion]:
        return db.query(ExamQuestion).filter(and_(ExamQuestion.id == question_id, ExamQuestion.is_active == True)).first()
    
    @staticmethod
    def get_random_questions(db: Session, exam_section_id: int, count: int = 40, difficulty_level: Optional[int] = None) -> List[ExamQuestion]:
        """Belirtilen bölümden rastgele sorular getir"""
        query = db.query(ExamQuestion).filter(
            and_(ExamQuestion.exam_section_id == exam_section_id, ExamQuestion.is_active == True)
        )
        
        if difficulty_level:
            query = query.filter(ExamQuestion.difficulty_level == difficulty_level)
        
        questions = query.all()
        if len(questions) <= count:
            return questions
        
        return random.sample(questions, count)
    
    @staticmethod
    def create(db: Session, question_data: ExamQuestionCreate) -> ExamQuestion:
        db_question = ExamQuestion(**question_data.dict())
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        return db_question
    
    @staticmethod
    def create_multiple(db: Session, questions_data: List[ExamQuestionCreate]) -> List[ExamQuestion]:
        """Çoklu soru oluşturma"""
        db_questions = []
        for question_data in questions_data:
            db_question = ExamQuestion(**question_data.dict())
            db.add(db_question)
            db_questions.append(db_question)
        
        db.commit()
        for question in db_questions:
            db.refresh(question)
        
        return db_questions
    
    @staticmethod
    def update(db: Session, question_id: int, question_data: ExamQuestionUpdate) -> Optional[ExamQuestion]:
        db_question = db.query(ExamQuestion).filter(ExamQuestion.id == question_id).first()
        if not db_question:
            return None
        
        update_data = question_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_question, field, value)
        
        db.commit()
        db.refresh(db_question)
        return db_question
    
    @staticmethod
    def delete(db: Session, question_id: int) -> bool:
        db_question = db.query(ExamQuestion).filter(ExamQuestion.id == question_id).first()
        if not db_question:
            return False
        
        db_question.is_active = False
        db.commit()
        return True
    
    @staticmethod
    def get_question_count_by_section(db: Session, exam_section_id: int) -> int:
        """Bölümdeki aktif soru sayısını getir"""
        return db.query(ExamQuestion).filter(
            and_(ExamQuestion.exam_section_id == exam_section_id, ExamQuestion.is_active == True)
        ).count()

class PracticeExamService:
    """Deneme sınavı servisi"""
    
    @staticmethod
    def get_user_exams(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[PracticeExam]:
        return db.query(PracticeExam).filter(PracticeExam.user_id == user_id).order_by(
            PracticeExam.created_at.desc()
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_id(db: Session, exam_id: int) -> Optional[PracticeExam]:
        return db.query(PracticeExam).filter(PracticeExam.id == exam_id).first()
    
    @staticmethod
    def create_practice_exam(db: Session, user_id: int, exam_section_id: int, question_count: int = 40) -> PracticeExam:
        """Deneme sınavı oluştur"""
        # Sınav bölümünü al
        exam_section = db.query(ExamSection).filter(ExamSection.id == exam_section_id).first()
        if not exam_section:
            raise ValueError("Geçersiz sınav bölümü")
        
        # Sınav adını oluştur
        exam_count = db.query(PracticeExam).filter(
            and_(PracticeExam.user_id == user_id, PracticeExam.exam_section_id == exam_section_id)
        ).count()
        
        exam_name = f"{exam_section.exam_type.name} {exam_section.name} Denemesi #{exam_count + 1}"
        
        # Deneme sınavı oluştur
        practice_exam = PracticeExam(
            name=exam_name,
            exam_type_id=exam_section.exam_type_id,
            exam_section_id=exam_section_id,
            user_id=user_id,
            total_questions=question_count,
            status="not_started"
        )
        
        db.add(practice_exam)
        db.commit()
        db.refresh(practice_exam)
        
        return practice_exam
    
    @staticmethod
    def start_practice_exam(db: Session, exam_id: int) -> Optional[PracticeExam]:
        """Deneme sınavını başlat"""
        practice_exam = db.query(PracticeExam).filter(PracticeExam.id == exam_id).first()
        if not practice_exam or practice_exam.status != "not_started":
            return None
        
        # Rastgele sorular seç
        questions = ExamQuestionService.get_random_questions(
            db, practice_exam.exam_section_id, practice_exam.total_questions
        )
        
        # Soru sonuç kayıtlarını oluştur
        for question in questions:
            result = PracticeQuestionResult(
                practice_exam_id=practice_exam.id,
                question_id=question.id
            )
            db.add(result)
        
        # Sınavı başlat
        practice_exam.status = "in_progress"
        practice_exam.start_time = datetime.utcnow()
        
        db.commit()
        db.refresh(practice_exam)
        
        return practice_exam
    
    @staticmethod
    def submit_answer(db: Session, exam_id: int, question_id: int, user_answer: Optional[str], time_spent: Optional[int] = None) -> bool:
        """Soru cevabını kaydet"""
        result = db.query(PracticeQuestionResult).filter(
            and_(
                PracticeQuestionResult.practice_exam_id == exam_id,
                PracticeQuestionResult.question_id == question_id
            )
        ).first()
        
        if not result:
            return False
        
        # Doğru cevabı kontrol et
        question = db.query(ExamQuestion).filter(ExamQuestion.id == question_id).first()
        is_correct = user_answer == question.correct_answer if user_answer else False
        
        # Sonucu güncelle
        result.user_answer = user_answer
        result.is_correct = is_correct
        result.time_spent_seconds = time_spent
        
        db.commit()
        return True
    
    @staticmethod
    def finish_practice_exam(db: Session, exam_id: int) -> Optional[PracticeExam]:
        """Deneme sınavını bitir ve puanla"""
        practice_exam = db.query(PracticeExam).filter(PracticeExam.id == exam_id).first()
        if not practice_exam or practice_exam.status != "in_progress":
            return None
        
        # Sonuçları hesapla
        results = db.query(PracticeQuestionResult).filter(
            PracticeQuestionResult.practice_exam_id == exam_id
        ).all()
        
        correct_count = sum(1 for r in results if r.is_correct == True)
        wrong_count = sum(1 for r in results if r.is_correct == False and r.user_answer is not None)
        empty_count = sum(1 for r in results if r.user_answer is None)
        
        # Puanı hesapla (100 üzerinden)
        score = (correct_count / len(results)) * 100 if results else 0
        
        # Sınavı bitir
        practice_exam.status = "completed"
        practice_exam.end_time = datetime.utcnow()
        practice_exam.duration_minutes = int((practice_exam.end_time - practice_exam.start_time).total_seconds() / 60)
        practice_exam.correct_answers = correct_count
        practice_exam.wrong_answers = wrong_count
        practice_exam.empty_answers = empty_count
        practice_exam.score = score
        
        db.commit()
        db.refresh(practice_exam)
        
        return practice_exam
    
    @staticmethod
    def get_exam_results(db: Session, exam_id: int) -> Optional[Dict[str, Any]]:
        """Sınav sonuçlarını detaylı olarak getir"""
        practice_exam = db.query(PracticeExam).filter(PracticeExam.id == exam_id).first()
        if not practice_exam:
            return None
        
        results = db.query(PracticeQuestionResult).filter(
            PracticeQuestionResult.practice_exam_id == exam_id
        ).all()
        
        # İstatistikler
        statistics = {
            "total_questions": len(results),
            "correct_answers": practice_exam.correct_answers,
            "wrong_answers": practice_exam.wrong_answers,
            "empty_answers": practice_exam.empty_answers,
            "score": practice_exam.score,
            "duration_minutes": practice_exam.duration_minutes,
            "success_rate": (practice_exam.correct_answers / len(results) * 100) if results else 0
        }
        
        # Performans analizi
        performance_analysis = {
            "grade": PracticeExamService._calculate_grade(practice_exam.score),
            "recommendations": PracticeExamService._generate_recommendations(practice_exam.score, statistics),
            "difficulty_breakdown": PracticeExamService._analyze_difficulty_performance(db, results)
        }
        
        return {
            "practice_exam": practice_exam,
            "question_results": results,
            "statistics": statistics,
            "performance_analysis": performance_analysis
        }
    
    @staticmethod
    def _calculate_grade(score: float) -> str:
        """Puana göre not hesapla"""
        if score >= 85:
            return "A"
        elif score >= 70:
            return "B"
        elif score >= 55:
            return "C"
        elif score >= 45:
            return "D"
        else:
            return "F"
    
    @staticmethod
    def _generate_recommendations(score: float, statistics: dict) -> List[str]:
        """Puana göre öneriler üret"""
        recommendations = []
        
        if score < 50:
            recommendations.append("Temel konuları tekrar etmeniz önerilir.")
            recommendations.append("Daha fazla pratik yaparak kendinizi geliştirin.")
        elif score < 70:
            recommendations.append("Orta seviye performans gösterdiniz.")
            recommendations.append("Zor konulara odaklanarak daha da gelişebilirsiniz.")
        else:
            recommendations.append("Harika bir performans sergilédiniz!")
            recommendations.append("Bu başarıyı sürdürmek için düzenli çalışmaya devam edin.")
        
        if statistics["empty_answers"] > statistics["total_questions"] * 0.1:
            recommendations.append("Boş bıraktığınız soruları azaltmaya çalışın.")
        
        return recommendations
    
    @staticmethod
    def _analyze_difficulty_performance(db: Session, results: List[PracticeQuestionResult]) -> dict:
        """Zorluk seviyelerine göre performans analizi"""
        difficulty_stats = {1: {"correct": 0, "total": 0}, 2: {"correct": 0, "total": 0}, 3: {"correct": 0, "total": 0}}
        
        for result in results:
            question = db.query(ExamQuestion).filter(ExamQuestion.id == result.question_id).first()
            if question:
                difficulty = question.difficulty_level
                difficulty_stats[difficulty]["total"] += 1
                if result.is_correct:
                    difficulty_stats[difficulty]["correct"] += 1
        
        # Yüzdelik hesapla
        for level in difficulty_stats:
            total = difficulty_stats[level]["total"]
            if total > 0:
                difficulty_stats[level]["percentage"] = (difficulty_stats[level]["correct"] / total) * 100
            else:
                difficulty_stats[level]["percentage"] = 0
        
        return difficulty_stats
