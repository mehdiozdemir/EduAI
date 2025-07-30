import React, { lazy, Suspense, type ComponentType } from 'react';
import { SectionSkeleton } from '../components/ui/Skeleton';

// Higher-order component for lazy loading
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyLoadedComponent(props: T) {
    return (
      <Suspense fallback={fallback || <SectionSkeleton />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Preload component for better performance
export function preloadComponent(importFunc: () => Promise<any>) {
  return importFunc();
}

// Code splitting utilities for different component types
export const createLazySection = (
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  sectionType: 'features' | 'testimonials' | 'stats' | 'hero' | 'default' = 'default'
) => {
  const getFallback = () => {
    switch (sectionType) {
      case 'features':
        return <SectionSkeleton title cards={4} layout="grid" />;
      case 'testimonials':
        return <SectionSkeleton title cards={3} layout="grid" />;
      case 'stats':
        return <SectionSkeleton title cards={4} layout="grid" />;
      case 'hero':
        return <SectionSkeleton title={false} cards={0} className="py-20" />;
      default:
        return <SectionSkeleton />;
    }
  };

  return withLazyLoading(importFunc, getFallback());
};

// Resource hints for better performance
export const addResourceHints = () => {
  if (typeof document === 'undefined') return;

  // Add DNS prefetch for external resources
  const dnsPrefetchUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.eduai.com'
  ];

  dnsPrefetchUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  });

  // Add preconnect for critical resources
  const preconnectUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];

  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Bundle splitting configuration
export const bundleSplittingConfig = {
  // Critical components (load immediately)
  critical: [
    'LandingHeader',
    'HeroSection'
  ],
  
  // Above-the-fold components (load with high priority)
  aboveFold: [
    'FeaturesSection'
  ],
  
  // Below-the-fold components (lazy load)
  belowFold: [
    'HowItWorksSection',
    'StatisticsSection',
    'TestimonialsSection',
    'CTASection',
    'FooterSection'
  ],
  
  // Non-critical utilities (load on demand)
  utilities: [
    'ScrollToTopButton',
    'ScrollProgressIndicator'
  ]
};

// Image optimization utilities
export const optimizeImages = {
  // Generate responsive image sources
  generateSrcSet: (baseSrc: string, widths: number[] = [400, 800, 1200, 1600]) => {
    if (!baseSrc.includes('.')) return baseSrc;
    
    const [name, ext] = baseSrc.split('.');
    return widths
      .map(width => `${name}-${width}w.${ext} ${width}w`)
      .join(', ');
  },

  // Generate WebP sources
  generateWebPSources: (baseSrc: string, widths: number[] = [400, 800, 1200, 1600]) => {
    if (!baseSrc.includes('.')) return baseSrc;
    
    const [name] = baseSrc.split('.');
    return widths
      .map(width => `${name}-${width}w.webp ${width}w`)
      .join(', ');
  },

  // Lazy loading configuration
  lazyLoadConfig: {
    rootMargin: '100px',
    threshold: 0.1,
    loading: 'lazy' as const
  }
};

// Performance optimization checklist
export const performanceChecklist = {
  // Critical rendering path optimizations
  criticalPath: {
    inlineCSS: true,
    deferNonCriticalCSS: true,
    minifyHTML: true,
    optimizeFonts: true
  },

  // JavaScript optimizations
  javascript: {
    treeShaking: true,
    codeSplitting: true,
    lazyLoading: true,
    serviceWorker: false // Can be enabled for PWA
  },

  // Image optimizations
  images: {
    lazyLoading: true,
    responsiveImages: true,
    webpFormat: true,
    imageCompression: true
  },

  // Network optimizations
  network: {
    gzipCompression: true,
    httpCaching: true,
    resourceHints: true,
    cdnUsage: false // Can be enabled for production
  }
};

// Component-specific lazy loading
export const lazyComponents = {
  // Features section (below fold)
  FeaturesSection: lazy(() => import('../components/landing/FeaturesSection')),
  
  // How it works section (below fold)
  HowItWorksSection: lazy(() => import('../components/landing/HowItWorksSection')),
  
  // Statistics section (below fold)
  StatisticsSection: lazy(() => import('../components/landing/StatisticsSection')),
  
  // Testimonials section (below fold)
  TestimonialsSection: lazy(() => import('../components/landing/TestimonialsSection')),
  
  // CTA section (below fold)
  CTASection: lazy(() => import('../components/landing/CTASection')),
  
  // Footer section (below fold)
  FooterSection: lazy(() => import('../components/landing/FooterSection'))
};

export default {
  withLazyLoading,
  preloadComponent,
  createLazySection,
  addResourceHints,
  bundleSplittingConfig,
  optimizeImages,
  performanceChecklist,
  lazyComponents
};
