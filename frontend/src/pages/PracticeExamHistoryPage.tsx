import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, type PracticeExam } from '../services/examService';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sınav Geçmişi
            </h1>
            <p className="text-lg text-gray-600">
              Daha önce çözdüğünüz sınavları görüntüleyin
            </p>
          </div>
          <Button onClick={() => navigate('/app/practice-exam')}>
            🎯 Yeni Sınav Çöz
          </Button>
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {statistics?.total_exams || 0}
                </div>
                <div className="text-sm text-gray-600">Toplam Sınav</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {statistics?.completed_exams || 0}
                </div>
                <div className="text-sm text-gray-600">Tamamlanan</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(statistics?.average_score || 0)}`}>
                  {(statistics?.average_score || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Ortalama Puan</div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {(statistics?.best_score || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">En Yüksek Puan</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Exams List */}
        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Henüz Sınav Çözmediniz
            </h3>
            <p className="text-gray-600 mb-6">
              İlk sınavınızı çözerek başlayın ve ilerlemenizi takip edin
            </p>
            <Button onClick={() => navigate('/app/practice-exam')}>
              İlk Sınavımı Çöz
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exam.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                        {getStatusText(exam.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Sınav Türü:</span>
                        <br />
                        {exam.exam_type_name}
                      </div>
                      <div>
                        <span className="font-medium">Tarih:</span>
                        <br />
                        {formatDate(exam.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Soru Sayısı:</span>
                        <br />
                        {exam.total_questions} soru
                      </div>
                      <div>
                        <span className="font-medium">Sonuç:</span>
                        <br />
                        {exam.status === 'completed' ? (
                          <span className={`font-bold ${getScoreColor(exam.score)}`}>
                            {exam.score.toFixed(1)}% ({exam.correct_answers}/{exam.total_questions})
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </div>

                    {exam.status === 'completed' && (
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">{exam.correct_answers}</div>
                          <div className="text-green-600 text-xs">Doğru</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="font-semibold text-red-600">{exam.wrong_answers}</div>
                          <div className="text-red-600 text-xs">Yanlış</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-50 rounded">
                          <div className="font-semibold text-yellow-600">{exam.empty_answers}</div>
                          <div className="text-yellow-600 text-xs">Boş</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    {exam.status === 'completed' ? (
                      <Button
                        onClick={() => viewResults(exam.id)}
                        variant="secondary"
                        size="sm"
                      >
                        📊 Sonuçları Görüntüle
                      </Button>
                    ) : exam.status === 'in_progress' ? (
                      <Button
                        onClick={() => continueExam(exam.id)}
                        size="sm"
                      >
                        ▶️ Devam Et
                      </Button>
                    ) : (
                      <Button
                        onClick={() => continueExam(exam.id)}
                        size="sm"
                      >
                        🚀 Başlat
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Performance by Type */}
        {statistics?.performance_by_type && Object.keys(statistics.performance_by_type).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sınav Türüne Göre Performans
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(statistics.performance_by_type).map(([type, data]: [string, any]) => (
                <div key={type} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{type}</h4>
                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Sınav Sayısı:</span>
                      <span className="font-medium">{data.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ortalama:</span>
                      <span className={`font-medium ${getScoreColor(data.average)}`}>
                        {data.average.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>En Yüksek:</span>
                      <span className={`font-medium ${getScoreColor(data.best)}`}>
                        {data.best.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeExamHistoryPage;
