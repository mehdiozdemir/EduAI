# Design Document

## Overview

Bu tasarım, mevcut SubjectListPage'i geliştirerek eğitim seviyesi seçimi özelliği ekler. Kullanıcılar önce eğitim seviyelerini (İlkokul, Ortaokul, Lise) seçecek, ardından seçilen seviyeye uygun dersler listelenecektir. Tasarım mevcut kod yapısını koruyarak minimal değişikliklerle maksimum etki sağlamayı hedefler.

## Architecture

### Component Hierarchy
```
SubjectListPage
├── EducationLevelSelector (new)
│   └── EducationLevelCard (new)
└── SubjectGrid (existing, modified)
    └── SubjectCard (existing)
```

### State Management
- `selectedEducationLevel`: Seçilen eğitim seviyesi ('ilkokul' | 'ortaokul' | 'lise' | null)
- `subjects`: Mevcut subjects state'i korunur
- `filteredSubjects`: Seçilen eğitim seviyesine göre filtrelenmiş dersler

### Data Flow
1. Kullanıcı eğitim seviyesi seçer
2. State güncellenir
3. Subjects API'den tüm dersler çekilir
4. Client-side'da eğitim seviyesine göre filtreleme yapılır
5. Filtrelenmiş dersler gösterilir

## Components and Interfaces

### EducationLevelSelector Component

```typescript
interface EducationLevelSelectorProps {
  selectedLevel: EducationLevel | null;
  onLevelSelect: (level: EducationLevel) => void;
}

type EducationLevel = 'ilkokul' | 'ortaokul' | 'lise';
```

**Responsibilities:**
- Üç eğitim seviyesi kartını render etme
- Seçim durumunu görsel olarak gösterme
- Kullanıcı etkileşimlerini parent component'e iletme

### EducationLevelCard Component

```typescript
interface EducationLevelCardProps {
  level: EducationLevel;
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: (level: EducationLevel) => void;
}
```

**Responsibilities:**
- Tek bir eğitim seviyesi kartını render etme
- Hover ve seçim durumlarını görsel olarak gösterme
- Click event'lerini handle etme

### Modified SubjectListPage

**New State:**
```typescript
const [selectedEducationLevel, setSelectedEducationLevel] = useState<EducationLevel | null>(null);
const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
```

**New Methods:**
- `handleEducationLevelSelect`: Eğitim seviyesi seçimini handle eder
- `filterSubjectsByEducationLevel`: Dersları eğitim seviyesine göre filtreler

## Data Models

### Education Level Configuration

```typescript
const EDUCATION_LEVELS = {
  ilkokul: {
    title: 'İlkokul',
    description: '1-4. Sınıf',
    subjects: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce']
  },
  ortaokul: {
    title: 'Ortaokul', 
    description: '5-8. Sınıf',
    subjects: ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Tarih', 'Coğrafya']
  },
  lise: {
    title: 'Lise',
    description: '9-12. Sınıf', 
    subjects: ['Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'İngilizce', 'Edebiyat', 'Felsefe']
  }
} as const;
```

### Subject Model Extension

Mevcut Subject interface'i korunur, filtreleme subject name'e göre yapılır:

```typescript
interface Subject {
  id: number;
  name: string;
  description: string;
  created_at: string;
  // Eğitim seviyesi bilgisi subject name'den çıkarılır
}
```

## Error Handling

### Client-Side Error Scenarios
1. **Eğitim seviyesi seçilmeden ders listesi gösterilmesi**: Kullanıcıya eğitim seviyesi seçmesi gerektiği bildirilir
2. **Filtreleme sonucu boş liste**: "Bu eğitim seviyesi için henüz ders bulunmuyor" mesajı gösterilir
3. **Geçersiz eğitim seviyesi**: Default olarak null state'e döner

### Server-Side Error Handling
Mevcut SubjectListPage'deki error handling mekanizması korunur:
- RetryHandler ile otomatik yeniden deneme
- ErrorBoundarySection ile hata yakalama
- Kullanıcı dostu hata mesajları

## Testing Strategy

### Unit Tests
1. **EducationLevelSelector Component**
   - Tüm eğitim seviyelerinin render edilmesi
   - Seçim durumunun doğru gösterilmesi
   - Click event'lerinin doğru çalışması

2. **EducationLevelCard Component**
   - Hover efektlerinin çalışması
   - Seçim durumunun görsel olarak gösterilmesi
   - Accessibility özellikleri

3. **SubjectListPage Filtering Logic**
   - Eğitim seviyesine göre doğru filtreleme
   - Boş liste durumlarının handle edilmesi
   - State güncellemelerinin doğru çalışması

### Integration Tests
1. **Full User Flow**
   - Eğitim seviyesi seçimi → Ders listesi güncellenmesi
   - Farklı eğitim seviyeleri arasında geçiş
   - Error durumlarında kullanıcı deneyimi

### Accessibility Tests
1. **Keyboard Navigation**
   - Tab ile eğitim seviyesi kartları arasında gezinme
   - Enter/Space ile seçim yapabilme

2. **Screen Reader Support**
   - Uygun ARIA labels
   - Seçim durumunun sesli olarak bildirilmesi

## Visual Design

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                        Dersler                              │
│                 Çalışmak istediğiniz dersi seçin           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   İlkokul   │  │   Ortaokul  │  │    Lise     │        │
│  │  1-4. Sınıf │  │  5-8. Sınıf │  │ 9-12. Sınıf │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Matematik  │  │   Türkçe    │  │Fen Bilimleri│        │
│  │             │  │             │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Styling Guidelines
- **Education Level Cards**: Mevcut SubjectCard stiline benzer, ancak farklı renk paleti
- **Selected State**: Border ve background color değişimi
- **Hover Effects**: Subtle shadow ve scale efektleri
- **Responsive Design**: Mobile-first approach, grid layout

### Color Scheme
- **Default State**: `bg-white border-gray-200`
- **Hover State**: `bg-gray-50 border-gray-300`
- **Selected State**: `bg-blue-50 border-blue-500`
- **Text Colors**: `text-gray-900` (title), `text-gray-600` (description)

## Implementation Notes

### Performance Considerations
1. **Client-Side Filtering**: Subjects API'den bir kez veri çekip client-side'da filtreleme yapılır
2. **Memoization**: `useMemo` ile filtrelenmiş subjects listesi optimize edilir
3. **Lazy Loading**: Mevcut lazy loading yapısı korunur

### Backward Compatibility
- Mevcut SubjectListPage API'si değişmez
- Existing routing yapısı korunur
- Mevcut test suite'ler etkilenmez

### Future Extensibility
- Eğitim seviyesi bilgisi backend'e eklenebilir
- Kullanıcı tercihleri localStorage'da saklanabilir
- Daha granular filtreleme seçenekleri eklenebilir (sınıf seviyesi gibi)