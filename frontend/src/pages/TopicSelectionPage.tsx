import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TopicCard from '../components/features/TopicCard';
import { Loading } from '../components/ui/Loading';
import { useErrorHandler, ErrorBoundarySection } from '../components/ui/ErrorBoundaryProvider';
import { RetryHandler, RetryUI } from '../components/ui/RetryHandler';
import { EmptyStateFallback } from '../components/ui/ErrorFallbacks';
import { 
  TopicSelectionErrorBoundary, 
  EnhancedRetryHandler, 
  NoTopicsEmptyState, 
  APIErrorHandler 
} from '../components/ui/EnhancedErrorHandling';
import { educationService } from '../services/educationService';
import { 
  validateTopicSelectionState,
  createTopicSelectionState,
  createQuizConfigurationState,
  extractCourseId,
  createFallbackNavigation,
  saveNavigationState,
  loadNavigationState,
  clearNavigationState
} from '../utils/navigationState';
import type { 
  CourseTopic, 
  TopicSelectionState,
  TopicSelectionNavigationState,
  CourseWithEducationLevel 
} from '../types';

export const TopicSelectionPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { handleError } = useErrorHandler();

  // Extract and validate course ID
  const courseIdNum = extractCourseId(courseId);

  // Get navigation state from location or session storage
  const locationState = location.state as TopicSelectionNavigationState | null;
  const sessionState = loadNavigationState<TopicSelectionNavigationState>('TOPIC_SELECTION_STATE');
  
  // Use location state first, then session storage as fallback
  const navigationState = validateTopicSelectionState(locationState) 
    ? locationState 
    : validateTopicSelectionState(sessionState) 
    ? sessionState 
    : null;

  const [state, setState] = useState<TopicSelectionState>({
    course: navigationState?.course || null,
    topics: [],
    selectedTopics: [],
    loading: true,
    error: null
  });

  // Load course data if not provided via navigation state
  const loadCourse = async (id: number): Promise<CourseWithEducationLevel | null> => {
    try {
      const course = await educationService.getCourse(id);
      setState(prev => ({ ...prev, course }));
      return course;
    } catch (error: any) {
      console.error('Error loading course:', error);
      handleError(error);
      setState(prev => ({ ...prev, error: error.message || 'Failed to load course' }));
      return null;
    }
  };

  // Handle fallback navigation when state is missing
  const handleMissingState = () => {
    console.warn('Navigation state missing, redirecting to subjects page');
    clearNavigationState('TOPIC_SELECTION_STATE');
    navigate(createFallbackNavigation.toSubjects(), { replace: true });
  };

  // Load topics for the course
  const loadTopics = async () => {
    if (!courseIdNum) {
      setState(prev => ({ ...prev, error: 'Course ID is required', loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let courseData = state.course;
      
      // Load course if not already loaded (handles browser refresh/direct URL access)
      if (!courseData) {
        courseData = await loadCourse(courseIdNum);
        if (!courseData) {
          // If course loading fails, redirect to subjects page
          handleMissingState();
          return;
        }
        
        // Save navigation state to session storage for future use
        const navState = createTopicSelectionState(courseData);
        saveNavigationState('TOPIC_SELECTION_STATE', navState);
      }

      // Load topics
      const topics = await educationService.getCourseTopics(courseIdNum);
      setState(prev => ({ 
        ...prev, 
        topics, 
        loading: false,
        error: null 
      }));
    } catch (error: any) {
      console.error('Error loading topics:', error);
      handleError(error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: error.message || 'Failed to load topics' 
      }));
    }
  };

  // Handle topic selection toggle
  const handleTopicToggle = (topic: CourseTopic) => {
    setState(prev => {
      const isSelected = prev.selectedTopics.some(t => t.id === topic.id);
      const selectedTopics = isSelected
        ? prev.selectedTopics.filter(t => t.id !== topic.id)
        : [...prev.selectedTopics, topic];

      return { ...prev, selectedTopics };
    });
  };

  // Handle continue to quiz configuration
  const handleContinue = () => {
    if (state.selectedTopics.length === 0 || !state.course || !courseIdNum) return;

    // Create complete navigation state for quiz configuration
    const quizConfigState = createQuizConfigurationState(
      state.course,
      state.selectedTopics,
      navigationState?.educationLevel
    );

    // Save to session storage for browser refresh scenarios
    saveNavigationState('QUIZ_CONFIG_STATE', quizConfigState);

    navigate(createFallbackNavigation.toQuizConfiguration(courseIdNum), {
      state: quizConfigState
    });
  };

  // Handle back navigation
  const handleBack = () => {
    // Clear navigation state when going back to subjects
    clearNavigationState('TOPIC_SELECTION_STATE');
    navigate(createFallbackNavigation.toSubjects());
  };

  // Load data on component mount
  useEffect(() => {
    loadTopics();
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle missing course ID
  if (!courseIdNum) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">Geçersiz ders ID'si.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Derslere Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <TopicSelectionErrorBoundary onError={handleError}>
        <EnhancedRetryHandler
          operation={loadTopics}
          onError={handleError}
          maxAttempts={3}
        >
          {({ retry, isRetrying, lastError, canRetry, errorType }) => (
            <>
              {/* Course Header */}
              {state.course && (
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <button
                          onClick={handleBack}
                          className="hover:text-primary-600 transition-colors focus:outline-none focus:text-primary-600"
                        >
                          Dersler
                        </button>
                        <span>›</span>
                        <span>{state.course.education_level.name}</span>
                        <span>›</span>
                        <span className="text-gray-900 font-medium">{state.course.name}</span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Konu Seçimi
                      </h1>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {state.course.name} dersi için çalışmak istediğiniz konuları seçin
                      </p>
                    </div>
                    
                    <button
                      onClick={handleBack}
                      className="self-start sm:self-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      ← Geri
                    </button>
                  </div>

                  {/* Course Description */}
                  {state.course.description && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm sm:text-base">
                        {state.course.description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Enhanced Error Display */}
              {lastError && (
                <div className="mb-6">
                  <APIErrorHandler
                    error={lastError}
                    onRetry={retry}
                    onReset={() => window.location.reload()}
                    isRetrying={isRetrying}
                  />
                </div>
              )}

              {/* Loading State */}
              {state.loading && (
                <div className="flex justify-center py-12">
                  <Loading size="lg" text="Konular yükleniyor..." />
                </div>
              )}

              {/* Topics Grid */}
              {!state.loading && !lastError && (
                <TopicSelectionErrorBoundary>
                  {/* Selected Topics Summary */}
                  {state.selectedTopics.length > 0 && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-green-900 text-sm sm:text-base">
                            {state.selectedTopics.length} konu seçildi
                          </h3>
                          <p className="text-green-700 text-xs sm:text-sm">
                            {state.selectedTopics.map(t => t.name).join(', ')}
                          </p>
                        </div>
                        <button
                          onClick={() => setState(prev => ({ ...prev, selectedTopics: [] }))}
                          className="self-start sm:self-center text-green-600 hover:text-green-800 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                        >
                          Tümünü Temizle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Topics Grid */}
                  {state.topics.length > 0 ? (
                    <>
                      <div className="mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                          Mevcut Konular ({state.topics.length})
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Birden fazla konu seçebilirsiniz
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        {state.topics.map((topic) => (
                          <ErrorBoundarySection key={topic.id}>
                            <TopicCard
                              topic={topic}
                              isSelected={state.selectedTopics.some(t => t.id === topic.id)}
                              onToggle={handleTopicToggle}
                            />
                          </ErrorBoundarySection>
                        ))}
                      </div>

                      {/* Continue Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={handleContinue}
                          disabled={state.selectedTopics.length === 0}
                          className={`px-6 py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            state.selectedTopics.length > 0
                              ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Devam Et ({state.selectedTopics.length} konu seçildi)
                        </button>
                      </div>

                      {/* Helper Text */}
                      {state.selectedTopics.length === 0 && (
                        <div className="text-center mt-4">
                          <p className="text-sm text-gray-500">
                            Devam etmek için en az bir konu seçin
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Enhanced Empty State */
                    <NoTopicsEmptyState
                      courseName={state.course?.name}
                      onBackToCourses={handleBack}
                      onRetry={retry}
                    />
                  )}
                </TopicSelectionErrorBoundary>
              )}
            </>
          )}
        </EnhancedRetryHandler>
      </TopicSelectionErrorBoundary>
    </div>
  );
};

export default TopicSelectionPage;