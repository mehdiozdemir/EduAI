import React, { Suspense, type ComponentType } from 'react';
import { Loading } from '../components/ui/Loading';
import * as Skeletons from '../components/ui/Skeletons';

interface LazyLoadOptions {
  fallback?: React.ComponentType;
  chunkName?: string;
  preload?: boolean;
}

// Type for component with optional preload method
type LazyComponentWithPreload<T extends ComponentType<unknown>> =
  React.ComponentType<React.ComponentProps<T>> & {
    preload?: () => Promise<{ default: T }>;
  };

/**
 * Enhanced lazy loading utility with better error handling and preloading
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyComponentWithPreload<T> {
  const LazyComponent = React.lazy(importFn);
  const { fallback: Fallback = Loading, preload = false } = options;

  const WrappedComponent = ((props: React.ComponentProps<T>) => (
    <Suspense fallback={<Fallback />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  )) as LazyComponentWithPreload<T>;

  WrappedComponent.displayName = `Lazy(${
    'displayName' in LazyComponent ? LazyComponent.displayName : 'Component'
  })`;

  // Add preload method
  if (preload) {
    WrappedComponent.preload = importFn;
  }

  return WrappedComponent;
}

/**
 * Lazy load heavy chart components
 */
export const LazyPerformanceChart = createLazyComponent(
  () =>
    import(
      /* webpackChunkName: "charts" */ '../components/features/PerformanceChart'
    ),
  { fallback: () => <Skeletons.PerformanceAnalysisSkeleton />, preload: true }
);

/**
 * Lazy load resource recommendation components
 */
export const LazyResourceRecommendation = createLazyComponent(
  () =>
    import(
      /* webpackChunkName: "recommendations" */ '../components/features/ResourceRecommendation'
    ),
  { fallback: () => <Skeletons.RecommendationsSkeleton />, preload: true }
);

/**
 * Lazy load question generator (heavy component with form logic)
 */
export const LazyQuestionGenerator = createLazyComponent(
  () =>
    import(
      /* webpackChunkName: "questions" */ '../components/features/QuestionGenerator'
    ),
  { fallback: () => <Skeletons.FormSkeleton />, preload: true }
);

/**
 * Lazy load quiz session (heavy component with state management)
 */
export const LazyQuizSession = createLazyComponent(
  () =>
    import(/* webpackChunkName: "quiz" */ '../components/features/QuizSession'),
  { fallback: () => <Skeletons.QuizSessionSkeleton />, preload: true }
);

/**
 * Preload components based on user interaction patterns
 */
export const preloadComponents = {
  charts: () => LazyPerformanceChart.preload?.(),
  recommendations: () => LazyResourceRecommendation.preload?.(),
  questions: () => LazyQuestionGenerator.preload?.(),
  quiz: () => LazyQuizSession.preload?.(),
};

/**
 * Route-based preloading hook
 */
export function useRoutePreloading() {
  React.useEffect(() => {
    // Preload likely next components based on current route
    const currentPath = window.location.pathname;

    if (currentPath.includes('/subjects')) {
      // User is viewing subjects, likely to generate questions next
      preloadComponents.questions();
    } else if (currentPath.includes('/questions')) {
      // User is in questions, likely to view performance next
      preloadComponents.charts();
    } else if (currentPath.includes('/performance')) {
      // User is viewing performance, likely to see recommendations
      preloadComponents.recommendations();
    }
  }, []);
}

/**
 * Intersection Observer based lazy loading for components
 */
export function useLazyComponentLoading(
  ref: React.RefObject<HTMLElement>,
  loadComponent: () => void,
  options: IntersectionObserverInit = {}
) {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadComponent();
            observer.unobserve(element);
          }
        });
      },
      {
        rootMargin: '100px', // Load 100px before element comes into view
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, loadComponent, options]);
}
