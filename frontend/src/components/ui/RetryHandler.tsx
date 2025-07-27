import React from 'react';
import Button from './Button';
import { cn } from '../../utils';

// Legacy interface for backward compatibility
interface RetryHandlerProps<T = unknown> {
  children:
    | React.ReactNode
    | ((props: {
        execute?: () => Promise<void>;
        retry: () => void;
        reset: () => void;
        isRetrying: boolean;
        attempt: number;
        lastError: Error | null;
        canRetry: boolean;
      }) => React.ReactNode);
  operation?: () => Promise<T>;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  onRetry?: () => Promise<void> | void;
  maxAttempts?: number;
  maxRetries?: number;
  delay?: number;
  retryDelay?: number;
  backoff?: 'linear' | 'exponential';
  exponentialBackoff?: boolean;
  onMaxRetriesReached?: (error: Error) => void;
  className?: string;
  showRetryCount?: boolean;
  customRetryButton?: (
    handleRetry: () => void,
    isRetrying: boolean,
    retryCount: number
  ) => React.ReactNode;
  disabled?: boolean;
}

/**
 * Simple retry handler component without hooks to avoid React hook errors
 * This is a temporary implementation to fix the immediate issue while maintaining API compatibility
 */
export const RetryHandler = <T = unknown,>({
  children,
  operation,
  onSuccess,
  onError,
  onRetry,
  maxAttempts = 3,
  maxRetries,
  delay: _delay = 1000,
  retryDelay: _retryDelay,
  backoff: _backoff = 'exponential',
  exponentialBackoff: _exponentialBackoff = true,
  onMaxRetriesReached: _onMaxRetriesReached,
  className,
  customRetryButton: _customRetryButton,
  disabled: _disabled = false,
}: RetryHandlerProps<T>) => {
  // Use maxRetries if provided for backward compatibility (temporarily unused)
  const _maxRetriesCount = maxRetries || maxAttempts;

  // Simple implementation without hooks to avoid React hook errors
  if (typeof children === 'function') {
    try {
      return (
        <div className={className}>
          {children({
            execute: operation
              ? async () => {
                  try {
                    const result = await operation();
                    if (onSuccess) {
                      onSuccess(result);
                    }
                  } catch (error) {
                    if (onError) {
                      onError(
                        error instanceof Error
                          ? error
                          : new Error(String(error))
                      );
                    }
                  }
                }
              : undefined,
            retry: () => {
              if (onRetry) {
                onRetry();
              } else if (operation) {
                // Simple retry without state management
                operation().then(
                  result => {
                    if (onSuccess) {
                      onSuccess(result);
                    }
                  },
                  error => {
                    if (onError) {
                      onError(
                        error instanceof Error
                          ? error
                          : new Error(String(error))
                      );
                    }
                  }
                );
              }
            },
            reset: () => {
              // Simple reset implementation
            },
            isRetrying: false,
            attempt: 0,
            lastError: null,
            canRetry: true,
          })}
        </div>
      );
    } catch (_error) {
      return (
        <div
          className={cn(
            'p-4 border border-red-200 rounded-lg bg-red-50',
            className
          )}
        >
          <p className="text-red-600 mb-2">Something went wrong</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Reload Page
          </Button>
        </div>
      );
    }
  }

  return <div className={className}>{children}</div>;
};

/**
 * Pre-built retry UI component
 */
interface RetryUIProps {
  error: Error | null;
  onRetry: () => void;
  onReset?: () => void;
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  canRetry: boolean;
  className?: string;
  title?: string;
  description?: string;
  showAttemptCount?: boolean;
}

export const RetryUI: React.FC<RetryUIProps> = ({
  error,
  onRetry,
  onReset,
  isRetrying,
  attempt,
  maxAttempts,
  canRetry,
  className,
  title = 'Operation Failed',
  description,
  showAttemptCount = true,
}) => {
  if (!error) {
    return null;
  }

  return (
    <div
      className={cn(
        'p-6 text-center max-w-md mx-auto border rounded-lg',
        className
      )}
    >
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 mb-4">{description || error.message}</p>

      {showAttemptCount && attempt > 0 && (
        <p className="text-sm text-gray-500 mb-4">
          Attempt {attempt} of {maxAttempts}
        </p>
      )}

      <div className="space-y-2">
        {canRetry && (
          <Button onClick={onRetry} disabled={isRetrying} className="w-full">
            {isRetrying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Retrying...
              </>
            ) : (
              `Try Again${attempt > 0 ? ` (${maxAttempts - attempt} left)` : ''}`
            )}
          </Button>
        )}

        {onReset && (
          <Button
            variant="outline"
            onClick={onReset}
            disabled={isRetrying}
            className="w-full"
          >
            Reset
          </Button>
        )}

        {!canRetry && attempt >= maxAttempts && (
          <div className="text-sm text-red-600 mt-2">
            Maximum retry attempts reached. Please try again later.
          </div>
        )}
      </div>
    </div>
  );
};
