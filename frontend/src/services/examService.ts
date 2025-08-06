import apiClient from './api';

// Types
export interface ExamType {
  id: number;
  name: string;
  description?: string;
  duration_minutes?: number;
  sections_count: number;
  is_active: boolean;
}

export interface ExamSection {
  id: number;
  name: string;
  exam_type_id: number;
  exam_type_name: string;
  question_count: number;
  total_questions?: number;
  color?: string;
  icon?: string;
  is_active: boolean;
}

export interface PracticeExam {
  id: number;
  name: string;
  exam_type_id: number;
  exam_section_id: number;
  user_id: number;
  status: 'not_started' | 'in_progress' | 'completed';
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  empty_answers: number;
  score: number;
  created_at: string;
  exam_type_name: string;
  exam_section_name: string;
}

export interface ExamQuestion {
  id: number;
  question_text: string;
  options: Array<{
    id: string;
    text: string;
    label: string;
    is_correct?: boolean;
  }>;
  correct_answer?: string;
  user_answer?: string;
  difficulty_level?: number;
  section_name?: string;
  is_correct?: boolean;
  explanation?: string;
}

export interface ExamStartRequest {
  exam_section_id: number;
}

export interface ExamSubmitRequest {
  [questionId: string]: string; // question_id -> selected_option
}

// Service
class ExamService {
  private baseUrl = '/api/v1';

  // Get all exam types
  async getExamTypes(): Promise<ExamType[]> {
    const response = await apiClient.get(`${this.baseUrl}/exam-types`);
    return response.data;
  }

  // Get sections for a specific exam type
  async getExamSections(examTypeId: number): Promise<ExamSection[]> {
    const response = await apiClient.get(`${this.baseUrl}/exam-types/${examTypeId}/sections`);
    return response.data;
  }

  // Get user's practice exams
  async getUserPracticeExams(): Promise<PracticeExam[]> {
    const response = await apiClient.get(`${this.baseUrl}/user/practice-exams`);
    return response.data;
  }

  // Start a practice exam (create new or select existing)
  async startPracticeExam(examData: ExamStartRequest, useExisting: boolean = true, forceNew: boolean = false): Promise<{
    exam_id: number;
    message: string;
    exam_name: string;
    total_questions: number;
    status: string;
  }> {
    const response = await apiClient.post(
      `${this.baseUrl}/practice-exam/start?use_existing=${useExisting}&force_new=${forceNew}`,
      examData
    );
    return response.data;
  }

  // Get practice exam details
  async getPracticeExamDetails(examId: number): Promise<PracticeExam> {
    const response = await apiClient.get(`${this.baseUrl}/practice-exam/${examId}/details`);
    return response.data;
  }

  // Get practice exam questions
  async getPracticeExamQuestions(examId: number, includeAnswers: boolean = false): Promise<ExamQuestion[]> {
    const response = await apiClient.get(
      `${this.baseUrl}/practice-exam/${examId}/questions?include_answers=${includeAnswers}`
    );
    return response.data;
  }

  // Submit practice exam answers
  async submitPracticeExam(examId: number, answers: ExamSubmitRequest): Promise<{
    message: string;
    score: number;
    correct_count: number;
    total_questions: number;
    results: any;
    analysis?: any; // Analiz sonuçları
    analysis_status?: string;
    analysis_error?: string;
    youtube_recommendations?: any; // YouTube önerileri
    youtube_status?: string;
    book_recommendations?: any; // Kitap önerileri
    book_status?: string;
    parallel_processing?: {
      enabled: boolean;
      execution_summary?: any;
      processing_time?: string;
      error?: string;
      fallback?: boolean;
    };
  }> {
    const response = await apiClient.post(`${this.baseUrl}/practice-exam/${examId}/submit`, answers);
    return response.data;
  }

  // Get exam results
  async getExamResults(examId: number): Promise<{
    exam: PracticeExam;
    statistics: any;
    recommendations: string[];
    grade: string;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/practice-exam/${examId}/results`);
    return response.data;
  }

  // Review completed exam (with answers)
  async reviewPracticeExam(examId: number): Promise<{
    exam: PracticeExam;
    detailed_questions: ExamQuestion[];
    message?: string;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/practice-exam/${examId}/review`);
    return response.data;
  }

  // Get exam statistics
  async getExamStatistics(): Promise<{
    total_exams: number;
    completed_exams: number;
    in_progress_exams: number;
    cancelled_exams: number;
    completion_rate: number;
    average_score: number;
    max_score: number;
    exam_type_statistics: any;
  }> {
    const response = await apiClient.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  // Get exam analysis (separate endpoint)
  async getExamAnalysis(examId: number, userId?: number): Promise<{
    status: string;
    data?: {
      weakness_level: number;
      weak_topics: string[];
      strong_topics: string[];
      recommendations: string[];
      detailed_analysis: string;
      personalized_insights: string[];
      improvement_trend: string;
    };
    exam_info?: {
      exam_id: number;
      exam_type: string;
      exam_section: string;
      score: number;
      completion_date?: string;
    };
    error?: string;
  }> {
    const params = userId ? `?exam_id=${examId}&user_id=${userId}` : `?exam_id=${examId}`;
    const response = await apiClient.post(`/api/v1/performance/analyze-exam${params}`);
    return response.data;
  }
}

export const examService = new ExamService();
export default examService;
