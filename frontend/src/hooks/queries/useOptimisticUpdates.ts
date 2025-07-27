import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queryClient';
import type {
  PerformanceAnalysis,
  PerformanceAnalysisRequest,
} from '../../types';

// Optimistic performance analysis creation
export const useOptimisticPerformanceAnalysis = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PerformanceAnalysisRequest) => {
      // Simulate API call delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000));

      // This would be the actual API call
      // return performanceService.analyzePerformance(data);

      // Mock response for now
      return {
        id: Date.now(),
        user_id: data.user_id,
        subject_id: data.subject_id,
        topic_id: data.topic_id,
        total_questions: data.total_questions,
        correct_answers: data.correct_answers,
        accuracy: (data.correct_answers / data.total_questions) * 100,
        weakness_level:
          data.correct_answers < data.total_questions * 0.7 ? 3 : 1,
        created_at: new Date().toISOString(),
      } as PerformanceAnalysis;
    },

    onMutate: async newAnalysis => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.performance.all(newAnalysis.user_id),
      });

      // Snapshot previous value
      const previousAnalyses = queryClient.getQueryData(
        queryKeys.performance.all(newAnalysis.user_id)
      );

      // Optimistically update cache
      const optimisticAnalysis: PerformanceAnalysis = {
        id: Date.now(), // Temporary ID
        user_id: newAnalysis.user_id,
        subject_id: newAnalysis.subject_id,
        topic_id: newAnalysis.topic_id,
        total_questions: newAnalysis.total_questions,
        correct_answers: newAnalysis.correct_answers,
        accuracy:
          (newAnalysis.correct_answers / newAnalysis.total_questions) * 100,
        weakness_level:
          newAnalysis.correct_answers < newAnalysis.total_questions * 0.7
            ? 3
            : 1,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        queryKeys.performance.all(newAnalysis.user_id),
        (old: PerformanceAnalysis[] = []) => [optimisticAnalysis, ...old]
      );

      // Return context for rollback
      return { previousAnalyses, optimisticAnalysis };
    },

    onError: (err, newAnalysis, context) => {
      // Rollback on error
      if (context?.previousAnalyses) {
        queryClient.setQueryData(
          queryKeys.performance.all(newAnalysis.user_id),
          context.previousAnalyses
        );
      }
    },

    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: queryKeys.performance.all(variables.user_id),
      });
    },
  });
};

// Optimistic quiz completion
export const useOptimisticQuizCompletion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizData: {
      userId: number;
      subjectId: number;
      topicId: number;
      results: {
        totalQuestions: number;
        correctAnswers: number;
        timeSpent: number;
      };
    }) => {
      // This would create a performance analysis from quiz results
      const analysisData: PerformanceAnalysisRequest = {
        user_id: quizData.userId,
        subject_id: quizData.subjectId,
        topic_id: quizData.topicId,
        total_questions: quizData.results.totalQuestions,
        correct_answers: quizData.results.correctAnswers,
        quiz_results: {
          total_questions: quizData.results.totalQuestions,
          correct_answers: quizData.results.correctAnswers,
          answers: [],
        },
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));

      return {
        id: Date.now(),
        ...analysisData,
        accuracy:
          (analysisData.correct_answers / analysisData.total_questions) * 100,
        weakness_level:
          analysisData.correct_answers < analysisData.total_questions * 0.7
            ? 3
            : 1,
        created_at: new Date().toISOString(),
      } as PerformanceAnalysis;
    },

    onMutate: async quizData => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.performance.all(quizData.userId),
      });

      // Snapshot previous value
      const previousAnalyses = queryClient.getQueryData(
        queryKeys.performance.all(quizData.userId)
      );

      // Create optimistic analysis
      const optimisticAnalysis: PerformanceAnalysis = {
        id: Date.now(),
        user_id: quizData.userId,
        subject_id: quizData.subjectId,
        topic_id: quizData.topicId,
        total_questions: quizData.results.totalQuestions,
        correct_answers: quizData.results.correctAnswers,
        accuracy:
          (quizData.results.correctAnswers / quizData.results.totalQuestions) *
          100,
        weakness_level:
          quizData.results.correctAnswers <
          quizData.results.totalQuestions * 0.7
            ? 3
            : 1,
        created_at: new Date().toISOString(),
      };

      // Optimistically update cache
      queryClient.setQueryData(
        queryKeys.performance.all(quizData.userId),
        (old: PerformanceAnalysis[] = []) => [optimisticAnalysis, ...old]
      );

      return { previousAnalyses, optimisticAnalysis };
    },

    onError: (err, quizData, context) => {
      // Rollback on error
      if (context?.previousAnalyses) {
        queryClient.setQueryData(
          queryKeys.performance.all(quizData.userId),
          context.previousAnalyses
        );
      }
    },

    onSuccess: (data, _variables) => {
      // Update with real data
      queryClient.setQueryData(queryKeys.performance.analysis(data.id), data);
    },

    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.performance.all(variables.userId),
      });
    },
  });
};

// Optimistic user profile updates (if supported)
export const useOptimisticUserUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      userData: Partial<{ username: string; email: string }>
    ) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const currentUser = queryClient.getQueryData(
        queryKeys.auth.user
      ) as Record<string, unknown> | undefined;
      return { ...(currentUser || {}), ...userData };
    },

    onMutate: async newUserData => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.user });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.auth.user);

      // Optimistically update user
      queryClient.setQueryData(queryKeys.auth.user, (old: unknown) => ({
        ...(old as Record<string, unknown>),
        ...newUserData,
      }));

      return { previousUser };
    },

    onError: (err, newUserData, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.user, context.previousUser);
      }
    },

    onSettled: () => {
      // Refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
    },
  });
};
