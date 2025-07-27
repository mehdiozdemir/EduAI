import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useRecommendations } from '../useRecommendations';
import { performanceService } from '../../services/performanceService';
import type { ResourceRecommendation } from '../../types';

// Mock the performance service
vi.mock('../../services/performanceService');
const mockPerformanceService = performanceService as any;

const mockRecommendations: ResourceRecommendation[] = [
  {
    id: 1,
    resource_type: 'youtube',
    title: 'React Hooks Tutorial',
    url: 'https://youtube.com/watch?v=example1',
    description: 'Learn React Hooks with practical examples',
    relevance_score: 0.85,
  },
  {
    id: 2,
    resource_type: 'book',
    title: 'Clean Code',
    url: 'https://example.com/clean-code',
    description: 'A handbook of agile software craftsmanship',
    relevance_score: 0.92,
  },
];

describe('useRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches recommendations automatically by default', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.loading).toBe(true);
    expect(result.current.recommendations).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recommendations).toEqual(mockRecommendations);
    expect(result.current.error).toBeNull();
    expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalledWith({
      subject_id: undefined,
      topic_id: undefined,
      resource_type: undefined,
      limit: undefined,
    });
  });

  it('fetches recommendations for specific analysis', async () => {
    mockPerformanceService.getRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() => 
      useRecommendations({ analysisId: 123 })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recommendations).toEqual(mockRecommendations);
    expect(mockPerformanceService.getRecommendations).toHaveBeenCalledWith(123);
    expect(mockPerformanceService.getPersonalizedRecommendations).not.toHaveBeenCalled();
  });

  it('fetches personalized recommendations with filters', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() => 
      useRecommendations({
        subjectId: 1,
        topicId: 2,
        resourceType: 'youtube',
        limit: 10,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalledWith({
      subject_id: 1,
      topic_id: 2,
      resource_type: 'youtube',
      limit: 10,
    });
  });

  it('does not auto-fetch when autoFetch is false', () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() => 
      useRecommendations({ autoFetch: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.recommendations).toEqual([]);
    expect(mockPerformanceService.getPersonalizedRecommendations).not.toHaveBeenCalled();
  });

  it('handles fetch errors correctly', async () => {
    const errorMessage = 'Network error';
    mockPerformanceService.getPersonalizedRecommendations.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recommendations).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles non-Error exceptions', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockRejectedValue('String error');

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Öneriler yüklenirken bir hata oluştu');
  });

  it('manually fetches recommendations', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);

    const { result } = renderHook(() => 
      useRecommendations({ autoFetch: false })
    );

    expect(result.current.recommendations).toEqual([]);

    await act(async () => {
      await result.current.fetchRecommendations();
    });

    expect(result.current.recommendations).toEqual(mockRecommendations);
    expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalled();
  });

  it('rates a recommendation', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);
    mockPerformanceService.rateRecommendation.mockResolvedValue();

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.rateRecommendation(1, 5, 'Great resource!');
    });

    expect(mockPerformanceService.rateRecommendation).toHaveBeenCalledWith(1, 5, 'Great resource!');
    
    // Check that the recommendation was updated locally
    const updatedRecommendation = result.current.recommendations.find(r => r.id === 1);
    expect(updatedRecommendation?.userRating).toBe(5);
  });

  it('marks recommendation as used', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);
    mockPerformanceService.markRecommendationUsed.mockResolvedValue();

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markRecommendationUsed(1);
    });

    expect(mockPerformanceService.markRecommendationUsed).toHaveBeenCalledWith(1);
    
    // Check that the recommendation was updated locally
    const updatedRecommendation = result.current.recommendations.find(r => r.id === 1);
    expect(updatedRecommendation?.isUsed).toBe(true);
  });

  it('handles rating errors', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);
    mockPerformanceService.rateRecommendation.mockRejectedValue(new Error('Rating failed'));

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.rateRecommendation(1, 5);
      })
    ).rejects.toThrow('Rating failed');
  });

  it('handles mark used errors', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);
    mockPerformanceService.markRecommendationUsed.mockRejectedValue(new Error('Mark used failed'));

    const { result } = renderHook(() => useRecommendations());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.markRecommendationUsed(1);
      })
    ).rejects.toThrow('Mark used failed');
  });

  it('retries fetching recommendations', async () => {
    mockPerformanceService.getPersonalizedRecommendations
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockRecommendations);

    const { result } = renderHook(() => useRecommendations());

    // Wait for initial error
    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    // Retry
    await act(async () => {
      result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.recommendations).toEqual(mockRecommendations);
    expect(result.current.error).toBeNull();
    expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalledTimes(2);
  });

  it('updates dependencies correctly', async () => {
    mockPerformanceService.getPersonalizedRecommendations.mockResolvedValue(mockRecommendations);

    const { result, rerender } = renderHook(
      ({ subjectId }) => useRecommendations({ subjectId }),
      { initialProps: { subjectId: 1 } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalledWith({
      subject_id: 1,
      topic_id: undefined,
      resource_type: undefined,
      limit: undefined,
    });

    // Change subject ID
    rerender({ subjectId: 2 });

    await waitFor(() => {
      expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalledWith({
        subject_id: 2,
        topic_id: undefined,
        resource_type: undefined,
        limit: undefined,
      });
    });

    expect(mockPerformanceService.getPersonalizedRecommendations).toHaveBeenCalledTimes(2);
  });
});