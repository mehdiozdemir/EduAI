import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { performanceService } from '../../services/performanceService';
import { queryKeys } from '../../lib/queryClient';
import type { PerformanceAnalysisRequest } from '../../types';

// Get user performance analyses
export const useUserPerformance = (userId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.performance.all(userId),
    queryFn: () => performanceService.getUserPerformance(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - performance data should be relatively fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get single performance analysis
export const usePerformanceAnalysis = (analysisId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.performance.analysis(analysisId),
    queryFn: () => performanceService.getPerformanceAnalysis(analysisId),
    enabled: enabled && !!analysisId,
    staleTime: 5 * 60 * 1000, // 5 minutes - analysis data is static once created
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get recommendations for analysis
export const useRecommendations = (analysisId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.performance.recommendations(analysisId),
    queryFn: () => performanceService.getRecommendations(analysisId),
    enabled: enabled && !!analysisId,
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations don't change often
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Create performance analysis mutation
export const useCreatePerformanceAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PerformanceAnalysisRequest) => 
      performanceService.analyzePerformance(data),
    onSuccess: (newAnalysis, variables) => {
      // Invalidate user performance list to include new analysis
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.performance.all(variables.user_id) 
      });
      
      // Set the new analysis in cache
      queryClient.setQueryData(
        queryKeys.performance.analysis(newAnalysis.id),
        newAnalysis
      );
    },
  });
};

// Get performance analysis by ID
export const usePerformanceAnalysisById = (analysisId: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.performance.analysis(analysisId),
    queryFn: () => performanceService.getPerformanceAnalysis(analysisId),
    enabled: enabled && !!analysisId,
    staleTime: 5 * 60 * 1000, // 5 minutes - analysis data is static once created
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get dashboard data
export const useDashboardData = (userId: number, enabled = true) => {
  return useQuery({
    queryKey: ['performance', 'dashboard', userId],
    queryFn: () => performanceService.getDashboardData(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard should be relatively fresh
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get performance trends
export const usePerformanceTrends = (
  userId: number, 
  params?: {
    period: 'week' | 'month' | 'quarter' | 'year';
    subject_id?: number;
    topic_id?: number;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: ['performance', 'trends', userId, params],
    queryFn: () => performanceService.getPerformanceTrends(userId, params),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get personalized recommendations
export const usePersonalizedRecommendations = (
  params?: {
    subject_id?: number;
    topic_id?: number;
    resource_type?: string;
    limit?: number;
  },
  enabled = true
) => {
  return useQuery({
    queryKey: ['recommendations', 'personalized', params],
    queryFn: () => performanceService.getPersonalizedRecommendations(params),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
};

// Delete performance analysis mutation
export const useDeletePerformanceAnalysis = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (analysisId: number) => 
      performanceService.deletePerformanceAnalysis(analysisId),
    onSuccess: (_, analysisId) => {
      // Remove from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.performance.analysis(analysisId) 
      });
      
      // Remove recommendations
      queryClient.removeQueries({ 
        queryKey: queryKeys.performance.recommendations(analysisId) 
      });
      
      // Invalidate user performance lists
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'performance' && 
          Array.isArray(query.queryKey) && 
          query.queryKey.length >= 2
      });
    },
  });
};

// Rate recommendation mutation
export const useRateRecommendation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      recommendationId, 
      rating, 
      feedback 
    }: { 
      recommendationId: number; 
      rating: number; 
      feedback?: string; 
    }) => performanceService.rateRecommendation(recommendationId, rating, feedback),
    onSuccess: () => {
      // Invalidate recommendations to reflect rating
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'recommendations' ||
          (query.queryKey[0] === 'performance' && 
           query.queryKey[2] === 'recommendations')
      });
    },
  });
};

// Mark recommendation as used mutation
export const useMarkRecommendationUsed = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (recommendationId: number) => 
      performanceService.markRecommendationUsed(recommendationId),
    onSuccess: () => {
      // Invalidate recommendations to reflect usage
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === 'recommendations' ||
          (query.queryKey[0] === 'performance' && 
           query.queryKey[2] === 'recommendations')
      });
    },
  });
};