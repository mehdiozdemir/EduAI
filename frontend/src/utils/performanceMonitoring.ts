/**
 * Comprehensive performance monitoring and metrics collection
 */

interface WebVitalsMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
  TTI: number; // Time to Interactive
}

interface CustomMetrics {
  componentRenderTime: Record<string, number[]>;
  apiResponseTime: Record<string, number[]>;
  routeChangeTime: Record<string, number>;
  bundleLoadTime: Record<string, number>;
  memoryUsage: number[];
  errorCount: number;
  userInteractions: number;
}

interface PerformanceReport {
  timestamp: number;
  url: string;
  userAgent: string;
  webVitals: Partial<WebVitalsMetrics>;
  customMetrics: Partial<CustomMetrics>;
  resourceTiming: PerformanceResourceTiming[];
  navigationTiming: PerformanceNavigationTiming | null;
}

class PerformanceMonitor {
  private webVitals: Partial<WebVitalsMetrics> = {};
  private customMetrics: CustomMetrics = {
    componentRenderTime: {},
    apiResponseTime: {},
    routeChangeTime: {},
    bundleLoadTime: {},
    memoryUsage: [],
    errorCount: 0,
    userInteractions: 0,
  };
  private observers: PerformanceObserver[] = [];
  private reportingInterval: number | null = null;

  constructor() {
    this.initializeWebVitalsObservers();
    this.initializeCustomObservers();
    this.startPeriodicReporting();
  }

