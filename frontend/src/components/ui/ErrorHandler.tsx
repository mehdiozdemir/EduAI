import React from 'react';
import type { ApiError } from '../../types';
import {
  GenericErrorFallback,
  NetworkErrorFallback,
  NotFoundErrorFallback,
  UnauthorizedErrorFallback,
  ServerErrorFallback,
  TimeoutErrorFallback,
  LoadingErrorFallback,
} from './ErrorFallbacks';
import { ErrorBoundary } from './ErrorBoundary';

interface ErrorHandlerProps {
  error: Error | ApiError | null;
  resetError?: () => void;
  className?: string;
  fallbackComponent?: React.ComponentType<{
    error: Error | ApiError;
    resetError: () => void;
  }>;
}

/**
 * Smart error handler that displays appropriate fallback based on error type
 */
export const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  resetError,
  className,
  fallbackComponent: CustomFallback,
}) => {
  if (!error) {
    return null;
  }

  // Use custom fallback if provided
  if (CustomFallback && resetError) {
    return <CustomFallback error={error} resetError={resetError} />;
  }

  // Determine error type and show appropriate fallback
  const errorType = getErrorType(error);

  switch (errorType) {
    case 'network':
      return (
        <NetworkErrorFallback
          error={error as Error}
          resetError={resetError}
          className={className}
        />
      );
    case 'notFound':
      return (
        <NotFoundErrorFallback
          error={error as Error}
          resetError={resetError}
          className={className}
        />
      );
    case 'unauthorized':
      return (
        <UnauthorizedErrorFallback
        error={error as Error}
        resetError={resetError}
          className={className}
        />
      );
    case 'server':
      return (
        <ServerErrorFallback
        error={error as Error}
          resetError={resetError}
          className={className}
        />
      );
    case 'timeout':
      return (
        <TimeoutErrorFallback
        error={error as Error}
          resetError={resetError}
          className={className}
        />
      );
    case 'loading':
      return (
        <LoadingErrorFallback
          error={error as Error}
          resetError={resetError}
          className={className}
        />
      );
    default:
      return (
        <GenericErrorFallback
          error={error as Error}
          resetError={resetError}
          className={className}
        />
      );
  }
};

/**
 * Determine error type based on error properties
 */
function getErrorType(error: Error | ApiError): string {
  // Check if it's an ApiError with status code
  if ('status' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.status) {
      case 401:
      case 403:
        return 'unauthorized';
      case 404:
        return 'notFound';
      case 408:
        return 'timeout';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'server';
      default:
        if (apiError.status >= 400 && apiError.status < 500) {
          return 'client';
        }
        if (apiError.status >= 500) {
          return 'server';
        }
    }
  }

  // Check error message for common patterns
  const message = error.message.toLowerCase();
  
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('offline')
  ) {
    return 'network';
  }
  
  if (
    message.includes('timeout') ||
    message.includes('aborted')
  ) {
    return 'timeout';
  }
  
  if (
    message.includes('not found') ||
    message.includes('404')
  ) {
    return 'notFound';
  }
  
  if (
    message.includes('unauthorized') ||
    message.includes('forbidden') ||
    message.includes('401') ||
    message.includes('403')
  ) {
    return 'unauthorized';
  }
  
  if (
    message.includes('server') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  ) {
    return 'server';
  }
  
  if (
    message.includes('loading') ||
    message.includes('load')
  ) {
    return 'loading';
  }

  return 'generic';
}

/**
 * Hook for error handling with automatic error type detection
 */
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | ApiError | null>(null);

  const handleError = React.useCallback((error: Error | ApiError) => {
    console.error('Error handled:', error);
    setError(error);
  }, []);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    resetError,
    clearError,
    hasError: error !== null,
  };
};

/**
 * Error boundary wrapper component
 */
interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError,
}) => {
  return (
    <ErrorBoundary
      fallback={fallback}
      onError={onError}
    >
      {children}
    </ErrorBoundary>
  );
};

// Re-export ErrorBoundary for convenience
export { ErrorBoundary } from './ErrorBoundary';

