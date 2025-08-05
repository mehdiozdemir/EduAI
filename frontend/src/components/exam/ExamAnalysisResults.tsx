import React from 'react';
import Card from '../ui/Card';

interface ExamAnalysisResultsProps {
  analysis?: AnalysisData;
  examInfo?: ExamInfo;
  loading?: boolean;
}

interface YouTubeVideo {
  title: string;
  channel: string;
  duration: string;
  level: string;
  video_url: string;
  topics_covered: string[];
  why_recommended: string;
  thumbnail_url?: string;
  channel_url?: string;
}

interface BookRecommendation {
  title: string;
  author: string;
  publisher: string;
  year: number;
  isbn?: string;
  price?: string;
  stock_status: string;
  purchase_links: string[];
  topics_covered: string[];
  difficulty_level: string;
  why_recommended: string;
  cover_image?: string;
}

interface AnalysisData {
  weakness_level?: number;
  weak_topics?: string[];
  strong_topics?: string[];
  recommendations?: string[];
  detailed_analysis?: string;
  personalized_insights?: string[];
  improvement_trend?: string;
  youtube_recommendations?: {
    recommendations: YouTubeVideo[];
    search_strategy?: string;
  };
  book_recommendations?: {
    recommendations: BookRecommendation[];
    search_summary?: string;
  };
}

interface ExamInfo {
  exam_id: number;
  exam_type: string;
  exam_section: string;
  score: number;
  completion_date?: string;
}

const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div 
      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    ></div>
  </div>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'destructive'; className?: string }> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const baseClass = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  const variantClass = variant === 'destructive' 
    ? "bg-red-100 text-red-800" 
    : "bg-blue-100 text-blue-800";
  
  return (
    <span className={`${baseClass} ${variantClass} ${className}`}>
      {children}
    </span>
  );
};

