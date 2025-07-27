import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import * as Skeletons from './Skeletons';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  minHeight?: string;
  priority?: boolean;
}

/**
 * Lazy loading wrapper for non-critical sections
 * Useful for below-the-fold content, heavy components, or optional features
 */
export const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback,
  className,
  threshold = 0.1,
  rootMargin = '100px',
  minHeight = '200px',
  priority = false,
}) => {
  const [isInView, setIsInView] = useState(priority);
  const [hasLoaded, setHasLoaded] = useState(priority);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Add a small delay to prevent layout shift
          setTimeout(() => setHasLoaded(true), 100);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, priority]);

  const defaultFallback = (
    <div 
      className="animate-pulse bg-gray-200 rounded-lg"
      style={{ minHeight }}
    >
      <div className="p-4">
        <Skeletons.Text lines={3} />
      </div>
    </div>
  );

  return (
    <div
      ref={sectionRef}
      className={clsx('transition-opacity duration-300', className)}
      style={{ minHeight: hasLoaded ? 'auto' : minHeight }}
    >
      {hasLoaded ? children : (fallback || defaultFallback)}
    </div>
  );
};

/**
 * Hook for lazy loading components based on intersection
 */
export function useLazyLoad(options: {
  threshold?: number;
  rootMargin?: string;
  priority?: boolean;
} = {}) {
  const { threshold = 0.1, rootMargin = '100px', priority = false } = options;
  const [isInView, setIsInView] = useState(priority);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, priority]);

  return { ref, isInView };
}

/**
 * Lazy loading wrapper for heavy components with error boundary
 */
export const LazyComponentWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
}> = ({ children, fallback, errorFallback, className }) => {
  const [hasError, setHasError] = useState(false);
  const { ref, isInView } = useLazyLoad();

  useEffect(() => {
    // Reset error state when component comes into view
    if (isInView && hasError) {
      setHasError(false);
    }
  }, [isInView, hasError]);

  if (hasError) {
    return (
      <div className={clsx('p-4 text-center text-red-600', className)}>
        {errorFallback || (
          <div>
            <p>Failed to load component</p>
            <button
              onClick={() => setHasError(false)}
              className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {isInView ? (
        <React.Suspense fallback={fallback || <Skeletons.Card />}>
          <ErrorBoundary onError={() => setHasError(true)}>
            {children}
          </ErrorBoundary>
        </React.Suspense>
      ) : (
        fallback || <Skeletons.Card />
      )}
    </div>
  );
};

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle error display
    }

    return this.props.children;
  }
}