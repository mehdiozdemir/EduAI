import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePerformanceQueries } from '../usePerformanceQueries';
import type { PerformanceAnalysisRequest } from '../../../types/performance';

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

describe('usePerformanceQueries', () => {
  describe('useUserPerformance', () => {
    it('should fetch user performance successfully', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      const { data, isLoading, error } = result.current.useUserPerformance(1);

      await waitFor(() => {
        expect(isLoading).toBe(false);
      });

      expect(error).toBeNull();
      expect(data).toEqual([
        {
          id: 1,
          user_id: 1,
          subject_id: 1,
          topic_id: 1,
          total_questions: 10,
          correct_answers: 8,
          accuracy: 0.8,
          weakness_level: 2,
          created_at: '2024-01-01T00:00:00Z',
        },
      ]);
    });

    it('should return empty array for user with no performance data', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      const { data, isLoading } = result.current.useUserPerformance(999);

      await waitFor(() => {
        expect(isLoading).toBe(false);
      });

      expect(data).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      // Mock server error by using invalid user ID that triggers error in MSW
      const { error, isLoading } = result.current.useUserPerformance(-1);

      await waitFor(() => {
        expect(isLoading).toBe(false);
      });

      expect(error).toBeDefined();
    });
  });

  describe('useRecommendations', () => {
    it('should fetch recommendations successfully', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      const { data, isLoading, error } = result.current.useRecommendations(1);

      await waitFor(() => {
        expect(isLoading).toBe(false);
      });

      expect(error).toBeNull();
      expect(data).toEqual([
        {
          id: 1,
          resource_type: 'youtube',
          title: 'Algebra Basics',
          url: 'https://youtube.com/watch?v=example',
          description: 'Learn algebra fundamentals',
          relevance_score: 0.9,
        },
        {
          id: 2,
          resource_type: 'book',
          title: 'Mathematics Textbook',
          url: 'https://example.com/book',
          description: 'Comprehensive math textbook',
          relevance_score: 0.8,
        },
      ]);
    });

    it('should return empty array for analysis with no recommendations', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      const { data, isLoading } = result.current.useRecommendations(999);

      await waitFor(() => {
        expect(isLoading).toBe(false);
      });

      expect(data).toEqual([]);
    });
  });

  describe('useAnalyzePerformance', () => {
    it('should analyze performance successfully', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      const request: PerformanceAnalysisRequest = {
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
      };

      result.current.analyzePerformance.mutate(request);

      await waitFor(() => {
        expect(result.current.analyzePerformance.isSuccess).toBe(true);
      });

      expect(result.current.analyzePerformance.data).toEqual({
        id: 1,
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
        accuracy: 0.8,
        weakness_level: 2,
        created_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle analysis errors', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      // Mock invalid request
      const request: PerformanceAnalysisRequest = {
        user_id: -1, // Invalid user ID
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
      };

      result.current.analyzePerformance.mutate(request);

      await waitFor(() => {
        expect(result.current.analyzePerformance.isError).toBe(true);
      });

      expect(result.current.analyzePerformance.error).toBeDefined();
    });

    it('should show loading state during analysis', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      const request: PerformanceAnalysisRequest = {
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
      };

      result.current.analyzePerformance.mutate(request);

      expect(result.current.analyzePerformance.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.analyzePerformance.isPending).toBe(false);
      });
    });
  });

  describe('query invalidation', () => {
    it('should invalidate user performance after analysis', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => usePerformanceQueries(), { wrapper });

      // First fetch user performance
      const userPerformanceQuery = result.current.useUserPerformance(1);

      await waitFor(() => {
        expect(userPerformanceQuery.isLoading).toBe(false);
      });

      // Analyze performance (should invalidate user performance query)
      const request: PerformanceAnalysisRequest = {
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
      };

      result.current.analyzePerformance.mutate(request);

      await waitFor(() => {
        expect(result.current.analyzePerformance.isSuccess).toBe(true);
      });

      // User performance query should be refetched
      expect(userPerformanceQuery.isRefetching || userPerformanceQuery.isLoading).toBe(true);
    });
  });

  describe('caching behavior', () => {
    it('should cache user performance data', async () => {
      const wrapper = createWrapper();
      
      // First render
      const { result: result1 } = renderHook(() => usePerformanceQueries(), { wrapper });
      const query1 = result1.current.useUserPerformance(1);

      await waitFor(() => {
        expect(query1.isLoading).toBe(false);
      });

      // Second render with same user ID should use cached data
      const { result: result2 } = renderHook(() => usePerformanceQueries(), { wrapper });
      const query2 = result2.current.useUserPerformance(1);

      // Should immediately have data from cache
      expect(query2.data).toBeDefined();
      expect(query2.isLoading).toBe(false);
    });

    it('should cache recommendations data', async () => {
      const wrapper = createWrapper();
      
      // First render
      const { result: result1 } = renderHook(() => usePerformanceQueries(), { wrapper });
      const query1 = result1.current.useRecommendations(1);

      await waitFor(() => {
        expect(query1.isLoading).toBe(false);
      });

      // Second render with same analysis ID should use cached data
      const { result: result2 } = renderHook(() => usePerformanceQueries(), { wrapper });
      const query2 = result2.current.useRecommendations(1);

      // Should immediately have data from cache
      expect(query2.data).toBeDefined();
      expect(query2.isLoading).toBe(false);
    });
  });
});