import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { 
  LoadingStateManager, 
  useLoadingState, 
  useComponentLoading,
  LoadingWrapper,
  GlobalLoadingIndicator 
} from '../LoadingStateManager';

// Test component that uses loading state
const LoadingStateConsumer: React.FC = () => {
  const { setLoading, isLoading, isAnyLoading, clearAllLoading } = useLoadingState();
  
  return (
    <div>
      <div data-testid="is-loading">{isLoading('test').toString()}</div>
      <div data-testid="is-any-loading">{isAnyLoading.toString()}</div>
      <button onClick={() => setLoading('test', true)}>Start Loading</button>
      <button onClick={() => setLoading('test', false)}>Stop Loading</button>
      <button onClick={clearAllLoading}>Clear All</button>
    </div>
  );
};

// Test component that uses component loading
const ComponentLoadingConsumer: React.FC = () => {
  const { isLoading, startLoading, stopLoading } = useComponentLoading('component-test');
  
  return (
    <div>
      <div data-testid="component-loading">{isLoading.toString()}</div>
      <button onClick={startLoading}>Start</button>
      <button onClick={stopLoading}>Stop</button>
    </div>
  );
};

// Test component for async operations
const AsyncOperationConsumer: React.FC = () => {
  const { executeWithLoading } = useComponentLoading('async-test');
  
  const handleAsyncOperation = () => {
    executeWithLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'success';
    });
  };
  
  return (
    <div>
      <button onClick={handleAsyncOperation}>Execute Async</button>
    </div>
  );
};

describe('LoadingStateManager', () => {
  it('should manage loading states', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={0}>
        <LoadingStateConsumer />
      </LoadingStateManager>
    );

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('is-any-loading')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Start Loading'));
    
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
      expect(screen.getByTestId('is-any-loading')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Stop Loading'));
    
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('is-any-loading')).toHaveTextContent('false');
    });
  });

  it('should clear all loading states', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={0}>
        <LoadingStateConsumer />
      </LoadingStateManager>
    );

    fireEvent.click(screen.getByText('Start Loading'));
    
    await waitFor(() => {
      expect(screen.getByTestId('is-any-loading')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Clear All'));
    
    await waitFor(() => {
      expect(screen.getByTestId('is-any-loading')).toHaveTextContent('false');
    });
  });

  it('should handle component-specific loading', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={0}>
        <ComponentLoadingConsumer />
      </LoadingStateManager>
    );

    expect(screen.getByTestId('component-loading')).toHaveTextContent('false');

    fireEvent.click(screen.getByText('Start'));
    
    await waitFor(() => {
      expect(screen.getByTestId('component-loading')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Stop'));
    
    await waitFor(() => {
      expect(screen.getByTestId('component-loading')).toHaveTextContent('false');
    });
  });

  it('should show loading wrapper when loading', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={0}>
        <LoadingStateConsumer />
        <LoadingWrapper loadingKey="test" skeleton="form">
          <div data-testid="content">Content</div>
        </LoadingWrapper>
      </LoadingStateManager>
    );

    // Initially should show content
    expect(screen.getByTestId('content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Start Loading'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
      // Should show skeleton instead
    });

    fireEvent.click(screen.getByText('Stop Loading'));
    
    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  it('should show global loading indicator', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={0}>
        <LoadingStateConsumer />
        <GlobalLoadingIndicator />
      </LoadingStateManager>
    );

    // Initially should not show indicator
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Start Loading'));
    
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Stop Loading'));
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });

  it('should handle async operations with loading', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={0}>
        <AsyncOperationConsumer />
      </LoadingStateManager>
    );

    fireEvent.click(screen.getByText('Execute Async'));
    
    // Loading state should be managed automatically
    // This is a basic test - in real usage, the loading state would be visible
  });

  it('should apply loading delay', async () => {
    render(
      <LoadingStateManager globalLoadingDelay={100}>
        <LoadingStateConsumer />
      </LoadingStateManager>
    );

    fireEvent.click(screen.getByText('Start Loading'));
    
    // Should not be loading immediately due to delay
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    
    // Should be loading after delay
    await waitFor(() => {
      expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    }, { timeout: 200 });
  });
});