# 🎓 EduAI - Akıllı Öğrenme Platformu

<div align="center">

![EduAI Banner](https://img.shields.io/badge/EduAI-Akıllı%20Öğrenme%20Platformu-brightgreen?style=for-the-badge&logo=graduation-cap)

**Yapay Zeka Destekli Kişiselleştirilmiş Öğrenme Platformu**

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi)](ps://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-646CFF?style=flat&logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 Proje Hakkında

**EduAI**, yapay zeka destekli akıllı öğrenme platformudur. Google Gemini AI entegrasyonu ile öğrencilere kişiselleştirilmiş eğitim deneyimi sunar. Platform, adaptif soru üretimi, performans analizi, kaynak önerileri ve kapsamlı sınav sistemi ile modern eğitim ihtiyaçlarını karşılar.

### 🎯 Vizyon
Geleneksel eğitim yöntemlerini AI ile birleştirerek, her öğrencinin kendi hızında ve seviyesinde öğrenebileceği akıllı bir ekosistem yaratmak.

### 🌟 Misyon
- **Kişiselleştirilmiş Öğrenme:** AI destekli adaptif içerik üretimi
- **Veri Odaklı İyileştirme:** Performans metrikleri ile sürekli gelişim
- **Erişilebilir Eğitim:** Modern web teknolojileri ile kullanıcı dostu arayüz
- **Kapsamlı Analitik:** Detaylı raporlama ve ilerleme takibi

---

## ✨ Temel Özellikler

### 🤖 Yapay Zeka Destekli Temel Özellikler
- **Adaptif Soru Üretimi** - Gemini AI ile seviye bazlı kişiselleştirilmiş sorular
- **Akıllı Performans Analizi** - Makine öğrenmesi destekli zayıf alan tespiti  
- **Otomatik Kaynak Önerileri** - AI destekli kitap ve materyal önerileri
- **AI Rehberlik Sistemi** - Mem0 AI ile kişiselleştirilmiş öğrenci mentörü
- **Konuşmalı Öğrenme** - Doğal dil işleme ile etkileşimli öğrenme
- **Hafıza Destekli AI** - Kullanıcı geçmişini hatırlayan akıllı asistan
- **Kişiselleştirilmiş Çalışma Planları** - AI destekli özelleştirilmiş çalışma programları

### 📊 Öğrenme Analitiği ve Değerlendirme
- **Kapsamlı Gösterge Paneli** - Gerçek zamanlı performans ve ilerleme göstergeleri
- **Gelişmiş Analitik** - Çoklu metrik destekli performans raporları
- **Uyarlanabilir Test** - Kullanıcı seviyesine göre ayarlanan sınav zorluğu
- **İlerleme Takibi** - Zaman bazlı gelişim analizi ve hedef takibi

### 🎯 Sınav Sistemi
- **Çoklu Sınav Formatları** - LGS, TYT ve AYT
- **Gerçek Zamanlı Değerlendirme** - Anlık değerlendirme ve detaylı geri bildirim
- **Performans Metrikleri** - Soru bazlı analiz ve kategori performansları
- **Geçmiş Veriler** - Geçmiş sınav sonuçları ve trend analizi

### 👥 Kullanıcı Yönetimi ve Yönetim
- **Rol Tabanlı Erişim Kontrolü** - Admin ve öğrenci rolleri
- **Kullanıcı Profil Yönetimi** - Kişisel profil ve tercih yönetimi  
- **Yönetici Paneliü** - Sistem yönetimi ve kullanıcı kontrolü
- **Çok Seviyeli Kimlik Doğrulama** - JWT tabanlı güvenli kimlik doğrulama

---

## 🏗️ Teknik Mimari

### Backend Mimarisi (Python/FastAPI)
```
backend/
├── 📁 app/
│   ├── 🤖 agents/              # AI Agent Modules
│   │   ├── master_agent.py     # Central AI coordinator
│   │   ├── question_agent.py   # Question generation
│   │   ├── analysis_agent.py   # Performance analysis  
│   │   ├── book_agent.py       # Resource recommendations
│   │   ├── exam_agent.py       # Exam management
│   │   └── youtube_agent.py    # Video content integration
│   │
│   ├── 🛠️ api/                 # REST API Uç Noktaları
│   │   ├── auth.py            # Kimlik doğrulama ve yetkilendirme
│   │   ├── users.py           # Kullanıcı yönetimi
│   │   ├── subjects.py        # Ders ve konu yönetimi
│   │   ├── questions.py       # Soru CRUD işlemleri
│   │   ├── exam.py            # Sınav sistemi
│   │   ├── performance.py     # Analitik ve raporlama
│   │   └── guidance.py        # AI rehberlik ve hafıza sistemi
│   │
│   ├── 💾 models/              # Veritabanı Modelleri (SQLAlchemy)
│   │   ├── user.py            # Kullanıcı varlığı ve kimlik doğrulama
│   │   ├── subject.py         # Dersler ve konular
│   │   ├── question.py        # Sorular ve cevaplar
│   │   ├── exam.py            # Sınav yapısı ve sonuçları
│   │   └── performance.py     # Analitik ve öneriler
│   │
│   ├── 🔧 services/            # İş Mantığı Katmanı
│   ├── 📋 schemas/             # Pydantic Modelleri (API sözleşmeleri)
│   ├── ⚙️ core/               # Konfigürasyon ve yardımcı araçlar
│   └── 🗄️ data/               # Statik veri ve AI komutları
│
├── 🧪 tests/                   # Kapsamlı test paketi
├── 📊 chroma_db/              # AI hafıza için vektör veritabanı
└── 🧠 mem0_data/              # Mem0 AI kişiselleştirilmiş hafıza depolaması
```

### Frontend Mimarisi (React/TypeScript)
```
frontend/
├── 📁 src/
│   ├── 🧩 components/          # Yeniden Kullanılabilir UI Bileşenleri
│   │   ├── ui/                # Temel UI bileşenleri
│   │   ├── features/          # Özellik-özel bileşenler
│   │   ├── layout/            # Düzen bileşenleri
│   │   └── forms/             # Form bileşenleri
│   │
│   ├── 📄 pages/               # Sayfa Bileşenleri ve Yönlendirme
│   │   ├── Dashboard.tsx      # Ana gösterge paneli
│   │   ├── QuestionPage.tsx   # Soru arayüzü
│   │   ├── PracticeExam*.tsx  # Sınav sistemi sayfaları
│   │   ├── PerformanceAnalysis.tsx
│   │   ├── AIGuidancePage.tsx # AI mentor ve rehberlik arayüzü
│   │   └── AdminPanel.tsx     # Yönetici arayüzü
│   │
│   ├── 🔌 services/            # API Entegrasyon Katmanı
│   │   ├── api.ts             # Temel API servisi
│   │   ├── authService.ts     # Kimlik doğrulama
│   │   ├── questionService.ts # Soru yönetimi
│   │   ├── performanceService.ts # Analitik
│   │   └── examService.ts     # Sınav işlemleri
│   │
│   ├── 🎣 hooks/               # Özel React Hook'ları
│   ├── 🎨 styles/              # Tailwind CSS ve stil
│   ├── 🧪 test/                # Frontend testleri
│   └── 📱 utils/               # Yardımcı fonksiyonlar
│
├── 📦 public/                  # Statik varlıklar ve PWA dosyaları
└── 🛠️ scripts/                # Build ve deployment scriptleri
```

### Teknoloji Yığını

#### Backend Teknolojileri
- **🐍 Python 3.8+** - Temel programlama dili
- **⚡ FastAPI** - Modern, yüksek performanslı web framework
- **🗄️ SQLAlchemy** - SQLite ile veritabanı ORM
- **🔐 JWT Kimlik Doğrulama** - Güvenli token tabanlı kimlik doğrulama
- **🤖 Google Gemini AI** - Gelişmiş dil modeli entegrasyonu
- **🧠 LangChain** - AI uygulama framework'ü
- **💾 Mem0 AI** - AI ajanları için kişiselleştirilmiş hafıza katmanı
- **🎯 ChromaDB** - AI hafıza depolaması için vektör veritabanı
- **🌐 Tavily API** - Web arama entegrasyonu
- **🎬 YouTube API** - Eğitim videosu entegrasyonu

#### Frontend Teknolojileri  
- **⚛️ React 19.1.0** - Modern UI kütüphanesi
- **📘 TypeScript 5.8.3** - Tip güvenli JavaScript
- **⚡ Vite 7.0.4** - Şimşek hızında build aracı
- **🎨 Tailwind CSS** - Yardımcı-öncelikli CSS framework
- **📊 Chart.js** - Etkileşimli veri görselleştirme
- **🔄 TanStack Query** - Güçlü veri getirme
- **🧭 React Router** - İstemci tarafı yönlendirme

#### Geliştirme ve DevOps
- **🧪 Vitest** - Birim test framework'ü
- **🐳 Docker** - Konteynerleştirme
- **📝 ESLint + Prettier** - Kod kalitesi araçları
- **🔄 GitHub Actions** - CI/CD pipeline
- **📊 Lighthouse** - Performans izleme

---

## 🧠 AI Rehberlik ve Hafıza Sistemi

### 🎯 Mem0 AI Entegrasyonu

EduAI, **Mem0 AI** teknolojisi ile gelişmiş kişiselleştirilmiş öğrenme deneyimi sunar:

#### 💭 Personalized Memory Layer
- **Kullanıcı Tercihleri Hatırlama** - Öğrenme stilini ve tercihlerini kaydetme
- **Öğrenme Geçmişi Takibi** - Geçmiş performansı ve zayıf alanları hatırlama
- **Contextual Recommendations** - Bağlamsal ve kişiselleştirilmiş öneriler
- **Adaptive Learning Path** - Kullanıcının ilerleyişine göre öğrenme yolunu ayarlama

#### 🤖 AI Mentor Özellikleri
- **Konuşmalı Öğrenme** - Doğal dil ile etkileşimli öğrenme rehberliği
- **Çalışma Planlama** - AI destekli kişiselleştirilmiş çalışma programları
- **Motivasyon Desteği** - Motivasyon desteği ve ilerleme takibi
- **Soru Yardımı** - Anlık soru yardımı ve açıklamalar

#### 🔄 Hafıza Yönetimi
- **Vektör Gömmeleri** - ChromaDB ile semantik hafıza depolama
- **Bilgi Grafikleri** - Konular arası bağlantıları haritalama
- **Öğrenme Analitiği** - Öğrenme modellerini sürekli iyileştirme
- **Gizlilik Öncelikli** - Kullanıcı verilerini güvenli şekilde saklama

### 💬 AI Guidance API Kullanımı

```javascript
// AI Rehber ile sohbet başlatma
const guidanceResponse = await fetch('/api/v1/guidance/ask', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: "Matematik konusunda zorlanıyorum, yardım edebilir misin?"
  })
});

// Soru sonucunu kaydetme ve hafızaya ekleme
const resultResponse = await fetch('/api/v1/guidance/save-result', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    question: "2 + 2 = ?",
    user_answer: "4",
    correct_answer: "4",
    is_correct: true,
    subject: "Matematik",
    topic: "Dört İşlem",
    difficulty: "kolay",
    education_level: "ilkokul"
  })
});

// Kullanıcı hafızasını alma
const memoryResponse = await fetch(`/api/v1/guidance/memory/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🚀 Kurulum ve Çalıştırma

### 📋 Sistem Gereksinimleri

- **Python:** 3.8 veya üstü
- **Node.js:** 16.0 veya üstü  
- **npm/yarn:** Paket yöneticisi
- **Git:** Version control
- **4GB RAM** minimum (8GB önerilen)

### ⬇️ 1. Projeyi İndirin

```bash
git clone https://github.com/mehdiozdemir/EduAI.git
cd EduAI
```

### 🖥️ 2. Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Python sanal ortamı oluşturun
python -m venv venv

# Sanal ortamı aktifleştirin
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Gerekli paketleri yükleyin  
pip install -e .

# Environment dosyasını oluşturun
cp .env.example .env

# .env dosyasını düzenleyin - API anahtarlarınızı ekleyin
# GEMINI_API_KEY=your_gemini_api_key_here
# YOUTUBE_API_KEY=your_youtube_api_key_here
# TAVILY_API_KEY=your_tavily_api_key_here
# MEM0_API_KEY=your_mem0_api_key_here (AI hafıza sistemi için)

# Backend'i başlatın
python -m app.main
```

Backend şu adreste çalışacak: **http://localhost:8000**

### 🌐 3. Frontend Kurulumu

```bash
# Yeni terminal açın ve frontend dizinine gidin
cd frontend

# Gerekli paketleri yükleyin
npm install

# Development modunda başlatın  
npm run dev
```

Frontend şu adreste çalışacak: **http://localhost:5173**

### 🐳 4. Docker ile Çalıştırma (Alternatif)

```bash
# Development environment
docker-compose -f docker-compose.dev.yml up -d

# Production environment
docker-compose up -d
```

---

## 👨‍💼 Varsayılan Admin Hesabı

Sistem ilk çalıştırıldığında otomatik olarak admin hesabı oluşturulur:

| Alan | Değer |
|------|-------|
| **👤 Kullanıcı Adı** | `admin` |
| **📧 E-posta** | `admin@eduai.com` |
| **🔒 Şifre** | `admin123` |
| **👑 Rol** | Administrator |

> ⚠️ **GÜVENLİK UYARISI:** Production ortamında mutlaka admin şifresini değiştirin!

### 🔐 Admin Şifresini Değiştirme

```bash
# .env dosyasında DEFAULT_ADMIN_PASSWORD değerini güncelle
DEFAULT_ADMIN_PASSWORD=yeni_guvenli_sifre

# Veritabanını sıfırla (isteğe bağlı)
rm backend/eduai.db

# Uygulamayı yeniden başlat
```

---

## 📚 API Dokümantasyonu

### 🔍 API Explorer

Backend çalışırken interactive API dokümantasyonuna ulaşın:

- **📖 Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **📋 ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **🔍 Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

### 🔐 Authentication Workflow

```javascript
// 1. Login yapın ve token alın
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@eduai.com',
    password: 'admin123'
  })
});

