import apiClient from './api';

export interface EducationLevelAdmin {
  id: number;
  name: string;
  description?: string;
}

// Admin API Types
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

export interface UserCreate {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_admin: boolean;
}

export interface UserUpdate {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

export interface SubjectAdmin {
  id: number;
  name: string;
  description?: string;
  education_level_id?: number;
  created_at: string;
  topics_count: number;
}

export interface SubjectCreate {
  name: string;
  description?: string;
  education_level_id: number;
}

export interface SubjectUpdate {
  name?: string;
  description?: string;
  education_level_id?: number;
}

export interface TopicAdmin {
  id: number;
  subject_id: number;
  subject_name: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface TopicCreate {
  subject_id: number;
  name: string;
  description?: string;
}

export interface TopicUpdate {
  subject_id?: number;
  name?: string;
  description?: string;
}

export interface ExamTypeAdmin {
  id: number;
  name: string;
  description?: string;
  duration_minutes?: number;
  education_level_id?: number;
  is_active: boolean;
  sections_count: number;
}

export interface ExamTypeCreate {
  name: string;
  description?: string;
  duration_minutes?: number;
  education_level_id: number;
}

export interface ExamTypeUpdate {
  name?: string;
  description?: string;
  duration_minutes?: number;
  education_level_id?: number;
  is_active?: boolean;
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
  section_name: string;
  count: number;
  difficulty?: number;
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

export interface PracticeExamQuestion {
  id: number;
  question_text: string;
  options: string[];
  correct_answer: string;
  difficulty_level?: number;
  section_name?: string;
  user_answer?: string;
  is_correct?: boolean;
}

// Exam Section Types
export interface ExamSectionAdmin {
  id: number;
  name: string;
  exam_type_id: number;
  course_id: number;
  question_count: number;
  sort_order: number;
  color?: string;
  icon?: string;
  created_at: string;
}

export interface ExamSectionCreate {
  name: string;
  exam_type_id: number;
  course_id: number;
  question_count?: number;
  sort_order?: number;
  color?: string;
  icon?: string;
}

export interface ExamSectionUpdate {
  name?: string;
  exam_type_id?: number;
  course_id?: number;
  question_count?: number;
  sort_order?: number;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

// Admin API Functions
export const adminApi = {
  // Dashboard Stats
  getStats: async (): Promise<AdminStats> => {
    const response = await apiClient.get('/api/v1/admin/stats');
    return response.data;
  },

  // User Management
  getUsers: async (): Promise<UserAdmin[]> => {
    const response = await apiClient.get('/api/v1/admin/users');
    return response.data;
  },

  createUser: async (userData: UserCreate): Promise<UserAdmin> => {
    const response = await apiClient.post('/api/v1/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId: number, userData: UserUpdate): Promise<UserAdmin> => {
    const response = await apiClient.put(`/api/v1/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/users/${userId}`);
  },

  activateUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/v1/admin/users/${userId}/activate`);
  },

  deactivateUser: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/v1/admin/users/${userId}/deactivate`);
  },

  makeAdmin: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/v1/admin/users/${userId}/make-admin`);
  },

  removeAdmin: async (userId: number): Promise<void> => {
    await apiClient.post(`/api/v1/admin/users/${userId}/remove-admin`);
  },

  // Course Management (formerly Subject Management)
  getSubjects: async (): Promise<SubjectAdmin[]> => {
    const response = await apiClient.get('/api/v1/courses');
    return response.data;
  },

  createSubject: async (subjectData: SubjectCreate): Promise<SubjectAdmin> => {
    const response = await apiClient.post('/api/v1/admin/courses', subjectData);
    return response.data;
  },

  updateSubject: async (subjectId: number, subjectData: SubjectUpdate): Promise<SubjectAdmin> => {
    const response = await apiClient.put(`/api/v1/admin/courses/${subjectId}`, subjectData);
    return response.data;
  },

  deleteSubject: async (subjectId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/courses/${subjectId}`);
  },

  // Topic Management
  getTopics: async (subjectId?: number): Promise<TopicAdmin[]> => {
    const params = subjectId ? { course_id: subjectId } : {};
    const response = await apiClient.get('/api/v1/topics', { params });
    // Map the new API response format to the expected frontend format
    if (response.data.topics && Array.isArray(response.data.topics)) {
      return response.data.topics.map((topic: any) => ({
        id: topic.id,
        subject_id: topic.course_id, // Map course_id back to subject_id for frontend compatibility
        subject_name: topic.course?.name || 'Unknown Course',
        name: topic.name,
        description: topic.description,
        created_at: topic.created_at
      }));
    }
    // Fallback for old format or empty response
    return Array.isArray(response.data) ? response.data : [];
  },

  createTopic: async (topicData: TopicCreate): Promise<TopicAdmin> => {
    // Convert subject_id to course_id for the API
    const courseTopicData = {
      course_id: topicData.subject_id,
      name: topicData.name,
      description: topicData.description
    };
    const response = await apiClient.post('/api/v1/admin/course-topics', courseTopicData);
    return response.data;
  },

