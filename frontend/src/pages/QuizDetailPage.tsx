import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loading } from '../components/ui/Loading';
import { useErrorHandler } from '../components/ui/ErrorBoundaryProvider';
import { educationService } from '../services/educationService';

interface QuizDetailData {
  id: number;
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
  questions_data: Array<{
    question: string;
    options: Array<{
      letter: string;
      text: string;
    }>;
    correct_answer: string;
    user_answer?: string;
    explanation: string;
    topic_name: string;
  }>;
}

export const QuizDetailPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  
  const [quizDetail, setQuizDetail] = useState<QuizDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (resultId) {
      loadQuizDetail(parseInt(resultId));
    }
  }, [resultId]);

  const loadQuizDetail = async (id: number) => {
    try {
      setLoading(true);
      const data = await educationService.getQuizResultDetail(id);
      setQuizDetail(data);
    } catch (error: any) {
      console.error('Quiz detail loading error:', error);
      handleError(error);
      navigate('/app/performance');
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
          <Loading size="lg" text="Sınav detayları yükleniyor..." />
        </div>
      </div>
    );
  }

  if (!quizDetail) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Sınav detayları bulunamadı.</p>
          <button
            onClick={() => navigate('/app/performance')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Performans Sayfasına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate('/app/performance')}
                  className="p-3 hover:bg-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📊 Sınav Detayları
                </h1>
              </div>
              <p className="text-gray-600 bg-gray-100 px-4 py-2 rounded-full inline-block">
                📅 {formatDate(quizDetail.completed_at)}
              </p>
            </div>
            <div className="text-right bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(quizDetail.percentage)}`}>
                🎯 {quizDetail.percentage}%
              </div>
              <p className="text-sm font-medium text-gray-600">Başarı Oranı</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quiz Info */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mr-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  📚 {quizDetail.course_name}
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200/50">
                  <span className="text-gray-600 font-medium">🎓 Eğitim Seviyesi:</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-bold rounded-full shadow-sm">
                    {quizDetail.education_level}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200/50">
                  <span className="text-gray-600 font-medium">⚡ Zorluk:</span>
                  <span className={`px-4 py-2 font-bold rounded-full shadow-sm ${getDifficultyColor(quizDetail.difficulty)}`}>
                    {quizDetail.difficulty === 'kolay' ? '🟢 Kolay' : quizDetail.difficulty === 'orta' ? '🟡 Orta' : '🔴 Zor'}
                  </span>
                </div>
                <div className="p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-xl border border-gray-200/50">
                  <span className="text-gray-600 font-medium block mb-3">📖 Konular:</span>
                  <div className="flex flex-wrap gap-2">
                    {quizDetail.topic_names.map((topic, index) => (
                      <span key={index} className="px-3 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-medium rounded-full shadow-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mr-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  📊 Sonuç Özeti
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl font-bold text-green-600 mb-2">{quizDetail.correct_answers}</div>
                  <div className="text-sm text-green-700 font-bold">✅ Doğru</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl font-bold text-red-600 mb-2">{quizDetail.wrong_answers}</div>
                  <div className="text-sm text-red-700 font-bold">❌ Yanlış</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{quizDetail.blank_answers}</div>
                  <div className="text-sm text-orange-700 font-bold">⭕ Boş</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{formatTime(quizDetail.time_spent)}</div>
                  <div className="text-sm text-blue-700 font-bold">⏱️ Süre</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Detail */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Soru Detayları</h2>
            <p className="text-gray-600 text-sm mt-1">Tüm soruların cevapları ve açıklamaları</p>
          </div>
          
          <div className="divide-y">
            {quizDetail.questions_data.map((question, index) => {
              const userAnswer = question.user_answer;
              const isCorrect = userAnswer === question.correct_answer;
              const isBlank = !userAnswer;
              
              return (
                <div key={index} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                          {question.topic_name}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCorrect 
                            ? 'bg-green-100 text-green-600' 
                            : isBlank 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {isCorrect ? '✓' : isBlank ? '−' : '✗'}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          isCorrect 
                            ? 'bg-green-100 text-green-800' 
                            : isBlank 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCorrect ? 'Doğru' : isBlank ? 'Boş Bırakıldı' : 'Yanlış'}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-3">{question.question}</h3>
                    </div>
                  </div>

                  <div className="ml-14 space-y-3">
                    {/* User Answer Status */}
                    {isBlank && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 text-xs font-bold">!</span>
                          </div>
                          <span className="text-orange-800 text-sm font-medium">
                            Bu soruyu boş bıraktınız
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isUserAnswer = userAnswer === option.letter;
                        const isCorrectAnswer = option.letter === question.correct_answer;
                        
                        let className = 'p-3 rounded-lg border ';
                        if (isCorrectAnswer) {
                          className += 'bg-green-50 border-green-200';
                        } else if (isUserAnswer && !isCorrectAnswer) {
                          className += 'bg-red-50 border-red-200';
                        } else {
                          className += 'bg-gray-50 border-gray-200';
                        }
                        
                        return (
                          <div key={option.letter} className={className}>
                            <div className="flex items-center gap-3">
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                isCorrectAnswer 
                                  ? 'border-green-500 bg-green-500 text-white' 
                                  : isUserAnswer 
                                  ? 'border-red-500 bg-red-500 text-white'
                                  : 'border-gray-300 text-gray-600'
                              }`}>
                                {option.letter}
                              </div>
                              <span className="text-gray-900">{option.text}</span>
                              <div className="ml-auto flex gap-2">
                                {isUserAnswer && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                    Seçiminiz
                                  </span>
                                )}
                                {isCorrectAnswer && (
                                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                    Doğru Cevap
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">Açıklama</h4>
                          <p className="text-blue-800 text-sm leading-relaxed">{question.explanation}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mt-12 justify-center">
          <button
            onClick={() => navigate('/app/performance')}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            📊 Performans Sayfasına Dön
          </button>
          <button
            onClick={() => navigate('/app/subjects')}
            className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            🚀 Yeni Sınav Başlat
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailPage;