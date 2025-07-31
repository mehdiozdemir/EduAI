import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EducationService } from '../educationService';
// Mock the BaseApiService
vi.mock('../api', () => ({
  BaseApiService: class {
    async get<T>(url: string): Promise<T> {
      // Mock implementation
      if (url === '/education-levels') {
        return [
          {
            id: 1,
            name: 'İlkokul',
            description: '1-4. Sınıf',
            sort_order: 1,
            grade_range: '1-4',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: null
          },
          {
            id: 2,
            name: 'Ortaokul',
            description: '5-8. Sınıf',
            sort_order: 2,
            grade_range: '5-8',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: null
          },
          {
            id: 3,
            name: 'Lise',
            description: '9-12. Sınıf',
            sort_order: 3,
            grade_range: '9-12',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: null
          }
        ] as T;
      }
      
      if (url === '/education-levels/1/courses') {
        return [
          {
            id: 1,
            name: 'Matematik',
            description: 'İlkokul matematik dersi',
            education_level_id: 1,
            code: 'MAT_ILK',
            color: '#FF5733',
            icon: '🔢',
            is_active: 1,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: null
          }
        ] as T;
      }
      
      throw new Error(`Unexpected URL: ${url}`);
    }
  }
}));

describe('EducationService', () => {
  let educationService: EducationService;

  beforeEach(() => {
    educationService = new EducationService();
  });

  describe('getEducationLevels', () => {
    it('should fetch all education levels', async () => {
      const levels = await educationService.getEducationLevels();
      
      expect(levels).toHaveLength(3);
      expect(levels[0]).toEqual({
        id: 1,
        name: 'İlkokul',
        description: '1-4. Sınıf',
        sort_order: 1,
        grade_range: '1-4',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      });
    });
  });

  describe('getCoursesByEducationLevel', () => {
    it('should fetch courses for a specific education level', async () => {
      const courses = await educationService.getCoursesByEducationLevel(1);
      
      expect(courses).toHaveLength(1);
      expect(courses[0]).toEqual({
        id: 1,
        name: 'Matematik',
        description: 'İlkokul matematik dersi',
        education_level_id: 1,
        code: 'MAT_ILK',
        color: '#FF5733',
        icon: '🔢',
        is_active: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      });
    });
  });
});