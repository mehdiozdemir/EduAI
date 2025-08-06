# EduAI Backend

Bu, EduAI platformunun backend API'sidir. FastAPI kullanılarak geliştirilmiştir.

## 🚀 Hızlı Başlangıç

### Kurulum

1. Python 3.8+ yüklendiğinden emin olun
2. Proje dizinine gidin:
   ```bash
   cd backend
   ```

3. Sanal ortam oluşturun ve aktifleştirin:
   ```bash
   python -m venv venv
   # Windows'ta:
   venv\Scripts\activate
   # Linux/Mac'te:
   source venv/bin/activate
   ```

4. Gerekli paketleri yükleyin:
   ```bash
   pip install -e .
   # veya
   pip install -r requirements.txt
   ```

5. Environment dosyasını yapılandırın:
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyin ve API anahtarlarınızı ekleyin
   ```

6. Uygulamayı çalıştırın:
   ```bash
   python -m app.main
   # veya
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## 👨‍💼 Varsayılan Admin Hesabı

Uygulama ilk çalıştırıldığında otomatik olarak bir admin hesabı oluşturulur:

- **Kullanıcı Adı:** `admin`
- **E-posta:** `admin@eduai.com`
- **Şifre:** `admin123` (production'da değiştirin!)

### Admin Şifresini Değiştirme

Admin şifresini değiştirmek için:

1. `.env` dosyasında `DEFAULT_ADMIN_PASSWORD` değerini değiştirin
2. Veritabanını sıfırlayın (isteğe bağlı):
   ```bash
   rm eduai.db
   ```
3. Uygulamayı yeniden başlatın

## 📚 API Dokümantasyonu

Uygulama çalışırken API dokümantasyonuna şu adreslerden ulaşabilirsiniz:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### Swagger UI'da Authentication

1. `/auth/login` endpoint'ini kullanarak login olun
2. "Authorize" butonuna tıklayın
3. Aldığınız JWT token'ı `Bearer {token}` formatında girin
4. Artık korumalı endpoint'leri kullanabilirsiniz

## 🏗️ Proje Yapısı

```
backend/
├── app/
│   ├── admin/          # Admin panel routes
│   ├── api/            # API endpoints
│   ├── agents/         # AI agents
│   ├── core/           # Core configuration
│   ├── models/         # Database models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── data/           # Static data files
│   ├── database.py     # Database configuration
│   └── main.py         # Application entry point
├── tests/              # Test files
├── pyproject.toml      # Project configuration
└── .env.example        # Environment variables template
```

## 🗄️ Veritabanı

Uygulama SQLite kullanır ve aşağıdaki tablolar otomatik oluşturulur:

- `users` - Kullanıcı bilgileri
- `subjects` - Dersler
- `topics` - Konular
- `questions` - Sorular
- `user_answers` - Kullanıcı cevapları
- `performance_analyses` - Performans analizleri
- `resource_recommendations` - Kaynak önerileri
- `education_levels` - Eğitim seviyeleri
- `exam_types` - Sınav türleri
- `exam_sections` - Sınav bölümleri
- `practice_exams` - Deneme sınavları

### Örnek Veriler

İlk çalıştırmada şu örnek veriler oluşturulur:

- Eğitim seviyeleri (İlkokul, Ortaokul, Lise, Üniversite)
- Temel dersler (Matematik, Türkçe, Fen Bilgisi, Sosyal Bilgiler, İngilizce)
- Her ders için örnek konular
- Sınav türleri (LGS, YKS, Genel Deneme)
- Her sınav türü için bölümler

## 🔧 Geliştirme

### Yeni API Endpoint Ekleme

1. `app/api/` altında uygun dosyaya route ekleyin
2. Gerekiyorsa `app/schemas/` altında Pydantic modeli oluşturun
3. Business logic'i `app/services/` altına ekleyin
4. `app/main.py`'de router'ı include edin

### Yeni Database Modeli Ekleme

1. `app/models/` altında model dosyası oluşturun
2. `app/models/__init__.py`'da export edin
3. Database migration gerekiyorsa Alembic kullanın

## 📝 Notlar

- Production'da mutlaka `.env` dosyasındaki varsayılan değerleri değiştirin
- API anahtarlarını güvenli bir şekilde saklayın
- Admin hesabı şifresini değiştirin
- Database backup'larını düzenli alın
- CORS ayarlarını production environment'a göre düzenleyin
