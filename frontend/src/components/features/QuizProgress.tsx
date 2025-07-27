import React, { useEffect, useState } from 'react';
import { cn } from '../../utils';
import type { AnswerEvaluation } from '../../types';

export interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalScore: number;
  maxPossibleScore: number;
  evaluations: (AnswerEvaluation | undefined)[];
  className?: string;
  showDetailedStats?: boolean;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  answeredQuestions,
  correctAnswers,
  totalScore,
  maxPossibleScore,
  evaluations,
  className,
  showDetailedStats = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [animatedAccuracy, setAnimatedAccuracy] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const accuracy = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const progress = (currentQuestion / totalQuestions) * 100;
  const scorePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  // Animate progress values
  useEffect(() => {
    const progressTimer = setTimeout(() => setAnimatedProgress(progress), 100);
    const accuracyTimer = setTimeout(() => setAnimatedAccuracy(accuracy), 200);
    const scoreTimer = setTimeout(() => setAnimatedScore(scorePercentage), 300);
    
    return () => {
      clearTimeout(progressTimer);
      clearTimeout(accuracyTimer);
      clearTimeout(scoreTimer);
    };
  }, [progress, accuracy, scorePercentage]);

  // Get streak information
  const getStreakInfo = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    for (let i = evaluations.length - 1; i >= 0; i--) {
      const evaluation = evaluations[i];
      if (evaluation?.is_correct) {
        tempStreak++;
        if (i === evaluations.length - 1) currentStreak = tempStreak;
      } else {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 0;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return { currentStreak, maxStreak };
  };

  const { currentStreak, maxStreak } = getStreakInfo();

  return (
    <div className={cn('bg-white rounded-lg border shadow-sm p-4', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Quiz İlerlemesi</h3>
          <div className="text-sm text-gray-600">
            Soru {currentQuestion} / {totalQuestions}
          </div>
        </div>

        {/* Progress Bar with Animation */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">İlerleme</span>
            <span className="font-medium text-gray-900">{Math.round(animatedProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Accuracy with Animation */}
          <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className={cn(
              "text-2xl font-bold transition-colors duration-500",
              animatedAccuracy >= 80 ? 'text-green-600' :
              animatedAccuracy >= 60 ? 'text-yellow-600' :
              animatedAccuracy >= 40 ? 'text-orange-600' : 'text-red-600'
            )}>
              {Math.round(animatedAccuracy)}%
            </div>
            <div className="text-sm text-gray-600">Doğruluk</div>
            <div className="text-xs text-gray-500 mt-1">
              {correctAnswers}/{answeredQuestions}
            </div>
            {/* Mini progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-1000",
                  animatedAccuracy >= 80 ? 'bg-green-500' :
                  animatedAccuracy >= 60 ? 'bg-yellow-500' :
                  animatedAccuracy >= 40 ? 'bg-orange-500' : 'bg-red-500'
                )}
                style={{ width: `${animatedAccuracy}%` }}
              />
            </div>
          </div>

          {/* Score with Animation */}
          <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
            <div className="text-2xl font-bold text-primary-600">
              {totalScore}
            </div>
            <div className="text-sm text-gray-600">Toplam Puan</div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(animatedScore)}% / {maxPossibleScore}
            </div>
            {/* Mini progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div
                className="bg-primary-500 h-1 rounded-full transition-all duration-1000"
                style={{ width: `${animatedScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak Information */}
        {answeredQuestions > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{currentStreak}</div>
                <div className="text-xs text-blue-600">Mevcut Seri</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-indigo-600">{maxStreak}</div>
                <div className="text-xs text-indigo-600">En İyi Seri</div>
              </div>
              <div className="text-2xl">
                {currentStreak >= 3 ? '🔥' : currentStreak >= 2 ? '⚡' : '💫'}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        {showDetailedStats && (
          <div className="space-y-3">
            <div className="border-t pt-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Detaylı İstatistikler</h4>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-semibold text-green-800">
                    {correctAnswers}
                  </div>
                  <div className="text-xs text-green-600">Doğru</div>
                </div>
                
                <div className="p-2 bg-red-50 rounded">
                  <div className="text-lg font-semibold text-red-800">
                    {answeredQuestions - correctAnswers}
                  </div>
                  <div className="text-xs text-red-600">Yanlış</div>
                </div>
                
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-lg font-semibold text-gray-800">
                    {totalQuestions - answeredQuestions}
                  </div>
                  <div className="text-xs text-gray-600">Kalan</div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            {answeredQuestions > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Puan Dağılımı</h4>
                <div className="space-y-1">
                  {evaluations.slice(0, answeredQuestions).map((evaluation, index) => (
                    evaluation && (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Soru {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            evaluation.is_correct 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          )}>
                            {evaluation.is_correct ? 'Doğru' : 'Yanlış'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {evaluation.score || 0}
                          </span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Performance Indicator */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Performans</span>
            <div className="flex items-center space-x-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                accuracy >= 80 ? 'bg-green-500' :
                accuracy >= 60 ? 'bg-yellow-500' :
                accuracy >= 40 ? 'bg-orange-500' : 'bg-red-500'
              )} />
              <span className={cn(
                'text-sm font-medium',
                accuracy >= 80 ? 'text-green-700' :
                accuracy >= 60 ? 'text-yellow-700' :
                accuracy >= 40 ? 'text-orange-700' : 'text-red-700'
              )}>
                {accuracy >= 80 ? 'Mükemmel' :
                 accuracy >= 60 ? 'İyi' :
                 accuracy >= 40 ? 'Orta' : 'Geliştirilmeli'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizProgress;