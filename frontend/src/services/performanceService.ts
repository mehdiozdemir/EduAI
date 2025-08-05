// Performance analysis and recommendation service

import { BaseApiService } from './api';
import type {
  PerformanceAnalysisRequest,
  PerformanceAnalysis,
  ResourceRecommendation,
  PerformanceData,
  PaginationParams,
  SortParams,
} from '../types';

export class PerformanceService extends BaseApiService {
  private baseUrl = '/api/v1';

  /**
   * Analyze user performance based on quiz results
   */
  async analyzePerformance(
    data: PerformanceAnalysisRequest
  ): Promise<PerformanceAnalysis> {
    const response = await this.post<PerformanceAnalysis>(
      `${this.baseUrl}/performance/analyze`,
      data
    );
    return response;
  }

  /**
   * Get user's performance history
   */
  async getUserPerformance(
    userId?: number,
    params?: PaginationParams &
      SortParams & {
        subject_id?: number;
        topic_id?: number;
        date_from?: string;
        date_to?: string;
      }
  ): Promise<PerformanceAnalysis[]> {
    if (!userId) {
      throw new Error('User ID is required for performance history');
    }

    const queryParams = new URLSearchParams();

    // Backend endpoint supports skip and limit parameters
    if (params?.page && params?.per_page) {
      const skip = (params.page - 1) * params.per_page;
      queryParams.append('skip', skip.toString());
      queryParams.append('limit', params.per_page.toString());
    }

    // Note: Backend endpoint doesn't support other filters yet
    // These would need to be added to the backend endpoint
    const url = `${this.baseUrl}/performance/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get<PerformanceAnalysis[]>(url);
  }

  /**
   * Get performance analysis by ID
   */
  async getPerformanceAnalysis(id: number): Promise<PerformanceAnalysis> {
    return await this.get<PerformanceAnalysis>(`${this.baseUrl}/performance/${id}`);
  }

  /**
   * Get resource recommendations for a performance analysis
   */
  async getRecommendations(
    analysisId: number
  ): Promise<ResourceRecommendation[]> {
    return await this.get<ResourceRecommendation[]>(
      `${this.baseUrl}/performance/${analysisId}/recommendations`
    );
  }

  /**
   * Get personalized recommendations for current user
   */
  async getPersonalizedRecommendations(params?: {
    subject_id?: number;
    topic_id?: number;
    resource_type?: string;
    limit?: number;
  }): Promise<ResourceRecommendation[]> {
    const queryParams = new URLSearchParams();

    if (params?.subject_id) {
      queryParams.append('subject_id', params.subject_id.toString());
    }
    if (params?.topic_id) {
      queryParams.append('topic_id', params.topic_id.toString());
    }
    if (params?.resource_type) {
      queryParams.append('resource_type', params.resource_type);
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const url = `${this.baseUrl}/recommendations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get<ResourceRecommendation[]>(url);
  }

  /**
   * Get performance dashboard data
   */
  async getDashboardData(userId?: number): Promise<{
    overall_stats: {
      total_questions: number;
      total_correct: number;
      overall_accuracy: number;
      total_sessions: number;
    };
    recent_performance: PerformanceAnalysis[];
    subject_breakdown: Array<{
      subject_name: string;
      accuracy: number;
      question_count: number;
    }>;
    weakness_areas: Array<{
      topic_name: string;
      subject_name: string;
      weakness_level: number;
      recommendation_count: number;
    }>;
    progress_chart: PerformanceData[];
  }> {
    if (!userId) {
      throw new Error('User ID is required for dashboard data');
    }

    console.log('PerformanceService.getDashboardData called with userId:', userId);
    try {
      const result = await this.get(`${this.baseUrl}/performance/dashboard/${userId}`) as {
        overall_stats: {
          total_questions: number;
          total_correct: number;
          overall_accuracy: number;
          total_sessions: number;
        };
        recent_performance: PerformanceAnalysis[];
        subject_breakdown: Array<{
          subject_name: string;
          accuracy: number;
          question_count: number;
        }>;
        weakness_areas: Array<{
          topic_name: string;
          subject_name: string;
          weakness_level: number;
          recommendation_count: number;
        }>;
        progress_chart: PerformanceData[];
      };
      console.log('PerformanceService.getDashboardData response:', result);
      return result;
    } catch (error) {
      console.error('PerformanceService.getDashboardData error:', error);
      throw error;
    }
  }

