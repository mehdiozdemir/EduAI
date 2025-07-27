import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorHandler } from './ErrorHandler';
import type { ApiError } from '../../types';

interface ErrorContextValue {
  errors: Array<{ id: string; error: Error | ApiError; timestamp: number }>;
  addError: (error: Error | ApiError) => string;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasErrors: boolean;
}

const ErrorContext = createContext<ErrorContextValue | undefined>(undefined);

interface ErrorBoundaryProviderProps {
  children: React.ReactNode;
  maxErrors?: number;
  autoRemoveAfter?: number; // milliseconds
  onError?: (error: Error | ApiError, errorInfo?: React.ErrorInfo) => void;
}

/**
 * Global error boundary provider that manages application-wide error state
 */
export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  children,
  maxErrors = 10,
  autoRemoveAfter = 10000, // 10 seconds
  onError,
}) => {
  const [errors, setErrors] = useState<Array<{ id: string; error: Error | ApiError; timestamp: number }>>([]);

  const addError = useCallback((error: Error | ApiError): string => {
    const id = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    setErrors(prev => {
      const newErrors = [{ id, error, timestamp }, ...prev];
      
      // Limit the number of stored errors
      if (newErrors.length > maxErrors) {
        return newErrors.slice(0, maxErrors);
      }
      
      return newErrors;
    });

    // Auto-remove error after specified time
    if (autoRemoveAfter > 0) {
      setTimeout(() => {
        removeError(id);
      }, autoRemoveAfter);
    }

    // Call external error handler if provided
    if (onError) {
      onError(error);
    }

    return id;
  }, [maxErrors, autoRemoveAfter, onError]);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const contextValue: ErrorContextValue = {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors: errors.length > 0,
  };

  return (
    <ErrorContext.Provider value={contextValue}>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          addError(error);
          if (onError) {
            onError(error, errorInfo);
          }
        }}
      >
        {children}
      </ErrorBoundary>
    </ErrorContext.Provider>
  );
};

/**
 * Hook to access error context
 */
export const useErrorContext = (): ErrorContextValue => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorBoundaryProvider');
  }
  return context;
};

/**
 * Hook for handling errors with automatic context integration
 */
export const useErrorHandler = () => {
  const { addError, removeError } = useErrorContext();
  const [currentError, setCurrentError] = useState<{ id: string; error: Error | ApiError } | null>(null);

  const handleError = useCallback((error: Error | ApiError) => {
    const id = addError(error);
    setCurrentError({ id, error });
    return id;
  }, [addError]);

  const clearError = useCallback(() => {
    if (currentError) {
      removeError(currentError.id);
      setCurrentError(null);
    }
  }, [currentError, removeError]);

  const resetError = useCallback(() => {
    clearError();
  }, [clearError]);

  return {
    error: currentError?.error || null,
    errorId: currentError?.id || null,
    handleError,
    clearError,
    resetError,
    hasError: currentError !== null,
  };
};

/**
 * Component for displaying global error notifications
 */
export const GlobalErrorDisplay: React.FC<{
  className?: string;
  maxVisible?: number;
}> = ({ className, maxVisible = 3 }) => {
  const { errors, removeError } = useErrorContext();
  const visibleErrors = errors.slice(0, maxVisible);

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-20 right-4 z-50 space-y-2 ${className || ''}`}>
      {visibleErrors.map(({ id, error }) => (
        <div
          key={id}
          className="max-w-sm bg-white border border-red-200 rounded-lg shadow-lg p-4"
        >
          <ErrorHandler
            error={error}
            resetError={() => removeError(id)}
            className="text-sm"
          />
        </div>
      ))}
    </div>
  );
};

/**
 * Higher-order component that wraps components with error boundary
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={fallbackComponent}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Component for wrapping sections with error boundaries
 */
export const ErrorBoundarySection: React.FC<{
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error: Error;
    resetError: () => void;
  }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  className?: string;
}> = ({ children, fallback, onError, className }) => {
  const { addError } = useErrorContext();

  return (
    <div className={className}>
      <ErrorBoundary
        fallback={fallback}
        onError={(error, errorInfo) => {
          addError(error);
          if (onError) {
            onError(error, errorInfo);
          }
        }}
      >
        {children}
      </ErrorBoundary>
    </div>
  );
};