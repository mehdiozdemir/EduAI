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
    // Backend expects query parameters for generation inputs
    const queryParams = new URLSearchParams({
      subject: params.subject,
      topic: params.topic,
      difficulty: params.difficulty,
      count: String(params.count),
      education_level: params.education_level ?? 'lise',
    });
    const url = `/api/v1/questions/generate?${queryParams.toString()}`;
    const response = await this.post<QuestionGenerationResponse>(url);
    return response;
  }

  /**
   * Evaluate user's answer to a question
   */
  async evaluateAnswer(request: EvaluateRequest): Promise<AnswerEvaluation> {
    // Backend expects { question, correct_answer, user_answer }
    const response = await this.post<AnswerEvaluation>('/api/v1/questions/evaluate', {
      question: (request as any).question ?? request.question_content ?? '',
      correct_answer: request.correct_answer,
      user_answer: request.user_answer,
    });
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
  async getQuestion(id: number): Promise<import('../types').StoredQuestion> {
    return await this.get<import('../types').StoredQuestion>(`/api/v1/questions/${id}`);
  }

  /**
   * Save generated questions for later use
   */
  async saveQuestions(questions: GeneratedQuestion[], metadata: Record<string, unknown>): Promise<{ session_id: string }> {
    const response = await this.post<{ session_id: string }>('/api/v1/questions/save', {
      questions,
      metadata
    });
    return response;
  }

  /**
   * Get saved question session
   */
  async getQuestionSession(sessionId: string): Promise<QuestionGenerationResponse> {
    return await this.get<QuestionGenerationResponse>(`/api/v1/questions/session/${sessionId}`);
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

    const url = `/api/v1/questions/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
    const response = await this.post<QuestionGenerationResponse>('/api/v1/questions/generate-custom', {
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

    const url = `/api/v1/questions/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(url);
  }

  /**
   * Report a question issue
   */
  async reportQuestion(questionId: string, issue: string, description?: string): Promise<void> {
    await this.post('/api/v1/questions/report', {
      question_id: questionId,
      issue_type: issue,
      description
    });
  }

  /**
   * Rate a question
   */
  async rateQuestion(questionId: string, rating: number, feedback?: string): Promise<void> {
    await this.post('/api/v1/questions/rate', {
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

    const url = `/api/v1/questions/difficulties?${queryParams.toString()}`;
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

    const url = `/api/v1/questions/education-levels?${queryParams.toString()}`;
    return await this.get<string[]>(url);
  }
}

// Create and export singleton instance
export const questionService = new QuestionService();