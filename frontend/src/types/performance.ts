// Performance analysis and recommendation related types

export interface PerformanceAnalysisRequest {
  user_id: number;
  subject_id: number;
  topic_id: number;
  total_questions: number;
  correct_answers: number;
  quiz_results: {
    total_questions: number;
    correct_answers: number;
    answers: Array<{
      question_id: string;
      is_correct: boolean;
      user_answer: string;
    }>;
  };
}

export interface PerformanceAnalysis {
  id: number;
  user_id: number;
  subject_id: number | null;
  topic_id: number | null;
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  weakness_level: number;
  created_at: string;
}

export interface ResourceRecommendation {
  id: number;
  resource_type: string;
  title: string;
  url: string;
  description: string;
  relevance_score: number;
  userRating?: number;
  isUsed?: boolean;
}

export interface PerformanceData {
  date: string;
  accuracy: number;
  subject: string;
  topic: string;
}