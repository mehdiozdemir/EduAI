import React, { useEffect, useState } from 'react';
import { performanceService } from '../services/performanceService';
import { subjectService } from '../services/subjectService';
import { educationService } from '../services/educationService';
import { useAuth } from '../hooks/useAuth';
import { PerformanceChart } from '../components/features/PerformanceChart';
import Card from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Badge } from '../components/ui/badge';
import { BookOpen, Play, ExternalLink, TrendingUp, Star, Check, Trash2, Target, BarChart3, User, Calendar, Award } from 'lucide-react';
import type { PerformanceAnalysis, PerformanceData, Subject, Topic, SortParams, PaginationParams } from '../types';

interface FilterParams {
  subject_id?: number;
  topic_id?: number;
  date_from?: string;
  date_to?: string;
}

export const PerformanceAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 10,
  });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<{
    [subjectId: string]: {
      subject_name: string;
      categories: {
        [key: string]: any[];
      };
    };
  }>({});
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Simplified: keep only quiz results section
  const activeTab: string = 'exams'; // Constant tab
  const performanceData: any[] = []; // Placeholder to satisfy references
  const trendsData: any[] = []; // Placeholder to satisfy references

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subjects for filter dropdown - separate try-catch to prevent blocking other data
        try {
          const subjectsData = await subjectService.getSubjects();
          setSubjects(subjectsData);
        } catch (subjectsError) {
          console.error('Error fetching subjects:', subjectsError);
          // Don't set error here, just log it - other data can still load
        }

        // Load topics if a subject filter is already set
        if (filters.subject_id) {
          try {
            const topicsData = await subjectService.getTopics(filters.subject_id);
            setTopics(topicsData);
          } catch (topicsError) {
            console.error('Error fetching topics for selected subject:', topicsError);
          }
        }

        // Fetch quiz results
        const quizResultsData = await educationService.getQuizResults({
          skip: (pagination.page - 1) * pagination.per_page,
          limit: pagination.per_page,
          course_id: filters.subject_id,
        });
        setQuizResults(quizResultsData);
        
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to load performance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, filters, sortParams, pagination, timePeriod]);

  const handleFilterChange = (key: keyof FilterParams, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handleSubjectChange = async (subjectId: string) => {
    const newSubjectId = subjectId ? parseInt(subjectId) : undefined;
    setFilters(prev => ({
      ...prev,
      subject_id: newSubjectId,
      topic_id: undefined, // Clear topic when subject changes
    }));
    setPagination(prev => ({ ...prev, page: 1 }));

    // Load topics for the selected subject
    if (newSubjectId) {
      try {
        const topicsData = await subjectService.getTopics(newSubjectId);
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching topics for subject:', error);
        setTopics([]); // Clear topics if error
      }
    } else {
      setTopics([]); // Clear topics when no subject is selected
    }
  };

  const handleSortChange = (sortBy: string) => {
    setSortParams(prev => ({
      sort_by: sortBy,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await performanceService.exportPerformanceData(user?.id, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `performance-data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({});
    setPagination({ page: 1, per_page: 10 });
  };

  const fetchRecommendations = async () => {
    if (!user?.id) return;
    
    try {
      setRecommendationsLoading(true);
      const data = await performanceService.getAllUserRecommendations();
      
      // Group recommendations by subject
      const groupedRecommendations: typeof recommendations = {};
      
      // Create a structure that groups by subject first, then by category
      Object.entries(data.data.categories).forEach(([category, categoryRecommendations]) => {
        categoryRecommendations.forEach((rec: any) => {
          // Use subject_id or create a default "Genel" subject
          const subjectId = rec.subject_id ? rec.subject_id.toString() : 'general';
          const subjectName = rec.subject_name || 'Genel Öneriler';
          
          if (!groupedRecommendations[subjectId]) {
            groupedRecommendations[subjectId] = {
              subject_name: subjectName,
              categories: {}
            };
          }
          
          if (!groupedRecommendations[subjectId].categories[category]) {
            groupedRecommendations[subjectId].categories[category] = [];
          }
          
          groupedRecommendations[subjectId].categories[category].push(rec);
        });
      });
      
      setRecommendations(groupedRecommendations);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Öneriler yüklenirken hata oluştu');
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleShowAnalysis = () => {
    fetchRecommendations();
  };

  // Helper function to safely format dates
  const formatDate = (dateValue: string | Date): string => {
    if (!dateValue) return 'Tarih yok';
    
    const date = new Date(dateValue);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date found:', dateValue);
      return 'Geçersiz tarih';
    }
    
    return date.toLocaleDateString('tr-TR');
  };

  // Helper functions to get names from IDs
  const getSubjectName = (subjectId: number): string => {
    if (!subjectId || subjectId === null || subjectId === undefined) {
      return 'Genel';
    }
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : `Ders #${subjectId}`;
  };

  const getTopicName = (topicId: number): string => {
    if (!topicId || topicId === null || topicId === undefined) {
      return 'Karma';
    }
    const topic = topics.find(t => t.id === topicId);
    return topic ? topic.name : `Konu #${topicId}`;
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
      setRecommendations(prev => {
        const newRecommendations = { ...prev };
        Object.keys(newRecommendations).forEach(subjectId => {
          Object.keys(newRecommendations[subjectId].categories).forEach(category => {
            newRecommendations[subjectId].categories[category] = 
              newRecommendations[subjectId].categories[category].filter((rec: any) => rec.id !== id);
            if (newRecommendations[subjectId].categories[category].length === 0) {
              delete newRecommendations[subjectId].categories[category];
            }
          });
          // Remove subject if no categories left
          if (Object.keys(newRecommendations[subjectId].categories).length === 0) {
            delete newRecommendations[subjectId];
          }
        });
        return newRecommendations;
      });
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
      setRecommendations(prev => {
        const newRecommendations = { ...prev };
        Object.keys(newRecommendations).forEach(subjectId => {
          Object.keys(newRecommendations[subjectId].categories).forEach(category => {
            newRecommendations[subjectId].categories[category] = 
              newRecommendations[subjectId].categories[category].filter((rec: any) => rec.id !== id);
            if (newRecommendations[subjectId].categories[category].length === 0) {
              delete newRecommendations[subjectId].categories[category];
            }
          });
          // Remove subject if no categories left
          if (Object.keys(newRecommendations[subjectId].categories).length === 0) {
            delete newRecommendations[subjectId];
          }
        });
        return newRecommendations;
      });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
    }
  };

  // Convert quiz data to chart data grouped by topic
  const getQuizChartData = (): PerformanceData[] => {
    console.log('Quiz Results Data:', quizResults); // Debug log
    
    if (!quizResults || quizResults.length === 0) {
      console.log('No quiz results found for chart');
      return [];
    }

    // Group quiz results by date and topic for time-based chart
    const chartDataByTime: PerformanceData[] = [];
    const quizByDate: { [key: string]: { [topic: string]: any[] } } = {};
    
    quizResults.forEach(quiz => {
      console.log('Processing quiz:', quiz); // Debug log
      
      // Create date key from completed_at or created_at with proper validation
      const dateField = quiz.completed_at || quiz.created_at;
      if (!dateField) {
        console.log('Quiz has no completed_at or created_at:', quiz);
        return; // Skip if no date
      }
      
      const quizDate = new Date(dateField);
      
      // Check if date is valid
      if (isNaN(quizDate.getTime())) {
        console.warn('Invalid date found in quiz:', dateField);
        return; // Skip invalid dates
      }
      
      const dateKey = quizDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      const topics = Array.isArray(quiz.topic_names) ? quiz.topic_names.join(', ') : (quiz.topic_names || 'Genel Konular');
      
      console.log('Date key:', dateKey, 'Topics:', topics); // Debug log
      
      if (!quizByDate[dateKey]) {
        quizByDate[dateKey] = {};
      }
      if (!quizByDate[dateKey][topics]) {
        quizByDate[dateKey][topics] = [];
      }
      quizByDate[dateKey][topics].push(quiz);
    });

    console.log('Quiz by date:', quizByDate); // Debug log

    // Convert to chart format with proper dates
    Object.entries(quizByDate).forEach(([dateKey, topicData]) => {
      Object.entries(topicData).forEach(([topic, quizzes]) => {
        const totalQuestions = quizzes.reduce((sum, quiz) => sum + (quiz.question_count || quiz.total_questions || quiz.total || 0), 0);
        const totalCorrect = quizzes.reduce((sum, quiz) => sum + (quiz.correct_answers || quiz.correct || 0), 0);
        const accuracy = totalQuestions > 0 ? Number(((totalCorrect / totalQuestions) * 100).toFixed(1)) : 0;
        
        const chartEntry = {
          date: dateKey,
          accuracy: accuracy,
          subject: quizzes[0]?.course_name || quizzes[0]?.subject || 'Genel',
          topic: topic,
        };
        
        console.log('Adding chart entry:', chartEntry); // Debug log
        chartDataByTime.push(chartEntry);
      });
    });

    console.log('Final chart data:', chartDataByTime); // Debug log
    
    // Sort by date
    return chartDataByTime.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Veri Yüklenemedi</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📊 Performans Analizi
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Öğrenme ilerlemenize dair ayrıntılı analizler ve kişisel öneriler
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={handleShowAnalysis}
                disabled={recommendationsLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {recommendationsLoading ? (
                  <div className="flex items-center">
                    <Loading />
                    <span className="ml-2">Yükleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Analizi Göster
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Export JSON
              </Button>
            </div>
          </div>


        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">📋 Toplam Quiz</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {quizResults.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">🏆 Ortalama Başarı</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {quizResults.length > 0 
                    ? (quizResults.reduce((sum, q) => sum + (q.percentage || 0), 0) / quizResults.length).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">⭐ En Yüksek Skor</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {quizResults.length > 0 
                    ? Math.max(...quizResults.map(q => q.percentage || 0)).toFixed(1)
                    : '0.0'
                  }%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center">
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                <Check className="w-8 h-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">✅ Toplam Doğru</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  {quizResults.reduce((sum, q) => sum + (q.correct_answers || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            ⚙️ Filtreleme & Seçenekler
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📚 Dersler
              </label>
              <select
                value={filters.subject_id || ''}
                onChange={(e) => handleSubjectChange(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg"
              >
                <option value="">Tüm Dersler</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📖 Konular {!filters.subject_id && '(Önce ders seçin)'}
              </label>
              <select
                value={filters.topic_id || ''}
                onChange={(e) => handleFilterChange('topic_id', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={!filters.subject_id}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Tüm Konular</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Başlangıç Tarihi
              </label>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date_from', e.target.value)}
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📅 Bitiş Tarihi
              </label>
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date_to', e.target.value)}
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⏱️ Zaman Periyodu
              </label>
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 shadow-lg"
              >
                <option value="week">Son 1 Hafta</option>
                <option value="month">Son 1 Ay</option>
                <option value="quarter">Son 3 Ay</option>
                <option value="year">Son 1 Yıl</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex space-x-3">
              <Button
                variant={chartType === 'line' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType('line')}
                className={`px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  chartType === 'line'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50'
                }`}
              >
                📈 Çizgi Grafiği
              </Button>
              <Button
                variant={chartType === 'bar' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType('bar')}
                className={`px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  chartType === 'bar'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50'
                }`}
              >
                📊 Çubuk Grafiği
              </Button>
              <Button
                variant={chartType === 'doughnut' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType('doughnut')}
                className={`px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                  chartType === 'doughnut'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50'
                }`}
              >
                🍩 Donut Tablosu
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="bg-white/80 backdrop-blur-sm border-2 border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              🧹 Filtreleri Temizle
            </Button>
          </div>
        </div>

        {/* Performance Trends Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mr-4">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Quiz Sonuçları Performansı
            </h3>
          </div>
          
          {getQuizChartData().length > 0 ? (
              <>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    📊 {getQuizChartData().length} veri noktası bulundu - Grafik oluşturuluyor...
                  </p>
                </div>
                <PerformanceChart
                  data={getQuizChartData()}
                  type={chartType}
                  height={400}
                  showLegend={true}
                  title="Konu Bazında Performans - Zaman İçindeki Konu Bazında Başarı Oranları"
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-6">📊</div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Grafik Verisi Bulunamadı</h3>
                <p className="text-gray-500 text-lg">Quiz sonuçlarınız yüklendiğinde burada konu bazında performans grafiği görünecek.</p>
                
                {/* Debug information */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left max-w-2xl mx-auto">
                  <h4 className="font-semibold text-yellow-800 mb-2">🔍 Debug Bilgileri:</h4>
                  <p className="text-sm text-yellow-700">Quiz Results Sayısı: {quizResults?.length || 0}</p>
                  <p className="text-sm text-yellow-700">Chart Data Sayısı: {getQuizChartData().length}</p>
                  {quizResults && quizResults.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-yellow-700">İlk Quiz Örneği:</p>
                      <pre className="text-xs text-yellow-600 bg-yellow-100 p-2 rounded mt-1 overflow-auto max-h-32">
                        {JSON.stringify(quizResults[0], null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
          )}
        </div>

        {/* Performance History Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mr-4">
                <Award className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                📈 {activeTab === 'general' ? 'Performans Geçmişi' : 'Sınav Geçmişi'}
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-600 bg-white/80 px-3 py-2 rounded-xl shadow-lg">
                🎯 {activeTab === 'general' ? performanceData.length : quizResults.length} sonuç görüntüleniyor
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-lg border border-white/30">
            <table className="min-w-full bg-white/80 backdrop-blur-sm">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors rounded-tl-2xl"
                    onClick={() => handleSortChange('created_at')}
                  >
                    📅 Tarih
                    {sortParams.sort_by === 'created_at' && (
                      <span className="ml-2 text-yellow-300">
                        {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  {activeTab === 'general' ? (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        📚 Ders
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        📖 Konu
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                        onClick={() => handleSortChange('total_questions')}
                      >
                        ❓ Sorular
                        {sortParams.sort_by === 'total_questions' && (
                          <span className="ml-2 text-yellow-300">
                            {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                        onClick={() => handleSortChange('correct_answers')}
                      >
                        ✅ Doğru
                        {sortParams.sort_by === 'correct_answers' && (
                          <span className="ml-2 text-yellow-300">
                            {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                        onClick={() => handleSortChange('accuracy')}
                      >
                        🎯 Doğruluk
                        {sortParams.sort_by === 'accuracy' && (
                          <span className="ml-2 text-yellow-300">
                            {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors rounded-tr-2xl"
                        onClick={() => handleSortChange('weakness_level')}
                      >
                        📊 Zayıflık Seviye
                        {sortParams.sort_by === 'weakness_level' && (
                          <span className="ml-2 text-yellow-300">
                            {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        � Ders
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        📖 Konular
                      </th>
                      <th
                        className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider cursor-pointer hover:bg-blue-600/20 transition-colors"
                        onClick={() => handleSortChange('percentage')}
                      >
                        🏆 Başarı Oranı
                        {sortParams.sort_by === 'percentage' && (
                          <span className="ml-2 text-yellow-300">
                            {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">
                        📊 Doğru/Yanlış/Boş
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider rounded-tr-2xl">
                        ⏱️ Süre
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white/90 backdrop-blur-sm divide-y divide-gray-200/50">
                {(activeTab === 'general' ? performanceData : quizResults).map((item, index) => (
                  <tr key={activeTab === 'general' ? item.id : item.id} className={`hover:bg-blue-50/80 transition-colors ${
                    index % 2 === 0 ? 'bg-white/50' : 'bg-gray-50/50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      📅 {formatDate(activeTab === 'general' ? item.created_at : (item.completed_at || item.created_at))}
                    </td>
                    {activeTab === 'general' ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          📚 {getSubjectName(item.subject_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          📖 {getTopicName(item.topic_id)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.total_questions || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          {item.correct_answers || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4 max-w-[120px] shadow-inner">
                              <div
                                className={`h-3 rounded-full shadow-lg ${
                                  (item.accuracy || 0) >= 80
                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                    : (item.accuracy || 0) >= 60
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                    : 'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${item.accuracy || 0}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${
                              (item.accuracy || 0) >= 80 ? 'text-green-600' : 
                              (item.accuracy || 0) >= 60 ? 'text-orange-500' : 'text-red-600'
                            }`}>
                              {(item.accuracy || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span
                            className={`inline-flex px-3 py-2 text-xs font-bold rounded-xl shadow-lg ${
                              (item.weakness_level || 0) <= 3
                                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
                                : (item.weakness_level || 0) <= 6
                                ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
                                : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300'
                            }`}
                          >
                            {item.weakness_level || 0}/10
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          � {item.course_name || 'Bilinmiyor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          📖 {item.topic_names ? item.topic_names.join(', ') : 'Karma'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-3 mr-4 max-w-[120px] shadow-inner">
                              <div
                                className={`h-3 rounded-full shadow-lg ${
                                  (item.percentage || 0) >= 80
                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                    : (item.percentage || 0) >= 60
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                    : 'bg-gradient-to-r from-red-400 to-red-600'
                                }`}
                                style={{ width: `${Math.min(100, item.percentage || 0)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-bold ${
                              (item.percentage || 0) >= 80 ? 'text-green-600' : 
                              (item.percentage || 0) >= 60 ? 'text-orange-500' : 'text-red-600'
                            }`}>
                              {(item.percentage || 0).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-1 text-xs">
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">✅ {item.correct_answers || 0}</span>
                            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded-lg">❌ {item.wrong_answers || 0}</span>
                            <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-lg">⚪ {item.blank_answers || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-xs font-medium">
                            ⏱️ {item.time_spent ? `${Math.floor(item.time_spent / 60)}:${(item.time_spent % 60).toString().padStart(2, '0')}` : '-'}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        {(activeTab === 'general' ? performanceData.length === 0 : quizResults.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Veri bulunamadı</h3>
            <p className="text-gray-500 text-lg mb-6">
              {activeTab === 'general' 
                ? 'Seçilen filtreler için performans verisi bulunamadı.'
                : 'Henüz çözülmüş quiz bulunamadı. Quiz çözerek performansını takip etmeye başla!'
              }
            </p>
            <Button 
              variant="outline" 
              className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
              onClick={clearFilters}
            >
              🧹 Filtreleri Temizle
            </Button>
          </div>
        )}

        {/* Pagination */}
        {(activeTab === 'general' ? performanceData.length > 0 : quizResults.length > 0) && (
          <div className="flex items-center justify-between mt-8 bg-white/50 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">📄 Göster</span>
              <select
                value={pagination.per_page}
                onChange={(e) => setPagination(prev => ({ ...prev, per_page: parseInt(e.target.value), page: 1 }))}
                className="px-3 py-2 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl text-sm shadow-lg focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm font-medium text-gray-700">sayfa başına</span>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                ⬅️ Önceki
              </Button>
              <span className="text-sm font-bold text-gray-700 bg-white/80 px-4 py-2 rounded-xl shadow-lg">
                📄 Sayfa {pagination.page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={
                  activeTab === 'general' 
                    ? performanceData.length < pagination.per_page
                    : quizResults.length < pagination.per_page
                }
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-200 hover:bg-blue-50 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                Sonraki ➡️
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      {showRecommendations && (
        <div className="space-y-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              🎯 Kişiselleştirilmiş Öneriler
            </h2>
            {recommendationsLoading ? (
              <div className="text-center py-12">
                <Loading />
                <p className="mt-4 text-gray-600 text-lg">Öneriler yükleniyor...</p>
              </div>
            ) : Object.keys(recommendations).length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-6 text-gray-400" />
                <h3 className="text-xl font-semibold mb-3 text-gray-700">Henüz öneri yok</h3>
                <p className="text-gray-600 text-lg">
                  Sınav çözmeye başladığınızda, performansınıza göre kişiselleştirilmiş öneriler burada görünecek.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(recommendations).map(([subjectId, subjectData]) => (
                  <div key={subjectId} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-200">
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                      <BookOpen className="w-7 h-7 mr-3 text-blue-500" />
                      📚 {subjectData.subject_name}
                    </h3>
                    
                    <div className="space-y-6">
                      {Object.entries(subjectData.categories).map(([category, categoryRecommendations]) => (
                        <div key={category} className={`p-6 rounded-2xl shadow-lg ${getCategoryColor(category)}`}>
                          <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                              {getCategoryIcon(category)}
                              <h4 className="text-xl font-semibold">{getCategoryTitle(category)}</h4>
                              <Badge variant="outline" className="text-sm font-medium">
                                {categoryRecommendations.length} öneri
                              </Badge>
                            </div>
                          </div>

                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {categoryRecommendations.map((rec: any) => (
                              <div key={rec.id} className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/50">
                                <div className="flex items-start gap-4">
                                  {getResourceIcon(rec.resource_type)}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Badge className={`text-xs font-medium ${getResourceBadgeColor(rec.resource_type)}`}>
                                        {rec.resource_type === 'youtube' ? 'Video' : 
                                         rec.resource_type === 'book' ? 'Kitap' : 
                                         rec.resource_type === 'ai_advice' ? 'AI Önerisi' : 'Diğer'}
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500" />
                                        <span className="text-sm text-gray-600 font-medium">
                                          {(rec.relevance_score * 10).toFixed(0)}/10
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <h5 className="font-semibold text-base mb-3 line-clamp-2 text-gray-800">
                                      {rec.title}
                                    </h5>
                                    
                                    {rec.description && (
                                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                        {rec.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                      {rec.resource_type === 'ai_advice' ? (
                                        <div className="text-sm text-green-600 font-medium flex-1 bg-green-50 px-3 py-2 rounded-lg">
                                          💡 AI Tavsiyesi
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
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
                                        className="px-3 border-green-300 hover:bg-green-50 rounded-lg"
                                        onClick={() => handleCompleteRecommendation(rec.id)}
                                        title="Tamamlandı olarak işaretle"
                                      >
                                        <Check className="w-4 h-4 text-green-600" />
                                      </Button>
                                      
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="px-3 border-red-300 hover:bg-red-50 rounded-lg"
                                        onClick={() => handleDeleteRecommendation(rec.id)}
                                        title="Öneriyi sil"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default PerformanceAnalysisPage;