  /**
   * Get performance trends over time
   */
  async getPerformanceTrends(
    userId?: number,
    params?: {
      period: 'week' | 'month' | 'quarter' | 'year';
      subject_id?: number;
      topic_id?: number;
    }
  ): Promise<PerformanceData[]> {
    const queryParams = new URLSearchParams();

    if (userId) {
      queryParams.append('user_id', userId.toString());
    }
    if (params?.period) {
      queryParams.append('period', params.period);
    }
    if (params?.subject_id) {
      queryParams.append('subject_id', params.subject_id.toString());
    }
    if (params?.topic_id) {
      queryParams.append('topic_id', params.topic_id.toString());
    }

    const url = `${this.baseUrl}/performance/trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get<PerformanceData[]>(url);
  }

  /**
   * Compare performance with other users (anonymized)
   */
  async getPerformanceComparison(
    userId?: number,
    params?: {
      subject_id?: number;
      topic_id?: number;
      education_level?: string;
    }
  ): Promise<{
    user_percentile: number;
    average_accuracy: number;
    user_accuracy: number;
    total_participants: number;
    subject_ranking?: number;
    topic_ranking?: number;
  }> {
    const queryParams = new URLSearchParams();

    if (userId) {
      queryParams.append('user_id', userId.toString());
    }
    if (params?.subject_id) {
      queryParams.append('subject_id', params.subject_id.toString());
    }
    if (params?.topic_id) {
      queryParams.append('topic_id', params.topic_id.toString());
    }
    if (params?.education_level) {
      queryParams.append('education_level', params.education_level);
    }

    const url = `${this.baseUrl}/performance/comparison${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(url);
  }

  /**
   * Export performance data
   */
  async exportPerformanceData(
    userId?: number,
    format: 'csv' | 'json' | 'pdf' = 'csv',
    params?: {
      date_from?: string;
      date_to?: string;
      subject_id?: number;
      topic_id?: number;
    }
  ): Promise<Blob> {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);

    if (userId) {
      queryParams.append('user_id', userId.toString());
    }
    if (params?.date_from) {
      queryParams.append('date_from', params.date_from);
    }
    if (params?.date_to) {
      queryParams.append('date_to', params.date_to);
    }
    if (params?.subject_id) {
      queryParams.append('subject_id', params.subject_id.toString());
    }
    if (params?.topic_id) {
      queryParams.append('topic_id', params.topic_id.toString());
    }

    const url = `${this.baseUrl}/performance/export?${queryParams.toString()}`;

    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    return response.data;
  }

  /**
   * Delete performance analysis
   */
  async deletePerformanceAnalysis(id: number): Promise<void> {
    await this.delete(`${this.baseUrl}/performance/${id}`);
  }

  /**
   * Rate a resource recommendation
   */
  async rateRecommendation(
    recommendationId: number,
    rating: number,
    feedback?: string
  ): Promise<void> {
    await this.post(`${this.baseUrl}/recommendations/${recommendationId}/rate`, {
      rating,
      feedback,
    });
  }

  /**
   * Mark recommendation as used
   */
  async markRecommendationUsed(recommendationId: number): Promise<void> {
    await this.post(`${this.baseUrl}/recommendations/${recommendationId}/used`);
  }

  /**
   * Get learning goals and progress
   */
  async getLearningGoals(userId?: number): Promise<
    Array<{
      id: number;
      subject_name: string;
      topic_name: string;
      target_accuracy: number;
      current_accuracy: number;
      progress_percentage: number;
      deadline?: string;
      status: 'active' | 'completed' | 'overdue';
    }>
  > {
    const queryParams = new URLSearchParams();

    if (userId) {
      queryParams.append('user_id', userId.toString());
    }

    const url = `${this.baseUrl}/performance/goals${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await this.get(url);
  }

  /**
   * Set learning goal
   */
  async setLearningGoal(goal: {
    subject_id: number;
    topic_id: number;
    target_accuracy: number;
    deadline?: string;
  }): Promise<void> {
    await this.post(`${this.baseUrl}/performance/goals`, goal);
  }
}

// Create and export singleton instance
export const performanceService = new PerformanceService();
// Performance monitoring and metrics collection
interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

interface BundleAnalysis {
  totalSize: number;
  chunkSizes: Record<string, number>;
  unusedCode: number;
  compressionRatio: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    timeToInteractive: 0,
  };

  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
    this.measurePageLoad();
  }

  private initializeObservers() {
    // Web Vitals observers
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntry & {
            processingStart: number;
            startTime: number;
          };
          this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        });
        this.metrics.cumulativeLayoutShift = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }
  }

  private measurePageLoad() {
    if ('performance' in window) {
      // Page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        this.metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      });

      // First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.firstContentfulPaint = fcpEntry.startTime;
      }
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public measureComponentRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    console.log(`${componentName} render time: ${endTime - startTime}ms`);
    
    // Send to analytics service if needed
    this.sendMetric('component-render', {
      component: componentName,
      duration: endTime - startTime,
    });
  }

  public measureApiCall(endpoint: string, duration: number, success: boolean) {
    this.sendMetric('api-call', {
      endpoint,
      duration,
      success,
      timestamp: Date.now(),
    });
  }

  public measureBundleSize(): Promise<BundleAnalysis> {
    return new Promise((resolve) => {
      // This would typically be done at build time
      // For runtime, we can estimate based on loaded resources
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalSize = 0;
      const chunkSizes: Record<string, number> = {};
      
      resources.forEach((resource) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          const size = resource.transferSize || 0;
          totalSize += size;
          
          const filename = resource.name.split('/').pop() || 'unknown';
          chunkSizes[filename] = size;
        }
      });

      resolve({
        totalSize,
        chunkSizes,
        unusedCode: 0, // Would need code coverage analysis
        compressionRatio: 0.7, // Estimated
      });
    });
  }

  private sendMetric(type: string, data: Record<string, unknown>) {
    // Send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: send to analytics service
      console.log(`Performance metric [${type}]:`, data);
      
      // You could send to services like:
      // - Google Analytics
      // - DataDog
      // - New Relic
      // - Custom analytics endpoint
    }
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();