  private initializeWebVitalsObservers() {
    if (!('PerformanceObserver' in window)) return;

    // First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.webVitals.FCP = entry.startTime;
        }
      });
    });
    paintObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(paintObserver);

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.webVitals.LCP = lastEntry.startTime;
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.webVitals.FID = entry.processingStart - entry.startTime;
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.webVitals.CLS = clsValue;
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);

    // Navigation timing for TTFB
    if (performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navEntries.length > 0) {
        const navEntry = navEntries[0];
        this.webVitals.TTFB = navEntry.responseStart - navEntry.fetchStart;
      }
    }
  }

  private initializeCustomObservers() {
    // Memory usage monitoring
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.customMetrics.memoryUsage.push(memory.usedJSHeapSize);
        
        // Keep only last 100 measurements
        if (this.customMetrics.memoryUsage.length > 100) {
          this.customMetrics.memoryUsage.shift();
        }
      }, 10000); // Every 10 seconds
    }

    // User interaction tracking
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.customMetrics.userInteractions++;
      }, { passive: true });
    });

    // Error tracking
    window.addEventListener('error', () => {
      this.customMetrics.errorCount++;
    });

    window.addEventListener('unhandledrejection', () => {
      this.customMetrics.errorCount++;
    });
  }

  private startPeriodicReporting() {
    // Report metrics every 30 seconds
    this.reportingInterval = window.setInterval(() => {
      this.reportMetrics();
    }, 30000);
  }

  /**
   * Measure component render performance
   */
  public measureComponentRender<T>(
    componentName: string,
    renderFn: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (!this.customMetrics.componentRenderTime[componentName]) {
      this.customMetrics.componentRenderTime[componentName] = [];
    }
    
    this.customMetrics.componentRenderTime[componentName].push(duration);
    
    // Keep only last 50 measurements per component
    if (this.customMetrics.componentRenderTime[componentName].length > 50) {
      this.customMetrics.componentRenderTime[componentName].shift();
    }

    // Log slow renders
    if (duration > 16) { // More than one frame at 60fps
      console.warn(`Slow render detected: ${componentName} took ${duration.toFixed(2)}ms`);
    }

    return result;
  }

  /**
   * Measure API call performance
   */
  public measureApiCall(endpoint: string, duration: number, success: boolean) {
    if (!this.customMetrics.apiResponseTime[endpoint]) {
      this.customMetrics.apiResponseTime[endpoint] = [];
    }
    
    this.customMetrics.apiResponseTime[endpoint].push(duration);
    
    // Keep only last 100 measurements per endpoint
    if (this.customMetrics.apiResponseTime[endpoint].length > 100) {
      this.customMetrics.apiResponseTime[endpoint].shift();
    }

    // Log slow API calls
    if (duration > 2000) { // More than 2 seconds
      console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
    }

    // Track success rate
    this.sendMetric('api-call', {
      endpoint,
      duration,
      success,
      timestamp: Date.now(),
    });
  }

  /**
   * Measure route change performance
   */
  public measureRouteChange(from: string, to: string, duration: number) {
    const routeKey = `${from} -> ${to}`;
    this.customMetrics.routeChangeTime[routeKey] = duration;

    if (duration > 1000) { // More than 1 second
      console.warn(`Slow route change: ${routeKey} took ${duration}ms`);
    }
  }

  /**
   * Measure bundle load performance
   */
  public measureBundleLoad(chunkName: string, duration: number) {
    this.customMetrics.bundleLoadTime[chunkName] = duration;

    if (duration > 3000) { // More than 3 seconds
      console.warn(`Slow bundle load: ${chunkName} took ${duration}ms`);
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceReport {
    const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      webVitals: { ...this.webVitals },
      customMetrics: { ...this.customMetrics },
      resourceTiming: resourceEntries,
      navigationTiming: navigationEntries[0] || null,
    };
  }

  /**
   * Generate performance score (0-100)
   */
  public getPerformanceScore(): number {
    let score = 100;

    // Deduct points for poor Web Vitals
    if (this.webVitals.FCP && this.webVitals.FCP > 1800) score -= 10;
    if (this.webVitals.LCP && this.webVitals.LCP > 2500) score -= 15;
    if (this.webVitals.FID && this.webVitals.FID > 100) score -= 10;
    if (this.webVitals.CLS && this.webVitals.CLS > 0.1) score -= 10;
    if (this.webVitals.TTFB && this.webVitals.TTFB > 800) score -= 5;

    // Deduct points for slow components
    Object.values(this.customMetrics.componentRenderTime).forEach(times => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > 16) score -= 5;
    });

    // Deduct points for slow API calls
    Object.values(this.customMetrics.apiResponseTime).forEach(times => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > 1000) score -= 5;
    });

    // Deduct points for errors
    if (this.customMetrics.errorCount > 0) {
      score -= Math.min(this.customMetrics.errorCount * 2, 20);
    }

    return Math.max(0, score);
  }

  /**
   * Get performance recommendations
   */
  public getRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.webVitals.FCP && this.webVitals.FCP > 1800) {
      recommendations.push('Optimize First Contentful Paint by reducing render-blocking resources');
    }

    if (this.webVitals.LCP && this.webVitals.LCP > 2500) {
      recommendations.push('Improve Largest Contentful Paint by optimizing images and critical resources');
    }

    if (this.webVitals.FID && this.webVitals.FID > 100) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time');
    }

    if (this.webVitals.CLS && this.webVitals.CLS > 0.1) {
      recommendations.push('Minimize Cumulative Layout Shift by setting dimensions for images and ads');
    }

    // Check for slow components
    Object.entries(this.customMetrics.componentRenderTime).forEach(([component, times]) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > 16) {
        recommendations.push(`Optimize ${component} component rendering (avg: ${avgTime.toFixed(2)}ms)`);
      }
    });

    // Check for slow API calls
    Object.entries(this.customMetrics.apiResponseTime).forEach(([endpoint, times]) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      if (avgTime > 1000) {
        recommendations.push(`Optimize ${endpoint} API response time (avg: ${avgTime.toFixed(0)}ms)`);
      }
    });

    if (this.customMetrics.errorCount > 0) {
      recommendations.push(`Fix ${this.customMetrics.errorCount} JavaScript errors`);
    }

    return recommendations;
  }

  /**
   * Report metrics to analytics service
   */
  private reportMetrics() {
    const metrics = this.getMetrics();
    this.sendMetric('performance-report', metrics);
  }

  /**
   * Send metric to analytics service
   */
  private sendMetric(type: string, data: any) {
    if (process.env.NODE_ENV === 'production') {
      // Send to your analytics service
      console.log(`[Performance] ${type}:`, data);
      
      // Example implementations:
      // - Google Analytics 4
      // - DataDog RUM
      // - New Relic Browser
      // - Custom analytics endpoint
      
      // Example: Send to custom endpoint
      // fetch('/api/analytics/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, data, timestamp: Date.now() })
      // }).catch(console.error);
    }
  }

  /**
   * Export performance data
   */
  public exportData(): string {
    const metrics = this.getMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Cleanup observers and intervals
   */
  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance monitoring decorator for class components
 */
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: any,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  return class extends (globalThis as any).React?.Component<P> {
    static displayName = `withPerformanceMonitoring(${displayName})`;
    
    componentDidMount() {
      performanceMonitor.measureComponentRender(displayName, () => {
        // Component is already mounted
      });
    }
    
    componentDidUpdate() {
      performanceMonitor.measureComponentRender(displayName, () => {
        // Component is already updated
      });
    }
    
    render() {
      return performanceMonitor.measureComponentRender(displayName, () => 
        (globalThis as any).React?.createElement(WrappedComponent, this.props)
      );
    }
  };
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).__PERFORMANCE_MONITOR__ = performanceMonitor;
}