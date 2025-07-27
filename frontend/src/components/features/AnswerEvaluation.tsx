import React, { useEffect, useState } from 'react';
import { cn } from '../../utils';
import type { AnswerEvaluation as AnswerEvaluationType, GeneratedQuestion } from '../../types';

export interface AnswerEvaluationProps {
  evaluation: AnswerEvaluationType;
  question: GeneratedQuestion;
  userAnswer: string;
  className?: string;
  showCorrectAnswer?: boolean;
  showExplanation?: boolean;
  showScore?: boolean;
}

const AnswerEvaluation: React.FC<AnswerEvaluationProps> = ({
  evaluation,
  question,
  userAnswer,
  className,
  showCorrectAnswer = true,
  showExplanation = true,
  showScore = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScoreAnimation, setShowScoreAnimation] = useState(false);
  
  const isCorrect = evaluation.is_correct;
  const hasMultipleChoice = question.options && question.options.length > 0;

  // Animation effects
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    const scoreTimer = setTimeout(() => setShowScoreAnimation(true), 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(scoreTimer);
    };
  }, []);

  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border-l-4 transition-all duration-500 transform',
      isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500',
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      className
    )}>
      <div className="flex items-start space-x-3">
        {/* Status Icon with Animation */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 transform',
          isCorrect ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600',
          isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
        )}>
          {isCorrect ? (
            <svg className="w-5 h-5 text-white transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        <div className="flex-1 space-y-3">
          {/* Header with result and score */}
          <div className="flex items-center justify-between">
            <h4 className={cn(
              'text-lg font-semibold transition-colors duration-300',
              isCorrect ? 'text-green-800' : 'text-red-800'
            )}>
              {isCorrect ? '✓ Doğru Cevap!' : '✗ Yanlış Cevap'}
            </h4>
            {showScore && evaluation.score !== undefined && (
              <div className={cn(
                'px-3 py-1 rounded-full text-sm font-medium transition-all duration-500 transform',
                getScoreColor(evaluation.score),
                showScoreAnimation ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              )}>
                <div className="flex items-center space-x-1">
                  <span>Puan:</span>
                  <span className="font-bold">{evaluation.score}</span>
                  {evaluation.score >= 80 && <span>🎉</span>}
                  {evaluation.score >= 60 && evaluation.score < 80 && <span>👍</span>}
                  {evaluation.score < 60 && <span>💪</span>}
                </div>
              </div>
            )}
          </div>

          {/* AI Feedback */}
          {evaluation.feedback && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                AI Geri Bildirimi
              </h5>
              <div className={cn(
                'p-3 rounded-md text-sm leading-relaxed',
                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              )}>
                {evaluation.feedback}
              </div>
            </div>
          )}

          {/* User's Answer */}
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Sizin Cevabınız:</h5>
            <div className={cn(
              'p-3 rounded-md text-sm bg-gray-100 border-l-4',
              isCorrect ? 'border-green-400' : 'border-red-400'
            )}>
              {userAnswer}
            </div>
          </div>

          {/* Correct Answer (for non-multiple choice or when answer is wrong) */}
          {showCorrectAnswer && (!hasMultipleChoice || !isCorrect) && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Doğru Cevap:</h5>
              <div className="p-3 rounded-md text-sm bg-green-100 text-green-800 border-l-4 border-green-400">
                {question.correct_answer}
              </div>
            </div>
          )}

          {/* Detailed Explanation */}
          {showExplanation && evaluation.explanation && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
                Detaylı Açıklama
              </h5>
              <div className="p-3 rounded-md text-sm bg-blue-50 text-blue-800 border-l-4 border-blue-400 leading-relaxed">
                {evaluation.explanation}
              </div>
            </div>
          )}

          {/* Question Explanation (if available) */}
          {showExplanation && question.explanation && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Konu Açıklaması
              </h5>
              <div className="p-3 rounded-md text-sm bg-gray-50 text-gray-700 border-l-4 border-gray-400 leading-relaxed">
                {question.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnswerEvaluation;