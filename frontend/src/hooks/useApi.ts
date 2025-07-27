// Custom hook for consistent API error handling

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';
import type { ApiError } from '../types';

// API state interface
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

// API hook options
interface UseApiOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retryCount?: number;
  retryDelay?: number;
}

// API hook return type
interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
  retry: () => Promise<T>;
}

/**
 * Custom hook for API calls with consistent error handling
 * Provides loading states, error handling, and retry functionality
 */
export const useApi = <T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> => {
  const { logout } = useAuth();
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Store the last arguments for retry functionality
  const lastArgsRef = useRef<unknown[]>([]);
  const retryCountRef = useRef(0);

  const { onSuccess, onError, retryCount = 0, retryDelay = 1000 } = options;

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
    retryCountRef.current = 0;
  }, []);

  // Execute API call
  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      try {
        setState(prev => ({
          ...prev,
          loading: true,
          error: null,
        }));

        // Store arguments for retry
        lastArgsRef.current = args;

        const result = await apiFunction(...args);

        setState({
          data: result,
          loading: false,
          error: null,
        });

        // Reset retry count on success
        retryCountRef.current = 0;

        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error: unknown) {
        const apiError: ApiError = {
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
          status: (error as { status?: number }).status || 500,
          details: (error as { details?: Record<string, unknown> }).details,
        };

        // Handle authentication errors
        if (apiError.status === 401) {
          // Token expired or invalid, logout user
          await logout();
          return Promise.reject(apiError);
        }

        setState({
          data: null,
          loading: false,
          error: apiError,
        });

        // Call error callback
        if (onError) {
          onError(apiError);
        }

        throw apiError;
      }
    },
    [apiFunction, onSuccess, onError, logout]
  );

  // Retry function
  const retry = useCallback(async (): Promise<T> => {
    if (retryCountRef.current < retryCount) {
      retryCountRef.current += 1;

      // Add delay before retry
      if (retryDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }

      return execute(...lastArgsRef.current);
    } else {
      throw new Error('Maximum retry attempts reached');
    }
  }, [execute, retryCount, retryDelay]);

  return {
    ...state,
    execute,
    reset,
    retry,
  };
};

// Hook for multiple API calls
interface UseMultipleApiOptions {
  executeInParallel?: boolean;
  onAllSuccess?: (results: unknown[]) => void;
  onAnyError?: (error: ApiError) => void;
}

interface UseMultipleApiReturn {
  loading: boolean;
  errors: (ApiError | null)[];
  results: unknown[];
  execute: () => Promise<unknown[]>;
  reset: () => void;
}

/**
 * Custom hook for handling multiple API calls
 */
export const useMultipleApi = (
  apiFunctions: Array<(...args: unknown[]) => Promise<unknown>>,
  options: UseMultipleApiOptions = {}
): UseMultipleApiReturn => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<(ApiError | null)[]>([]);
  const [results, setResults] = useState<unknown[]>([]);

  const { executeInParallel = true, onAllSuccess, onAnyError } = options;

  const execute = useCallback(async (): Promise<unknown[]> => {
    setLoading(true);
    setErrors([]);
    setResults([]);

    try {
      let apiResults: unknown[];

      if (executeInParallel) {
        // Execute all API calls in parallel
        const promises = apiFunctions.map(async (apiFunction, _index) => {
          try {
            return await apiFunction();
          } catch (error: unknown) {
            const apiError: ApiError = {
              message:
                error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred',
              status: (error as { status?: number }).status || 500,
              details: (error as { details?: Record<string, unknown> }).details,
            };

            setErrors(prev => {
              const newErrors = [...prev];
              newErrors[_index] = apiError;
              return newErrors;
            });

            if (onAnyError) {
              onAnyError(apiError);
            }

            throw apiError;
          }
        });

        apiResults = await Promise.allSettled(promises).then(results =>
          results.map(result => {
            if (result.status === 'fulfilled') {
              return result.value;
            } else {
              return null;
            }
          })
        );
      } else {
        // Execute API calls sequentially
        apiResults = [];
        const newErrors: (ApiError | null)[] = [];

        for (let i = 0; i < apiFunctions.length; i++) {
          try {
            const result = await apiFunctions[i]();
            apiResults.push(result);
            newErrors.push(null);
          } catch (error: unknown) {
            const apiError: ApiError = {
              message:
                error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred',
              status: (error as { status?: number }).status || 500,
              details: (error as { details?: Record<string, unknown> }).details,
            };

            apiResults.push(null);
            newErrors.push(apiError);

            if (onAnyError) {
              onAnyError(apiError);
            }
          }
        }

        setErrors(newErrors);
      }

      setResults(apiResults);

      // Check if all calls were successful
      const hasErrors = errors.some(error => error !== null);
      if (!hasErrors && onAllSuccess) {
        onAllSuccess(apiResults);
      }

      return apiResults;
    } finally {
      setLoading(false);
    }
  }, [apiFunctions, executeInParallel, onAllSuccess, onAnyError, errors]);

  const reset = useCallback(() => {
    setLoading(false);
    setErrors([]);
    setResults([]);
  }, []);

  return {
    loading,
    errors,
    results,
    execute,
    reset,
  };
};

