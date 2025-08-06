import React, { useState, useMemo } from 'react';
import QuestionCard from './QuestionCard';
import QuizResults from './QuizResults';
import QuizProgress from './QuizProgress';
import RealTimePerformance from './RealTimePerformance';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Loading } from '../ui/Loading';
import { questionService } from '../../services/questionService';
import { aiGuidanceService } from '../../services/aiGuidanceService';
import { cn } from '../../utils';
import type { GeneratedQuestion, AnswerEvaluation, QuizResults as QuizResultsType, EvaluateRequest } from '../../types';

interface QuizSessionProps {
  questions: GeneratedQuestion[];
  onComplete: (results: QuizResultsType) => void;
  onExit?: () => void;
  subject?: string;
  topic?: string;
  difficulty?: string;
  educationLevel?: string;
}

interface QuestionState {
  question: GeneratedQuestion;
  userAnswer?: string;
  evaluation?: AnswerEvaluation;
  isAnswered: boolean;
}

const QuizSession: React.FC<QuizSessionProps> = ({
  questions,
  onComplete,
  onExit,
  subject = "Genel",
  topic = "Karma",
  difficulty = "orta",
  educationLevel = "lise"
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(() =>
    questions.map(question => ({
      question,
      isAnswered: false
    }))
  );
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [startTime] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questionStates[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Calculate quiz statistics
  const quizStats = useMemo(() => {
    const answeredQuestions = questionStates.filter(state => state.isAnswered).length;
    const correctAnswers = questionStates.filter(state => state.evaluation?.is_correct).length;
    const totalScore = questionStates.reduce((sum, state) => sum + (state.evaluation?.score || 0), 0);
    const maxPossibleScore = questions.length * 100; // Assuming max score per question is 100
    const evaluations = questionStates.map(state => state.evaluation);

    return {
      answeredQuestions,
      correctAnswers,
      totalScore,
      maxPossibleScore,
      evaluations
    };
  }, [questionStates, questions.length]);

  const handleAnswer = async (answer: string) => {
    setIsEvaluating(true);
    
    try {
      const evaluateRequest: EvaluateRequest = {
        question_id: currentQuestion.question.id,
        user_answer: answer,
        correct_answer: currentQuestion.question.correct_answer,
        question_content: currentQuestion.question.content
      };

      const evaluation = await questionService.evaluateAnswer(evaluateRequest);

      // Update question state with answer and evaluation
      setQuestionStates(prev => prev.map((state, index) => 
        index === currentQuestionIndex
          ? {
              ...state,
              userAnswer: answer,
              evaluation,
              isAnswered: true
            }
          : state
      ));

      setShowResult(true);

      // Store question result to memory for AI guidance
      try {
        await aiGuidanceService.storeQuestionResult({
          question: currentQuestion.question.content,
          user_answer: answer,
          correct_answer: currentQuestion.question.correct_answer,
          is_correct: evaluation.is_correct,
          subject,
          topic,
          difficulty,
          education_level: educationLevel
        });
      } catch (memoryError) {
        console.error('Error storing question result to memory:', memoryError);
        // Don't block the quiz flow if memory storage fails
      }

      // Show success/failure toast notification
      if (evaluation.is_correct) {
        // Could add toast notification here for correct answers
        console.log('🎉 Doğru cevap!');
      } else {
        // Could add toast notification here for incorrect answers
        console.log('💪 Yanlış cevap, devam et!');
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Create a fallback evaluation for error cases
      const fallbackEvaluation: AnswerEvaluation = {
        is_correct: false,
        score: 0,
        feedback: 'Cevap değerlendirilirken bir hata oluştu. Lütfen tekrar deneyin.',
        explanation: 'Sistem hatası nedeniyle değerlendirme yapılamadı.'
      };

      setQuestionStates(prev => prev.map((state, index) => 
        index === currentQuestionIndex
          ? {
              ...state,
              userAnswer: answer,
              evaluation: fallbackEvaluation,
              isAnswered: true
            }
          : state
      ));

      setShowResult(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleCompleteQuiz();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowResult(false);
    }
  };

  const handleCompleteQuiz = () => {
    const endTime = Date.now();
    const timeSpent = Math.round((endTime - startTime) / 1000); // in seconds

    const results: QuizResultsType = {
      totalQuestions: questions.length,
      correctAnswers: questionStates.filter(state => state.evaluation?.is_correct).length,
      accuracy: 0, // Will be calculated below
      timeSpent,
      answers: questionStates.map(state => ({
        questionId: state.question.id,
        userAnswer: state.userAnswer || '',
        isCorrect: state.evaluation?.is_correct || false,
        evaluation: state.evaluation!
      }))
    };

    results.accuracy = (results.correctAnswers / results.totalQuestions) * 100;

    setIsCompleted(true);
    onComplete(results);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowResult(questionStates[currentQuestionIndex - 1].isAnswered);
    }
  };

  const handleExitQuiz = () => {
    if (onExit) {
      onExit();
    }
  };

  const handleRestartQuiz = () => {
    // Reset all states
    setCurrentQuestionIndex(0);
    setQuestionStates(questions.map(question => ({
      question,
      isAnswered: false
    })));
    setIsEvaluating(false);
    setShowResult(false);
    setIsCompleted(false);
  };

  if (isCompleted) {
    const results: QuizResultsType = {
      totalQuestions: questions.length,
      correctAnswers: questionStates.filter(state => state.evaluation?.is_correct).length,
      accuracy: 0,
      timeSpent: Math.round((Date.now() - startTime) / 1000),
      answers: questionStates.map(state => ({
        questionId: state.question.id,
        userAnswer: state.userAnswer || '',
        isCorrect: state.evaluation?.is_correct || false,
        evaluation: state.evaluation!
      }))
    };
    results.accuracy = (results.correctAnswers / results.totalQuestions) * 100;

    return (
      <QuizResults 
        results={results} 
        onRestart={handleRestartQuiz}
        onNewQuiz={onExit}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex justify-center py-8">
          <Loading size="lg" text="Quiz yükleniyor..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Quiz Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Quiz Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quiz Oturumu</CardTitle>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Soru {currentQuestionIndex + 1} / {questions.length}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExitQuiz}
                >
                  Çıkış
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion.question}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          showResult={showResult}
          evaluation={currentQuestion.evaluation}
          loading={isEvaluating}
        />

        {/* Navigation */}
        {showResult && (
          <Card>
            <CardContent className="flex justify-between items-center py-4">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Önceki Soru
              </Button>

              <div className="text-sm text-gray-600">
                {questionStates.filter(state => state.isAnswered).length} / {questions.length} soru cevaplandı
              </div>

              <Button
                onClick={handleNextQuestion}
                variant={isLastQuestion ? 'primary' : 'outline'}
              >
                {isLastQuestion ? 'Quiz\'i Tamamla' : 'Sonraki Soru →'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Question Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Soru Durumu</span>
              <div className="text-sm text-gray-600">
                {questionStates.filter(state => state.isAnswered).length} / {questions.length} tamamlandı
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questionStates.map((state, index) => {
                const isCurrentQuestion = index === currentQuestionIndex;
                const isAnswered = state.isAnswered;
                const isCorrect = state.evaluation?.is_correct;
                const score = state.evaluation?.score || 0;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setShowResult(state.isAnswered);
                    }}
                    className={cn(
                      'w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 relative',
                      isCurrentQuestion && 'ring-2 ring-primary-500 ring-offset-1',
                      isCurrentQuestion
                        ? 'bg-primary-600 text-white shadow-lg'
                        : isAnswered
                        ? isCorrect
                          ? 'bg-green-500 text-white hover:bg-green-600 shadow-md'
                          : 'bg-red-500 text-white hover:bg-red-600 shadow-md'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    )}
                    title={
                      isAnswered 
                        ? `Soru ${index + 1}: ${isCorrect ? 'Doğru' : 'Yanlış'} (${score} puan)`
                        : `Soru ${index + 1}: Cevaplanmadı`
                    }
                  >
                    {index + 1}
                    {/* Score indicator for answered questions */}
                    {isAnswered && !isCurrentQuestion && (
                      <div className={cn(
                        'absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs flex items-center justify-center',
                        score >= 80 ? 'bg-yellow-400' : score >= 60 ? 'bg-blue-400' : 'bg-gray-400'
                      )}>
                        {score >= 80 ? '★' : score >= 60 ? '●' : '○'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Enhanced Legend */}
            <div className="flex items-center justify-center flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-600 rounded-lg mr-2 ring-1 ring-primary-500"></div>
                <span>Mevcut</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-lg mr-2"></div>
                <span>Doğru</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-lg mr-2"></div>
                <span>Yanlış</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-200 rounded-lg mr-2"></div>
                <span>Cevaplanmadı</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>Yüksek Puan</span>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Genel İlerleme</span>
                <span className="font-medium">
                  {Math.round((questionStates.filter(state => state.isAnswered).length / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(questionStates.filter(state => state.isAnswered).length / questions.length) * 100}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar with Progress and Real-time Performance */}
      <div className="lg:col-span-1 space-y-4">
        <QuizProgress
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          answeredQuestions={quizStats.answeredQuestions}
          correctAnswers={quizStats.correctAnswers}
          totalScore={quizStats.totalScore}
          maxPossibleScore={quizStats.maxPossibleScore}
          evaluations={quizStats.evaluations}
          showDetailedStats={true}
        />
        
        <RealTimePerformance
          recentEvaluations={questionStates
            .filter(state => state.evaluation)
            .map(state => state.evaluation!)
            .slice(-5) // Show last 5 evaluations
          }
          answeredQuestions={quizStats.answeredQuestions}
          correctAnswers={quizStats.correctAnswers}
        />
      </div>
    </div>
  );
};

export default QuizSession;