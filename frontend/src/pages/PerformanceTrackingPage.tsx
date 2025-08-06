import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../components/ui/Loading';
import { useErrorHandler } from '../components/ui/ErrorBoundaryProvider';
import { educationService } from '../services/educationService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface QuizResult {
  id: number;
  course_id: number;
  course_name: string;
  education_level: string;
  topic_names: string[];
  difficulty: string;
  question_count: number;
  correct_answers: number;
  wrong_answers: number;
  blank_answers: number;
  percentage: number;
  time_spent: number;
  completed_at: string;
}

interface PerformanceStats {
  total_quizzes: number;
  average_percentage: number;
  best_percentage: number;
  total_questions: number;
  total_correct: number;
  total_wrong: number;
  total_blank: number;
  favorite_difficulty: string;
  most_studied_course: string;
}

export const PerformanceTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'kolay' | 'orta' | 'zor'>('all');
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedFilter, selectedCourse]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [resultsResponse, statsResponse] = await Promise.all([
        educationService.getQuizResults({
          difficulty: selectedFilter === 'all' ? undefined : selectedFilter,
          course_id: selectedCourse || undefined
        }),
        educationService.getPerformanceStats()
      ]);
      
      setQuizResults(resultsResponse);
      setPerformanceStats(statsResponse);
    } catch (error: any) {
      console.error('Performance data loading error:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'kolay': return 'bg-green-100 text-green-800';
      case 'orta': return 'bg-yellow-100 text-yellow-800';
      case 'zor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Performans verileri yükleniyor..." />
        </div>
      </div>
    );
  }

  // Chart data preparation
  const prepareChartData = () => {
    if (!performanceStats || quizResults.length === 0) return null;

    // Performance trend data (last 10 quizzes)
    const recentQuizzes = quizResults.slice(0, 10).reverse();
    const trendData = {
      labels: recentQuizzes.map((_, index) => `Sınav ${index + 1}`),
      datasets: [
        {
          label: 'Başarı Oranı (%)',
          data: recentQuizzes.map(quiz => quiz.percentage),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Answer distribution data
    const answerDistributionData = {
      labels: ['Doğru', 'Yanlış', 'Boş'],
      datasets: [
        {
          data: [performanceStats.total_correct, performanceStats.total_wrong, performanceStats.total_blank],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(249, 115, 22, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };

    // Difficulty distribution
    const difficultyStats = quizResults.reduce((acc, quiz) => {
      acc[quiz.difficulty] = (acc[quiz.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyData = {
      labels: Object.keys(difficultyStats),
      datasets: [
        {
          label: 'Sınav Sayısı',
          data: Object.values(difficultyStats),
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(249, 115, 22, 1)',
            'rgba(239, 68, 68, 1)',
          ],
          borderWidth: 2,
        },
      ],
    };

    return { trendData, answerDistributionData, difficultyData };
  };

  const chartData = prepareChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📊 Performans Takibi
              </h1>
              <p className="text-gray-600 mt-1">Sınav sonuçlarınızı analiz edin ve gelişiminizi takip edin</p>
            </div>
            <button
              onClick={() => navigate('/app/subjects')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 Yeni Sınav Başlat
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Performance Stats */}
        {performanceStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">📚 Toplam Sınav</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {performanceStats.total_quizzes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">📈 Ortalama Başarı</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {performanceStats.average_percentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">🏆 En İyi Skor</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {performanceStats.best_percentage}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">❓ Toplam Soru</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {performanceStats.total_questions}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {performanceStats && chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Trend Chart */}
            <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📈 Performans Trendi
                </h3>
              </div>
              <div className="h-80">
                <Line data={chartData.trendData} options={chartOptions} />
              </div>
            </div>

            {/* Answer Distribution Chart */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  🎯 Cevap Dağılımı
                </h3>
              </div>
              <div className="h-80">
                <Doughnut data={chartData.answerDistributionData} options={doughnutOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Additional Charts */}
        {performanceStats && chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Difficulty Distribution */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ⚡ Zorluk Dağılımı
                </h3>
              </div>
              <div className="h-64">
                <Bar data={chartData.difficultyData} options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }} />
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎖️ Tercihler & İstatistikler
                </h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50">
                  <p className="text-sm font-medium text-gray-600 mb-2">🎯 En Çok Tercih Edilen Zorluk</p>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${getDifficultyColor(performanceStats.favorite_difficulty)}`}>
                    {performanceStats.favorite_difficulty || 'Henüz veri yok'}
                  </span>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                  <p className="text-sm font-medium text-gray-600 mb-2">📚 En Çok Çalışılan Ders</p>
                  <p className="font-bold text-gray-900 text-lg">{performanceStats.most_studied_course || 'Henüz veri yok'}</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200/50">
                    <div className="text-2xl font-bold text-green-600">{performanceStats.total_correct}</div>
                    <div className="text-xs text-green-700 font-medium">✅ Doğru</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl border border-red-200/50">
                    <div className="text-2xl font-bold text-red-600">{performanceStats.total_wrong}</div>
                    <div className="text-xs text-red-700 font-medium">❌ Yanlış</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-xl border border-orange-200/50">
                    <div className="text-2xl font-bold text-orange-600">{performanceStats.total_blank}</div>
                    <div className="text-xs text-orange-700 font-medium">⭕ Boş</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-6">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">🎯 Zorluk Seviyesi Filtresi</label>
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value as any)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="all">🌟 Tümü</option>
                  <option value="kolay">🟢 Kolay</option>
                  <option value="orta">🟡 Orta</option>
                  <option value="zor">🔴 Zor</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Results */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  📋 Sınav Geçmişi
                </h2>
                <p className="text-gray-600 text-sm mt-1">Tüm sınav sonuçlarınızın detaylı listesi</p>
              </div>
            </div>
          </div>

          {quizResults.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                🎯 Henüz sınav sonucu yok
              </h3>
              <p className="text-gray-600 mb-6 text-lg">İlk sınavınızı tamamladığınızda sonuçlar burada görünecek.</p>
              <button
                onClick={() => navigate('/app/subjects')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚀 İlk Sınavımı Başlat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/50">
              {quizResults.map((result, index) => (
                <div key={result.id} className="p-6 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {result.course_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${getDifficultyColor(result.difficulty)}`}>
                          {result.difficulty === 'kolay' ? '🟢 Kolay' : result.difficulty === 'orta' ? '🟡 Orta' : '🔴 Zor'}
                        </span>
                        <span className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-sm font-medium rounded-full shadow-sm">
                          📚 {result.education_level}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.topic_names.map((topic, topicIndex) => (
                          <span key={topicIndex} className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm rounded-full font-medium shadow-sm">
                            📖 {topic}
                          </span>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200/50">
                          <p className="text-green-600 font-medium text-sm mb-1">🎯 Başarı Oranı</p>
                          <p className={`font-bold text-2xl ${getPerformanceColor(result.percentage)}`}>
                            {result.percentage}%
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200/50">
                          <p className="text-blue-600 font-medium text-sm mb-1">✅ Doğru/Toplam</p>
                          <p className="font-bold text-2xl text-blue-600">
                            {result.correct_answers}/{result.question_count}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200/50">
                          <p className="text-orange-600 font-medium text-sm mb-1">❌ Yanlış/Boş</p>
                          <p className="font-bold text-2xl text-orange-600">
                            {result.wrong_answers}/{result.blank_answers}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200/50">
                          <p className="text-purple-600 font-medium text-sm mb-1">⏱️ Süre</p>
                          <p className="font-bold text-2xl text-purple-600">{formatTime(result.time_spent)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-6 flex flex-col items-end">
                      <p className="text-sm text-gray-500 mb-3 bg-gray-100 px-3 py-1 rounded-full">
                        📅 {formatDate(result.completed_at)}
                      </p>
                      <button
                        onClick={() => navigate(`/app/performance/quiz/${result.id}`)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        🔍 Detayları Gör
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceTrackingPage;