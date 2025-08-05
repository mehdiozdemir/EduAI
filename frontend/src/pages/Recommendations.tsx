import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/badge';
import Button from '../components/ui/Button';
import { BookOpen, Play, ExternalLink, Calendar, TrendingUp, Star, Check, Trash2, Target } from 'lucide-react';
import { performanceService } from '../services/performanceService';

interface ResourceRecommendation {
  id: number;
  resource_type: string;
  title: string;
  url: string;
  description: string;
  relevance_score: number;
  category: string;
  created_at: string;
}

interface RecommendationsResponse {
  status: string;
  data: {
    total_recommendations: number;
    categories: {
      [key: string]: ResourceRecommendation[];
    };
  };
}

const Recommendations = () => {
  const [categories, setCategories] = useState<{[key: string]: ResourceRecommendation[]}>({});
  const [totalRecommendations, setTotalRecommendations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const data: RecommendationsResponse = await performanceService.getAllUserRecommendations();
      setCategories(data.data.categories);
      setTotalRecommendations(data.data.total_recommendations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'video':
        return <Play className="w-5 h-5 text-red-500" />;
      case 'books':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'ai_tips':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'video':
        return 'Video Önerileri';
      case 'books':
        return 'Kitap Önerileri';
      case 'ai_tips':
        return 'AI Tavsiyeleri';
      default:
        return 'Genel Öneriler';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'video':
        return 'border-red-200 bg-red-50';
      case 'books':
        return 'border-blue-200 bg-blue-50';
      case 'ai_tips':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'youtube':
        return <Play className="w-4 h-4 text-red-500" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'ai_advice':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <ExternalLink className="w-4 h-4 text-gray-500" />;
    }
  };

  const getResourceBadgeColor = (type: string) => {
    switch (type) {
      case 'youtube':
        return 'bg-red-100 text-red-800';
      case 'book':
        return 'bg-blue-100 text-blue-800';
      case 'ai_advice':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCompleteRecommendation = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/v1/performance/recommendation/${id}/status?status_param=completed`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eduai_access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Remove from current view
      setCategories(prev => {
        const newCategories = { ...prev };
        Object.keys(newCategories).forEach(category => {
          newCategories[category] = newCategories[category].filter(rec => rec.id !== id);
          if (newCategories[category].length === 0) {
            delete newCategories[category];
          }
        });
        return newCategories;
      });
      
      setTotalRecommendations(prev => prev - 1);
    } catch (error) {
      console.error('Error completing recommendation:', error);
    }
  };

  const handleDeleteRecommendation = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/v1/performance/recommendation/${id}/status?status_param=deleted`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eduai_access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      // Remove from current view
      setCategories(prev => {
        const newCategories = { ...prev };
        Object.keys(newCategories).forEach(category => {
          newCategories[category] = newCategories[category].filter(rec => rec.id !== id);
          if (newCategories[category].length === 0) {
            delete newCategories[category];
          }
        });
        return newCategories;
      });
      
      setTotalRecommendations(prev => prev - 1);
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Öneriler yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={fetchRecommendations} className="mt-4">
            Tekrar Dene
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kişiselleştirilmiş Önerilerim</h1>
        <p className="text-gray-600 mb-4">
          Size özel hazırlanmış öğrenme kaynakları ve tavsiyeleri
        </p>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            Toplam {totalRecommendations} aktif öneri
          </Badge>
          <Badge variant="outline" className="text-sm text-green-600">
            {Object.keys(categories).length} kategori
          </Badge>
        </div>
      </div>

      {Object.keys(categories).length === 0 ? (
        <Card className="p-8 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Henüz öneri yok</h3>
          <p className="text-gray-600">
            Sınav çözmeye başladığınızda, performansınıza göre kişiselleştirilmiş öneriler burada görünecek.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(categories).map(([category, recommendations]) => (
            <Card key={category} className={`p-6 ${getCategoryColor(category)}`}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(category)}
                  <h2 className="text-xl font-semibold">{getCategoryTitle(category)}</h2>
                  <Badge variant="outline" className="text-xs">
                    {recommendations.length} öneri
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec) => (
                  <Card key={rec.id} className="p-4 bg-white hover:shadow-md transition-shadow border-0">
                    <div className="flex items-start gap-3">
                      {getResourceIcon(rec.resource_type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-xs ${getResourceBadgeColor(rec.resource_type)}`}>
                            {rec.resource_type === 'youtube' ? 'Video' : 
                             rec.resource_type === 'book' ? 'Kitap' : 
                             rec.resource_type === 'ai_advice' ? 'AI Önerisi' : 'Diğer'}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs text-gray-600">
                              {(rec.relevance_score * 10).toFixed(0)}/10
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2 line-clamp-2">
                          {rec.title}
                        </h4>
                        
                        {rec.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                            {rec.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {rec.resource_type === 'ai_advice' ? (
                            <div className="text-xs text-green-600 font-medium flex-1">
                              💡 AI Tavsiyesi
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs flex-1"
                              onClick={() => window.open(rec.url, '_blank')}
                              disabled={!rec.url}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              {rec.resource_type === 'youtube' ? 'İzle' : 'İncele'}
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2"
                            onClick={() => handleCompleteRecommendation(rec.id)}
                            title="Tamamlandı olarak işaretle"
                          >
                            <Check className="w-3 h-3 text-green-600" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2"
                            onClick={() => handleDeleteRecommendation(rec.id)}
                            title="Öneriyi sil"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;