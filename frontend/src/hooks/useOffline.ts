import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOffline: boolean;
  isOnline: boolean;
  wasOffline: boolean;
}

interface UseOfflineOptions {
  onOnline?: () => void;
  onOffline?: () => void;
  pingUrl?: string;
  pingInterval?: number;
  pingTimeout?: number;
}

/**
 * Hook for detecting online/offline status
 */
export const useOffline = (options: UseOfflineOptions = {}) => {
  const {
    onOnline,
    onOffline,
    pingUrl = '/api/health',
    pingInterval = 30000, // 30 seconds
    pingTimeout = 5000, // 5 seconds
  } = options;

  const [state, setState] = useState<OfflineState>({
    isOffline: !navigator.onLine,
    isOnline: navigator.onLine,
    wasOffline: false,
  });

  // Ping server to verify actual connectivity
  const pingServer = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), pingTimeout);

      const response = await fetch(pingUrl, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, [pingUrl, pingTimeout]);

  // Handle online event
  const handleOnline = useCallback(async () => {
    // Verify with server ping
    const isActuallyOnline = await pingServer();
    
    setState(prev => ({
      isOffline: !isActuallyOnline,
      isOnline: isActuallyOnline,
      wasOffline: prev.isOffline,
    }));

    if (isActuallyOnline && onOnline) {
      onOnline();
    }
  }, [pingServer, onOnline]);

  // Handle offline event
  const handleOffline = useCallback(() => {
    setState(prev => ({
      isOffline: true,
      isOnline: false,
      wasOffline: prev.isOffline,
    }));

    if (onOffline) {
      onOffline();
    }
  }, [onOffline]);

  // Periodic connectivity check
  useEffect(() => {
    const checkConnectivity = async () => {
      if (navigator.onLine) {
        const isActuallyOnline = await pingServer();
        setState(prev => {
          const newState = {
            isOffline: !isActuallyOnline,
            isOnline: isActuallyOnline,
            wasOffline: prev.isOffline,
          };

          // Trigger callbacks if state changed
          if (prev.isOffline && isActuallyOnline && onOnline) {
            onOnline();
          } else if (!prev.isOffline && !isActuallyOnline && onOffline) {
            onOffline();
          }

          return newState;
        });
      }
    };

    const intervalId = setInterval(checkConnectivity, pingInterval);
    return () => clearInterval(intervalId);
  }, [pingServer, pingInterval, onOnline, onOffline]);

  // Listen to browser online/offline events
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return state;
};

/**
 * Hook for offline-aware API calls
 */
export const useOfflineAwareApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseOfflineOptions & {
    queueWhenOffline?: boolean;
    retryWhenOnline?: boolean;
  } = {}
) => {
  const { queueWhenOffline = true, retryWhenOnline = true, ...offlineOptions } = options;
  const [queue, setQueue] = useState<Array<{ args: any[]; resolve: (value: T) => void; reject: (error: Error) => void }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const offlineState = useOffline({
    ...offlineOptions,
    onOnline: () => {
      if (retryWhenOnline && queue.length > 0) {
        processQueue();
      }
      if (offlineOptions.onOnline) {
        offlineOptions.onOnline();
      }
    },
  });

  const processQueue = useCallback(async () => {
    if (isExecuting || queue.length === 0) return;

    setIsExecuting(true);
    const currentQueue = [...queue];
    setQueue([]);

    for (const { args, resolve, reject } of currentQueue) {
      try {
        const result = await apiFunction(...args);
        resolve(result);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }

    setIsExecuting(false);
  }, [apiFunction, queue, isExecuting]);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      if (offlineState.isOffline) {
        if (queueWhenOffline) {
          return new Promise<T>((resolve, reject) => {
            setQueue(prev => [...prev, { args, resolve, reject }]);
          });
        } else {
          throw new Error('No internet connection available');
        }
      }

      return apiFunction(...args);
    },
    [apiFunction, offlineState.isOffline, queueWhenOffline]
  );

  return {
    ...offlineState,
    execute,
    queueLength: queue.length,
    isExecuting,
    clearQueue: () => setQueue([]),
  };
};