import { useMutation, useQuery } from '@tanstack/react-query';
import { questionService } from '../../services/questionService';
import { queryKeys } from '../../lib/queryClient';
import type {
  QuestionParams,
  EvaluateRequest,
  GeneratedQuestion,
} from '../../types';

// Generate questions mutation
export const useGenerateQuestions = () => {
  return useMutation({
    mutationFn: (params: QuestionParams) =>
      questionService.generateQuestions(params),
    // Cache generated questions for a short time
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get cached generated questions
export const useGeneratedQuestions = (
  params: QuestionParams | null,
  enabled = false
) => {
  return useQuery({
    queryKey: queryKeys.questions.generated(params),
    queryFn: () => questionService.generateQuestions(params!),
    enabled: enabled && !!params,
    staleTime: 2 * 60 * 1000, // 2 minutes - questions should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once for question generation
  });
};

// Evaluate answer mutation
export const useEvaluateAnswer = () => {
  return useMutation({
    mutationFn: (request: EvaluateRequest) =>
      questionService.evaluateAnswer(request),
    // Don't cache evaluations as they're one-time operations
    gcTime: 0,
  });
};

// Get cached answer evaluation (for review purposes)
export const useAnswerEvaluation = (
  questionId: string,
  answer: string,
  enabled = false
) => {
  return useQuery({
    queryKey: queryKeys.questions.evaluation(questionId, answer),
    queryFn: () =>
      questionService.evaluateAnswer({
        question_id: questionId,
        user_answer: answer,
        correct_answer: '', // This would need to be provided
        question_content: '', // This would need to be provided
      }),
    enabled: enabled && !!questionId && !!answer,
    staleTime: 10 * 60 * 1000, // 10 minutes - evaluations are static
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Batch evaluate answers mutation
export const useBatchEvaluateAnswers = () => {
  return useMutation({
    mutationFn: (requests: EvaluateRequest[]) =>
      questionService.evaluateAnswers(requests),
    gcTime: 0, // Don't cache batch evaluations
  });
};

// Get question history
export const useQuestionHistory = (
  userId?: number,
  limit?: number,
  enabled = true
) => {
  return useQuery({
    queryKey: ['questions', 'history', userId, limit],
    queryFn: () => questionService.getQuestionHistory(userId, limit),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get question statistics
export const useQuestionStats = (userId?: number, enabled = true) => {
  return useQuery({
    queryKey: ['questions', 'stats', userId],
    queryFn: () => questionService.getQuestionStats(userId),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Generate custom questions mutation
export const useGenerateCustomQuestions = () => {
  return useMutation({
    mutationFn: ({
      subject,
      topic,
      customPrompt,
      count = 5,
    }: {
      subject: string;
      topic: string;
      customPrompt: string;
      count?: number;
    }) =>
      questionService.generateCustomQuestions(
        subject,
        topic,
        customPrompt,
        count
      ),
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Save questions mutation
export const useSaveQuestions = () => {
  return useMutation({
    mutationFn: ({
      questions,
      metadata,
    }: {
      questions: GeneratedQuestion[];
      metadata: Record<string, unknown>;
    }) => questionService.saveQuestions(questions, metadata),
    gcTime: 0, // Don't cache save operations
  });
};

// Get saved question session
export const useQuestionSession = (sessionId: string, enabled = false) => {
  return useQuery({
    queryKey: ['questions', 'session', sessionId],
    queryFn: () => questionService.getQuestionSession(sessionId),
    enabled: enabled && !!sessionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Report question mutation
export const useReportQuestion = () => {
  return useMutation({
    mutationFn: ({
      questionId,
      issue,
      description,
    }: {
      questionId: string;
      issue: string;
      description?: string;
    }) => questionService.reportQuestion(questionId, issue, description),
    gcTime: 0, // Don't cache reports
  });
};

// Rate question mutation
export const useRateQuestion = () => {
  return useMutation({
    mutationFn: ({
      questionId,
      rating,
      feedback,
    }: {
      questionId: string;
      rating: number;
      feedback?: string;
    }) => questionService.rateQuestion(questionId, rating, feedback),
    gcTime: 0, // Don't cache ratings
  });
};
