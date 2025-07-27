import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  ErrorBoundaryProvider, 
  useErrorContext, 
  useErrorHandler,
  GlobalErrorDisplay 
} from '../ErrorBoundaryProvider';

// Test component that throws an error
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test component that uses error context
const ErrorContextConsumer: React.FC = () => {
  const { errors, addError, clearErrors } = useErrorContext();
  
  return (
    <div>
      <div data-testid="error-count">{errors.length}</div>
      <button onClick={() => addError(new Error('Manual error'))}>
        Add Error
      </button>
      <button onClick={clearErrors}>Clear Errors</button>
    </div>
  );
};

// Test component that uses error handler
const ErrorHandlerConsumer: React.FC = () => {
  const { error, handleError, clearError } = useErrorHandler();
  
  return (
    <div>
      {error && <div data-testid="error-message">{error.message}</div>}
      <button onClick={() => handleError(new Error('Handler error'))}>
        Handle Error
      </button>
      <button onClick={clearError}>Clear Error</button>
    </div>
  );
};

describe('ErrorBoundaryProvider', () => {
  it('should catch and handle errors', () => {
    const onError = vi.fn();
    
    render(
      <ErrorBoundaryProvider onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundaryProvider>
        <ThrowError shouldThrow={false} />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should provide error context', () => {
    render(
      <ErrorBoundaryProvider>
        <ErrorContextConsumer />
      </ErrorBoundaryProvider>
    );

    expect(screen.getByTestId('error-count')).toHaveTextContent('0');

    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('1');

    fireEvent.click(screen.getByText('Clear Errors'));
    expect(screen.getByTestId('error-count')).toHaveTextContent('0');
  });

  it('should handle errors with useErrorHandler', () => {
    render(
      <ErrorBoundaryProvider>
        <ErrorHandlerConsumer />
      </ErrorBoundaryProvider>
    );

    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Handle Error'));
    expect(screen.getByTestId('error-message')).toHaveTextContent('Handler error');

    fireEvent.click(screen.getByText('Clear Error'));
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('should display global errors', () => {
    render(
      <ErrorBoundaryProvider>
        <ErrorContextConsumer />
        <GlobalErrorDisplay />
      </ErrorBoundaryProvider>
    );

    fireEvent.click(screen.getByText('Add Error'));
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('should limit number of errors', () => {
    render(
      <ErrorBoundaryProvider maxErrors={2}>
        <ErrorContextConsumer />
      </ErrorBoundaryProvider>
    );

    // Add 3 errors
    fireEvent.click(screen.getByText('Add Error'));
    fireEvent.click(screen.getByText('Add Error'));
    fireEvent.click(screen.getByText('Add Error'));

    // Should only keep 2 errors
    expect(screen.getByTestId('error-count')).toHaveTextContent('2');
  });
});