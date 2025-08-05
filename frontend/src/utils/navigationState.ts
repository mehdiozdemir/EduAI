// Navigation state management utilities for topic selection flow

import type { 
  TopicSelectionNavigationState,
  QuizConfigurationNavigationState,
  CourseWithEducationLevel,
  CourseTopic,
  EducationLevelData
} from '../types';

/**
 * Creates navigation state for topic selection page
 */
export const createTopicSelectionState = (
  course: CourseWithEducationLevel,
  educationLevel?: EducationLevelData
): TopicSelectionNavigationState => {
  return {
    course,
    educationLevel: educationLevel || course.education_level
  };
};

/**
 * Creates navigation state for quiz configuration page
 */
export const createQuizConfigurationState = (
  course: CourseWithEducationLevel,
  selectedTopics: CourseTopic[],
  educationLevel?: EducationLevelData
): QuizConfigurationNavigationState => {
  return {
    course,
    selectedTopics,
    educationLevel: educationLevel || course.education_level
  };
};

/**
 * Validates topic selection navigation state
 */
export const validateTopicSelectionState = (
  state: any
): state is TopicSelectionNavigationState => {
  return !!(
    state &&
    typeof state === 'object' &&
    state.course &&
    typeof state.course === 'object' &&
    state.course.id &&
    state.course.name &&
    state.course.education_level &&
    state.educationLevel &&
    typeof state.educationLevel === 'object' &&
    state.educationLevel.id &&
    state.educationLevel.name
  );
};

/**
 * Validates quiz configuration navigation state
 */
export const validateQuizConfigurationState = (
  state: any
): state is QuizConfigurationNavigationState => {
  return !!(
    validateTopicSelectionState(state) &&
    state.selectedTopics &&
    Array.isArray(state.selectedTopics) &&
    state.selectedTopics.length > 0 &&
    state.selectedTopics.every((topic: any) => 
      topic && typeof topic === 'object' && topic.id && topic.name
    )
  );
};

/**
 * Extracts course ID from URL parameters
 */
export const extractCourseId = (courseIdParam: string | undefined): number | null => {
  if (!courseIdParam) return null;
  
  const courseId = parseInt(courseIdParam, 10);
  return isNaN(courseId) ? null : courseId;
};

/**
 * Creates fallback navigation paths for error scenarios
 */
export const createFallbackNavigation = {
  toSubjects: () => '/app/subjects',
  toTopicSelection: (courseId: number) => `/app/courses/${courseId}/topics`,
  toQuizConfiguration: (courseId: number) => `/app/courses/${courseId}/quiz-config`
};

/**
 * Session storage keys for navigation state persistence
 */
export const NAVIGATION_STORAGE_KEYS = {
  TOPIC_SELECTION_STATE: 'topic_selection_navigation_state',
  QUIZ_CONFIG_STATE: 'quiz_configuration_navigation_state'
} as const;

/**
 * Saves navigation state to session storage
 */
export const saveNavigationState = (
  key: keyof typeof NAVIGATION_STORAGE_KEYS,
  state: TopicSelectionNavigationState | QuizConfigurationNavigationState
): void => {
  try {
    const storageKey = NAVIGATION_STORAGE_KEYS[key];
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save navigation state to session storage:', error);
  }
};

/**
 * Loads navigation state from session storage
 */
export const loadNavigationState = <T = any>(
  key: keyof typeof NAVIGATION_STORAGE_KEYS
): T | null => {
  try {
    const storageKey = NAVIGATION_STORAGE_KEYS[key];
    const stored = sessionStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to load navigation state from session storage:', error);
    return null;
  }
};

/**
 * Clears navigation state from session storage
 */
export const clearNavigationState = (
  key: keyof typeof NAVIGATION_STORAGE_KEYS
): void => {
  try {
    const storageKey = NAVIGATION_STORAGE_KEYS[key];
    sessionStorage.removeItem(storageKey);
  } catch (error) {
    console.warn('Failed to clear navigation state from session storage:', error);
  }
};

/**
 * Clears all navigation states from session storage
 */
export const clearAllNavigationStates = (): void => {
  Object.keys(NAVIGATION_STORAGE_KEYS).forEach(key => {
    clearNavigationState(key as keyof typeof NAVIGATION_STORAGE_KEYS);
  });
};