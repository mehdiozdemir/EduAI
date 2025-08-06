import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DifficultySelector from '../components/features/DifficultySelector';
import QuestionCountSelector from '../components/features/QuestionCountSelector';
import { useErrorHandler, ErrorBoundarySection } from '../components/ui/ErrorBoundaryProvider';
import { 
  QuizConfigurationErrorBoundary, 
  FormValidationError 
} from '../components/ui/EnhancedErrorHandling';
import { Loading } from '../components/ui/Loading';
import { educationService } from '../services/educationService';
import { 
  validateQuizConfigurationState,
  createTopicSelectionState,
  extractCourseId,
  createFallbackNavigation,
  loadNavigationState,
  clearNavigationState
} from '../utils/navigationState';
import type { 
  QuizConfigurationState,
  QuizConfigurationNavigationState,
  DifficultyLevelTurkish,
  QuestionCountOption
} from '../types';

export const QuizConfigurationPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleError } = useErrorHandler();

  // Extract and validate course ID
  const courseIdNum = extractCourseId(courseId);

  // Get navigation state from location or session storage
  const locationState = location.state as QuizConfigurationNavigationState | null;
  const sessionState = loadNavigationState<QuizConfigurationNavigationState>('QUIZ_CONFIG_STATE');
  
  // Use location state first, then session storage as fallback
  const navigationState = validateQuizConfigurationState(locationState) 
    ? locationState 
    : validateQuizConfigurationState(sessionState) 
    ? sessionState 
    : null;

  const [state, setState] = useState<QuizConfigurationState>({
    selectedTopics: navigationState?.selectedTopics || [],
    course: navigationState?.course || null!,
    difficulty: '' as any, // Will be set to empty initially for validation
    questionCount: null as any, // Will be set to null initially for validation
    isSubmitting: false
  });

  const [errors, setErrors] = useState<{
    difficulty?: string;
    questionCount?: string;
    general?: string;
  }>({});

  // Handle fallback navigation when state is missing
  const handleMissingState = () => {
    console.warn('Navigation state missing, redirecting to subjects page');
    clearNavigationState('QUIZ_CONFIG_STATE');
    navigate(createFallbackNavigation.toSubjects(), { replace: true });
  };

  // Load course data if missing from navigation state (handles browser refresh/direct URL access)
  const loadMissingCourseData = async () => {
    if (!courseIdNum) {
      handleMissingState();
      return;
    }

    try {
      const course = await educationService.getCourse(courseIdNum);
      
      // If we have course data but no selected topics, redirect to topic selection
      if (course && (!navigationState?.selectedTopics?.length)) {
        console.warn('No selected topics found, redirecting to topic selection');
        const topicSelectionState = createTopicSelectionState(course);
        navigate(createFallbackNavigation.toTopicSelection(courseIdNum), {
          state: topicSelectionState,
          replace: true
        });
        return;
      }

      // Update state with loaded course data
      setState(prev => ({ ...prev, course }));
    } catch (error: any) {
      console.error('Error loading course data:', error);
      handleError(error);
      handleMissingState();
    }
  };

  // Check navigation state and handle missing data
  useEffect(() => {
    if (!navigationState || !navigationState.course || !navigationState.selectedTopics?.length) {
      console.warn('Missing navigation state, attempting to recover...');
      loadMissingCourseData();
    }
  }, [navigationState, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle difficulty selection
  const handleDifficultyChange = (difficulty: DifficultyLevelTurkish) => {
    setState(prev => ({ ...prev, difficulty }));
    // Clear difficulty error when user makes a selection
    if (errors.difficulty) {
      setErrors(prev => ({ ...prev, difficulty: undefined }));
    }
  };

  // Handle question count selection
  const handleQuestionCountChange = (questionCount: QuestionCountOption) => {
    setState(prev => ({ ...prev, questionCount }));
    // Clear question count error when user makes a selection
    if (errors.questionCount) {
      setErrors(prev => ({ ...prev, questionCount: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!state.difficulty) {
      newErrors.difficulty = 'Zorluk seviyesi seçimi zorunludur';
    }

    if (!state.questionCount) {
      newErrors.questionCount = 'Soru sayısı seçimi zorunludur';
    }

    if (state.selectedTopics.length === 0) {
      newErrors.general = 'En az bir konu seçilmiş olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      // Create quiz configuration object
      const quizConfig = {
        courseId: courseIdNum!,
        topicIds: state.selectedTopics.map(topic => topic.id),
        difficulty: state.difficulty,
        questionCount: state.questionCount
      };

      // Clear navigation states as we're moving to quiz
      clearNavigationState('QUIZ_CONFIG_STATE');
      clearNavigationState('TOPIC_SELECTION_STATE');

      // Navigate to quiz page
      navigate('/app/quiz', {
        state: {
          configuration: quizConfig,
          course: state.course,
          selectedTopics: state.selectedTopics
        }
      });

    } catch (error: any) {
      console.error('Error starting quiz:', error);
      handleError(error);
      setErrors(prev => ({ 
        ...prev, 
        general: error.message || 'Quiz başlatılırken bir hata oluştu' 
      }));
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle back navigation to topic selection
  const handleBack = () => {
    if (!courseIdNum || !state.course) return;

    // Create navigation state for topic selection
    const topicSelectionState = createTopicSelectionState(
      state.course,
      navigationState?.educationLevel
    );

    navigate(createFallbackNavigation.toTopicSelection(courseIdNum), {
      state: topicSelectionState
    });
  };

  // Handle back to subjects
  const handleBackToSubjects = () => {
    // Clear navigation states when going back to subjects
    clearNavigationState('QUIZ_CONFIG_STATE');
    clearNavigationState('TOPIC_SELECTION_STATE');
    navigate(createFallbackNavigation.toSubjects());
  };

  // Show loading if navigation state is being processed
  if (!navigationState || !state.course) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Yükleniyor..." />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      <QuizConfigurationErrorBoundary onError={handleError}>
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button
                  onClick={handleBackToSubjects}
                  className="hover:text-primary-600 transition-colors focus:outline-none focus:text-primary-600"
                >
                  Dersler
                </button>
                <span>›</span>
                <button
                  onClick={handleBack}
                  className="hover:text-primary-600 transition-colors focus:outline-none focus:text-primary-600"
                >
                  Konu Seçimi
                </button>
                <span>›</span>
                <span className="text-gray-900 font-medium">Soru Çözümü Ayarları</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Soru Çözümü Ayarları
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
              Soru Çözümü parametrelerini ayarlayın ve quiz'i başlatın
              </p>
            </div>
            
            <button
              onClick={handleBack}
              className="self-start sm:self-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              ← Geri
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        <ErrorBoundarySection>
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              Seçim Özeti
            </h2>
            
            {/* Course Info */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-blue-800 mb-1">Ders</h3>
              <div className="flex items-center gap-2">
                <span className="text-blue-900 font-medium">{state.course.name}</span>
                <span className="text-blue-700 text-sm">
                  ({state.course.education_level.name})
                </span>
              </div>
              {state.course.description && (
                <p className="text-blue-700 text-sm mt-1">{state.course.description}</p>
              )}
            </div>

            {/* Selected Topics */}
            <div>
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Seçilen Konular ({state.selectedTopics.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {state.selectedTopics.map((topic) => (
                  <span
                    key={topic.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {topic.name}
                    {topic.difficulty_level && (
                      <span className="ml-1 text-blue-600">
                        (Seviye {topic.difficulty_level})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </ErrorBoundarySection>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Form Validation Errors - Only show general errors */}
          {errors.general && (
            <FormValidationError errors={{ general: errors.general }} className="mb-6" />
          )}

          {/* Difficulty Selector */}
          <ErrorBoundarySection>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <DifficultySelector
                value={state.difficulty}
                onChange={handleDifficultyChange}
                error={errors.difficulty}
                required
                label="Zorluk Seviyesi"
                helperText="Quiz sorularının zorluk seviyesini belirleyin"
              />
            </div>
          </ErrorBoundarySection>

          {/* Question Count Selector */}
          <ErrorBoundarySection>
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <QuestionCountSelector
                value={state.questionCount}
                onChange={handleQuestionCountChange}
                error={errors.questionCount}
                required
                label="Soru Sayısı"
                helperText="Quiz'de kaç soru olacağını seçin"
              />
            </div>
          </ErrorBoundarySection>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              ← Konu Seçimine Dön
            </button>
            
            <button
              type="submit"
              disabled={state.isSubmitting}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                state.isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg'
              }`}
            >
              {state.isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Soru Çözümü Başlatılıyor...
                </div>
              ) : (
                'Soru Çözümünü Başlat'
              )}
            </button>
          </div>

          {/* Form Help Text */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-500">
            Soru çözümü ayarlarınızı kontrol edin ve hazır olduğunuzda soru çözümü başlatın
            </p>
          </div>
        </form>
      </QuizConfigurationErrorBoundary>
    </div>
  );
};

export default QuizConfigurationPage;