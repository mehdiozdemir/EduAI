import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { examService, type ExamQuestion, type PracticeExam } from '../services/examService';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';

interface LocationState {
  examName?: string;
  totalQuestions?: number;
  isNewExam?: boolean;
}

const PracticeExamPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [exam, setExam] = useState<PracticeExam | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Load exam data
  useEffect(() => {
    if (examId) {
      loadExamData();
    }
  }, [examId]);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          handleSubmitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const loadExamData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [examDetails, examQuestions] = await Promise.all([
        examService.getPracticeExamDetails(parseInt(examId!)),
        examService.getPracticeExamQuestions(parseInt(examId!), false)
      ]);

      setExam(examDetails);
      
      // Transform backend data to frontend format
      const transformedQuestions = (examQuestions || []).map((question: any) => {
        // Build options array from individual option fields if not already present
        if (!question.options || !Array.isArray(question.options)) {
          const options: Array<{
            id: string;
            text: string;
            label: string;
          }> = [];
          const optionLabels = ['A', 'B', 'C', 'D', 'E'];
          const optionFields = ['option_a', 'option_b', 'option_c', 'option_d', 'option_e'];
          
          optionFields.forEach((fieldName, index) => {
            const optionText = question[fieldName];
            if (optionText && optionText.trim() !== '') {
              options.push({
                id: optionLabels[index],
                text: optionText.trim(),
                label: optionLabels[index]
              });
            }
          });
          
          return {
            ...question,
            options
          };
        }
        return question;
      });
      
      setQuestions(transformedQuestions);

      // Calculate time left if exam has started
      if (examDetails.start_time && examDetails.status === 'in_progress') {
        const startTime = new Date(examDetails.start_time).getTime();
        const now = new Date().getTime();
        const elapsed = Math.floor((now - startTime) / 1000);
        const maxDuration = (examDetails.duration_minutes || 90) * 60; // Default 90 minutes
        const remaining = maxDuration - elapsed;
        setTimeLeft(Math.max(0, remaining));
      }

    } catch (err) {
      console.error('Error loading exam data:', err);
      setError('Sınav verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async (autoSubmit: boolean = false) => {
    if (!autoSubmit && !showSubmitConfirm) {
      setShowSubmitConfirm(true);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      console.log('🔍 Frontend Submit Debug:');
      console.log('   - Exam ID:', examId);
      console.log('   - Total Questions:', questions.length);
      console.log('   - Answers object:', answers);
      console.log('   - Answers count:', Object.keys(answers).length);
      console.log('   - Question IDs:', questions.map(q => q.id));

      const result = await examService.submitPracticeExam(parseInt(examId!), answers);
      
      // Navigate to results page
      navigate(`/app/practice-exam/${examId}/results`, {
        state: {
          examName: exam?.name || state?.examName,
          result: result
        }
      });

    } catch (err) {
      console.error('Error submitting exam:', err);
      setError('Sınav gönderilirken hata oluştu');
    } finally {
      setSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = (): number => {
    return Object.keys(answers).length;
  };

  const getQuestionStatus = (questionId: string): 'answered' | 'current' | 'unanswered' => {
    const question = questions[currentQuestionIndex];
    if (question && question.id.toString() === questionId) {
      return 'current';
    }
    return answers[questionId] ? 'answered' : 'unanswered';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/app/practice-exam')}>
            Sınav Seçimine Dön
          </Button>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Sınav Bulunamadı</h2>
          <Button onClick={() => navigate('/app/practice-exam')}>
            Sınav Seçimine Dön
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {exam.name}
              </h1>
              <p className="text-sm text-gray-600">
                Soru {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {timeLeft !== null && (
                <div className={`text-lg font-mono font-bold ${
                  timeLeft < 300 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  ⏱️ {formatTime(timeLeft)}
                </div>
              )}
              <div className="text-sm text-gray-600">
                Cevaplanan: {getAnsweredCount()} / {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Question Text */}
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Soru {currentQuestionIndex + 1}
                </h2>
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
                />
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {(currentQuestion?.options || []).map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      answers[currentQuestion.id.toString()] === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.id}
                      checked={answers[currentQuestion.id.toString()] === option.id}
                      onChange={() => selectAnswer(currentQuestion.id.toString(), option.id)}
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <span className="font-medium text-blue-600 mr-2">
                        {option.label})
                      </span>
                      <span className="text-gray-800">
                        {option.text}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Önceki Soru
                </Button>

                <div className="text-sm text-gray-500">
                  {currentQuestionIndex + 1} / {questions.length}
                </div>

                <Button
                  onClick={goToNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Sonraki Soru →
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Soru Haritası
              </h3>

              <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((question, index) => {
                  const status = getQuestionStatus(question.id.toString());
                  return (
                    <button
                      key={question.id}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg border transition-all ${
                        status === 'current'
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : status === 'answered'
                          ? 'border-green-500 bg-green-100 text-green-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-xs text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Mevcut soru</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                  <span>Cevaplandı</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
                  <span>Cevaplanmadı</span>
                </div>
              </div>

              <Button
                onClick={() => handleSubmitExam()}
                disabled={submitting}
                className="w-full"
                variant={getAnsweredCount() === questions.length ? "primary" : "secondary"}
              >
                {submitting ? 'Gönderiliyor...' : 'Sınavı Bitir'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Sınavı Bitir</h3>
            <p className="text-gray-600 mb-6">
              Sınavı bitirmek istediğinizden emin misiniz?
              <br />
              <br />
              <strong>Cevaplanan sorular:</strong> {getAnsweredCount()} / {questions.length}
              <br />
              <strong>Boş sorular:</strong> {questions.length - getAnsweredCount()}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1"
              >
                İptal
              </Button>
              <Button
                onClick={() => handleSubmitExam()}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Gönderiliyor...' : 'Evet, Bitir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeExamPage;
