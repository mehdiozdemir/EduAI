// AI Guidance service for personalized learning assistance

import { BaseApiService } from './api';

interface UserProfile {
  name: string;
  learning_level: string;
  strong_subjects: string[];
  weak_subjects: string[];
  total_sessions: number;
  avg_accuracy: number;
}

interface GuidanceResponse {
  main_message: string;
  recommendations: string[];
  next_steps: string[];
  motivational_message: string;
}

interface GuidanceData {
  guidance: GuidanceResponse;
  user_profile: UserProfile;
  recommendations: string[];
  next_steps: string[];
}

export class AIGuidanceService extends BaseApiService {
  /**
   * Ask AI guidance for personalized learning assistance
   */
  async askGuidance(question: string): Promise<{ status: string; data: GuidanceData; message: string }> {
    const response = await this.post<{ status: string; data: GuidanceData; message: string }>('/api/v1/guidance/ask', {
      question
    });
    return response;
  }

  /**
   * Get user learning profile
   */
  async getUserProfile(): Promise<{ status: string; data: { user_profile: UserProfile; learning_summary: any } }> {
    const response = await this.get<{ status: string; data: { user_profile: UserProfile; learning_summary: any } }>('/api/v1/guidance/profile');
    return response;
  }

  /**
   * Store question result for memory
   */
  async storeQuestionResult(params: {
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    subject: string;
    topic: string;
    difficulty?: string;
    education_level?: string;
  }): Promise<{ status: string; message: string }> {
    const response = await this.post<{ status: string; message: string }>('/api/v1/guidance/store-question-result', params);
    return response;
  }
}

// Create and export a singleton instance
export const aiGuidanceService = new AIGuidanceService();
