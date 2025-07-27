import React from 'react';
import Button from './Button';
import Card from './Card';
import { cn } from '../../utils';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  className?: string;
}

// Generic error fallback
export const GenericErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
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
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-4">
        We encountered an unexpected error. Please try again.
      </p>
      {resetError && (
        <Button onClick={resetError} className="w-full">
          Try again
        </Button>
      )}
    </Card>
  </div>
);

// Network error fallback
export const NetworkErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>
      <p className="text-gray-600 mb-4">
        Unable to connect to the server. Please check your internet connection and try again.
      </p>
      <div className="space-y-2">
        {resetError && (
          <Button onClick={resetError} className="w-full">
            Try again
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Reload page
        </Button>
      </div>
    </Card>
  </div>
);

// Not found error fallback
export const NotFoundErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8a7.962 7.962 0 01-2 5.291z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Content Not Found
      </h3>
      <p className="text-gray-600 mb-4">
        The content you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-y-2">
        {resetError && (
          <Button onClick={resetError} className="w-full">
            Go back
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Previous page
        </Button>
      </div>
    </Card>
  </div>
);

// Unauthorized error fallback
export const UnauthorizedErrorFallback: React.FC<ErrorFallbackProps> = ({
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Access Denied
      </h3>
      <p className="text-gray-600 mb-4">
        You don't have permission to access this content. Please log in or contact support.
      </p>
      <div className="space-y-2">
        <Button
          onClick={() => window.location.href = '/login'}
          className="w-full"
        >
          Go to Login
        </Button>
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="w-full"
        >
          Go back
        </Button>
      </div>
    </Card>
  </div>
);

// Server error fallback
export const ServerErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Server Error
      </h3>
      <p className="text-gray-600 mb-4">
        Our servers are experiencing issues. Please try again in a few moments.
      </p>
      <div className="space-y-2">
        {resetError && (
          <Button onClick={resetError} className="w-full">
            Try again
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="w-full"
        >
          Reload page
        </Button>
      </div>
    </Card>
  </div>
);

// Empty state fallback
export const EmptyStateFallback: React.FC<{
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}> = ({
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  action,
  icon,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <div className="text-center max-w-md">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon || (
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  </div>
);

// Loading error fallback (for when loading fails)
export const LoadingErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Loading Failed
      </h3>
      <p className="text-gray-600 mb-4">
        We couldn't load the content. Please try again.
      </p>
      {resetError && (
        <Button onClick={resetError} className="w-full">
          Retry loading
        </Button>
      )}
    </Card>
  </div>
);

// Timeout error fallback
export const TimeoutErrorFallback: React.FC<ErrorFallbackProps> = ({
  resetError,
  className,
}) => (
  <div className={cn('flex items-center justify-center p-8', className)}>
    <Card className="max-w-md w-full p-6 text-center">
      <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-yellow-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Request Timeout
      </h3>
      <p className="text-gray-600 mb-4">
        The request took too long to complete. Please try again.
      </p>
      {resetError && (
        <Button onClick={resetError} className="w-full">
          Try again
        </Button>
      )}
    </Card>
  </div>
);