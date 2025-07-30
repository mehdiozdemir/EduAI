import { useEffect } from 'react';

export interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  entries: PerformanceEntry[];
  id: string;
}

interface PerformanceMonitorProps {
  onMetric?: (metric: WebVitalsMetric) => void;
  enableLogging?: boolean;
}

export const usePerformanceMonitor = ({ 
  onMetric, 
  enableLogging = false 
}: PerformanceMonitorProps = {}) => {
  useEffect(() => {
    // Check if browser supports performance API
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    // Log initial load metrics
    if (enableLogging) {
      console.log('Performance Monitor initialized');
    }

    // Monitor Largest Contentful Paint (LCP)
    const observeLCP = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
          
          const metric: WebVitalsMetric = {
            name: 'LCP',
            value: lastEntry.startTime,
            delta: lastEntry.startTime,
            entries: entries,
            id: generateId()
          };

          if (enableLogging) {
            console.log('LCP:', metric.value);
          }
          
          onMetric?.(metric);
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        if (enableLogging) {
          console.warn('LCP monitoring not supported:', error);
        }
      }
    };

    // Monitor First Input Delay (FID)
    const observeFID = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as PerformanceEventTiming;
          
          const metric: WebVitalsMetric = {
            name: 'FID',
            value: firstEntry.processingStart - firstEntry.startTime,
            delta: firstEntry.processingStart - firstEntry.startTime,
            entries: entries,
            id: generateId()
          };

          if (enableLogging) {
            console.log('FID:', metric.value);
          }
          
          onMetric?.(metric);
        });
        
        observer.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        if (enableLogging) {
          console.warn('FID monitoring not supported:', error);
        }
      }
    };

    // Monitor Cumulative Layout Shift (CLS)
    const observeCLS = () => {
      try {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          for (const entry of entries) {
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          
          const metric: WebVitalsMetric = {
            name: 'CLS',
            value: clsValue,
            delta: clsValue,
            entries: entries,
            id: generateId()
          };

          if (enableLogging) {
            console.log('CLS:', metric.value);
          }
          
          onMetric?.(metric);
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        if (enableLogging) {
          console.warn('CLS monitoring not supported:', error);
        }
      }
    };

    // Monitor Time to First Byte (TTFB)
    const observeTTFB = () => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const navigationEntry = entries[0] as PerformanceNavigationTiming;
          
          const metric: WebVitalsMetric = {
            name: 'TTFB',
            value: navigationEntry.responseStart - navigationEntry.requestStart,
            delta: navigationEntry.responseStart - navigationEntry.requestStart,
            entries: entries,
            id: generateId()
          };

          if (enableLogging) {
            console.log('TTFB:', metric.value);
          }
          
          onMetric?.(metric);
        });
        
        observer.observe({ entryTypes: ['navigation'] });
      } catch (error) {
        if (enableLogging) {
          console.warn('TTFB monitoring not supported:', error);
        }
      }
    };

    // Start observing metrics
    observeLCP();
    observeFID();
    observeCLS();
    observeTTFB();

    // Monitor page load completion
    const handleLoad = () => {
      if (enableLogging) {
        const loadTime = performance.now();
        console.log('Page load completed in:', loadTime.toFixed(2), 'ms');
        
        // Log navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log('Navigation Timing:', {
            DNS: navigation.domainLookupEnd - navigation.domainLookupStart,
            TCP: navigation.connectEnd - navigation.connectStart,
            Request: navigation.responseStart - navigation.requestStart,
            Response: navigation.responseEnd - navigation.responseStart,
            DOM: navigation.domContentLoadedEventEnd - navigation.responseEnd,
            Total: navigation.loadEventEnd - navigation.fetchStart
          });
        }
      }
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }

  }, [onMetric, enableLogging]);
};

// Helper function to generate unique IDs
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Performance budget checker
export const checkPerformanceBudget = () => {
  const budgets = {
    LCP: 2500, // 2.5 seconds
    FID: 100,  // 100 milliseconds
    CLS: 0.1,  // 0.1 layout shift score
    TTFB: 600  // 600 milliseconds
  };

  return {
    budgets,
    checkMetric: (metric: WebVitalsMetric) => {
      const budget = budgets[metric.name as keyof typeof budgets];
      return budget ? metric.value <= budget : true;
    }
  };
};

// Bundle size analyzer
export const analyzeBundleSize = () => {
  if (typeof window === 'undefined') return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const scripts = resources.filter(r => r.name.includes('.js'));
  const styles = resources.filter(r => r.name.includes('.css'));
  
  const totalScriptSize = scripts.reduce((sum, script) => sum + (script.transferSize || 0), 0);
  const totalStyleSize = styles.reduce((sum, style) => sum + (style.transferSize || 0), 0);
  
  console.log('Bundle Analysis:', {
    totalScripts: scripts.length,
    totalStyles: styles.length,
    scriptSize: `${(totalScriptSize / 1024).toFixed(2)} KB`,
    styleSize: `${(totalStyleSize / 1024).toFixed(2)} KB`,
    totalSize: `${((totalScriptSize + totalStyleSize) / 1024).toFixed(2)} KB`
  });

  return {
    scripts: scripts.length,
    styles: styles.length,
    scriptSize: totalScriptSize,
    styleSize: totalStyleSize,
    totalSize: totalScriptSize + totalStyleSize
  };
};

export default usePerformanceMonitor;
