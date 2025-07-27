import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, DefaultErrorFallback, useErrorHandler } from '../ErrorBoundary';

// Mock component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test component for useErrorHandler hook
const TestErrorHandler: React.FC = () => {
  const { captureError, resetError } = useErrorHandler();

  return (
    <div>
      <button onClick={() => captureError(new Error('Hook error'))}>
        Trigger Error
      </button>
      <button onClick={resetError}>Reset Error</button>
    </div>
  );
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders default error fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const CustomFallback: React.FC<{ error: Error; resetError: () => void }> = ({ error }) => (
      <div>Custom error: {error.message}</div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error: Test error')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('resets error when try again button is clicked', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    // Re-render with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error details (development only)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Error details (development only)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('DefaultErrorFallback', () => {
  it('renders error fallback with reset button', () => {
    const resetError = jest.fn();
    const error = new Error('Test error');

    render(<DefaultErrorFallback error={error} resetError={resetError} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('calls resetError when try again button is clicked', () => {
    const resetError = jest.fn();
    const error = new Error('Test error');

    render(<DefaultErrorFallback error={error} resetError={resetError} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(resetError).toHaveBeenCalled();
  });

  it('reloads page when reload button is clicked', () => {
    const resetError = jest.fn();
    const error = new Error('Test error');
    const originalReload = window.location.reload;
    window.location.reload = jest.fn();

    render(<DefaultErrorFallback error={error} resetError={resetError} />);

    fireEvent.click(screen.getByRole('button', { name: /reload page/i }));

    expect(window.location.reload).toHaveBeenCalled();

    window.location.reload = originalReload;
  });
});

describe('useErrorHandler', () => {
  it('captures and throws errors', () => {
    const TestComponent = () => {
      const { captureError } = useErrorHandler();

      return (
        <button onClick={() => captureError(new Error('Hook error'))}>
          Trigger Error
        </button>
      );
    };

    expect(() => {
      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /trigger error/i }));
    }).not.toThrow(); // Error should be caught by ErrorBoundary

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});