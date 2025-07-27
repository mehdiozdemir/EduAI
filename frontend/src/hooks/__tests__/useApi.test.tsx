// Tests for useApi hook

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useApi, useMultipleApi, usePaginatedApi } from '../useApi';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { TokenManager } from '../../services/api';
import type { ApiError } from '../../types';

// Mock dependencies
vi.mock('../../services/authService');
vi.mock('../../services/api');

const mockAuthService = vi.mocked(authService);
const mockTokenManager = vi.mocked(TokenManager);

// Test component for useApi
const TestUseApiComponent: React.FC<{
  apiFunction: (...args: any[]) => Promise<any>;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}> = ({ apiFunction, onSuccess, onError }) => {
  const { data, loading, error, execute, reset, retry } = useApi(apiFunction, {
    onSuccess,
    onError,
    retryCount: 2,
    retryDelay: 100,
  });

  const handleExecute = async () => {
    try {
      await execute('test-arg');
    } catch {
      // Error is handled by the hook, no need to do anything
    }
  };

  const handleRetry = async () => {
    try {
      await retry();
    } catch {
      // Error is handled by the hook, no need to do anything
    }
  };

  return (
    <div>
      <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error?.message || 'null'}</div>
      <button onClick={handleExecute}>Execute</button>
      <button onClick={reset}>Reset</button>
      <button onClick={handleRetry}>Retry</button>
    </div>
  );
};

// Test component for useMultipleApi
const TestUseMultipleApiComponent: React.FC<{
  apiFunctions: Array<(...args: any[]) => Promise<any>>;
}> = ({ apiFunctions }) => {
  const { loading, errors, results, execute, reset } = useMultipleApi(apiFunctions, {
    executeInParallel: true,
  });

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="errors">{JSON.stringify(errors)}</div>
      <div data-testid="results">{JSON.stringify(results)}</div>
      <button onClick={execute}>Execute</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

// Test component for usePaginatedApi
const TestUsePaginatedApiComponent: React.FC<{
  apiFunction: (page: number, pageSize: number) => Promise<{ data: unknown[]; hasMore: boolean }>;
}> = ({ apiFunction }) => {
  const { data, loading, error, hasMore, currentPage, loadMore, refresh, reset } = usePaginatedApi(
    apiFunction,
    { pageSize: 2 }
  );

  return (
    <div>
      <div data-testid="data">{JSON.stringify(data)}</div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error?.message || 'null'}</div>
      <div data-testid="has-more">{hasMore.toString()}</div>
      <div data-testid="current-page">{currentPage.toString()}</div>
      <button onClick={loadMore}>Load More</button>
      <button onClick={refresh}>Refresh</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenManager.getToken.mockReturnValue(null);
  });

  it('should handle successful API call', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({ message: 'success' });
    const onSuccess = vi.fn();

    renderWithProvider(
      <TestUseApiComponent apiFunction={mockApiFunction} onSuccess={onSuccess} />
    );

    expect(screen.getByTestId('data')).toHaveTextContent('null');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('null');

    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('{"message":"success"}');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    expect(mockApiFunction).toHaveBeenCalledWith('test-arg');
    expect(onSuccess).toHaveBeenCalledWith({ message: 'success' });
  });

  it('should handle API error', async () => {
    const mockError = { message: 'API Error', status: 500 };
    const mockApiFunction = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();

    renderWithProvider(
      <TestUseApiComponent apiFunction={mockApiFunction} onError={onError} />
    );

    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('API Error');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });

    expect(onError).toHaveBeenCalledWith({
      message: 'API Error',
      status: 500,
      details: undefined,
    });
  });

  it('should handle 401 error and logout user', async () => {
    const mockError = { message: 'Unauthorized', status: 401 };
    const mockApiFunction = vi.fn().mockRejectedValue(mockError);
    mockAuthService.logout = vi.fn().mockResolvedValue(undefined);

    renderWithProvider(
      <TestUseApiComponent apiFunction={mockApiFunction} />
    );

    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  it('should reset state', async () => {
    const mockApiFunction = vi.fn().mockResolvedValue({ message: 'success' });

    renderWithProvider(
      <TestUseApiComponent apiFunction={mockApiFunction} />
    );

    // Execute API call
    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('{"message":"success"}');
    });

    // Reset state
    await act(async () => {
      screen.getByText('Reset').click();
    });

    expect(screen.getByTestId('data')).toHaveTextContent('null');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  it('should handle retry functionality', async () => {
    const mockApiFunction = vi.fn()
      .mockRejectedValueOnce({ message: 'First error', status: 500 })
      .mockResolvedValue({ message: 'success' });

    renderWithProvider(
      <TestUseApiComponent apiFunction={mockApiFunction} />
    );

    // First call fails
    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('First error');
    });

    // Retry succeeds
    await act(async () => {
      screen.getByText('Retry').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('{"message":"success"}');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    expect(mockApiFunction).toHaveBeenCalledTimes(2);
  });
});