// Hook for paginated API calls
interface UsePaginatedApiOptions<T> {
  initialPage?: number;
  pageSize?: number;
  onSuccess?: (data: T[], hasMore: boolean) => void;
  onError?: (error: ApiError) => void;
}

interface UsePaginatedApiReturn<T> {
  data: T[];
  loading: boolean;
  error: ApiError | null;
  hasMore: boolean;
  currentPage: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for paginated API calls
 */
export const usePaginatedApi = <T = unknown>(
  apiFunction: (
    page: number,
    pageSize: number
  ) => Promise<{ data: T[]; hasMore: boolean }>,
  options: UsePaginatedApiOptions<T> = {}
): UsePaginatedApiReturn<T> => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(options.initialPage || 1);

  const { pageSize = 20, onSuccess, onError } = options;

  const loadMore = useCallback(async (): Promise<void> => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const result = await apiFunction(currentPage, pageSize);

      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setCurrentPage(prev => prev + 1);

      if (onSuccess) {
        onSuccess(result.data, result.hasMore);
      }
    } catch (err: unknown) {
      const apiError: ApiError = {
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred',
        status: (err as { status?: number }).status || 500,
        details: (err as { details?: Record<string, unknown> }).details,
      };

      setError(apiError);

      if (onError) {
        onError(apiError);
      }
    } finally {
      setLoading(false);
    }
  }, [
    apiFunction,
    currentPage,
    pageSize,
    loading,
    hasMore,
    onSuccess,
    onError,
  ]);

  const refresh = useCallback(async (): Promise<void> => {
    setData([]);
    setHasMore(true);
    setError(null);

    const initialPage = options.initialPage || 1;
    setCurrentPage(initialPage);

    // Load first page directly instead of using loadMore
    try {
      setLoading(true);
      const result = await apiFunction(initialPage, pageSize);

      setData(result.data);
      setHasMore(result.hasMore);
      setCurrentPage(initialPage + 1);

      if (onSuccess) {
        onSuccess(result.data, result.hasMore);
      }
    } catch (err: unknown) {
      const apiError: ApiError = {
        message:
          err instanceof Error ? err.message : 'An unexpected error occurred',
        status: (err as { status?: number }).status || 500,
        details: (err as { details?: Record<string, unknown> }).details,
      };

      setError(apiError);

      if (onError) {
        onError(apiError);
      }
    } finally {
      setLoading(false);
    }
  }, [apiFunction, pageSize, options.initialPage, onSuccess, onError]);

  const reset = useCallback(() => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
    setCurrentPage(options.initialPage || 1);
  }, [options.initialPage]);

  // Load initial data
  useEffect(() => {
    loadMore();
  }, [loadMore]); // Include loadMore dependency

  return {
    data,
    loading,
    error,
    hasMore,
    currentPage,
    loadMore,
    refresh,
    reset,
  };
};
