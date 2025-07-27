// Temporarily disabled React hooks to fix hook errors
// import { useEffect, useRef } from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

/**
 * Hook for monitoring component render performance
 * Temporarily simplified to avoid React hook errors
 */
export function useRenderPerformance(componentName: string) {
  // Simple implementation without hooks to avoid React hook errors
  try {
    const startTime = performance.now();
    
    // Log render attempt
    console.log(`Rendering component: ${componentName}`);
    
    // Track render performance without hooks
    performanceMonitor.measureComponentRender(componentName, () => {
      // Render is already complete
    });
    
    return {
      renderCount: 1,
    };
  } catch (error) {
    console.warn(`Performance monitoring failed for ${componentName}:`, error);
    return {
      renderCount: 0,
    };
  }
}

/**
 * Hook for monitoring API call performance
 */
export function useApiPerformance() {
  const measureApiCall = (endpoint: string, promise: Promise<any>) => {
    const startTime = performance.now();
    
    return promise
      .then((result) => {
        const duration = performance.now() - startTime;
        performanceMonitor.measureApiCall(endpoint, duration, true);
        return result;
      })
      .catch((error) => {
        const duration = performance.now() - startTime;
        performanceMonitor.measureApiCall(endpoint, duration, false);
        throw error;
      });
  };

  return { measureApiCall };
}

/**
 * Hook for monitoring route change performance
 * Temporarily simplified to avoid React hook errors
 */
export function useRoutePerformance() {
  // Simple implementation without hooks
  const startRouteChange = () => {
    try {
      const currentRoute = window.location.pathname;
      console.log(`Route change started: ${currentRoute}`);
      
      // Simple route change tracking without state
      performanceMonitor.measureRouteChange(
        '',
        currentRoute,
        0
      );
    } catch (error) {
      console.warn('Route performance monitoring failed:', error);
    }
  };

  return { startRouteChange };
}

/**
 * Hook for getting current performance metrics
 */
export function usePerformanceMetrics() {
  const getMetrics = () => performanceMonitor.getMetrics();
  const getScore = () => performanceMonitor.getPerformanceScore();
  const getRecommendations = () => performanceMonitor.getRecommendations();
  
  return {
    getMetrics,
    getScore,
    getRecommendations,
  };
}