describe('useMultipleApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenManager.getToken.mockReturnValue(null);
  });

  it('should handle multiple successful API calls', async () => {
    const mockApi1 = vi.fn().mockResolvedValue({ data: 'api1' });
    const mockApi2 = vi.fn().mockResolvedValue({ data: 'api2' });

    renderWithProvider(
      <TestUseMultipleApiComponent apiFunctions={[mockApi1, mockApi2]} />
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('results')).toHaveTextContent('[]');

    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('results')).toHaveTextContent('[{"data":"api1"},{"data":"api2"}]');
    });

    expect(mockApi1).toHaveBeenCalled();
    expect(mockApi2).toHaveBeenCalled();
  });

  it('should handle mixed success and error results', async () => {
    const mockApi1 = vi.fn().mockResolvedValue({ data: 'api1' });
    const mockApi2 = vi.fn().mockRejectedValue({ message: 'API2 Error', status: 500 });

    renderWithProvider(
      <TestUseMultipleApiComponent apiFunctions={[mockApi1, mockApi2]} />
    );

    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      // First API succeeds, second fails (returns null)
      expect(screen.getByTestId('results')).toHaveTextContent('[{"data":"api1"},null]');
    });
  });

  it('should reset state', async () => {
    const mockApi1 = vi.fn().mockResolvedValue({ data: 'api1' });

    renderWithProvider(
      <TestUseMultipleApiComponent apiFunctions={[mockApi1]} />
    );

    // Execute
    await act(async () => {
      screen.getByText('Execute').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('results')).toHaveTextContent('[{"data":"api1"}]');
    });

    // Reset
    await act(async () => {
      screen.getByText('Reset').click();
    });

    expect(screen.getByTestId('results')).toHaveTextContent('[]');
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });
});

describe('usePaginatedApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTokenManager.getToken.mockReturnValue(null);
  });

  it('should handle paginated data loading', async () => {
    const mockApiFunction = vi.fn()
      .mockResolvedValueOnce({ data: ['item1', 'item2'], hasMore: true })
      .mockResolvedValueOnce({ data: ['item3', 'item4'], hasMore: false });

    renderWithProvider(
      <TestUsePaginatedApiComponent apiFunction={mockApiFunction} />
    );

    // Initial load should happen automatically
    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('["item1","item2"]');
      expect(screen.getByTestId('has-more')).toHaveTextContent('true');
      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });

    // Load more
    await act(async () => {
      screen.getByText('Load More').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('["item1","item2","item3","item4"]');
      expect(screen.getByTestId('has-more')).toHaveTextContent('false');
      expect(screen.getByTestId('current-page')).toHaveTextContent('3');
    });

    expect(mockApiFunction).toHaveBeenCalledTimes(2);
    expect(mockApiFunction).toHaveBeenNthCalledWith(1, 1, 2);
    expect(mockApiFunction).toHaveBeenNthCalledWith(2, 2, 2);
  });

  it('should handle refresh', async () => {
    const mockApiFunction = vi.fn()
      .mockResolvedValue({ data: ['item1', 'item2'], hasMore: false });

    renderWithProvider(
      <TestUsePaginatedApiComponent apiFunction={mockApiFunction} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('["item1","item2"]');
    });

    // Refresh
    await act(async () => {
      screen.getByText('Refresh').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('current-page')).toHaveTextContent('2');
    });

    // Should be called twice (initial + refresh)
    expect(mockApiFunction).toHaveBeenCalledTimes(2);
  });

  it('should handle errors', async () => {
    const mockApiFunction = vi.fn().mockRejectedValue({ message: 'Load error', status: 500 });

    renderWithProvider(
      <TestUsePaginatedApiComponent apiFunction={mockApiFunction} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Load error');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should reset state', async () => {
    const mockApiFunction = vi.fn()
      .mockResolvedValue({ data: ['item1'], hasMore: false });

    renderWithProvider(
      <TestUsePaginatedApiComponent apiFunction={mockApiFunction} />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('data')).toHaveTextContent('["item1"]');
    });

    // Reset
    await act(async () => {
      screen.getByText('Reset').click();
    });

    expect(screen.getByTestId('data')).toHaveTextContent('[]');
    expect(screen.getByTestId('current-page')).toHaveTextContent('1');
    expect(screen.getByTestId('has-more')).toHaveTextContent('true');
  });
});