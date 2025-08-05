import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loading } from '../components/ui/Loading';
import { useErrorHandler } from '../components/ui/ErrorBoundaryProvider';
import { educationService } from '../services/educationService';

interface QuizQuestion {
  question: string;
  options: Array<{
    letter: string;
    text: string;
  }>;
  correct_answer: string;
  explanation: string;
  topic_id: number;
  topic_name: string;
  keywords: string[];
}

interface QuizData {
  course: {
    id: number;
    name: string;
    education_level: string;
  };
  topics: Array<{
    id: number;
    name: string;
  }>;
  difficulty: string;
  question_count: number;
  questions: QuizQuestion[];
}

interface QuizState {
  configuration: {
    courseId: number;
    topicIds: number[];
    difficulty: string;
    questionCount: number;
  };
  course: any;
  selectedTopics: any[];
}

export const QuizPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const quizState = location.state as QuizState | null;

  useEffect(() => {
    if (!quizState?.configuration) {
      navigate('/app/subjects', { replace: true });
      return;
    }

    generateQuiz();
  }, [quizState]);

  // Timer effect
  useEffect(() => {
    if (quizData && timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [quizData, timeRemaining, showResults]);

  const generateQuiz = async () => {
    if (!quizState?.configuration) return;

    try {
      setLoading(true);
      
      const data = await educationService.generateQuiz({
        course_id: quizState.configuration.courseId,
        topic_ids: quizState.configuration.topicIds,
        difficulty: quizState.configuration.difficulty,
        question_count: quizState.configuration.questionCount
      });
      
      if (data.status === 'success') {
        setQuizData(data.quiz);
        // Quiz süresi: soru başına 90 saniye
        setTimeRemaining(data.quiz.questions.length * 90);
      } else {
        throw new Error(data.error || 'Quiz oluşturulamadı');
      }
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      handleError(error);
      navigate('/app/subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const handleTimeUp = () => {
    setShowResults(true);
  };

  const calculateResults = () => {
    if (!quizData) return { score: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++;
      }
    });

    return {
      score: correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100)
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Quiz hazırlanıyor..." />
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-600">Quiz yüklenemedi.</p>
          <button
            onClick={() => navigate('/app/subjects')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const results = calculateResults();
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Results Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="text-center">
              <div className="mb-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                  results.percentage >= 70 ? 'bg-green-100' : results.percentage >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  {results.percentage >= 70 ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : results.percentage >= 50 ? (
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sınav Tamamlandı!</h1>
              <p className="text-gray-600">{quizData.course.name} • {quizData.difficulty} Seviye</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className={`text-4xl font-bold mb-2 ${
                results.percentage >= 70 ? 'text-green-600' : results.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {results.percentage}%
              </div>
              <p className="text-gray-600">Başarı Oranı</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {results.score}
              </div>
              <p className="text-gray-600">Doğru Cevap</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="text-4xl font-bold text-gray-600 mb-2">
                {results.total - results.score}
              </div>
              <p className="text-gray-600">Yanlış Cevap</p>
            </div>
          </div>

          {/* Performance Message */}
          <div className={`rounded-lg p-6 mb-8 ${
            results.percentage >= 70 
              ? 'bg-green-50 border border-green-200' 
              : results.percentage >= 50 
              ? 'bg-yellow-50 border border-yellow-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-2 ${
                results.percentage >= 70 ? 'text-green-800' : results.percentage >= 50 ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {results.percentage >= 70 
                  ? '🎉 Tebrikler! Harika bir performans!' 
                  : results.percentage >= 50 
                  ? '👍 İyi bir performans gösterdiniz!' 
                  : '💪 Daha fazla çalışma ile başarabilirsiniz!'}
              </h3>
              <p className={`${
                results.percentage >= 70 ? 'text-green-700' : results.percentage >= 50 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {results.percentage >= 70 
                  ? 'Bu konularda çok başarılısınız. Diğer konulara da odaklanabilirsiniz.' 
                  : results.percentage >= 50 
                  ? 'Ortalama bir performans. Eksik kaldığınız konuları tekrar etmenizi öneririz.' 
                  : 'Bu konularda daha fazla çalışmanız gerekiyor. Temel kavramları gözden geçirin.'}
              </p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Detaylı Sonuçlar</h2>
              <p className="text-gray-600 text-sm mt-1">Tüm soruların cevapları ve açıklamaları</p>
            </div>
            
            <div className="divide-y">
              {quizData.questions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correct_answer;
                
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
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {isCorrect ? '✓' : '✗'}
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-3">{question.question}</h3>
                      </div>
                    </div>

                    <div className="ml-14 space-y-3">
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
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
            <button
              onClick={() => navigate('/app/subjects')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Ana Sayfaya Dön
            </button>
            <button
              onClick={() => {
                const courseId = quizState?.configuration?.courseId || quizData.course.id;
                navigate(`/app/courses/${courseId}/quiz-config`, {
                  state: {
                    course: quizState?.course,
                    selectedTopics: quizState?.selectedTopics,
                    educationLevel: quizState?.course?.education_level
                  }
                });
              }}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Yeni Sınav Başlat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{quizData.course.name}</h1>
                <p className="text-sm text-gray-600">
                  Soru {currentQuestionIndex + 1} / {quizData.questions.length} • Zorluk: {quizData.difficulty}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-xs text-gray-500">Kalan Süre</p>
              </div>
              
              {/* Finish Quiz Button */}
              <button
                onClick={handleFinishQuiz}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 text-sm"
              >
                Sınavı Bitir
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Question Header */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">
                      {currentQuestionIndex + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                        {currentQuestion.topic_name}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {quizData.difficulty}
                      </span>
                    </div>
                    <h2 className="text-xl font-medium text-gray-900 leading-relaxed">
                      {currentQuestion.question}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="p-6">
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === option.letter;
                    
                    return (
                      <button
                        key={option.letter}
                        onClick={() => handleAnswerSelect(currentQuestionIndex, option.letter)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:shadow-sm ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-500 text-white' 
                              : 'border-gray-300 text-gray-600'
                          }`}>
                            {option.letter}
                          </div>
                          <span className="text-gray-900 leading-relaxed">
                            {option.text}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
                      currentQuestionIndex === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Önceki Soru
                  </button>

                  {currentQuestionIndex === quizData.questions.length - 1 ? (
                    <button
                      onClick={handleFinishQuiz}
                      className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
                    >
                      Sınavı Tamamla
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                      Sonraki Soru
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-24">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 text-sm">Soru Navigasyonu</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Cevaplanmış: {Object.keys(selectedAnswers).length} / {quizData.questions.length}
                </p>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  {quizData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-10 h-10 rounded text-sm font-medium transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white shadow-md'
                          : selectedAnswers[index]
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={`Soru ${index + 1}${selectedAnswers[index] ? ' (Cevaplanmış)' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Mevcut soru</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                    <span className="text-gray-600">Cevaplanmış</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                    <span className="text-gray-600">Cevaplanmamış</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;