const { access_token, token_type, user } = await loginResponse.json();

// 2. Protected endpoint'leri kullanın
const protectedResponse = await fetch('/users/me', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});
```

### 🔑 Ana API Endpoint'leri

#### Authentication
- `POST /auth/login` - Kullanıcı girişi
- `POST /auth/register` - Yeni kullanıcı kaydı
- `GET /users/me` - Mevcut kullanıcı bilgileri

#### AI Question Generation
- `POST /agents/generate-questions` - AI soru üretimi
- `POST /agents/evaluate-answer` - Cevap değerlendirmesi
- `GET /agents/info` - AI agent bilgileri

#### AI Guidance & Memory System
- `POST /api/v1/guidance/ask` - AI rehberlik sohbeti
- `POST /api/v1/guidance/save-result` - Soru sonucu kaydetme
- `GET /api/v1/guidance/memory/{user_id}` - Kullanıcı hafızası

#### Performance Analytics
- `GET /api/v1/performance/dashboard/{user_id}` - Dashboard verileri
- `POST /api/v1/performance/analyze` - Performans analizi
- `GET /api/v1/performance/recommendations` - AI önerileri
- `POST /api/v1/performance/analyze-exam` - Sınav analizi

#### Exam System
- `GET /api/v1/exam/types` - Sınav türleri listesi
- `GET /api/v1/exam/sections/{exam_type_id}` - Sınav bölümleri
- `POST /api/v1/exam/practice/start` - Deneme sınavı başlat
- `POST /api/v1/exam/practice/submit` - Sınav sonuçları gönder
- `GET /api/v1/exam/user/{user_id}/practice-exams` - Kullanıcı sınav geçmişi



---

## 🔧 Development Guide

### 🆕 Yeni Özellik Ekleme

#### Backend - API Uç Noktası
```bash
# 1. Model oluştur (app/models/)
# 2. Schema tanımla (app/schemas/)  
# 3. Servis mantığı yaz (app/services/)
# 4. Router ekle (app/api/)
# 5. Main.py'de include et
```

#### Frontend - Bileşen
```bash
# 1. Bileşen oluştur (src/components/)
# 2. Hook yaz (src/hooks/)
# 3. Servis entegrasyonu (src/services/)
# 4. Test yaz (src/test/)
# 5. Router'a ekle (src/router/)
```



## 🗄️ Veritabanı Şeması

### 📊 SQL Veritabanı (SQLite/SQLAlchemy)

#### Temel Tablolar
- **👥 users** - Rolleri olan kullanıcı yönetimi ve kimlik doğrulama
- **🎓 education_levels** - Eğitim seviyeleri (İlkokul, Ortaokul, Lise, Üniversite)
- **� courses** - Course subjects per education level (Matematik, Türkçe, etc.)
- **📝 course_topics** - Her ders içindeki detaylı konular
- **📚 subjects** - Eski konu sistemi (uyumluluk için korunuyor)
- **📋 topics** - Derslere bağlı eski konu sistemi
- **❓ questions** - Temel AI üretimi sorular ve cevaplar
- **� user_answers** - Student responses to questions
- **�📊 performance_analyses** - Performance tracking & analytics data
- **💡 resource_recommendations** - AI destekli çalışma önerileri
- **📖 book_recommendations** - Kitap öneri veri modelleri (Pydantic)

#### Sınav Sistemi Tabloları
- **📋 exam_types** - Sınav formatları (LGS, TYT, AYT) metadata ile
- **📑 exam_sections** - Sınav türüne göre bölümler (Matematik, Fen, vb.)
- **❓ exam_questions** - Seçenekli kapsamlı sınav soruları
- **🎯 practice_exams** - Öğrenci sınav oturumları ve sonuçları
- **📊 practice_question_results** - Detaylı soru bazlı sonuçlar

### 🧠 Vektör Veritabanı (ChromaDB)

EduAI, **ChromaDB** vektör veritabanı kullanarak AI hafıza ve semantik arama özelliklerini destekler:

#### 🎯 Vector Store Configuration
```python
vector_store: {
    "provider": "chroma",
    "config": {
        "collection_name": "eduai_memory",
        "path": "./chroma_db"
    }
}
```

#### 📊 Vektör Veritabanı Özellikleri
- **🔍 Semantik Arama** - Eğitim içeriğinde anlamsal arama
- **🧠 AI Hafıza Depolaması** - Mem0 AI ile kişiselleştirilmiş hafıza
- **📈 Gömme Depolaması** - Gemini text-embedding-004 modeli kullanımı
- **🔄 Gerçek Zamanlı Güncellemeler** - Kullanıcı etkileşimlerini anlık kaydetme
- **🎯 Bağlamsal Getirme** - Bağlamsal içerik getirme

#### 🗂️ Vektör Koleksiyonları
- **eduai_memory** - Ana hafıza koleksiyonu
- **Kullanıcı Öğrenme Kalıpları** - Öğrenci öğrenme kalıpları
- **Soru Gömmeleri** - Soru ve cevap vektörleri
- **İçerik İlişkileri** - Konular arası semantik bağlantılar

#### 💾 Vektör Depolama Yapısı
```
chroma_db/
├── chroma.sqlite3              # ChromaDB metadata
├── 072e2ca6-e5fa-4a66.../      # Koleksiyon verileri
└── b2d4d81c-50d1-40c3.../      # Vektör gömmeleri
```

### Örnek Veri
Sistem ilk çalıştığında şu veriler otomatik oluşur:

#### 🎓 Eğitim Seviyeleri
- İlkokul, Ortaokul, Lise

#### 📚 Dersler ve Konular (Kurs Sistemi)
- **İlkokul Matematik:** Dört İşlem, Kesirler, Geometri Temelleri
- **Ortaokul Matematik:** Cebir, Geometri, Olasılık
- **Lise Matematik:** Fonksiyonlar, Trigonometri, İntegral
- **Türkçe:** Okuma Anlama, Dilbilgisi, Yazım Kuralları, Kompozisyon
- **Fen Bilgisi:** Fizik, Kimya, Biyoloji temelleri
- **Sosyal Bilgiler:** Tarih, Coğrafya, Vatandaşlık
- **İngilizce:** Grammar, Vocabulary, Reading, Writing

#### 🎯 Sınav Türleri ve Bölümleri
- **LGS:** 
  - Türkçe (20 soru), Matematik (20 soru)
  - Fen Bilimleri (20 soru), Sosyal Bilgiler (10 soru)
- **YKS-TYT:** 
  - Türkçe (40 soru), Matematik (40 soru)
  - Fen Bilimleri (20 soru), Sosyal Bilimler (20 soru)
- **YKS-AYT:**
  - Matematik (40 soru), Fen Bilimleri (40 soru)
  - Edebiyat (24 soru), Tarih (10 soru), Coğrafya (6 soru)
- **Genel Deneme:** Özelleştirilebilir formatlar

#### 🧠 Vektör Veritabanı Koleksiyonları
- **eduai_memory** - Kullanıcı öğrenme hafızası (Mem0 AI)
- **question_embeddings** - Soru ve cevap vektörleri
- **content_similarity** - İçerik benzerlik matrisi
- **learning_patterns** - Öğrenme kalıpları ve tercihler

#### 📊 Veritabanı İlişkileri
```
users (1) ←→ (n) performance_analyses
users (1) ←→ (n) practice_exams
users (1) ←→ (n) user_answers
education_levels (1) ←→ (n) courses
courses (1) ←→ (n) course_topics
exam_types (1) ←→ (n) exam_sections
exam_sections (1) ←→ (n) exam_questions
practice_exams (1) ←→ (n) practice_question_results
```

---

## 🤝 Katkıda Bulunma

### 🔄 Katkı İş Akışı

1. **🍴 Fork** - Repository'yi fork edin
2. **🌿 Branch** - Özellik branch'i oluşturun
   ```bash
   git checkout -b feature/amazing-new-feature
   ```
3. **💻 Code** - Değişikliklerinizi yapın
4. **🧪 Test** - Testleri yazın ve çalıştırın
5. **📝 Commit** - Geleneksel commit format kullanın
   ```bash
   git commit -m "feat: add amazing new feature"
   ```
6. **📤 Push** - Branch'inizi push edin
7. **🔄 PR** - Pull Request oluşturun

### 📋 Katkı Kuralları

#### Kod Kalitesi Standartları
- ✅ Kapsamlı birim testleri
- ✅ TypeScript strict mod uyumluluğu 
- ✅ ESLint + Prettier formatı
- ✅ Anlamlı commit mesajları
- ✅ Güncellenmiş dokümantasyon

#### 🐛 Hata Raporları
Issue açarken şunları ekleyin:
- Sistem bilgileri (OS, Python/Node versiyonları)
- Tekrarlama adımları
- Beklenen ve gerçek davranış
- Hata logları ve ekran görüntüleri

#### 💡 Özellik İstekleri  
- Net problem açıklaması
- Önerilen çözüm yaklaşımı
- Kullanım durumu örnekleri
- Uygulama değerlendirmeleri

---

## 📜 Lisans

Bu proje **MIT License** altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

```
MIT License

Copyright (c) 2024 EduAI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🆘 Destek ve İletişim

### 📞 Destek Kanalları
- **🐛 Issues:** [GitHub Issues](https://github.com/mehdiozdemir/EduAI/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/mehdiozdemir/EduAI/discussions)  
- **📖 Wiki:** [Proje Wiki](https://github.com/mehdiozdemir/EduAI/wiki)
- **📧 Email:** mehdiozdemir11@gmail.com

### 📚 Faydalı Kaynaklar
- **📖 API Dokümantasyonu:** [Swagger UI](http://localhost:8000/docs)
---

<div align="center">

### 🙏 Teşekkürler

EduAI projesine katkıda bulunan herkese teşekkür ederiz!

**Built with ❤️ by Mehdi Özdemir and Sevgi Başar**

[![Made in Turkey](https://img.shields.io/badge/Made%20in-Turkey-red?style=for-the-badge)](https://turkey.gov.tr)

---

**⭐ Beğendiyseniz yıldız vermeyi unutmayın!**

