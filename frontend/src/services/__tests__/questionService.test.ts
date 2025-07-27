import { describe, it, expect } from 'vitest';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { questionService } from '../questionService';
import type { QuestionParams, EvaluateRequest } from '../../types/question';

describe('QuestionService', () => {
  describe('generateQuestions', () => {
    it('should generate questions successfully', async () => {
      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
        education_level: 'high',
      };

      const result = await questionService.generateQuestions(params);

      expect(result.questions).toHaveLength(2);
      expect(result.questions[0]).toEqual({
        id: '1',
        content: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correct_answer: '4',
        explanation: 'Basic addition: 2 + 2 = 4',
      });
      expect(result.metadata).toEqual({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
      });
    });

    it('should handle invalid parameters', async () => {
      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 15, // Too many questions
        education_level: 'high',
      };

      await expect(questionService.generateQuestions(params)).rejects.toThrow();
    });

    it('should handle server errors', async () => {
      server.use(
        http.post('http://localhost:8000/questions/generate', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
        education_level: 'high',
      };

      await expect(questionService.generateQuestions(params)).rejects.toThrow();
    });
  });

  describe('evaluateAnswer', () => {
    it('should evaluate correct answer', async () => {
      const request: EvaluateRequest = {
        question_id: '1',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'What is 2 + 2?',
      };

      const result = await questionService.evaluateAnswer(request);

      expect(result).toEqual({
        is_correct: true,
        score: 1,
        feedback: 'Correct answer!',
        explanation: 'This is a mock explanation for the answer.',
      });
    });

    it('should evaluate incorrect answer', async () => {
      const request: EvaluateRequest = {
        question_id: '1',
        user_answer: '3',
        correct_answer: '4',
        question_content: 'What is 2 + 2?',
      };

      const result = await questionService.evaluateAnswer(request);

      expect(result).toEqual({
        is_correct: false,
        score: 0,
        feedback: 'Incorrect. Try again.',
        explanation: 'This is a mock explanation for the answer.',
      });
    });

    it('should handle server errors', async () => {
      server.use(
        http.post('http://localhost:8000/questions/evaluate', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const request: EvaluateRequest = {
        question_id: '1',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'What is 2 + 2?',
      };

      await expect(questionService.evaluateAnswer(request)).rejects.toThrow();
    });
  });
});