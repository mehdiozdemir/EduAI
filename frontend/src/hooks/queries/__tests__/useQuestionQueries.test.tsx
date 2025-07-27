import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useQuestionQueries } from '../useQuestionQueries';
import type { QuestionParams, EvaluateRequest } from '../../../types/question';

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useQuestionQueries', () => {
  describe('useGenerateQuestions', () => {
    it('should generate questions successfully', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
        education_level: 'high',
      };

      result.current.generateQuestions.mutate(params);

      await waitFor(() => {
        expect(result.current.generateQuestions.isSuccess).toBe(true);
      });

      expect(result.current.generateQuestions.data).toEqual({
        questions: [
          {
            id: '1',
            content: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correct_answer: '4',
            explanation: 'Basic addition: 2 + 2 = 4',
          },
          {
            id: '2',
            content: 'What is the square root of 16?',
            options: ['2', '4', '6', '8'],
            correct_answer: '4',
            explanation: 'The square root of 16 is 4 because 4 × 4 = 16',
          },
        ],
        metadata: {
          subject: 'Mathematics',
          topic: 'Algebra',
          difficulty: 'easy',
          count: 2,
        },
      });
    });

    it('should handle generation errors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 15, // Too many questions
        education_level: 'high',
      };

      result.current.generateQuestions.mutate(params);

      await waitFor(() => {
        expect(result.current.generateQuestions.isError).toBe(true);
      });

      expect(result.current.generateQuestions.error).toBeDefined();
    });

    it('should show loading state during generation', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
        education_level: 'high',
      };

      result.current.generateQuestions.mutate(params);

      expect(result.current.generateQuestions.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.generateQuestions.isPending).toBe(false);
      });
    });
  });

  describe('useEvaluateAnswer', () => {
    it('should evaluate answer successfully', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      const request: EvaluateRequest = {
        question_id: '1',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'What is 2 + 2?',
      };

      result.current.evaluateAnswer.mutate(request);

      await waitFor(() => {
        expect(result.current.evaluateAnswer.isSuccess).toBe(true);
      });

      expect(result.current.evaluateAnswer.data).toEqual({
        is_correct: true,
        score: 1,
        feedback: 'Correct answer!',
        explanation: 'This is a mock explanation for the answer.',
      });
    });

    it('should evaluate incorrect answer', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      const request: EvaluateRequest = {
        question_id: '1',
        user_answer: '3',
        correct_answer: '4',
        question_content: 'What is 2 + 2?',
      };

      result.current.evaluateAnswer.mutate(request);

      await waitFor(() => {
        expect(result.current.evaluateAnswer.isSuccess).toBe(true);
      });

      expect(result.current.evaluateAnswer.data).toEqual({
        is_correct: false,
        score: 0,
        feedback: 'Incorrect. Try again.',
        explanation: 'This is a mock explanation for the answer.',
      });
    });

    it('should handle evaluation errors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      // Mock server error
      const request: EvaluateRequest = {
        question_id: 'invalid',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'Invalid question',
      };

      result.current.evaluateAnswer.mutate(request);

      await waitFor(() => {
        expect(result.current.evaluateAnswer.isError).toBe(true);
      });
    });
  });

  describe('mutation callbacks', () => {
    it('should call onSuccess callback for question generation', async () => {
      const wrapper = createWrapper();
      const onSuccess = vi.fn();
      
      const { result } = renderHook(() => useQuestionQueries({ onSuccess }), { wrapper });

      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
        education_level: 'high',
      };

      result.current.generateQuestions.mutate(params);

      await waitFor(() => {
        expect(result.current.generateQuestions.isSuccess).toBe(true);
      });

      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          questions: expect.any(Array),
          metadata: expect.any(Object),
        })
      );
    });

    it('should call onError callback for question generation', async () => {
      const wrapper = createWrapper();
      const onError = vi.fn();
      
      const { result } = renderHook(() => useQuestionQueries({ onError }), { wrapper });

      const params: QuestionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 15, // Too many questions
        education_level: 'high',
      };

      result.current.generateQuestions.mutate(params);

      await waitFor(() => {
        expect(result.current.generateQuestions.isError).toBe(true);
      });

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('optimistic updates', () => {
    it('should handle optimistic updates for answer evaluation', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useQuestionQueries(), { wrapper });

      const request: EvaluateRequest = {
        question_id: '1',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'What is 2 + 2?',
      };

      // Should immediately show optimistic result
      result.current.evaluateAnswer.mutate(request);

      // Check that mutation is pending
      expect(result.current.evaluateAnswer.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.evaluateAnswer.isSuccess).toBe(true);
      });
    });
  });
});