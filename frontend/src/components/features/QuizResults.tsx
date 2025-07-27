import React from 'react';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { cn } from '../../utils';
import type { QuizResults as QuizResultsType } from '../../types';

export interface QuizResultsProps {
  results: QuizResultsType;
  onRestart?: () => void;
  onNewQuiz?: () => void;
  onViewDetails?: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  results,
  onRestart,
  onNewQuiz,
  onViewDetails,
}) => {
  const { totalQuestions, correctAnswers, accuracy, timeSpent, answers } = results;
  const incorrectAnswers = totalQuestions - correctAnswers;
  
  // Format time spent
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}dk ${remainingSeconds}sn`;
    }
    return `${remainingSeconds}sn`;
  };

  // Get performance message based on accuracy
  const getPerformanceMessage = (accuracy: number): { message: string; color: string; icon: string } => {
    if (accuracy >= 90) {
      return {
        message: 'Mükemmel! Harika bir performans sergiledıniz.',
        color: 'text-green-600',
        icon: '🎉'
      };
    } else if (accuracy >= 80) {
      return {
        message: 'Çok iyi! Başarılı bir performans.',
        color: 'text-blue-600',
        icon: '👏'
      };
    } else if (accuracy >= 70) {
      return {
        message: 'İyi! Gelişim gösteriyorsunuz.',
        color: 'text-yellow-600',
        icon: '👍'
      };
    } else if (accuracy >= 60) {
      return {
        message: 'Orta seviye. Biraz daha çalışma gerekiyor.',
        color: 'text-orange-600',
        icon: '📚'
      };
    } else {
      return {
        message: 'Daha fazla çalışma gerekiyor. Vazgeçmeyin!',
        color: 'text-red-600',
        icon: '💪'
      };
    }
  };

  const performance = getPerformanceMessage(accuracy);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Main Results Card */}
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Tamamlandı!</CardTitle>
          <div className="text-4xl mb-2">{performance.icon}</div>
          <p className={cn('text-lg font-medium', performance.color)}>
            {performance.message}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Circle */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={accuracy >= 70 ? '#10b981' : accuracy >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(accuracy / 100) * 314.16} 314.16`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(accuracy)}%
                  </div>
                  <div className="text-sm text-gray-600">Başarı</div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
              <div className="text-sm text-gray-600">Toplam Soru</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-gray-600">Doğru</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-gray-600">Yanlış</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Süre</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Soru Detayları</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {answers.map((answer, index) => (
                <div
                  key={answer.questionId}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    answer.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                      answer.isCorrect
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Soru {index + 1}
                      </div>
                      <div className="text-xs text-gray-600">
                        Cevabınız: {answer.userAnswer}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {answer.isCorrect ? (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    {answer.evaluation.score !== undefined && (
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {answer.evaluation.score}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {onRestart && (
              <Button
                variant="outline"
                onClick={onRestart}
                className="flex-1"
              >
                Tekrar Dene
              </Button>
            )}
            {onNewQuiz && (
              <Button
                variant="primary"
                onClick={onNewQuiz}
                className="flex-1"
              >
                Yeni Quiz
              </Button>
            )}
            {onViewDetails && (
              <Button
                variant="ghost"
                onClick={onViewDetails}
                className="flex-1"
              >
                Detayları Görüntüle
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performans Analizi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Doğruluk Oranı</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-1000',
                      accuracy >= 70 ? 'bg-green-500' : accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${accuracy}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{Math.round(accuracy)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Ortalama Süre/Soru</span>
              <span className="text-sm font-medium">
                {formatTime(Math.round(timeSpent / totalQuestions))}
              </span>
            </div>

            {accuracy < 70 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600">💡</div>
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800">Gelişim Önerisi</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Performansınızı artırmak için yanlış cevapladığınız konuları tekrar gözden geçirmenizi öneririz.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;