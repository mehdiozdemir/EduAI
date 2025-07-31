// Education level and course service for managing educational content

import { BaseApiService } from './api';
import type { 
  EducationLevelData, 
  Course, 
  CourseTopic,
  EducationLevelWithCourses,
  CourseWithEducationLevel,
  CourseWithTopics,
  EducationSystemOverview,
  CourseListResponse,
  PaginatedResponse, 
  PaginationParams, 
  SortParams 
} from '../types';

export class EducationService extends BaseApiService {
  /**
   * Get all education levels
   */
  async getEducationLevels(params?: PaginationParams): Promise<EducationLevelData[]> {
    console.log('EducationService.getEducationLevels called with params:', params);
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('skip', ((params.page - 1) * (params.per_page || 10)).toString());
    }
    if (params?.per_page) {
      queryParams.append('limit', params.per_page.toString());
    }

    const url = `/api/v1/education-levels${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Making API request to:', url);
    
    try {
      const response = await this.get<EducationLevelData[]>(url);
      console.log('API response received:', response);
      return response;
    } catch (error) {
      console.error('Error in getEducationLevels:', error);
      throw error;
    }
  }

  /**
   * Get education level by ID
   */
  async getEducationLevel(id: number): Promise<EducationLevelData> {
    return await this.get<EducationLevelData>(`/api/v1/education-levels/${id}`);
  }

  /**
   * Get education level with courses
   */
  async getEducationLevelWithCourses(id: number): Promise<EducationLevelWithCourses> {
    return await this.get<EducationLevelWithCourses>(`/api/v1/education-levels/${id}/with-courses`);
  }

  /**
   * Get courses by education level
   */
  async getCoursesByEducationLevel(levelId: number): Promise<Course[]> {
    console.log('EducationService.getCoursesByEducationLevel called with levelId:', levelId);
    
    try {
      const response = await this.get<Course[]>(`/api/v1/education-levels/${levelId}/courses`);
      console.log('API response received:', response);
      return response;
    } catch (error) {
      console.error('Error in getCoursesByEducationLevel:', error);
      throw error;
    }
  }

  /**
   * Get all courses
   */
  async getCourses(params?: PaginationParams & { education_level_id?: number }): Promise<CourseListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('skip', ((params.page - 1) * (params.per_page || 10)).toString());
    }
    if (params?.per_page) {
      queryParams.append('limit', params.per_page.toString());
    }
    if (params?.education_level_id) {
      queryParams.append('education_level_id', params.education_level_id.toString());
    }

    const url = `/api/v1/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return await this.get<CourseListResponse>(url);
  }

  /**
   * Get course by ID
   */
  async getCourse(id: number): Promise<CourseWithEducationLevel> {
    return await this.get<CourseWithEducationLevel>(`/api/v1/courses/${id}`);
  }

  /**
   * Get course with topics
   */
  async getCourseWithTopics(id: number): Promise<CourseWithTopics> {
    return await this.get<CourseWithTopics>(`/api/v1/courses/${id}/with-topics`);
  }

  /**
   * Get topics for a specific course
   */
  async getCourseTopics(courseId: number, params?: PaginationParams & SortParams): Promise<CourseTopic[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('skip', ((params.page - 1) * (params.per_page || 10)).toString());
    }
    if (params?.per_page) {
      queryParams.append('limit', params.per_page.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const url = `/api/v1/courses/${courseId}/topics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await this.get<CourseTopic[] | PaginatedResponse<CourseTopic>>(url);
    
    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.data;
    }
  }

  /**
   * Search courses
   */
  async searchCourses(query: string, params?: PaginationParams & { education_level_id?: number }): Promise<CourseListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    
    if (params?.page) {
      queryParams.append('skip', ((params.page - 1) * (params.per_page || 10)).toString());
    }
    if (params?.per_page) {
      queryParams.append('limit', params.per_page.toString());
    }
    if (params?.education_level_id) {
      queryParams.append('education_level_id', params.education_level_id.toString());
    }

    const url = `/api/v1/courses/search?${queryParams.toString()}`;
    
    return await this.get<CourseListResponse>(url);
  }

  /**
   * Get education system overview
   */
  async getEducationSystemOverview(): Promise<EducationSystemOverview> {
    return await this.get<EducationSystemOverview>('/api/v1/education-system/overview');
  }
}

// Create and export singleton instance
export const educationService = new EducationService();