from pydantic import BaseModel, HttpUrl, Field, validator
from typing import List, Optional
from enum import Enum

class StockStatus(str, Enum):
    AVAILABLE = "Trendyol'da Mevcut"
    CHECK_REQUIRED = "Trendyol'da Kontrol Edilmeli"
    OUT_OF_STOCK = "Stokta Yok"

class BookType(str, Enum):
    TEXTBOOK = "Ders Kitabı"
    WORKBOOK = "Soru Bankası"
    GUIDE = "Konu Anlatımı"
    FASCICLE = "Fasikül"
    EXAM_PREP = "Sınav Hazırlık"
    REFERENCE = "Kaynak Kitap"

class BookRecommendation(BaseModel):
    title: str = Field(..., description="Kitap başlığı", min_length=5, max_length=200)
    author: str = Field(..., description="Yazar adı", min_length=2, max_length=100)
    publisher: str = Field(..., description="Yayınevi adı", min_length=2, max_length=100)
    description: str = Field(..., description="Kitap açıklaması ve zayıf konularla ilişkisi", min_length=10, max_length=500)
    relevance_score: int = Field(..., description="Zayıf konulara uygunluk skoru", ge=1, le=10)
    rating: Optional[float] = Field(None, description="Trendyol değerlendirme puanı", ge=0, le=5)
    rating_count: Optional[int] = Field(None, description="Değerlendirme sayısı", ge=0)
    book_type: BookType = Field(..., description="Kitap türü")
    target_audience: str = Field(..., description="Hedef kitle", min_length=2, max_length=50)
    key_topics: List[str] = Field(..., description="Ana konular listesi", min_items=1, max_items=10)
    stock_status: StockStatus = Field(..., description="Stok durumu")
    stock_confidence: int = Field(..., description="Stok güvenilirlik skoru", ge=1, le=10)
    price: Optional[str] = Field(None, description="Fiyat bilgisi (XX TL formatında)")
    discount_price: Optional[str] = Field(None, description="İndirimli fiyat (varsa)")
    url: HttpUrl = Field(..., description="Trendyol ürün linki")
    availability_note: str = Field(..., description="Stok/availability hakkında not", max_length=200)

    @validator('url')
    def validate_trendyol_url(cls, v):
        url_str = str(v)
        
        if 'trendyol.com' not in url_str:
            raise ValueError('URL must be a Trendyol link')
        
        # Must be a product page, not search or category
        valid_patterns = ['-p-', '/pd/']  # Trendyol uses -p- format for product codes
        invalid_patterns = ['/sr?', '/search', '/arama', '-x-c91', '/kategori']
        
        # Check for valid product page patterns (before query parameters)
        url_without_params = url_str.split('?')[0]  # Remove query parameters for checking
        
        has_valid_pattern = any(pattern in url_without_params for pattern in valid_patterns)
        has_invalid_pattern = any(pattern in url_str for pattern in invalid_patterns)
        
        if not has_valid_pattern or has_invalid_pattern:
            raise ValueError('URL must be a direct Trendyol product page (contains -p- or /pd/)')
        
        # Check for non-book products
        non_book_keywords = ['terlik', 'ayakkabı', 'çanta', 'giyim', 'elektronik', 'oyuncak']
        if any(keyword in url_str.lower() for keyword in non_book_keywords):
            raise ValueError('URL appears to be for non-book product')
        
        return v

    @validator('price', 'discount_price')
    def validate_price_format(cls, v):
        if v is not None:
            if not v.endswith(' TL'):
                raise ValueError('Price must end with " TL"')
            
            price_part = v.replace(' TL', '').replace(',', '.')
            # Handle Turkish number format (1.450 -> 1450)
            if '.' in price_part and len(price_part.split('.')[-1]) == 3:
                # This is likely a thousands separator, not decimal
                price_part = price_part.replace('.', '')
            
            try:
                price_val = float(price_part)
                if not (5 <= price_val <= 5000):  # Expanded range for book sets
                    raise ValueError('Price must be between 5 and 5000 TL')
            except ValueError:
                raise ValueError('Invalid price format')
        return v

    @validator('key_topics')
    def validate_key_topics(cls, v):
        if not v:
            raise ValueError('At least one key topic is required')
        
        # Check for non-book topics
        non_book_topics = ['terlik', 'ayakkabı', 'çanta', 'giyim', 'elektronik']
        for topic in v:
            if any(non_book in topic.lower() for non_book in non_book_topics):
                raise ValueError(f'Topic "{topic}" appears to be non-book related')
        
        return v

class BookRecommendationList(BaseModel):
    recommendations: List[BookRecommendation] = Field(..., description="Kitap önerileri listesi", min_items=1, max_items=10)
    search_query: str = Field(..., description="Kullanılan arama sorgusu")
    total_found: int = Field(..., description="Toplam bulunan öneri sayısı", ge=0)

    @validator('recommendations')
    def validate_recommendations(cls, v):
        if not v:
            raise ValueError('At least one book recommendation is required')
        
        # Check for duplicate URLs
        urls = [rec.url for rec in v]
        if len(urls) != len(set(str(url) for url in urls)):
            raise ValueError('Duplicate URLs are not allowed')
        
        return v 