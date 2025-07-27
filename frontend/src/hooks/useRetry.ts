import { useState, useCallback, useRef } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
  onMaxAttemptsReached?: (error: Error) => void;
}

interface RetryState {
  isRetrying: boolean;
  attempt: number;
  lastError: Error | null;
}

interface UseRetryReturn<T> {
  execute: (...args: any[]) => Promise<T>;
  retry: () => Promise<T>;
  reset: () => void;
  state: RetryState;
  canRetry: boolean;
}

/**
 * Hook for implementing retry logic with configurable options
 */
export const useRetry = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: RetryOptions = {}
): UseRetryReturn<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = 'exponential',
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    attempt: 0,
    lastError: null,
  });

  const lastArgsRef = useRef<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const calculateDelay = useCallback(
    (attempt: number): number => {
      if (backoff === 'exponential') {
        return delay * Math.pow(2, attempt - 1);
      }
      return delay * attempt;
    },
    [delay, backoff]
  );

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      lastArgsRef.current = args;

      setState(prev => ({
        ...prev,
        isRetrying: false,
        attempt: 0,
        lastError: null,
      }));

      try {
        const result = await asyncFunction(...args);
        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState(prev => ({
          ...prev,
          attempt: 1,
          lastError: err,
        }));
        throw err;
      }
    },
    [asyncFunction]
  );

  const retry = useCallback(async (): Promise<T> => {
    if (state.attempt >= maxAttempts) {
      if (onMaxAttemptsReached && state.lastError) {
        onMaxAttemptsReached(state.lastError);
      }
      throw new Error(`Maximum retry attempts (${maxAttempts}) reached`);
    }

    const nextAttempt = state.attempt + 1;

    setState(prev => ({
      ...prev,
      isRetrying: true,
      attempt: nextAttempt,
    }));

    if (onRetry && state.lastError) {
      onRetry(nextAttempt, state.lastError);
    }

    // Calculate delay for this attempt
    const retryDelay = calculateDelay(nextAttempt);

    // Wait before retrying
    await new Promise(resolve => {
      timeoutRef.current = setTimeout(resolve, retryDelay);
    });

    try {
      setState(prev => ({ ...prev, isRetrying: false }));
      const result = await asyncFunction(...lastArgsRef.current);

      // Reset state on success
      setState(prev => ({
        ...prev,
        attempt: 0,
        lastError: null,
      }));

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        isRetrying: false,
        lastError: err,
      }));
      throw err;
    }
  }, [
    state.attempt,
    state.lastError,
    maxAttempts,
    asyncFunction,
    calculateDelay,
    onRetry,
    onMaxAttemptsReached,
  ]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setState({
      isRetrying: false,
      attempt: 0,
      lastError: null,
    });
  }, []);

  const canRetry =
    state.attempt > 0 && state.attempt < maxAttempts && !state.isRetrying;

  return {
    execute,
    retry,
    reset,
    state,
    canRetry,
  };
};

/**
 * Hook for automatic retry with exponential backoff
 */
export const useAutoRetry = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: RetryOptions & { autoRetry?: boolean } = {}
): UseRetryReturn<T> & {
  executeWithAutoRetry: (...args: any[]) => Promise<T>;
} => {
  const { autoRetry = true, ...retryOptions } = options;
  const retryHook = useRetry(asyncFunction, retryOptions);

  const executeWithAutoRetry = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        return await retryHook.execute(...args);
      } catch (error) {
        if (autoRetry && retryHook.canRetry) {
          return await retryHook.retry();
        }
        throw error;
      }
    },
    [retryHook, autoRetry]
  );

  return {
    ...retryHook,
    executeWithAutoRetry,
  };
};

/**
 * Hook for retry with circuit breaker pattern
 */
interface CircuitBreakerOptions extends RetryOptions {
  failureThreshold?: number;
  resetTimeout?: number;
}

type CircuitState = 'closed' | 'open' | 'half-open';

interface UseCircuitBreakerReturn<T> extends UseRetryReturn<T> {
  circuitState: CircuitState;
  failureCount: number;
  resetCircuit: () => void;
}

export const useCircuitBreaker = <T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: CircuitBreakerOptions = {}
): UseCircuitBreakerReturn<T> => {
  const {
    failureThreshold = 5,
    resetTimeout = 60000, // 1 minute
    ...retryOptions
  } = options;

  const [circuitState, setCircuitState] = useState<CircuitState>('closed');
  const [failureCount, setFailureCount] = useState(0);
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

  const retryHook = useRetry(asyncFunction, {
    ...retryOptions,
    onMaxAttemptsReached: error => {
      setFailureCount(prev => {
        const newCount = prev + 1;
        if (newCount >= failureThreshold) {
          setCircuitState('open');
          // Set timeout to reset circuit breaker
          resetTimeoutRef.current = setTimeout(() => {
            setCircuitState('half-open');
          }, resetTimeout);
        }
        return newCount;
      });

      if (retryOptions.onMaxAttemptsReached) {
        retryOptions.onMaxAttemptsReached(error);
      }
    },
  });

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      if (circuitState === 'open') {
        throw new Error(
          'Circuit breaker is open. Service temporarily unavailable.'
        );
      }

      try {
        const result = await retryHook.execute(...args);

        // Reset failure count on success
        if (circuitState === 'half-open') {
          setCircuitState('closed');
          setFailureCount(0);
        }

        return result;
      } catch (error) {
        if (circuitState === 'half-open') {
          setCircuitState('open');
          // Reset timeout for next attempt
          resetTimeoutRef.current = setTimeout(() => {
            setCircuitState('half-open');
          }, resetTimeout);
        }
        throw error;
      }
    },
    [circuitState, retryHook, resetTimeout]
  );

  const resetCircuit = useCallback(() => {
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
    }
    setCircuitState('closed');
    setFailureCount(0);
    retryHook.reset();
  }, [retryHook]);

  return {
    ...retryHook,
    execute,
    circuitState,
    failureCount,
    resetCircuit,
  };
};
