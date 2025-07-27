/**
 * Tree-shaking optimization utilities
 * This file helps identify and optimize imports for better tree-shaking
 */

// Re-export only what we need from large libraries
// This helps bundlers understand what can be tree-shaken

// Chart.js - only import what we need
export {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// React Hook Form - specific imports
export {
  useForm,
  useController,
  useFormContext,
  useWatch,
  Controller,
  FormProvider,
} from 'react-hook-form';

// Axios - only what we need
export {
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
  AxiosInstance,
} from 'axios';

// React Router - specific imports
export {
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
  Navigate,
  Link,
  NavLink,
  Outlet,
} from 'react-router-dom';

// React Query - specific imports
export {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

/**
 * Utility to check if a module is being used
 * This can help identify unused imports during development
 */
export function trackModuleUsage(moduleName: string, feature: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📦 Using ${moduleName}:${feature}`);
  }
}

/**
 * Dynamic import wrapper with error handling
 * Helps with code splitting and lazy loading
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.error('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Conditional import based on feature flags
 * Helps exclude code from production builds
 */
export async function conditionalImport<T>(
  condition: boolean,
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  if (!condition) {
    return fallback;
  }
  
  return dynamicImport(importFn, fallback);
}

/**
 * Bundle size tracking for development
 */
export class BundleTracker {
  private static instance: BundleTracker;
  private modules: Map<string, number> = new Map();

  static getInstance(): BundleTracker {
    if (!BundleTracker.instance) {
      BundleTracker.instance = new BundleTracker();
    }
    return BundleTracker.instance;
  }

  trackModule(name: string, estimatedSize: number) {
    if (process.env.NODE_ENV === 'development') {
      this.modules.set(name, estimatedSize);
      this.logBundleSize();
    }
  }

  private logBundleSize() {
    const totalSize = Array.from(this.modules.values()).reduce((sum, size) => sum + size, 0);
    console.log(`📊 Estimated bundle size: ${totalSize}KB`);
    
    if (totalSize > 1000) {
      console.warn('⚠️ Bundle size is getting large. Consider code splitting.');
    }
  }

  getReport() {
    return {
      modules: Object.fromEntries(this.modules),
      totalSize: Array.from(this.modules.values()).reduce((sum, size) => sum + size, 0),
    };
  }
}

/**
 * Webpack magic comments for better chunk naming
 */
export const webpackChunkNames = {
  auth: '/* webpackChunkName: "auth" */',
  dashboard: '/* webpackChunkName: "dashboard" */',
  subjects: '/* webpackChunkName: "subjects" */',
  questions: '/* webpackChunkName: "questions" */',
  performance: '/* webpackChunkName: "performance" */',
  charts: '/* webpackChunkName: "charts" */',
  forms: '/* webpackChunkName: "forms" */',
  demo: '/* webpackChunkName: "demo" */',
  error: '/* webpackChunkName: "error" */',
} as const;

/**
 * Preload critical chunks
 */
export function preloadChunk(chunkName: keyof typeof webpackChunkNames) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = `/assets/${chunkName}.js`; // Adjust path as needed
    document.head.appendChild(link);
  }
}

/**
 * Remove unused CSS classes (for development analysis)
 */
export function analyzeUnusedCSS() {
  if (process.env.NODE_ENV === 'development') {
    // This would require a more sophisticated implementation
    // For now, just log a reminder
    console.log('💡 Consider using PurgeCSS or similar tools to remove unused CSS');
  }
}