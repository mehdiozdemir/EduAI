// Education level and course related types

export interface EducationLevelData {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
  grade_range: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Course {
  id: number;
  name: string;
  description: string | null;
  education_level_id: number;
  code: string | null;
  color: string | null;
  icon: string | null;
  is_active: number;
  created_at: string;
  updated_at: string | null;
}

export interface CourseTopic {
  id: number;
  name: string;
  description: string | null;
  course_id: number;
  sort_order: number;
  difficulty_level: number;
  estimated_duration: number | null;
  is_active: number;
  created_at: string;
  updated_at: string | null;
}

// Extended types with relationships
export interface EducationLevelWithCourses extends EducationLevelData {
  courses: Course[];
}

export interface CourseWithEducationLevel extends Course {
  education_level: EducationLevelData;
}

export interface CourseWithTopics extends Course {
  topics: CourseTopic[];
}

// Response types
export interface EducationSystemOverview {
  education_levels: EducationLevelWithCourses[];
  total_levels: number;
  total_courses: number;
  total_topics: number;
}

export interface CourseListResponse {
  courses: CourseWithEducationLevel[];
  total: number;
  page: number;
  per_page: number;
}

// Quiz configuration types
export interface QuizConfiguration {
  courseId: number;
  topicIds: number[];
  difficulty: 'kolay' | 'orta' | 'zor';
  questionCount: 5 | 10 | 15 | 20;
}

// Navigation state types for topic selection flow
export interface TopicSelectionNavigationState {
  course: CourseWithEducationLevel;
  educationLevel: EducationLevelData;
}

export interface QuizConfigurationNavigationState {
  course: CourseWithEducationLevel;
  selectedTopics: CourseTopic[];
  educationLevel: EducationLevelData;
}

// Topic selection state management types
export interface TopicSelectionState {
  course: CourseWithEducationLevel | null;
  topics: CourseTopic[];
  selectedTopics: CourseTopic[];
  loading: boolean;
  error: string | null;
}

export interface QuizConfigurationState {
  selectedTopics: CourseTopic[];
  course: CourseWithEducationLevel;
  difficulty: 'kolay' | 'orta' | 'zor';
  questionCount: 5 | 10 | 15 | 20;
  isSubmitting: boolean;
}

// Type aliases for convenience
export type EducationLevelName = 'ilkokul' | 'ortaokul' | 'lise';
export type DifficultyLevelTurkish = 'kolay' | 'orta' | 'zor';
export type QuestionCountOption = 5 | 10 | 15 | 20;