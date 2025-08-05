import React from 'react';
import Card from '../ui/Card';

interface AnalysisData {
  weakness_level: number;
  weak_topics: string[];
  strong_topics: string[];
  recommendations: string[];
  detailed_analysis: string;
  personalized_insights: string[];
  improvement_trend: string;
}

interface ExamInfo {
  exam_id: number;
  exam_type: string;
  exam_section: string;
  score: number;
  completion_date?: string;
}

interface ExamAnalysisResultsProps {
  analysis: AnalysisData;
  examInfo?: ExamInfo;
  loading?: boolean;
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

const ExamAnalysisResults: React.FC<ExamAnalysisResultsProps> = ({
  analysis,
  examInfo,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
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

  const getTrendIcon = (trend: string) => {
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
            <Badge className={getWeaknessLevelColor(analysis.weakness_level)}>
              {getWeaknessLevelText(analysis.weakness_level)} ({analysis.weakness_level}/10)
            </Badge>
          </div>
          <ProgressBar 
            value={(analysis.weakness_level / 10) * 100} 
            className="h-2"
          />
          <p className="text-sm text-gray-600">
            {analysis.detailed_analysis}
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
          {analysis.weak_topics.length > 0 ? (
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
          {analysis.strong_topics.length > 0 ? (
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
            {getTrendIcon(analysis.improvement_trend)} Öğrenme Trendi
          </h3>
        </div>
        <p className="text-sm">{analysis.improvement_trend}</p>
      </Card>

      {/* Recommendations */}
      <Card padding="lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            💡 Öneriler
          </h3>
        </div>
        {analysis.recommendations.length > 0 ? (
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
      {analysis.personalized_insights.length > 0 && (
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
    </div>
  );
};

export default ExamAnalysisResults;
