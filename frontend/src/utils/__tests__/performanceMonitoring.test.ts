import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { performanceMonitor } from '../performanceMonitoring';

// Mock performance API
const mockPerformance = {
  now: () => Date.now(),
  getEntriesByType: () => [],
  memory: {
    usedJSHeapSize: 1000000,
  },
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(global, 'PerformanceObserver', {
  value: class MockPerformanceObserver {
    constructor(callback: any) {
      this.callback = callback;
    }
    observe() {}
    disconnect() {}
    callback: any;
  },
  writable: true,
});

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    // Reset any state
  });

  afterEach(() => {
    performanceMonitor.cleanup();
  });

  it('should measure component render time', () => {
    const componentName = 'TestComponent';
    let renderExecuted = false;

    const result = performanceMonitor.measureComponentRender(componentName, () => {
      renderExecuted = true;
      return 'test result';
    });

    expect(renderExecuted).toBe(true);
    expect(result).toBe('test result');
  });

  it('should measure API call performance', () => {
    const endpoint = '/api/test';
    const duration = 500;
    const success = true;

    // This should not throw
    expect(() => {
      performanceMonitor.measureApiCall(endpoint, duration, success);
    }).not.toThrow();
  });

  it('should measure route change performance', () => {
    const from = '/home';
    const to = '/dashboard';
    const duration = 200;

    // This should not throw
    expect(() => {
      performanceMonitor.measureRouteChange(from, to, duration);
    }).not.toThrow();
  });

  it('should get performance metrics', () => {
    const metrics = performanceMonitor.getMetrics();

    expect(metrics).toHaveProperty('timestamp');
    expect(metrics).toHaveProperty('url');
    expect(metrics).toHaveProperty('userAgent');
    expect(metrics).toHaveProperty('webVitals');
    expect(metrics).toHaveProperty('customMetrics');
  });

  it('should calculate performance score', () => {
    const score = performanceMonitor.getPerformanceScore();

    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should provide recommendations', () => {
    const recommendations = performanceMonitor.getRecommendations();

    expect(Array.isArray(recommendations)).toBe(true);
  });

  it('should export data as JSON string', () => {
    const data = performanceMonitor.exportData();

    expect(typeof data).toBe('string');
    expect(() => JSON.parse(data)).not.toThrow();
  });
});