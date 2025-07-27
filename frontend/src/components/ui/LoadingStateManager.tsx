import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  DashboardSkeleton,
  SubjectListSkeleton,
  TopicListSkeleton,
  QuizSessionSkeleton,
  PerformanceAnalysisSkeleton,
  RecommendationsSkeleton,
  FormSkeleton,
  TableSkeleton,
} from './Skeletons';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextValue {
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: boolean;
  clearAllLoading: () => void;
  withLoading: <T>(key: string, asyncFn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(
  undefined
);

interface LoadingStateManagerProps {
  children: React.ReactNode;
  globalLoadingDelay?: number; // Delay before showing loading states
}

/**
 * Global loading state manager
 */
export const LoadingStateManager: React.FC<LoadingStateManagerProps> = ({
  children,
  globalLoadingDelay = 200, // 200ms delay to prevent flashing
}) => {
  const [delayedStates, setDelayedStates] = useState<LoadingState>({});
  const [timeouts, setTimeouts] = useState<Map<string, NodeJS.Timeout>>(
    new Map()
  );

  const setLoading = useCallback(
    (key: string, loading: boolean) => {
      if (loading) {
        // Clear any existing timeout for this key
        const existingTimeout = timeouts.get(key);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
        }

        // Apply delay before showing loading state
        const timeoutId = setTimeout(() => {
          setDelayedStates(prev => ({ ...prev, [key]: true }));
          setTimeouts(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
          });
        }, globalLoadingDelay);

        setTimeouts(prev => new Map(prev).set(key, timeoutId));
      } else {
        // Clear timeout if it exists
        const existingTimeout = timeouts.get(key);
        if (existingTimeout) {
          clearTimeout(existingTimeout);
          setTimeouts(prev => {
            const newMap = new Map(prev);
            newMap.delete(key);
            return newMap;
          });
        }

        setDelayedStates(prev => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
      }
    },
    [globalLoadingDelay, timeouts]
  );

  const isLoading = useCallback(
    (key: string) => {
      return delayedStates[key] || false;
    },
    [delayedStates]
  );

  const isAnyLoading = Object.keys(delayedStates).length > 0;

  const clearAllLoading = useCallback(() => {
    // Clear all timeouts
    timeouts.forEach(timeout => clearTimeout(timeout));
    setTimeouts(new Map());
    setDelayedStates({});
  }, [timeouts]);

  const withLoading = useCallback(
    async <T,>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
      setLoading(key, true);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading]
  );

  const contextValue: LoadingContextValue = {
    loadingStates: delayedStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
    withLoading,
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

/**
 * Hook to access loading context
 */
export const useLoadingState = (): LoadingContextValue => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error(
      'useLoadingState must be used within a LoadingStateManager'
    );
  }
  return context;
};

/**
 * Hook for managing component-specific loading state
 */
export const useComponentLoading = (componentKey: string) => {
  const { setLoading, isLoading, withLoading } = useLoadingState();

  const startLoading = useCallback(() => {
    setLoading(componentKey, true);
  }, [componentKey, setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(componentKey, false);
  }, [componentKey, setLoading]);

  const executeWithLoading = useCallback(
    async <T,>(asyncFn: () => Promise<T>): Promise<T> => {
      return withLoading(componentKey, asyncFn);
    },
    [componentKey, withLoading]
  );

  return {
    isLoading: isLoading(componentKey),
    startLoading,
    stopLoading,
    executeWithLoading,
  };
};

/**
 * Component that shows skeleton based on loading state
 */
interface LoadingWrapperProps {
  loadingKey: string;
  skeleton?:
    | 'dashboard'
    | 'subjects'
    | 'topics'
    | 'quiz'
    | 'performance'
    | 'recommendations'
    | 'form'
    | 'table'
    | React.ComponentType;
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  loadingKey,
  skeleton = 'dashboard',
  children,
  className,
  fallback,
}) => {
  const { isLoading } = useLoadingState();
  const loading = isLoading(loadingKey);

  if (!loading) {
    return <>{children}</>;
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>;
  }

  // Render appropriate skeleton
  const renderSkeleton = () => {
    if (typeof skeleton === 'string') {
      switch (skeleton) {
        case 'dashboard':
          return <DashboardSkeleton className={className} />;
        case 'subjects':
          return <SubjectListSkeleton className={className} />;
        case 'topics':
          return <TopicListSkeleton className={className} />;
        case 'quiz':
          return <QuizSessionSkeleton className={className} />;
        case 'performance':
          return <PerformanceAnalysisSkeleton className={className} />;
        case 'recommendations':
          return <RecommendationsSkeleton className={className} />;
        case 'form':
          return <FormSkeleton className={className} />;
        case 'table':
          return <TableSkeleton className={className} />;
        default:
          return <DashboardSkeleton className={className} />;
      }
    } else {
      const SkeletonComponent = skeleton;
      return <SkeletonComponent />;
    }
  };

  return <div className={className}>{renderSkeleton()}</div>;
};

/**
 * Higher-order component that adds loading state management
 */
export const withLoadingState = <P extends object>(
  Component: React.ComponentType<P>,
  loadingKey: string,
  skeletonType?: LoadingWrapperProps['skeleton']
) => {
  const WrappedComponent: React.FC<P> = props => {
    return (
      <LoadingWrapper loadingKey={loadingKey} skeleton={skeletonType}>
        <Component {...props} />
      </LoadingWrapper>
    );
  };

  WrappedComponent.displayName = `withLoadingState(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

/**
 * Global loading indicator for the entire application
 */
export const GlobalLoadingIndicator: React.FC<{
  className?: string;
  showText?: boolean;
}> = ({ className, showText = true }) => {
  const { isAnyLoading } = useLoadingState();

  if (!isAnyLoading) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className || ''}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        {showText && <span className="text-sm text-gray-600">Loading...</span>}
      </div>
    </div>
  );
};

/**
 * Hook for async operations with automatic loading state
 */
export const useAsyncOperation = <T = unknown,>(
  key: string,
  operation: () => Promise<T>,
  dependencies: React.DependencyList = []
) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const { executeWithLoading } = useComponentLoading(key);

  const execute = useCallback(async () => {
    try {
      setError(null);
      const result = await executeWithLoading(operation);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    }
  }, [executeWithLoading, operation]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    execute().catch(() => {
      // Error is already handled in execute function
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    data,
    error,
    execute,
    reset,
    isLoading: useComponentLoading(key).isLoading,
  };
};
