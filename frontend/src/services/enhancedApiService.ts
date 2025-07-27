import { BaseApiService } from './api';
import type { ApiError } from '../types';
import type { AxiosRequestConfig } from 'axios';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

interface CircuitBreakerOptions extends RetryOptions {
  failureThreshold?: number;
  resetTimeout?: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

/**
 * Enhanced API service with retry mechanisms and error handling
 */
export class EnhancedApiService extends BaseApiService {
  private retryOptions: RetryOptions = {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
  };

  private circuitBreakerOptions: CircuitBreakerOptions = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    ...this.retryOptions,
  };

  private circuitState: CircuitState = 'closed';
  private failureCount = 0;
  private resetTimeout?: NodeJS.Timeout;

  /**
   * Calculate delay for retry attempts
   */
  private calculateDelay(attempt: number, delay: number, backoff: 'linear' | 'exponential'): number {
    if (backoff === 'exponential') {
      return delay * Math.pow(2, attempt - 1);
    }
    return delay * attempt;
  }

  /**
   * Make API call with retry mechanism
   */
  async callWithRetry<T>(
    apiCall: () => Promise<T>,
    customRetryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    const options = { ...this.retryOptions, ...customRetryOptions };
    let lastError: Error;

    for (let attempt = 1; attempt <= (options.maxAttempts || 3); attempt++) {
      try {
        const result = await apiCall();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === options.maxAttempts) {
          if (options.onMaxAttemptsReached) {
            options.onMaxAttemptsReached(lastError);
          }
          throw lastError;
        }

        if (options.onRetry) {
          options.onRetry(attempt, lastError);
        }

        // Wait before retrying
        const delay = this.calculateDelay(
          attempt, 
          options.delay || 1000, 
          options.backoff || 'exponential'
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Make API call with circuit breaker pattern
   */
  async callWithCircuitBreaker<T>(
    apiCall: () => Promise<T>,
    customOptions?: Partial<CircuitBreakerOptions>
  ): Promise<T> {
    const options = { ...this.circuitBreakerOptions, ...customOptions };

    if (this.circuitState === 'open') {
      throw new Error('Circuit breaker is open. Service temporarily unavailable.');
    }

    try {
      const result = await this.callWithRetry(apiCall, options);
      
      // Reset failure count on success
      if (this.circuitState === 'half-open') {
        this.circuitState = 'closed';
        this.failureCount = 0;
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      
      if (this.failureCount >= (options.failureThreshold || 5)) {
        this.circuitState = 'open';
        
        // Set timeout to reset circuit breaker
        if (this.resetTimeout) {
          clearTimeout(this.resetTimeout);
        }
        
        this.resetTimeout = setTimeout(() => {
          this.circuitState = 'half-open';
        }, options.resetTimeout || 60000);
      }
      
      throw error;
    }
  }

  /**
   * Enhanced GET request with retry
   */
  async getWithRetry<T>(
    url: string,
    config?: AxiosRequestConfig,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.callWithRetry(() => this.get<T>(url, config), retryOptions);
  }

  /**
   * Enhanced POST request with retry
   */
  async postWithRetry<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.callWithRetry(() => this.post<T>(url, data, config), retryOptions);
  }

  /**
   * Enhanced PUT request with retry
   */
  async putWithRetry<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.callWithRetry(() => this.put<T>(url, data, config), retryOptions);
  }

  /**
   * Enhanced DELETE request with retry
   */
  async deleteWithRetry<T>(
    url: string,
    config?: AxiosRequestConfig,
    retryOptions?: Partial<RetryOptions>
  ): Promise<T> {
    return this.callWithRetry(() => this.delete<T>(url, config), retryOptions);
  }

  /**
   * Reset circuit breaker manually
   */
  resetCircuitBreaker(): void {
    this.circuitState = 'closed';
    this.failureCount = 0;
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = undefined;
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): {
    state: CircuitState;
    failureCount: number;
  } {
    return {
      state: this.circuitState,
      failureCount: this.failureCount,
    };
  }

  /**
   * Batch API calls with error handling
   */
  async batchCalls<T>(
    calls: Array<() => Promise<T>>,
    options?: {
      failFast?: boolean;
      maxConcurrency?: number;
    }
  ): Promise<Array<T | ApiError>> {
    const { failFast = false, maxConcurrency = 5 } = options || {};
    const results: Array<T | ApiError> = [];

    if (failFast) {
      // Fail fast - stop on first error
      for (const call of calls) {
        try {
          const result = await this.callWithRetry(call);
          results.push(result);
        } catch (error) {
          const apiError: ApiError = {
            message: error instanceof Error ? error.message : 'Unknown error',
            status: (error as any).status || 500,
            details: (error as any).details,
          };
          results.push(apiError);
          break;
        }
      }
    } else {
      // Process all calls with limited concurrency
      const chunks = [];
      for (let i = 0; i < calls.length; i += maxConcurrency) {
        chunks.push(calls.slice(i, i + maxConcurrency));
      }

      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(call => this.callWithRetry(call))
        );

        for (const result of chunkResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            const apiError: ApiError = {
              message: result.reason?.message || 'Unknown error',
              status: result.reason?.status || 500,
              details: result.reason?.details,
            };
            results.push(apiError);
          }
        }
      }
    }

    return results;
  }

  /**
   * Health check with circuit breaker
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.callWithCircuitBreaker(() => this.get('/health'));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Prefetch data with caching
   */
  private cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  async prefetch<T>(
    key: string,
    apiCall: () => Promise<T>,
    ttl: number = 300000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }

    try {
      const data = await this.callWithRetry(apiCall);
      this.cache.set(key, { data, timestamp: now, ttl });
      return data;
    } catch (error) {
      // Return cached data if available, even if expired
      if (cached) {
        console.warn('Using expired cache due to API error:', error);
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create and export singleton instance
export const enhancedApiService = new EnhancedApiService();