  updateTopic: async (topicId: number, topicData: TopicUpdate): Promise<TopicAdmin> => {
    // Convert subject_id to course_id for the API
    const courseTopicData: any = {
      name: topicData.name,
      description: topicData.description
    };
    if (topicData.subject_id) {
      courseTopicData.course_id = topicData.subject_id;
    }
    const response = await apiClient.put(`/api/v1/admin/course-topics/${topicId}`, courseTopicData);
    return response.data;
  },

  deleteTopic: async (topicId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/course-topics/${topicId}`);
  },

  // Exam Types Management
  getExamTypes: async (): Promise<ExamTypeAdmin[]> => {
    const response = await apiClient.get('/api/v1/exam-types');
    return response.data;
  },

  createExamType: async (examTypeData: ExamTypeCreate): Promise<ExamTypeAdmin> => {
    const response = await apiClient.post('/api/v1/admin/exam-types', examTypeData);
    return response.data;
  },

  updateExamType: async (examTypeId: number, examTypeData: ExamTypeUpdate): Promise<ExamTypeAdmin> => {
    const response = await apiClient.put(`/api/v1/admin/exam-types/${examTypeId}`, examTypeData);
    return response.data;
  },

  deleteExamType: async (examTypeId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/exam-types/${examTypeId}`);
  },

  // Questions Management
  getQuestions: async (params?: {
    exam_section_id?: number;
    limit?: number;
    offset?: number;
  }): Promise<ExamQuestionAdmin[]> => {
    const response = await apiClient.get('/api/v1/admin/questions', { params });
    return response.data;
  },

  deleteQuestion: async (questionId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/questions/${questionId}`);
  },

  generateQuestions: async (request: GenerateQuestionsRequest): Promise<ExamQuestionAdmin[]> => {
    const response = await apiClient.post('/api/v1/admin/generate-questions', request);
    return response.data;
  },

  // Education Levels Management
  getEducationLevels: async (): Promise<EducationLevelAdmin[]> => {
    const response = await apiClient.get('/api/v1/education-levels');
    return response.data;
  },

  // Exam Sections Management
  getExamSections: async (examTypeId?: number): Promise<any[]> => {
    if (examTypeId) {
      const response = await apiClient.get(`/api/v1/exam-types/${examTypeId}/sections`);
      return response.data;
    } else {
      // Get all exam sections
      const response = await apiClient.get('/api/v1/admin/exam-sections');
      return response.data;
    }
  },

  createExamSection: async (sectionData: ExamSectionCreate): Promise<ExamSectionAdmin> => {
    const response = await apiClient.post('/api/v1/admin/exam-sections', sectionData);
    return response.data;
  },

  updateExamSection: async (sectionId: number, sectionData: ExamSectionUpdate): Promise<ExamSectionAdmin> => {
    const response = await apiClient.put(`/api/v1/admin/exam-sections/${sectionId}`, sectionData);
    return response.data;
  },

  deleteExamSection: async (sectionId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/exam-sections/${sectionId}`);
  },

  // Practice Exam Management
  getPracticeExams: async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
  }): Promise<PracticeExamAdmin[]> => {
    const response = await apiClient.get('/api/v1/admin/practice-exams', { params });
    return response.data;
  },

  getPracticeExamQuestions: async (examId: number): Promise<PracticeExamQuestion[]> => {
    try {
      // Try admin endpoint first
      const response = await apiClient.get(`/api/v1/admin/practice-exams/${examId}/questions`);
      return response.data;
    } catch (error) {
      console.warn('Admin endpoint failed, trying user endpoint:', error);
      try {
        // Fallback to user endpoint
        const response = await apiClient.get(`/api/v1/practice-exam/${examId}/questions`);
        return response.data;
      } catch (fallbackError) {
        console.warn('User endpoint also failed, trying results endpoint:', fallbackError);
        try {
          // Another fallback - try results endpoint
          const response = await apiClient.get(`/api/v1/practice-exam/${examId}/results`);
          return response.data.questions || response.data || [];
        } catch (finalError) {
          console.error('All endpoints failed:', finalError);
          throw finalError;
        }
      }
    }
  },
  
  createPracticeExam: async (examData: {
    exam_type_id: number;
    exam_section_id: number;
    user_id: number;
    name: string;
  }): Promise<any> => {
    // Use the admin practice exam creation endpoint
    const response = await apiClient.post('/api/v1/admin/practice-exams', {
      exam_type_id: examData.exam_type_id,
      exam_section_id: examData.exam_section_id,
      user_id: examData.user_id,
      name: examData.name
    });
    return response.data;
  },

  deletePracticeExam: async (examId: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/practice-exams/${examId}`);
  },

  // System Health
  getSystemHealth: async (): Promise<{ status: string; details?: any }> => {
    const response = await apiClient.get('/api/v1/admin/health');
    return response.data;
  },

  // Exam System Configuration (DEPRECATED - Use getExamSections instead)
  // getExamSystemConfig: async (): Promise<any> => {
  //   const response = await apiClient.get('/api/v1/admin/exam-system-config');
  //   return response.data;
  // },
};
