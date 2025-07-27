import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundaryProvider, GlobalErrorDisplay } from './components/ui/ErrorBoundaryProvider';
import { LoadingStateManager, GlobalLoadingIndicator } from './components/ui/LoadingStateManager';
import { PerformanceDashboard } from './components/features/PerformanceDashboard';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { registerSW } from './utils/serviceWorker';
import { performanceMonitor } from './utils/performanceMonitoring';
//import { useRenderPerformance } from './hooks/usePerfance';

function App() {
  // Temporarily disable performance monitoring to fix React hook errors
  // useRenderPerformance('App');

  useEffect(() => {
    // Register service worker for caching and offline support
    registerSW({
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully:', registration);
      },
      onUpdate: (registration) => {
        console.log('Service Worker updated:', registration);
        // You could show a notification to the user about the update
      },
      onOfflineReady: () => {
        console.log('App is ready to work offline');
      },
    });

    // Initialize performance monitoring
    console.log('Performance monitoring initialized');

    // Cleanup performance monitor on unmount
    return () => {
      performanceMonitor.cleanup();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundaryProvider
        maxErrors={5}
        autoRemoveAfter={10000}
        onError={(error, errorInfo) => {
          // Log errors to external service in production
          if (process.env.NODE_ENV === 'production') {
            console.error('Application Error:', error, errorInfo);
            // TODO: Send to error tracking service (e.g., Sentry)
          }
        }}
      >
        <LoadingStateManager globalLoadingDelay={200}>
          <AuthProvider>
            <RouterProvider router={router} />
            <GlobalErrorDisplay maxVisible={3} />
            <GlobalLoadingIndicator />
            <PerformanceDashboard />
          </AuthProvider>
        </LoadingStateManager>
      </ErrorBoundaryProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
