import apiClient from './api';
import type { ApiResponse } from '../types/api';

// Admin specific types
export interface AdminStats {
  total_users: number;
  total_exam_types: number;
  total_questions: number;
  monthly_exams: number;
  active_users: number;
  popular_exam_types: Array<{ name: string; count: number }>;
}

export interface UserAdmin {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
}

export interface ExamTypeAdmin {
  id: number;
  name: string;
  description?: string;
  duration_minutes?: number;
  is_active: boolean;
  sections_count: number;
}

export interface ExamQuestionAdmin {
  id: number;
  question_text: string;
  exam_section_id: number;
  section_name: string;
  difficulty_level?: number;
  correct_answer: string;
  created_by?: string;
  created_at: string;
}

export interface GenerateQuestionsRequest {
  exam_type: string;
  subject: string;
  count: number;
  difficulty_level?: number;
}

export interface SystemHealthResponse {
  status: string;
  database: string;
  ai_service: string;
  memory_usage: string;
  uptime: string;
}

class AdminService {
  private readonly baseUrl = '/api/v1/admin';

  async getStats(): Promise<ApiResponse<AdminStats>> {
    return apiClient.get(`${this.baseUrl}/stats`);
  }

  async getUsers(): Promise<ApiResponse<UserAdmin[]>> {
    return apiClient.get(`${this.baseUrl}/users`);
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<ApiResponse<void>> {
    return apiClient.put(`${this.baseUrl}/users/${userId}/status`, { is_active: isActive });
  }

  async updateUserRole(userId: number, isAdmin: boolean): Promise<ApiResponse<void>> {
    return apiClient.put(`${this.baseUrl}/users/${userId}/role`, { is_admin: isAdmin });
  }

  async getExamTypes(): Promise<ApiResponse<ExamTypeAdmin[]>> {
    return apiClient.get(`${this.baseUrl}/exam-types`);
  }

  async createExamType(examType: Omit<ExamTypeAdmin, 'id' | 'sections_count'>): Promise<ApiResponse<ExamTypeAdmin>> {
    return apiClient.post(`${this.baseUrl}/exam-types`, examType);
  }

  async updateExamType(id: number, examType: Partial<ExamTypeAdmin>): Promise<ApiResponse<ExamTypeAdmin>> {
    return apiClient.put(`${this.baseUrl}/exam-types/${id}`, examType);
  }

  async deleteExamType(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.baseUrl}/exam-types/${id}`);
  }

  async getQuestions(
    examSectionId?: number,
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<{ questions: ExamQuestionAdmin[]; total: number }>> {
    const params = new URLSearchParams();
    if (examSectionId) params.append('exam_section_id', examSectionId.toString());
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get(`${this.baseUrl}/questions${query}`);
  }

  async deleteQuestion(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.baseUrl}/questions/${id}`);
  }

  async generateQuestions(request: GenerateQuestionsRequest): Promise<ApiResponse<{ message: string; count: number }>> {
    return apiClient.post(`${this.baseUrl}/generate-questions`, request);
  }

  async getSystemHealth(): Promise<ApiResponse<SystemHealthResponse>> {
    return apiClient.get(`${this.baseUrl}/health`);
  }

  async clearCache(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`${this.baseUrl}/clear-cache`);
  }

  async exportData(dataType: 'users' | 'questions' | 'exam_types'): Promise<ApiResponse<{ download_url: string }>> {
    return apiClient.post(`${this.baseUrl}/export`, { data_type: dataType });
  }

  // ============ EXAM TYPES AND SECTIONS ============
  async getExamTypesForAdmin(): Promise<ApiResponse<ExamTypeAdmin[]>> {
    return apiClient.get(`${this.baseUrl}/exam-types`);
  }

  async getExamSections(examTypeId?: number): Promise<ApiResponse<ExamSectionAdmin[]>> {
    if (examTypeId) {
      return apiClient.get(`${this.baseUrl}/exam-types/${examTypeId}/sections`);
    }
    return apiClient.get(`${this.baseUrl}/exam-sections`);
  }

  // ============ PRACTICE EXAM MANAGEMENT ============
  async createPracticeExam(examData: {
    exam_section_id: number;
    user_id: number;
    name: string;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`${this.baseUrl}/practice-exams`, examData);
  }

  async getPracticeExams(): Promise<ApiResponse<PracticeExamAdmin[]>> {
    return apiClient.get(`${this.baseUrl}/practice-exams`);
  }

  async deletePracticeExam(examId: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.baseUrl}/practice-exams/${examId}`);
  }

  async updatePracticeExamStatus(examId: number, status: string): Promise<ApiResponse<any>> {
    return apiClient.patch(`${this.baseUrl}/practice-exams/${examId}/status`, { status });
  }

  // ============ EXAM SECTION MANAGEMENT ============
  async createExamSection(sectionData: {
    name: string;
    exam_type_id: number;
    course_id: number;
    question_count?: number;
    sort_order?: number;
    color?: string;
    icon?: string;
  }): Promise<ApiResponse<ExamSectionAdmin>> {
    return apiClient.post(`${this.baseUrl}/exam-sections`, sectionData);
  }

  // ============ COURSES ============
  async getCourses(): Promise<ApiResponse<CourseAdmin[]>> {
    return apiClient.get(`${this.baseUrl}/courses`);
  }
}

export const adminService = new AdminService();

// Additional types
export interface ExamSectionAdmin {
  id: number;
  name: string;
  exam_type_id: number;
  exam_type_name: string;
  question_count?: number;
  is_active: boolean;
  questions_count: number;
}

export interface PracticeExamAdmin {
  id: number;
  name: string;
  user_id: number;
  user_email: string;
  exam_type_name: string;
  status: string;
  score?: number;
  total_questions: number;
  created_at: string;
  start_time?: string;
  end_time?: string;
}

export interface CourseAdmin {
  id: number;
  name: string;
  code?: string;
  description?: string;
  education_level_id: number;
  created_at: string;
  topics_count: number;
}
