import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RetryHandler, RetryUI } from '../RetryHandler';

// Test component that uses retry handler
const RetryHandlerConsumer: React.FC<{
  operation: () => Promise<string>;
  onSuccess?: (result: string) => void;
  onError?: (error: Error) => void;
}> = ({ operation, onSuccess, onError }) => {
  return (
    <RetryHandler
      operation={operation}
      onSuccess={onSuccess}
      onError={onError}
      maxAttempts={3}
      delay={10}
    >
      {({ execute, retry, reset, isRetrying, attempt, lastError, canRetry }) => (
        <div>
          <div data-testid="is-retrying">{isRetrying.toString()}</div>
          <div data-testid="attempt">{attempt}</div>
          <div data-testid="can-retry">{canRetry.toString()}</div>
          {lastError && <div data-testid="error">{lastError.message}</div>}
          <button onClick={execute}>Execute</button>
          <button onClick={retry} disabled={!canRetry}>Retry</button>
          <button onClick={reset}>Reset</button>
        </div>
      )}
    </RetryHandler>
  );
};

// Temporarily disabled - uses removed useComponentRetry hook
/*
const ComponentRetryConsumer: React.FC<{
  operation: () => Promise<string>;
}> = ({ operation }) => {
  const { result, execute, retry, reset, isExecuting, attempt, lastError, canRetry } = 
    useComponentRetry(operation, { maxAttempts: 2 });
  
  return (
    <div>
      <div data-testid="result">{result || 'no result'}</div>
      <div data-testid="is-executing">{isExecuting.toString()}</div>
      <div data-testid="attempt">{attempt}</div>
      <div data-testid="can-retry">{canRetry.toString()}</div>
      {lastError && <div data-testid="error">{lastError.message}</div>}
      <button onClick={execute}>Execute</button>
      <button onClick={retry} disabled={!canRetry}>Retry</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
*/

describe('RetryHandler', () => {
  it('should execute operation successfully', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const mockOnSuccess = vi.fn();
    
    render(
      <RetryHandlerConsumer 
        operation={mockOperation}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByText('Execute'));
    
    await waitFor(() => {
      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledWith('success');
    });
  });

  it('should handle operation failure and retry', async () => {
    const mockOperation = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValue('success');
    const mockOnError = vi.fn();
    
    render(
      <RetryHandlerConsumer 
        operation={mockOperation}
        onError={mockOnError}
      />
    );

    fireEvent.click(screen.getByText('Execute'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('First failure');
      expect(screen.getByTestId('attempt')).toHaveTextContent('1');
      expect(screen.getByTestId('can-retry')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Retry'));
    
    await waitFor(() => {
      expect(mockOperation).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('attempt')).toHaveTextContent('0');
    });
  });

  it('should disable retry after max attempts', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Always fails'));
    
    render(
      <RetryHandlerConsumer operation={mockOperation} />
    );

    // Execute and fail
    fireEvent.click(screen.getByText('Execute'));
    
    await waitFor(() => {
      expect(screen.getByTestId('can-retry')).toHaveTextContent('true');
    });

    // Retry and fail again
    fireEvent.click(screen.getByText('Retry'));
    
    await waitFor(() => {
      expect(screen.getByTestId('can-retry')).toHaveTextContent('true');
    });

    // Retry one more time (should reach max attempts)
    fireEvent.click(screen.getByText('Retry'));
    
    await waitFor(() => {
      expect(screen.getByTestId('can-retry')).toHaveTextContent('false');
    });
  });

  it('should reset state', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'));
    
    render(
      <RetryHandlerConsumer operation={mockOperation} />
    );

    fireEvent.click(screen.getByText('Execute'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failure');
      expect(screen.getByTestId('attempt')).toHaveTextContent('1');
    });

    fireEvent.click(screen.getByText('Reset'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
      expect(screen.getByTestId('attempt')).toHaveTextContent('0');
    });
  });

  it('should show retry UI correctly', () => {
    const mockOnRetry = vi.fn();
    const mockError = new Error('Test error');
    
    render(
      <RetryUI
        error={mockError}
        onRetry={mockOnRetry}
        isRetrying={false}
        attempt={1}
        maxAttempts={3}
        canRetry={true}
        title="Test Failed"
        description="Test description"
      />
    );

    expect(screen.getByText('Test Failed')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Attempt 1 of 3')).toBeInTheDocument();
    
    const retryButton = screen.getByText(/Try Again/);
    expect(retryButton).toBeInTheDocument();
    
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('should show retrying state in UI', () => {
    const mockError = new Error('Test error');
    
    render(
      <RetryUI
        error={mockError}
        onRetry={vi.fn()}
        isRetrying={true}
        attempt={1}
        maxAttempts={3}
        canRetry={true}
      />
    );

    expect(screen.getByText('Retrying...')).toBeInTheDocument();
  });

  it('should disable retry when max attempts reached', () => {
    const mockError = new Error('Test error');
    
    render(
      <RetryUI
        error={mockError}
        onRetry={vi.fn()}
        isRetrying={false}
        attempt={3}
        maxAttempts={3}
        canRetry={false}
      />
    );

    expect(screen.getByText('Maximum retry attempts reached. Please try again later.')).toBeInTheDocument();
  });
});

// Temporarily disabled - useComponentRetry hook removed to fix React hook errors
/*
describe('useComponentRetry', () => {
  it('should handle successful operation', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    
    render(<ComponentRetryConsumer operation={mockOperation} />);

    expect(screen.getByTestId('result')).toHaveTextContent('no result');

    fireEvent.click(screen.getByText('Execute'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('success');
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle failed operation', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    render(<ComponentRetryConsumer operation={mockOperation} />);

    fireEvent.click(screen.getByText('Execute'));
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Operation failed');
      expect(screen.getByTestId('attempt')).toHaveTextContent('1');
      expect(screen.getByTestId('can-retry')).toHaveTextContent('true');
    });
  });
});
*/