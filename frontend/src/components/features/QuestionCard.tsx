import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import AnswerEvaluation from './AnswerEvaluation';
import { cn } from '../../utils';
import type { GeneratedQuestion, AnswerEvaluation as AnswerEvaluationType } from '../../types';

export interface QuestionCardProps {
  question: GeneratedQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  evaluation?: AnswerEvaluationType;
  loading?: boolean;
  disabled?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showResult = false,
  evaluation,
  loading = false,
  disabled = false,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer('');
    setUserAnswer('');
    setHasAnswered(false);
  }, [question.id]);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer && !userAnswer) return;
    
    const answer = selectedAnswer || userAnswer;
    setHasAnswered(true);
    onAnswer(answer);
  };

  const handleOptionSelect = (option: string) => {
    if (disabled || hasAnswered) return;
    setSelectedAnswer(option);
    setUserAnswer('');
  };

  const handleTextAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled || hasAnswered) return;
    setUserAnswer(e.target.value);
    setSelectedAnswer('');
  };

  const isMultipleChoice = question.options && question.options.length > 0;
  const canSubmit = (selectedAnswer || userAnswer.trim()) && !hasAnswered;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Soru {questionNumber} / {totalQuestions}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">
              {Math.round((questionNumber / totalQuestions) * 100)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Question Content */}
        <div className="prose prose-sm max-w-none">
          <div className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {question.content}
          </div>
        </div>

        {/* Answer Options */}
        {isMultipleChoice ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Seçenekler:</h4>
            <div className="space-y-2">
              {question.options!.map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...
                const isSelected = selectedAnswer === option;
                const isCorrect = showResult && option === question.correct_answer;
                const isWrong = showResult && isSelected && option !== question.correct_answer;

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    disabled={disabled || hasAnswered}
                    className={cn(
                      'w-full text-left p-4 rounded-lg border-2 transition-all duration-200',
                      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500',
                      isSelected && !showResult && 'border-primary-500 bg-primary-50',
                      !isSelected && !showResult && 'border-gray-200',
                      showResult && isCorrect && 'border-green-500 bg-green-50',
                      showResult && isWrong && 'border-red-500 bg-red-50',
                      showResult && !isSelected && !isCorrect && 'border-gray-200 bg-gray-50',
                      (disabled || hasAnswered) && 'cursor-not-allowed'
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium',
                        isSelected && !showResult && 'border-primary-500 bg-primary-500 text-white',
                        !isSelected && !showResult && 'border-gray-300 text-gray-600',
                        showResult && isCorrect && 'border-green-500 bg-green-500 text-white',
                        showResult && isWrong && 'border-red-500 bg-red-500 text-white',
                        showResult && !isSelected && !isCorrect && 'border-gray-300 text-gray-600'
                      )}>
                        {optionLetter}
                      </div>
                      <div className="flex-1 text-gray-900">
                        {option}
                      </div>
                      {showResult && isCorrect && (
                        <div className="flex-shrink-0 text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {showResult && isWrong && (
                        <div className="flex-shrink-0 text-red-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label htmlFor="answer-text" className="block text-sm font-medium text-gray-700">
              Cevabınız:
            </label>
            <textarea
              id="answer-text"
              value={userAnswer}
              onChange={handleTextAnswerChange}
              disabled={disabled || hasAnswered}
              placeholder="Cevabınızı buraya yazın..."
              rows={4}
              className={cn(
                'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                'disabled:bg-gray-50 disabled:cursor-not-allowed',
                showResult && evaluation?.is_correct && 'border-green-500 bg-green-50',
                showResult && evaluation && !evaluation.is_correct && 'border-red-500 bg-red-50'
              )}
            />
          </div>
        )}

        {/* Evaluation Results */}
        {showResult && evaluation && (
          <AnswerEvaluation
            evaluation={evaluation}
            question={question}
            userAnswer={selectedAnswer || userAnswer}
            showCorrectAnswer={!isMultipleChoice || !evaluation.is_correct}
            showExplanation={true}
            showScore={true}
          />
        )}
      </CardContent>

      <CardFooter>
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-500">
            {hasAnswered ? 'Cevaplandı' : 'Cevabınızı seçin'}
          </div>
          <Button
            onClick={handleAnswerSubmit}
            disabled={!canSubmit || loading}
            loading={loading}
            className={cn(
              'transition-all duration-200',
              loading && 'animate-pulse'
            )}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>AI Değerlendiriyor...</span>
              </div>
            ) : (
              'Cevapla'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuestionCard;