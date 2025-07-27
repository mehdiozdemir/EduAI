import { renderHook, act } from '@testing-library/react';
import { useRetry, useAutoRetry, useCircuitBreaker } from '../useRetry';

// Mock async function that can be controlled
const createMockAsyncFunction = (shouldFail: boolean[] = []) => {
  let callCount = 0;
  return jest.fn(async () => {
    const currentCall = callCount++;
    if (shouldFail[currentCall]) {
      throw new Error(`Error on call ${currentCall + 1}`);
    }
    return `Success on call ${currentCall + 1}`;
  });
};

describe('useRetry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('executes function successfully on first try', async () => {
    const mockFn = createMockAsyncFunction([false]);
    const { result } = renderHook(() => useRetry(mockFn));

    await act(async () => {
      const response = await result.current.execute();
      expect(response).toBe('Success on call 1');
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(result.current.state.attempt).toBe(0);
    expect(result.current.state.error).toBeNull();
  });

  it('retries on failure and succeeds', async () => {
    const mockFn = createMockAsyncFunction([true, false]); // Fail first, succeed second
    const { result } = renderHook(() => useRetry(mockFn, { maxAttempts: 2, delay: 100 }));

    // First execution fails
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        expect(error.message).toBe('Error on call 1');
      }
    });

    expect(result.current.state.attempt).toBe(1);
    expect(result.current.canRetry).toBe(true);

    // Retry succeeds
    await act(async () => {
      jest.advanceTimersByTime(100);
      const response = await result.current.retry();
      expect(response).toBe('Success on call 2');
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result.current.state.attempt).toBe(0);
    expect(result.current.state.error).toBeNull();
  });

  it('respects maxAttempts limit', async () => {
    const mockFn = createMockAsyncFunction([true, true, true]); // Always fail
    const onMaxAttemptsReached = jest.fn();
    const { result } = renderHook(() => 
      useRetry(mockFn, { 
        maxAttempts: 2, 
        delay: 100,
        onMaxAttemptsReached 
      })
    );

    // First execution fails
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        expect(error.message).toBe('Error on call 1');
      }
    });

    // First retry fails
    await act(async () => {
      jest.advanceTimersByTime(100);
      try {
        await result.current.retry();
      } catch (error) {
        expect(error.message).toBe('Error on call 2');
      }
    });

    // Second retry should fail with max attempts error
    await act(async () => {
      jest.advanceTimersByTime(100);
      try {
        await result.current.retry();
      } catch (error) {
        expect(error.message).toBe('Maximum retry attempts (2) reached');
      }
    });

    expect(result.current.canRetry).toBe(false);
  });

  it('calls onRetry callback', async () => {
    const mockFn = createMockAsyncFunction([true, false]);
    const onRetry = jest.fn();
    const { result } = renderHook(() => 
      useRetry(mockFn, { maxAttempts: 2, delay: 100, onRetry })
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected to fail
      }
    });

    await act(async () => {
      jest.advanceTimersByTime(100);
      await result.current.retry();
    });

    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
  });

  it('uses exponential backoff by default', async () => {
    const mockFn = createMockAsyncFunction([true, true, false]);
    const { result } = renderHook(() => 
      useRetry(mockFn, { maxAttempts: 3, delay: 100 })
    );

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected to fail
      }
    });

    const startTime = Date.now();
    
    await act(async () => {
      jest.advanceTimersByTime(100); // First retry delay: 100ms
      try {
        await result.current.retry();
      } catch (error) {
        // Expected to fail
      }
    });

    await act(async () => {
      jest.advanceTimersByTime(200); // Second retry delay: 200ms (exponential)
      await result.current.retry();
    });

    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('resets state correctly', async () => {
    const mockFn = createMockAsyncFunction([true]);
    const { result } = renderHook(() => useRetry(mockFn));

    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        // Expected to fail
      }
    });

    expect(result.current.state.attempt).toBe(1);
    expect(result.current.state.error).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.attempt).toBe(0);
    expect(result.current.state.error).toBeNull();
    expect(result.current.canRetry).toBe(false);
  });
});

describe('useAutoRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('automatically retries on failure', async () => {
    const mockFn = createMockAsyncFunction([true, false]);
    const { result } = renderHook(() => 
      useAutoRetry(mockFn, { maxAttempts: 2, delay: 100, autoRetry: true })
    );

    await act(async () => {
      jest.advanceTimersByTime(100);
      const response = await result.current.executeWithAutoRetry();
      expect(response).toBe('Success on call 2');
    });

    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('does not auto-retry when disabled', async () => {
    const mockFn = createMockAsyncFunction([true]);
    const { result } = renderHook(() => 
      useAutoRetry(mockFn, { maxAttempts: 2, autoRetry: false })
    );

    await act(async () => {
      try {
        await result.current.executeWithAutoRetry();
      } catch (error) {
        expect(error.message).toBe('Error on call 1');
      }
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

describe('useCircuitBreaker', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('opens circuit after failure threshold', async () => {
    const mockFn = createMockAsyncFunction([true, true, true, true, true, true]); // Always fail
    const { result } = renderHook(() => 
      useCircuitBreaker(mockFn, { 
        failureThreshold: 3, 
        maxAttempts: 1, // No retries for faster testing
        resetTimeout: 1000 
      })
    );

    // First 3 failures should work normally
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          expect(error.message).toBe(`Error on call ${i + 1}`);
        }
      });
    }

    expect(result.current.circuitState).toBe('open');

    // Next call should fail immediately with circuit breaker error
    await act(async () => {
      try {
        await result.current.execute();
      } catch (error) {
        expect(error.message).toBe('Circuit breaker is open. Service temporarily unavailable.');
      }
    });

    // Function should not be called when circuit is open
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('transitions to half-open after reset timeout', async () => {
    const mockFn = createMockAsyncFunction([true, true, true, false]); // Fail 3 times, then succeed
    const { result } = renderHook(() => 
      useCircuitBreaker(mockFn, { 
        failureThreshold: 3, 
        maxAttempts: 1,
        resetTimeout: 1000 
      })
    );

    // Trigger circuit breaker
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          // Expected to fail
        }
      });
    }

    expect(result.current.circuitState).toBe('open');

    // Wait for reset timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.circuitState).toBe('half-open');

    // Next successful call should close the circuit
    await act(async () => {
      const response = await result.current.execute();
      expect(response).toBe('Success on call 4');
    });

    expect(result.current.circuitState).toBe('closed');
    expect(result.current.failureCount).toBe(0);
  });

  it('resets circuit manually', async () => {
    const mockFn = createMockAsyncFunction([true, true, true]);
    const { result } = renderHook(() => 
      useCircuitBreaker(mockFn, { 
        failureThreshold: 2, 
        maxAttempts: 1 
      })
    );

    // Trigger circuit breaker
    for (let i = 0; i < 2; i++) {
      await act(async () => {
        try {
          await result.current.execute();
        } catch (error) {
          // Expected to fail
        }
      });
    }

    expect(result.current.circuitState).toBe('open');

    // Reset circuit manually
    act(() => {
      result.current.resetCircuit();
    });

    expect(result.current.circuitState).toBe('closed');
    expect(result.current.failureCount).toBe(0);
  });
});