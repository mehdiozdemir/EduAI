import React, { useEffect, useState } from 'react';
import { cn } from '../../utils';
import type { AnswerEvaluation } from '../../types';

export interface RealTimePerformanceProps {
  recentEvaluations: AnswerEvaluation[];
  answeredQuestions: number;
  correctAnswers: number;
  className?: string;
}

const RealTimePerformance: React.FC<RealTimePerformanceProps> = ({
  recentEvaluations,
  answeredQuestions,
  correctAnswers,
  className,
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [lastResult, setLastResult] = useState<AnswerEvaluation | null>(null);

  const accuracy =
    answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
  const recentAccuracy =
    recentEvaluations.length > 0
      ? (recentEvaluations.filter(e => e.is_correct).length /
          recentEvaluations.length) *
        100
      : 0;

  // Show animation when new evaluation comes in
  useEffect(() => {
    if (recentEvaluations.length > 0) {
      const latest = recentEvaluations[recentEvaluations.length - 1];
      if (latest !== lastResult) {
        setLastResult(latest);
        setShowAnimation(true);
        const timer = setTimeout(() => setShowAnimation(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [recentEvaluations, lastResult]);

  const getPerformanceLevel = (acc: number) => {
    if (acc >= 90)
      return {
        level: 'Mükemmel',
        color: 'text-green-600',
        bg: 'bg-green-50',
        icon: '🎯',
      };
    if (acc >= 80)
      return {
        level: 'Çok İyi',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: '🚀',
      };
    if (acc >= 70)
      return {
        level: 'İyi',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: '👍',
      };
    if (acc >= 60)
      return {
        level: 'Orta',
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        icon: '📈',
      };
    return {
      level: 'Geliştirilmeli',
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: '💪',
    };
  };

  const performance = getPerformanceLevel(accuracy);
  const recentPerformance = getPerformanceLevel(recentAccuracy);

  return (
    <div className={cn('space-y-3', className)}>
      {/* Real-time Result Animation */}
      {showAnimation && lastResult && (
        <div
          className={cn(
            'p-3 rounded-lg border-l-4 transition-all duration-500 transform',
            lastResult.is_correct
              ? 'bg-green-50 border-green-500 animate-pulse'
              : 'bg-red-50 border-red-500 animate-pulse'
          )}
        >
          <div className="flex items-center space-x-2">
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-white text-sm',
                lastResult.is_correct ? 'bg-green-500' : 'bg-red-500'
              )}
            >
              {lastResult.is_correct ? '✓' : '✗'}
            </div>
            <div>
              <div
                className={cn(
                  'font-medium text-sm',
                  lastResult.is_correct ? 'text-green-800' : 'text-red-800'
                )}
              >
                {lastResult.is_correct ? 'Doğru!' : 'Yanlış!'}
              </div>
              <div className="text-xs text-gray-600">
                Puan: {lastResult.score}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Performance */}
      <div className={cn('p-4 rounded-lg border', performance.bg)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">{performance.icon}</span>
              <span className={cn('font-semibold', performance.color)}>
                {performance.level}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Genel Performans: {Math.round(accuracy)}%
            </div>
          </div>
          <div className="text-right">
            <div className={cn('text-2xl font-bold', performance.color)}>
              {correctAnswers}/{answeredQuestions}
            </div>
            <div className="text-xs text-gray-500">Doğru/Toplam</div>
          </div>
        </div>
      </div>

      {/* Recent Performance Trend */}
      {recentEvaluations.length >= 3 && (
        <div className={cn('p-3 rounded-lg border', recentPerformance.bg)}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-700">
                Son {recentEvaluations.length} Soru
              </div>
              <div className={cn('text-sm', recentPerformance.color)}>
                {recentPerformance.level} ({Math.round(recentAccuracy)}%)
              </div>
            </div>
            <div className="flex space-x-1">
              {recentEvaluations.slice(-5).map((evaluation, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-3 h-3 rounded-full',
                    evaluation.is_correct ? 'bg-green-500' : 'bg-red-500'
                  )}
                  title={`Soru ${index + 1}: ${evaluation.is_correct ? 'Doğru' : 'Yanlış'}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Performance Tips */}
      {answeredQuestions >= 3 && accuracy < 70 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-600">💡</span>
            <div>
              <div className="text-sm font-medium text-yellow-800">
                Performans İpucu
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {accuracy < 50
                  ? 'Soruları daha dikkatli okuyun ve acele etmeyin.'
                  : 'İyi gidiyorsunuz! Konsantrasyonunuzu koruyun.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Streak Information */}
      {(() => {
        let currentStreak = 0;
        for (let i = recentEvaluations.length - 1; i >= 0; i--) {
          if (recentEvaluations[i].is_correct) {
            currentStreak++;
          } else {
            break;
          }
        }

        if (currentStreak >= 3) {
          return (
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔥</span>
                <div>
                  <div className="text-sm font-medium text-purple-800">
                    Harika Seri!
                  </div>
                  <div className="text-sm text-purple-700">
                    {currentStreak} doğru cevap üst üste!
                  </div>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
};

export default RealTimePerformance;
