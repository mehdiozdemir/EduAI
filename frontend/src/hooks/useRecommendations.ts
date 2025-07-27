import { useState, useEffect, useCallback } from 'react';
import { performanceService } from '../services/performanceService';
import type { ResourceRecommendation } from '../types';

interface UseRecommendationsOptions {
  analysisId?: number;
  subjectId?: number;
  topicId?: number;
  resourceType?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseRecommendationsReturn {
  recommendations: ResourceRecommendation[];
  loading: boolean;
  error: string | null;
  fetchRecommendations: () => Promise<void>;
  rateRecommendation: (recommendationId: number, rating: number, feedback?: string) => Promise<void>;
  markRecommendationUsed: (recommendationId: number) => Promise<void>;
  retry: () => void;
}

export const useRecommendations = (
  options: UseRecommendationsOptions = {}
): UseRecommendationsReturn => {
  const {
    analysisId,
    subjectId,
    topicId,
    resourceType,
    limit,
    autoFetch = true,
  } = options;

  const [recommendations, setRecommendations] = useState<ResourceRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: ResourceRecommendation[];

      if (analysisId) {
        // Fetch recommendations for specific analysis
        data = await performanceService.getRecommendations(analysisId);
      } else {
        // Fetch personalized recommendations
        data = await performanceService.getPersonalizedRecommendations({
          subject_id: subjectId,
          topic_id: topicId,
          resource_type: resourceType,
          limit,
        });
      }

      setRecommendations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Öneriler yüklenirken bir hata oluştu';
      setError(errorMessage);
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [analysisId, subjectId, topicId, resourceType, limit]);

  const rateRecommendation = useCallback(async (
    recommendationId: number,
    rating: number,
    feedback?: string
  ) => {
    try {
      await performanceService.rateRecommendation(recommendationId, rating, feedback);
      
      // Update the local state to reflect the rating
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, userRating: rating }
            : rec
        )
      );
    } catch (err) {
      console.error('Error rating recommendation:', err);
      throw err;
    }
  }, []);

  const markRecommendationUsed = useCallback(async (recommendationId: number) => {
    try {
      await performanceService.markRecommendationUsed(recommendationId);
      
      // Update the local state to reflect the usage
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === recommendationId 
            ? { ...rec, isUsed: true }
            : rec
        )
      );
    } catch (err) {
      console.error('Error marking recommendation as used:', err);
      throw err;
    }
  }, []);

  const retry = useCallback(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    if (autoFetch) {
      fetchRecommendations();
    }
  }, [fetchRecommendations, autoFetch]);

  return {
    recommendations,
    loading,
    error,
    fetchRecommendations,
    rateRecommendation,
    markRecommendationUsed,
    retry,
  };
};

export default useRecommendations;