import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOffline } from '../useOffline';

describe('useOffline', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock addEventListener and removeEventListener
    window.addEventListener = vi.fn();
    window.removeEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial online status', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.isOffline).toBe(false);
    expect(result.current.isOnline).toBe(true);
  });

  it('should return offline status when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOffline).toBe(true);
    expect(result.current.isOnline).toBe(false);
  });

  it('should add event listeners on mount', () => {
    renderHook(() => useOffline());

    expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const { unmount } = renderHook(() => useOffline());

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });

  it('should update status when going offline', () => {
    let offlineHandler: () => void;
    
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'offline') {
        offlineHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOffline).toBe(false);

    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      offlineHandler();
    });

    expect(result.current.isOffline).toBe(true);
    expect(result.current.isOnline).toBe(false);
  });

  it('should update status when going online', () => {
    let onlineHandler: () => void;
    
    // Start offline
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false,
    });

    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'online') {
        onlineHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useOffline());

    expect(result.current.isOffline).toBe(true);

    // Simulate going online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      onlineHandler();
    });

    expect(result.current.isOffline).toBe(false);
    expect(result.current.isOnline).toBe(true);
  });

  it('should provide last online time', () => {
    const { result } = renderHook(() => useOffline());

    expect(result.current.lastOnline).toBeInstanceOf(Date);
  });

  it('should update last online time when going offline', () => {
    let offlineHandler: () => void;
    
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'offline') {
        offlineHandler = handler as () => void;
      }
    });

    const { result } = renderHook(() => useOffline());
    const initialLastOnline = result.current.lastOnline;

    // Wait a bit to ensure time difference
    setTimeout(() => {
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: false,
        });
        offlineHandler();
      });

      expect(result.current.lastOnline.getTime()).toBeGreaterThan(initialLastOnline.getTime());
    }, 10);
  });
});