const YouTubeVideoCard: React.FC<{ video: YouTubeVideo }> = ({ video }) => (
  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex gap-3">
      {video.thumbnail_url && (
        <div className="flex-shrink-0">
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-20 h-15 object-cover rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <a 
          href={video.video_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 font-medium text-sm leading-tight block mb-1 hover:underline"
        >
          {video.title}
        </a>
        <div className="flex items-center gap-2 mb-2">
          {video.channel_url ? (
            <a 
              href={video.channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 text-xs hover:underline"
            >
              📺 {video.channel}
            </a>
          ) : (
            <span className="text-gray-600 text-xs">📺 {video.channel}</span>
          )}
          <span className="text-gray-500 text-xs">•</span>
          <span className="text-gray-600 text-xs">⏱️ {video.duration}</span>
          <span className="text-gray-500 text-xs">•</span>
          <span className={`text-xs px-1 py-0 rounded ${
            video.level.toLowerCase().includes('kolay') || video.level.toLowerCase().includes('temel') 
              ? 'bg-green-100 text-green-800' 
              : video.level.toLowerCase().includes('orta')
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            📊 {video.level}
          </span>
        </div>
        <p className="text-gray-700 text-xs mb-2" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {video.why_recommended}
        </p>
        <div className="flex flex-wrap gap-1">
          {video.topics_covered && video.topics_covered.length > 0 && video.topics_covered.slice(0, 3).map((topic, idx) => (
            <Badge key={idx} className="text-xs py-0 px-1">
              {topic}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const BookCard: React.FC<{ book: BookRecommendation }> = ({ book }) => (
  <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex gap-3">
      {book.cover_image && (
        <div className="flex-shrink-0">
          <img 
            src={book.cover_image} 
            alt={book.title}
            className="w-16 h-20 object-cover rounded"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm leading-tight mb-1">{book.title}</h4>
        <p className="text-gray-600 text-xs mb-1">
          ✍️ {book.author} • 📚 {book.publisher} ({book.year})
        </p>
        <p className="text-gray-700 text-xs mb-2" style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {book.why_recommended}
        </p>
        <div className="flex flex-wrap gap-1 mb-2">
          {book.topics_covered && book.topics_covered.length > 0 && book.topics_covered.slice(0, 3).map((topic, idx) => (
            <Badge key={idx} className="text-xs py-0 px-1">
              {topic}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs px-2 py-1 rounded ${
            book.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {book.stock_status === 'in_stock' ? '✅ Mevcut' : '⏳ Temin Edilebilir'}
          </span>
          {book.price && (
            <span className="text-xs font-medium text-gray-700">💰 {book.price}</span>
          )}
        </div>
        {book.purchase_links && book.purchase_links.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {book.purchase_links.slice(0, 2).map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
              >
                🛒 Satın Al
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

const ExamAnalysisResults: React.FC<ExamAnalysisResultsProps> = ({
  analysis,
  examInfo,
  loading = false
}) => {
  // Güvenlik kontrolü
  if (!analysis) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Analiz verisi bulunamadı</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 text-sm font-medium">
              AI analiz çalışıyor... YouTube videoları ve kitap önerileri hazırlanıyor
            </span>
          </div>
        </div>
      </div>
    );
  }

  const getWeaknessLevelColor = (level: number) => {
    if (level <= 3) return "text-green-600 bg-green-100";
    if (level <= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getWeaknessLevelText = (level: number) => {
    if (level <= 3) return "Düşük";
    if (level <= 6) return "Orta";
    return "Yüksek";
  };

  const getTrendIcon = (trend: string | undefined) => {
    if (!trend) return '❓'; // Güvenlik kontrolü
    const lowerTrend = trend.toLowerCase();
    if (lowerTrend.includes('gelişi') || lowerTrend.includes('artış') || lowerTrend.includes('pozitif')) {
      return '📈';
    }
    if (lowerTrend.includes('sabit') || lowerTrend.includes('değişmez')) {
      return '🎯';
    }
    return '⚠️';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {examInfo && (
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📚 Sınav Bilgileri
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Sınav Türü</p>
              <p className="text-lg font-semibold">{examInfo.exam_type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Bölüm</p>
              <p className="text-lg font-semibold">{examInfo.exam_section}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Skor</p>
              <p className="text-lg font-semibold text-blue-600">{examInfo.score.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tarih</p>
              <p className="text-lg font-semibold">
                {examInfo.completion_date 
                  ? new Date(examInfo.completion_date).toLocaleDateString('tr-TR')
                  : 'Bilinmiyor'
                }
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Weakness Level */}
      <Card padding="lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🎯 Zayıflık Analizi
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Genel Zayıflık Seviyesi</span>
            <Badge className={getWeaknessLevelColor(analysis.weakness_level || 0)}>
              {getWeaknessLevelText(analysis.weakness_level || 0)} ({analysis.weakness_level || 0}/10)
            </Badge>
          </div>
          <ProgressBar 
            value={((analysis.weakness_level || 0) / 10) * 100} 
            className="h-2"
          />
          <p className="text-sm text-gray-600">
            {analysis.detailed_analysis || 'Detaylı analiz bilgisi mevcut değil'}
          </p>
        </div>
      </Card>

      {/* Topics Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
              ⚠️ Zayıf Konular
            </h3>
          </div>
          {analysis.weak_topics && analysis.weak_topics.length > 0 ? (
            <div className="space-y-2">
              {analysis.weak_topics.map((topic, index) => (
                <Badge key={index} variant="destructive" className="mr-2 mb-2">
                  {topic}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Belirgin zayıf konu tespit edilmedi</p>
          )}
        </Card>

        {/* Strong Topics */}
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
              ✅ Güçlü Konular
            </h3>
          </div>
          {analysis.strong_topics && analysis.strong_topics.length > 0 ? (
            <div className="space-y-2">
              {analysis.strong_topics.map((topic, index) => (
                <Badge key={index} className="mr-2 mb-2 bg-green-100 text-green-800">
                  {topic}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Belirgin güçlü konu tespit edilmedi</p>
          )}
        </Card>
      </div>

      {/* Learning Trend */}
      <Card padding="lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {getTrendIcon(analysis.improvement_trend || '')} Öğrenme Trendi
          </h3>
        </div>
        <p className="text-sm">{analysis.improvement_trend || 'Trend bilgisi mevcut değil'}</p>
      </Card>

      {/* Recommendations */}
      <Card padding="lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            💡 Öneriler
          </h3>
        </div>
        {analysis.recommendations && analysis.recommendations.length > 0 ? (
          <ul className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Şu anda özel öneri bulunmuyor</p>
        )}
      </Card>

      {/* Personalized Insights */}
      {analysis.personalized_insights && analysis.personalized_insights.length > 0 && (
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              🔍 Kişisel İçgörüler
            </h3>
          </div>
          <ul className="space-y-2">
            {analysis.personalized_insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                <span className="text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* YouTube Video Recommendations */}
      {analysis.youtube_recommendations && 
       analysis.youtube_recommendations.recommendations && 
       analysis.youtube_recommendations.recommendations.length > 0 && (
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-red-600">
              📺 YouTube Video Önerileri
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Zayıf konularınız için önerilen eğitim videoları
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.youtube_recommendations.recommendations.slice(0, 6).map((video, index) => (
              <YouTubeVideoCard key={index} video={video} />
            ))}
          </div>
          {analysis.youtube_recommendations.search_strategy && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Arama Stratejisi:</strong> {analysis.youtube_recommendations.search_strategy}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Book Recommendations */}
      {analysis.book_recommendations && 
       analysis.book_recommendations.recommendations && 
       analysis.book_recommendations.recommendations.length > 0 && (
        <Card padding="lg">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-green-600">
              📚 Kitap Önerileri
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Zayıf konularınızı güçlendirmek için önerilen kitaplar
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.book_recommendations.recommendations.slice(0, 6).map((book, index) => (
              <BookCard key={index} book={book} />
            ))}
          </div>
          {analysis.book_recommendations.search_summary && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">
                <strong>Arama Özeti:</strong> {analysis.book_recommendations.search_summary}
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default ExamAnalysisResults;
