import { describe, it, expect } from 'vitest';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { subjectService } from '../subjectService';

describe('SubjectService', () => {
  describe('getSubjects', () => {
    it('should fetch all subjects successfully', async () => {
      const subjects = await subjectService.getSubjects();

      expect(subjects).toHaveLength(2);
      expect(subjects[0]).toEqual({
        id: 1,
        name: 'Mathematics',
        description: 'Basic mathematics concepts',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:8000/subjects', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(subjectService.getSubjects()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('http://localhost:8000/subjects', () => {
          return HttpResponse.error();
        })
      );

      await expect(subjectService.getSubjects()).rejects.toThrow();
    });
  });

  describe('getSubject', () => {
    it('should fetch a specific subject successfully', async () => {
      const subject = await subjectService.getSubject(1);

      expect(subject).toEqual({
        id: 1,
        name: 'Mathematics',
        description: 'Basic mathematics concepts',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should throw error for non-existent subject', async () => {
      await expect(subjectService.getSubject(999)).rejects.toThrow();
    });
  });

  describe('getTopics', () => {
    it('should fetch topics for a subject successfully', async () => {
      const topics = await subjectService.getTopics(1);

      expect(topics).toHaveLength(2);
      expect(topics[0]).toEqual({
        id: 1,
        subject_id: 1,
        name: 'Algebra',
        description: 'Basic algebra concepts',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      });
    });

    it('should return empty array for subject with no topics', async () => {
      const topics = await subjectService.getTopics(999);

      expect(topics).toHaveLength(0);
    });

    it('should handle server errors', async () => {
      server.use(
        http.get('http://localhost:8000/subjects/:id/topics', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      await expect(subjectService.getTopics(1)).rejects.toThrow();
    });
  });
});