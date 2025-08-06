import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, type PracticeExam } from '../services/examService';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
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

const PracticeExamHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<PracticeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userExams, examStats] = await Promise.all([
        examService.getUserPracticeExams(),
        examService.getExamStatistics()
      ]);

      setExams(userExams);
      setStatistics(examStats);
    } catch (err) {
      console.error('Error loading exam history:', err);
      setError('Sınav geçmişi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      default:
        return 'Başlanmadı';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewResults = (examId: number) => {
    navigate(`/app/practice-exam/${examId}/results`);
  };

  const continueExam = (examId: number) => {
    navigate(`/app/practice-exam/${examId}`);
  };

  // Chart data preparation
  const prepareChartData = () => {
    if (!statistics || exams.length === 0) return null;

    // Performance trend data (last 10 exams)
    const recentExams = exams.filter(exam => exam.status === 'completed').slice(0, 10).reverse();
    const trendData = {
      labels: recentExams.map((_, index) => `Sınav ${index + 1}`),
      datasets: [
        {
          label: 'Başarı Oranı (%)',
          data: recentExams.map(exam => exam.score),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };

    // Answer distribution data
    const totalCorrect = exams.reduce((sum, exam) => sum + (exam.correct_answers || 0), 0);
    const totalWrong = exams.reduce((sum, exam) => sum + (exam.wrong_answers || 0), 0);
    const totalEmpty = exams.reduce((sum, exam) => sum + (exam.empty_answers || 0), 0);

    const answerDistributionData = {
      labels: ['Doğru', 'Yanlış', 'Boş'],
      datasets: [
        {
          data: [totalCorrect, totalWrong, totalEmpty],
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

    // Exam type distribution
    const examTypeData = statistics?.performance_by_type ? {
      labels: Object.keys(statistics.performance_by_type),
      datasets: [
        {
          label: 'Ortalama Başarı (%)',
          data: Object.values(statistics.performance_by_type).map((data: any) => data.average),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 101, 101, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(249, 115, 22, 0.8)',
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 101, 101, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(249, 115, 22, 1)',
          ],
          borderWidth: 2,
        },
      ],
    } : null;

    return { trendData, answerDistributionData, examTypeData };
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loading size="lg" />
          <p className="mt-4 text-lg font-medium text-gray-600">Sınav geçmişi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                📚 Sınav Geçmişi
              </h1>
              <p className="text-lg text-gray-600">
                Daha önce çözdüğünüz sınavları görüntüleyin ve performansınızı analiz edin
              </p>
            </div>
            <button
              onClick={() => navigate('/app/practice-exam')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🎯 Yeni Sınav Çöz
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Statistics Overview */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">📚 Toplam Sınav</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {statistics?.total_exams || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">✅ Tamamlanan</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {statistics?.completed_exams || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">📊 Ortalama Puan</p>
                  <p className={`text-3xl font-bold ${getScoreColor(statistics?.average_score || 0)}`}>
                    {(statistics?.average_score || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">🏆 En Yüksek Puan</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {(statistics?.best_score || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {statistics && chartData && exams.length > 0 && (
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

        {/* Exam Type Performance Chart */}
        {statistics && chartData?.examTypeData && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 mb-8">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                📊 Sınav Türüne Göre Performans
              </h3>
            </div>
            <div className="h-64">
              <Bar data={chartData.examTypeData} options={{
                ...chartOptions,
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                  },
                },
              }} />
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl shadow-lg">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
              <button 
                onClick={() => setError(null)} 
                className="ml-auto p-1 hover:bg-red-200 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              📝 Henüz Sınav Çözmediniz
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              İlk sınavınızı çözerek başlayın ve ilerlemenizi takip edin
            </p>
            <button
              onClick={() => navigate('/app/practice-exam')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              🚀 İlk Sınavımı Çöz
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {exams.map((exam, index) => (
              <div
                key={exam.id}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {exam.name}
                      </h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-sm ${getStatusColor(exam.status)}`}>
                        {exam.status === 'completed' ? '✅ Tamamlandı' : 
                         exam.status === 'in_progress' ? '⏳ Devam Ediyor' : '🔄 Başlanmadı'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-200/50">
                        <p className="text-blue-600 font-medium text-sm mb-1">📚 Sınav Türü</p>
                        <p className="font-bold text-blue-800">{exam.exam_type_name}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200/50">
                        <p className="text-purple-600 font-medium text-sm mb-1">📅 Tarih</p>
                        <p className="font-bold text-purple-800 text-sm">{formatDate(exam.created_at)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200/50">
                        <p className="text-green-600 font-medium text-sm mb-1">❓ Soru Sayısı</p>
                        <p className="font-bold text-green-800">{exam.total_questions} soru</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-3 rounded-xl border border-orange-200/50">
                        <p className="text-orange-600 font-medium text-sm mb-1">🎯 Sonuç</p>
                        {exam.status === 'completed' ? (
                          <p className={`font-bold text-lg ${getScoreColor(exam.score)}`}>
                            {exam.score.toFixed(1)}%
                          </p>
                        ) : (
                          <p className="text-gray-500 font-bold">-</p>
                        )}
                      </div>
                    </div>

                    {exam.status === 'completed' && (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="text-2xl font-bold text-green-600 mb-1">{exam.correct_answers}</div>
                          <div className="text-green-700 text-sm font-bold">✅ Doğru</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="text-2xl font-bold text-red-600 mb-1">{exam.wrong_answers}</div>
                          <div className="text-red-700 text-sm font-bold">❌ Yanlış</div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200/50 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="text-2xl font-bold text-yellow-600 mb-1">{exam.empty_answers}</div>
                          <div className="text-yellow-700 text-sm font-bold">⭕ Boş</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 ml-6">
                    {exam.status === 'completed' ? (
                      <button
                        onClick={() => viewResults(exam.id)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        📊 Sonuçları Görüntüle
                      </button>
                    ) : exam.status === 'in_progress' ? (
                      <button
                        onClick={() => continueExam(exam.id)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        ▶️ Devam Et
                      </button>
                    ) : (
                      <button
                        onClick={() => continueExam(exam.id)}
                        className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        🚀 Başlat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance by Type */}
        {statistics?.performance_by_type && Object.keys(statistics.performance_by_type).length > 0 && (
          <div className="mt-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl mr-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                📈 Detaylı Performans Analizi
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(statistics.performance_by_type).map(([type, data]: [string, any], index) => {
                const gradients = [
                  'from-blue-50 to-cyan-50 border-blue-200/50',
                  'from-green-50 to-emerald-50 border-green-200/50',
                  'from-purple-50 to-pink-50 border-purple-200/50',
                  'from-orange-50 to-yellow-50 border-orange-200/50',
                  'from-red-50 to-pink-50 border-red-200/50',
                ];
                const gradient = gradients[index % gradients.length];
                
                return (
                  <div key={type} className={`p-6 bg-gradient-to-br ${gradient} rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">{type}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                        <span className="text-gray-700 font-medium">📊 Sınav Sayısı:</span>
                        <span className="font-bold text-gray-900 text-lg">{data.count}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                        <span className="text-gray-700 font-medium">📈 Ortalama:</span>
                        <span className={`font-bold text-lg ${getScoreColor(data.average)}`}>
                          {data.average.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
                        <span className="text-gray-700 font-medium">🏆 En Yüksek:</span>
                        <span className={`font-bold text-lg ${getScoreColor(data.best)}`}>
                          {data.best.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeExamHistoryPage;
