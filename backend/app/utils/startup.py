"""
Startup utilities for initializing the application
"""
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def create_default_admin():
    """
    Create default admin user if it doesn't exist
    """
    db: Session = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(
            (User.username == "admin") | (User.email == "admin@eduai.com")
        ).first()
        
        if not admin_user:
            # Create default admin user
            admin_user = User(
                username="admin",
                email="admin@eduai.com",
                first_name="Admin",
                last_name="User",
                is_admin=True,
                is_active=True
            )
            
            # Set default password (you should change this in production)
            default_password = getattr(settings, 'DEFAULT_ADMIN_PASSWORD', 'admin123')
            admin_user.set_password(default_password)
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            logger.info(f"Created default admin user: username=admin, email=admin@eduai.com")
            logger.warning(f"Default admin password is '{default_password}' - Please change it in production!")
            
        else:
            logger.info("Admin user already exists")
            
    except Exception as e:
        logger.error(f"Error creating default admin user: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def create_sample_data():
    """
    Create sample education data if database is empty
    """
    db: Session = SessionLocal()
    try:
        from app.models.education_level import EducationLevel
        from app.models.subject import Subject, Topic
        from app.models.exam import ExamType, ExamSection
        
        # Check if education levels exist
        education_count = db.query(EducationLevel).count()
        if education_count == 0:
            # Create sample education levels
            education_levels = [
                EducationLevel(name="İlkokul", description="İlkokul seviyesi", sort_order=1),
                EducationLevel(name="Ortaokul", description="Ortaokul seviyesi", sort_order=2),
                EducationLevel(name="Lise", description="Lise seviyesi", sort_order=3),
                EducationLevel(name="Üniversite", description="Üniversite seviyesi", sort_order=4),
            ]
            
            for level in education_levels:
                db.add(level)
            
            logger.info("Created sample education levels")
        
        # Check if subjects exist
        subject_count = db.query(Subject).count()
        if subject_count == 0:
            # Create sample subjects
            subjects_data = [
                {"name": "Matematik", "description": "Matematik dersi"},
                {"name": "Türkçe", "description": "Türkçe dersi"},
                {"name": "Fen Bilgisi", "description": "Fen Bilgisi dersi"},
                {"name": "Sosyal Bilgiler", "description": "Sosyal Bilgiler dersi"},
                {"name": "İngilizce", "description": "İngilizce dersi"},
            ]
            
            for subject_data in subjects_data:
                subject = Subject(**subject_data)
                db.add(subject)
                db.flush()  # Get the ID
                
                # Add some sample topics for each subject
                if subject.name == "Matematik":
                    topics = [
                        {"name": "Dört İşlem", "description": "Toplama, çıkarma, çarpma, bölme", "subject_id": subject.id},
                        {"name": "Kesirler", "description": "Kesir işlemleri", "subject_id": subject.id},
                        {"name": "Geometri", "description": "Temel geometri", "subject_id": subject.id},
                    ]
                elif subject.name == "Türkçe":
                    topics = [
                        {"name": "Okuma Anlama", "description": "Metin anlama ve yorumlama", "subject_id": subject.id},
                        {"name": "Dilbilgisi", "description": "Türkçe dilbilgisi", "subject_id": subject.id},
                        {"name": "Yazım Kuralları", "description": "Yazım ve noktalama", "subject_id": subject.id},
                    ]
                else:
                    topics = [
                        {"name": f"{subject.name} Temelleri", "description": f"Temel {subject.name} konuları", "subject_id": subject.id},
                    ]
                
                for topic_data in topics:
                    topic = Topic(**topic_data)
                    db.add(topic)
            
            logger.info("Created sample subjects and topics")
        
        # Check if exam types exist
        exam_type_count = db.query(ExamType).count()
        if exam_type_count == 0:
            # Create sample exam types
            exam_types = [
                ExamType(name="LGS", description="Liselere Giriş Sınavı", sort_order=1),
                ExamType(name="YKS", description="Yükseköğretim Kurumları Sınavı", sort_order=2),
                ExamType(name="Genel Deneme", description="Genel deneme sınavları", sort_order=3),
            ]
            
            for exam_type in exam_types:
                db.add(exam_type)
                db.flush()  # Get the ID
                
                # Add sample exam sections
                if exam_type.name == "LGS":
                    sections = [
                        {"name": "Türkçe", "description": "Türkçe bölümü", "exam_type_id": exam_type.id, "sort_order": 1},
                        {"name": "Matematik", "description": "Matematik bölümü", "exam_type_id": exam_type.id, "sort_order": 2},
                        {"name": "Fen Bilimleri", "description": "Fen Bilimleri bölümü", "exam_type_id": exam_type.id, "sort_order": 3},
                        {"name": "Sosyal Bilgiler", "description": "Sosyal Bilgiler bölümü", "exam_type_id": exam_type.id, "sort_order": 4},
                    ]
                elif exam_type.name == "YKS":
                    sections = [
                        {"name": "TYT", "description": "Temel Yeterlilik Testi", "exam_type_id": exam_type.id, "sort_order": 1},
                        {"name": "AYT", "description": "Alan Yeterlilik Testi", "exam_type_id": exam_type.id, "sort_order": 2},
                    ]
                else:
                    sections = [
                        {"name": "Genel", "description": "Genel bölüm", "exam_type_id": exam_type.id, "sort_order": 1},
                    ]
                
                for section_data in sections:
                    section = ExamSection(**section_data)
                    db.add(section)
            
            logger.info("Created sample exam types and sections")
        
        db.commit()
        
    except Exception as e:
        logger.error(f"Error creating sample data: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def initialize_application():
    """
    Initialize the application with default data
    """
    logger.info("Initializing EduAI application...")
    
    try:
        # Create default admin user
        create_default_admin()
        
        # Create sample data
        create_sample_data()
        
        logger.info("Application initialization completed successfully")
        
    except Exception as e:
        logger.error(f"Application initialization failed: {str(e)}")
        raise
