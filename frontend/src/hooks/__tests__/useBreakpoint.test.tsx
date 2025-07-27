import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useBreakpoint } from '../useBreakpoint';

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener,
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return xs breakpoint for small screens', () => {
    mockInnerWidth(400);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('xs');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return sm breakpoint for small-medium screens', () => {
    mockInnerWidth(700);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('sm');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return md breakpoint for tablet screens', () => {
    mockInnerWidth(800);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('md');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return lg breakpoint for desktop screens', () => {
    mockInnerWidth(1200);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('lg');
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
  });

  it('should return xl breakpoint for large desktop screens', () => {
    mockInnerWidth(1400);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('xl');
    expect(result.current.isDesktop).toBe(true);
  });

  it('should return 2xl breakpoint for extra large screens', () => {
    mockInnerWidth(1600);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('2xl');
    expect(result.current.isDesktop).toBe(true);
  });

  it('should correctly identify breakpoints with isBreakpoint function', () => {
    mockInnerWidth(1000);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.isBreakpoint('xs')).toBe(true);
    expect(result.current.isBreakpoint('sm')).toBe(true);
    expect(result.current.isBreakpoint('md')).toBe(true);
    expect(result.current.isBreakpoint('lg')).toBe(false);
    expect(result.current.isBreakpoint('xl')).toBe(false);
  });

  it('should add and remove event listeners', () => {
    const { unmount } = renderHook(() => useBreakpoint());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should update breakpoint when window is resized', () => {
    mockInnerWidth(400);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.currentBreakpoint).toBe('xs');
    
    // Simulate window resize
    mockInnerWidth(1200);
    
    // Get the resize handler that was registered
    const resizeHandler = mockAddEventListener.mock.calls[0][1];
    
    act(() => {
      resizeHandler();
    });
    
    expect(result.current.currentBreakpoint).toBe('lg');
    expect(result.current.isDesktop).toBe(true);
  });

  it('should return correct window width', () => {
    mockInnerWidth(1024);
    
    const { result } = renderHook(() => useBreakpoint());
    
    expect(result.current.windowWidth).toBe(1024);
  });
});