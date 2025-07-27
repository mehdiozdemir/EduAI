import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformance } from '../usePerformance';

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(),
  getEntriesByName: vi.fn(),
  clearMarks: vi.fn(),
  clearMeasures: vi.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('usePerformance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  it('should start and stop timing', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.startTiming('test-operation');
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('test-operation-start');

    mockPerformance.now.mockReturnValue(2000);

    act(() => {
      result.current.stopTiming('test-operation');
    });

    expect(mockPerformance.mark).toHaveBeenCalledWith('test-operation-end');
    expect(mockPerformance.measure).toHaveBeenCalledWith(
      'test-operation',
      'test-operation-start',
      'test-operation-end'
    );
  });

  it('should measure duration correctly', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.startTiming('duration-test');
    });

    mockPerformance.now.mockReturnValue(1500);

    let duration: number;
    act(() => {
      duration = result.current.stopTiming('duration-test');
    });

    expect(duration!).toBe(500);
  });

  it('should get performance metrics', () => {
    const mockEntries = [
      { name: 'test-operation', duration: 500 },
      { name: 'another-operation', duration: 300 },
    ];

    mockPerformance.getEntriesByType.mockReturnValue(mockEntries);

    const { result } = renderHook(() => usePerformance());

    const metrics = result.current.getMetrics();

    expect(mockPerformance.getEntriesByType).toHaveBeenCalledWith('measure');
    expect(metrics).toEqual(mockEntries);
  });

  it('should clear performance data', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.clearMetrics();
    });

    expect(mockPerformance.clearMarks).toHaveBeenCalled();
    expect(mockPerformance.clearMeasures).toHaveBeenCalled();
  });

  it('should handle timing with callback', async () => {
    const { result } = renderHook(() => usePerformance());
    const mockCallback = vi.fn().mockResolvedValue('result');

    mockPerformance.now.mockReturnValueOnce(1000).mockReturnValueOnce(1500);

    let duration: number;
    let callbackResult: string;

    await act(async () => {
      const { result: cbResult, duration: dur } = await result.current.timeFunction(
        'callback-test',
        mockCallback
      );
      duration = dur;
      callbackResult = cbResult;
    });

    expect(mockCallback).toHaveBeenCalled();
    expect(callbackResult!).toBe('result');
    expect(duration!).toBe(500);
    expect(mockPerformance.mark).toHaveBeenCalledWith('callback-test-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('callback-test-end');
  });

  it('should handle errors in timed functions', async () => {
    const { result } = renderHook(() => usePerformance());
    const mockCallback = vi.fn().mockRejectedValue(new Error('Test error'));

    await expect(
      result.current.timeFunction('error-test', mockCallback)
    ).rejects.toThrow('Test error');

    // Should still create end mark even on error
    expect(mockPerformance.mark).toHaveBeenCalledWith('error-test-start');
    expect(mockPerformance.mark).toHaveBeenCalledWith('error-test-end');
  });

  it('should get specific metric by name', () => {
    const mockEntry = { name: 'specific-operation', duration: 750 };
    mockPerformance.getEntriesByName.mockReturnValue([mockEntry]);

    const { result } = renderHook(() => usePerformance());

    const metric = result.current.getMetric('specific-operation');

    expect(mockPerformance.getEntriesByName).toHaveBeenCalledWith('specific-operation', 'measure');
    expect(metric).toEqual(mockEntry);
  });

  it('should return undefined for non-existent metric', () => {
    mockPerformance.getEntriesByName.mockReturnValue([]);

    const { result } = renderHook(() => usePerformance());

    const metric = result.current.getMetric('non-existent');

    expect(metric).toBeUndefined();
  });

  it('should handle performance API not being available', () => {
    const originalPerformance = window.performance;
    // @ts-ignore
    delete window.performance;

    const { result } = renderHook(() => usePerformance());

    // Should not throw errors
    expect(() => {
      result.current.startTiming('test');
      result.current.stopTiming('test');
      result.current.getMetrics();
      result.current.clearMetrics();
    }).not.toThrow();

    // Restore
    window.performance = originalPerformance;
  });
});