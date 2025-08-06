import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import { Badge } from '../components/ui/badge';
import Button from '../components/ui/Button';
import { BookOpen, Play, ExternalLink, TrendingUp, Star, Check, Trash2, Target, Search, Grid3X3, List } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter and search functions
  const getFilteredRecommendations = () => {
    let filtered = categories;
    
    if (selectedCategory !== 'all') {
      filtered = { [selectedCategory]: categories[selectedCategory] || [] };
    }
    
    if (searchTerm) {
      const searchFiltered: {[key: string]: ResourceRecommendation[]} = {};
      Object.entries(filtered).forEach(([category, recs]) => {
        const matchingRecs = recs.filter(rec => 
          rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingRecs.length > 0) {
          searchFiltered[category] = matchingRecs;
        }
      });
      filtered = searchFiltered;
    }
    
    // Global deduplication across all categories by title
    const allSeenTitles = new Set<string>();
    const deduplicatedFiltered: {[key: string]: ResourceRecommendation[]} = {};
    
    Object.entries(filtered).forEach(([category, recs]) => {
      const uniqueRecs = recs.filter(rec => {
        const titleLower = rec.title.toLowerCase().trim();
        if (allSeenTitles.has(titleLower)) {
          return false; // Skip duplicate across all categories
        }
        allSeenTitles.add(titleLower);
        return true;
      });
      
      if (uniqueRecs.length > 0) {
        deduplicatedFiltered[category] = uniqueRecs;
      }
    });
    
    return deduplicatedFiltered;
  };

  const getStatistics = () => {
    const filtered = getFilteredRecommendations();
    const totalFiltered = Object.values(filtered).reduce((sum, recs) => sum + recs.length, 0);
    const categoryCount = Object.keys(filtered).length;
    
    // Calculate average relevance score
    const allRecs = Object.values(filtered).flat();
    const avgScore = allRecs.length > 0 
      ? allRecs.reduce((sum, rec) => sum + rec.relevance_score, 0) / allRecs.length 
      : 0;
    
    return { totalFiltered, categoryCount, avgScore };
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              🎯 Kişiselleştirilmiş Önerilerim
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Performansınıza özel hazırlanmış öğrenme kaynakları ve AI tavsiyeleri
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{totalRecommendations}</div>
              <div className="text-sm text-gray-600">Toplam Öneri</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{Object.keys(categories).length}</div>
              <div className="text-sm text-gray-600">Kategori</div>
            </Card>
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {getStatistics().avgScore > 0 ? `${(getStatistics().avgScore * 10).toFixed(1)}` : '0'}
              </div>
              <div className="text-sm text-gray-600">Ortalama Puan</div>
            </Card>
          </div>

          {/* Filter and Search Bar */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Öneri ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[160px]"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="video">🎥 Video</option>
                <option value="books">📚 Kitap</option>
                <option value="ai_tips">🤖 AI Tavsiyeleri</option>
              </select>

              {/* View Toggle */}
              <div className="flex rounded-xl border border-gray-200 bg-white">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-0"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none border-0"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        {Object.keys(getFilteredRecommendations()).length === 0 ? (
          <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <TrendingUp className="w-16 h-16 mx-auto mb-6 text-gray-400" />
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              {searchTerm || selectedCategory !== 'all' ? 'Arama sonucu bulunamadı' : 'Henüz öneri yok'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Farklı bir arama terimi veya kategori deneyin.'
                : 'Sınav çözmeye başladığınızda, performansınıza göre kişiselleştirilmiş öneriler burada görünecek.'
              }
            </p>
            {(searchTerm || selectedCategory !== 'all') && (
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="mx-auto"
              >
                Filtreleri Temizle
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(getFilteredRecommendations()).map(([category, recommendations]) => (
              <Card key={category} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg overflow-hidden">
                {/* Category Header */}
                <div className={`p-6 ${getCategoryColor(category)} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getCategoryIcon(category)}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">{getCategoryTitle(category)}</h2>
                        <p className="text-gray-600 mt-1">{recommendations.length} aktif öneri</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-medium">
                      {((recommendations.reduce((sum, rec) => sum + rec.relevance_score, 0) / recommendations.length) * 10).toFixed(1)}/10
                    </Badge>
                  </div>
                </div>

                {/* Recommendations Grid */}
                <div className="p-6">
                  <div className={viewMode === 'grid' 
                    ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" 
                    : "space-y-4"
                  }>
                    {recommendations.map((rec) => (
                      <Card key={rec.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white">
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
                              {getResourceIcon(rec.resource_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`text-xs ${getResourceBadgeColor(rec.resource_type)}`}>
                                  {rec.resource_type === 'youtube' ? '🎥 Video' : 
                                   rec.resource_type === 'book' ? '📚 Kitap' : 
                                   rec.resource_type === 'ai_advice' ? '🤖 AI Önerisi' : '📄 Diğer'}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-xs font-medium text-gray-700">
                                    {(rec.relevance_score * 10).toFixed(1)}
                                  </span>
                                </div>
                              </div>
                              
                              <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {rec.title}
                              </h4>
                            </div>
                          </div>
                          
                          {/* Description */}
                          {rec.description && (
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                              {rec.description}
                            </p>
                          )}
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                            {rec.resource_type === 'ai_advice' ? (
                              <div className="flex-1 text-sm text-green-600 font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                AI Tavsiyesi
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                className="flex-1 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                                onClick={() => window.open(rec.url, '_blank')}
                                disabled={!rec.url}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                {rec.resource_type === 'youtube' ? 'İzle' : 'İncele'}
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCompleteRecommendation(rec.id)}
                              className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                              title="Tamamlandı"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRecommendation(rec.id)}
                              className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;