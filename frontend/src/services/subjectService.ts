// Subject and Topic service for managing educational content

import { BaseApiService } from './api';
import type { Subject, Topic, PaginatedResponse, PaginationParams, SortParams } from '../types';

export class SubjectService extends BaseApiService {
  /**
   * Get all subjects
   */
  async getSubjects(params?: PaginationParams & SortParams): Promise<Subject[]> {
    console.log('SubjectService.getSubjects called with params:', params);
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const basePath = '/subjects/';
    const url = `${basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Making API request to:', url);
    
    try {
      // Check if response is paginated or direct array
      const response = await this.get<Subject[] | PaginatedResponse<Subject>>(url);
      console.log('API response received:', response);
      
      // Handle both paginated and direct array responses
      if (Array.isArray(response)) {
        return response;
      } else {
        return response.data;
      }
    } catch (error) {
      console.error('Error in getSubjects:', error);
      throw error;
    }
  }

  /**
   * Get subject by ID
   */
  async getSubject(id: number): Promise<Subject> {
    return await this.get<Subject>(`/subjects/${id}`);
  }

  /**
   * Create new subject (admin only)
   */
  async createSubject(subjectData: Omit<Subject, 'id' | 'created_at' | 'updated_at'>): Promise<Subject> {
    return await this.post<Subject>('/subjects', subjectData);
  }

  /**
   * Update subject (admin only)
   */
  async updateSubject(id: number, subjectData: Partial<Subject>): Promise<Subject> {
    return await this.put<Subject>(`/subjects/${id}`, subjectData);
  }

  /**
   * Delete subject (admin only)
   */
  async deleteSubject(id: number): Promise<void> {
    await this.delete(`/subjects/${id}`);
  }

  /**
   * Get topics for a specific subject
   */
  async getTopics(subjectId: number, params?: PaginationParams & SortParams): Promise<Topic[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const url = `/subjects/${subjectId}/topics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Check if response is paginated or direct array
    const response = await this.get<Topic[] | PaginatedResponse<Topic>>(url);
    
    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.data;
    }
  }

  /**
   * Get all topics (across all subjects)
   */
  async getAllTopics(params?: PaginationParams & SortParams): Promise<Topic[]> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }
    if (params?.sort_by) {
      queryParams.append('sort_by', params.sort_by);
    }
    if (params?.sort_order) {
      queryParams.append('sort_order', params.sort_order);
    }

    const url = `/topics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Check if response is paginated or direct array
    const response = await this.get<Topic[] | PaginatedResponse<Topic>>(url);
    
    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.data;
    }
  }

  /**
   * Get topic by ID
   */
  async getTopic(id: number): Promise<Topic> {
    return await this.get<Topic>(`/topics/${id}`);
  }

  /**
   * Create new topic (admin only)
   */
  async createTopic(topicData: Omit<Topic, 'id' | 'created_at' | 'updated_at'>): Promise<Topic> {
    return await this.post<Topic>('/topics', topicData);
  }

  /**
   * Update topic (admin only)
   */
  async updateTopic(id: number, topicData: Partial<Topic>): Promise<Topic> {
    return await this.put<Topic>(`/topics/${id}`, topicData);
  }

  /**
   * Delete topic (admin only)
   */
  async deleteTopic(id: number): Promise<void> {
    await this.delete(`/topics/${id}`);
  }

  /**
   * Search subjects by name or description
   */
  async searchSubjects(query: string, params?: PaginationParams): Promise<Subject[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }

    const url = `/subjects/search?${queryParams.toString()}`;
    
    // Check if response is paginated or direct array
    const response = await this.get<Subject[] | PaginatedResponse<Subject>>(url);
    
    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.data;
    }
  }

  /**
   * Search topics by name or description
   */
  async searchTopics(query: string, subjectId?: number, params?: PaginationParams): Promise<Topic[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (subjectId) {
      queryParams.append('subject_id', subjectId.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      queryParams.append('per_page', params.per_page.toString());
    }

    const url = `/topics/search?${queryParams.toString()}`;
    
    // Check if response is paginated or direct array
    const response = await this.get<Topic[] | PaginatedResponse<Topic>>(url);
    
    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      return response;
    } else {
      return response.data;
    }
  }
}

// Create and export singleton instance
export const subjectService = new SubjectService();