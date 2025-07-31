// Export all API services

export { BaseApiService, TokenManager } from './api';
export { AuthService, authService } from './authService';
export { SubjectService, subjectService } from './subjectService';
export { EducationService, educationService } from './educationService';
export { QuestionService, questionService } from './questionService';
export { PerformanceService, performanceService } from './performanceService';

// Import services for re-export
import { authService } from './authService';
import { subjectService } from './subjectService';
import { educationService } from './educationService';
import { questionService } from './questionService';
import { performanceService } from './performanceService';

// Re-export default instances for convenience
export const services = {
  auth: authService,
  subject: subjectService,
  education: educationService,
  question: questionService,
  performance: performanceService,
};

// Export types for service consumers
export type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Subject,
  Topic,
  EducationLevelData,
  Course,
  CourseTopic,
  EducationLevelWithCourses,
  CourseWithEducationLevel,
  CourseWithTopics,
  EducationSystemOverview,
  CourseListResponse,
  EducationLevelName,
  QuestionParams,
  GeneratedQuestion,
  QuestionGenerationResponse,
  EvaluateRequest,
  AnswerEvaluation,
  PerformanceAnalysisRequest,
  PerformanceAnalysis,
  ResourceRecommendation,
  PerformanceData,
  ApiError,
  ValidationError,
  ApiResponse,
  PaginatedResponse,
} from '../types';