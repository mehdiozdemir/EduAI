// Question generation and evaluation service

import { BaseApiService } from './api';
import type { 
  QuestionParams, 
  GeneratedQuestion, 
  QuestionGenerationResponse, 
  EvaluateRequest, 
  AnswerEvaluation 
} from '../types';

export class QuestionService extends BaseApiService {
  /**
   * Generate questions based on parameters
   */
  async generateQuestions(params: QuestionParams): Promise<QuestionGenerationResponse> {
    const response = await this.post<QuestionGenerationResponse>('/questions/generate', params);
    return response;
  }

  /**
   * Evaluate user's answer to a question
   */
  async evaluateAnswer(request: EvaluateRequest): Promise<AnswerEvaluation> {
    const response = await this.post<AnswerEvaluation>('/questions/evaluate', request);
    return response;
  }

  /**
   * Store question result to memory for AI guidance
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
    const response = await this.post<{ status: string; message: string }>('/questions/store-result', params);
    return response;
  }

  /**
   * Batch evaluate multiple answers
   */
  async evaluateAnswers(requests: EvaluateRequest[]): Promise<AnswerEvaluation[]> {
    const response = await this.post<AnswerEvaluation[]>('/questions/evaluate-batch', {
      evaluations: requests
    });
    return response;
  }

  /**
   * Get question by ID (if questions are stored)
   */
  async getQuestion(id: string): Promise<GeneratedQuestion> {
    return await this.get<GeneratedQuestion>(`/questions/${id}`);
  }

  /**
   * Save generated questions for later use
   */
  async saveQuestions(questions: GeneratedQuestion[], metadata: Record<string, unknown>): Promise<{ session_id: string }> {
    const response = await this.post<{ session_id: string }>('/questions/save', {
      questions,
      metadata
    });
    return response;
  }

  /**
   * Get saved question session
   */
  async getQuestionSession(sessionId: string): Promise<QuestionGenerationResponse> {
    return await this.get<QuestionGenerationResponse>(`/questions/session/${sessionId}`);
  }

  /**
   * Get user's question history
   */
  async getQuestionHistory(userId?: number, limit?: number): Promise<QuestionGenerationResponse[]> {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append('user_id', userId.toString());
    }
    if (limit) {
      queryParams.append('limit', limit.toString());
    }

    const url = `/questions/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get<QuestionGenerationResponse[]>(url);
  }

  /**
   * Generate questions with custom prompt
   */
  async generateCustomQuestions(
    subject: string,
    topic: string,
    customPrompt: string,
    count: number = 5
  ): Promise<QuestionGenerationResponse> {
    const response = await this.post<QuestionGenerationResponse>('/questions/generate-custom', {
      subject,
      topic,
      custom_prompt: customPrompt,
      count
    });
    return response;
  }

  /**
   * Get question statistics for a user
   */
  async getQuestionStats(userId?: number): Promise<{
    total_questions: number;
    total_correct: number;
    accuracy: number;
    subjects_covered: number;
    topics_covered: number;
    average_score: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (userId) {
      queryParams.append('user_id', userId.toString());
    }

    const url = `/questions/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(url);
  }

  /**
   * Report a question issue
   */
  async reportQuestion(questionId: string, issue: string, description?: string): Promise<void> {
    await this.post('/questions/report', {
      question_id: questionId,
      issue_type: issue,
      description
    });
  }

  /**
   * Rate a question
   */
  async rateQuestion(questionId: string, rating: number, feedback?: string): Promise<void> {
    await this.post('/questions/rate', {
      question_id: questionId,
      rating,
      feedback
    });
  }

  /**
   * Get available difficulty levels for a subject/topic
   */
  async getAvailableDifficulties(subject: string, topic?: string): Promise<string[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('subject', subject);
    
    if (topic) {
      queryParams.append('topic', topic);
    }

    const url = `/questions/difficulties?${queryParams.toString()}`;
    return await this.get<string[]>(url);
  }

  /**
   * Get available education levels for a subject/topic
   */
  async getAvailableEducationLevels(subject: string, topic?: string): Promise<string[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('subject', subject);
    
    if (topic) {
      queryParams.append('topic', topic);
    }

    const url = `/questions/education-levels?${queryParams.toString()}`;
    return await this.get<string[]>(url);
  }
}

// Create and export singleton instance
export const questionService = new QuestionService();