import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSubjects, useSubject, useTopics } from '../useSubjectQueries';
import { subjectService } from '../../../services/subjectService';
import type { Subject, Topic } from '../../../types';

// Mock the subject service
vi.mock('../../../services/subjectService');
const mockSubjectService = subjectService as any;

// Test wrapper with QueryClient
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

const mockSubjects: Subject[] = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Math subjects',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Physics subjects',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTopics: Topic[] = [
  {
    id: 1,
    subject_id: 1,
    name: 'Algebra',
    description: 'Algebraic concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    subject_id: 1,
    name: 'Geometry',
    description: 'Geometric concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('useSubjectQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useSubjects', () => {
    it('should fetch subjects successfully', async () => {
      mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);

      const { result } = renderHook(() => useSubjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSubjects);
      expect(mockSubjectService.getSubjects).toHaveBeenCalledTimes(1);
    });

    it('should handle subjects fetch error', async () => {
      const error = new Error('Failed to fetch subjects');
      mockSubjectService.getSubjects.mockRejectedValue(error);

      const { result } = renderHook(() => useSubjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useSubject', () => {
    it('should fetch single subject successfully', async () => {
      const subject = mockSubjects[0];
      mockSubjectService.getSubject.mockResolvedValue(subject);

      const { result } = renderHook(() => useSubject(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(subject);
      expect(mockSubjectService.getSubject).toHaveBeenCalledWith(1);
    });

    it('should not fetch when disabled', () => {
      const { result } = renderHook(() => useSubject(1, false), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockSubjectService.getSubject).not.toHaveBeenCalled();
    });
  });

  describe('useTopics', () => {
    it('should fetch topics successfully', async () => {
      mockSubjectService.getTopics.mockResolvedValue(mockTopics);

      const { result } = renderHook(() => useTopics(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTopics);
      expect(mockSubjectService.getTopics).toHaveBeenCalledWith(1);
    });

    it('should not fetch when subject ID is 0', () => {
      const { result } = renderHook(() => useTopics(0), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockSubjectService.getTopics).not.toHaveBeenCalled();
    });

    it('should handle topics fetch error', async () => {
      const error = new Error('Failed to fetch topics');
      mockSubjectService.getTopics.mockRejectedValue(error);

      const { result } = renderHook(() => useTopics(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });
});