import { describe, it, expect } from 'vitest';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { performanceService } from '../performanceService';
import type { PerformanceAnalysisRequest } from '../../types/performance';

describe('PerformanceService', () => {
  describe('analyzePerformance', () => {
    it('should analyze performance successfully', async () => {
      const request: PerformanceAnalysisRequest = {
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
      };

      const result = await performanceService.analyzePerformance(request);

      expect(result).toEqual({
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

    it('should handle server errors', async () => {
      server.use(
        http.post('http://localhost:8000/performance/analyze', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const request: PerformanceAnalysisRequest = {
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 10,
        correct_answers: 8,
      };

      await expect(performanceService.analyzePerformance(request)).rejects.toThrow();
    });
  });

  describe('getUserPerformance', () => {
    it('should get user performance successfully', async () => {
      const result = await performanceService.getUserPerformance(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
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

    it('should return empty array for user with no performance data', async () => {
      const result = await performanceService.getUserPerformance(999);

      expect(result).toHaveLength(0);
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:8000/performance/user/:userId', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(performanceService.getUserPerformance(1)).rejects.toThrow();
    });
  });

  describe('getRecommendations', () => {
    it('should get recommendations successfully', async () => {
      const result = await performanceService.getRecommendations(1);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        resource_type: 'youtube',
        title: 'Algebra Basics',
        url: 'https://youtube.com/watch?v=example',
        description: 'Learn algebra fundamentals',
        relevance_score: 0.9,
      });
    });

    it('should return empty array for analysis with no recommendations', async () => {
      const result = await performanceService.getRecommendations(999);

      expect(result).toHaveLength(0);
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:8000/performance/:analysisId/recommendations', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(performanceService.getRecommendations(1)).rejects.toThrow();
    });
  });
});