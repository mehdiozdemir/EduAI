import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerSW, unregisterSW } from '../serviceWorker';

// Mock navigator.serviceWorker
const mockServiceWorker = {
  register: vi.fn(),
  getRegistration: vi.fn(),
  ready: Promise.resolve({
    unregister: vi.fn(),
  }),
};

Object.defineProperty(navigator, 'serviceWorker', {
  value: mockServiceWorker,
  writable: true,
});

describe('Service Worker Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  describe('registerSW', () => {
    it('should register service worker successfully', async () => {
      const mockRegistration = { scope: '/' };
      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      await registerSW();

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(console.log).toHaveBeenCalledWith('SW registered: ', mockRegistration);
    });

    it('should handle registration errors', async () => {
      const error = new Error('Registration failed');
      mockServiceWorker.register.mockRejectedValue(error);

      await registerSW();

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(console.error).toHaveBeenCalledWith('SW registration failed: ', error);
    });

    it('should not register when service worker is not supported', async () => {
      const originalServiceWorker = navigator.serviceWorker;
      // @ts-ignore
      delete navigator.serviceWorker;

      await registerSW();

      expect(console.log).toHaveBeenCalledWith('Service Worker not supported');

      // Restore
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
      });
    });

    it('should register with custom path', async () => {
      const mockRegistration = { scope: '/' };
      mockServiceWorker.register.mockResolvedValue(mockRegistration);

      await registerSW('/custom-sw.js');

      expect(mockServiceWorker.register).toHaveBeenCalledWith('/custom-sw.js');
    });
  });

  describe('unregisterSW', () => {
    it('should unregister service worker successfully', async () => {
      const mockRegistration = {
        unregister: vi.fn().mockResolvedValue(true),
      };
      mockServiceWorker.getRegistration.mockResolvedValue(mockRegistration);

      const result = await unregisterSW();

      expect(result).toBe(true);
      expect(mockServiceWorker.getRegistration).toHaveBeenCalled();
      expect(mockRegistration.unregister).toHaveBeenCalled();
    });

    it('should handle unregistration when no registration exists', async () => {
      mockServiceWorker.getRegistration.mockResolvedValue(undefined);

      const result = await unregisterSW();

      expect(result).toBe(false);
      expect(mockServiceWorker.getRegistration).toHaveBeenCalled();
    });

    it('should handle unregistration errors', async () => {
      const error = new Error('Unregistration failed');
      mockServiceWorker.getRegistration.mockRejectedValue(error);

      const result = await unregisterSW();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith('SW unregistration failed: ', error);
    });

    it('should not unregister when service worker is not supported', async () => {
      const originalServiceWorker = navigator.serviceWorker;
      // @ts-ignore
      delete navigator.serviceWorker;

      const result = await unregisterSW();

      expect(result).toBe(false);

      // Restore
      Object.defineProperty(navigator, 'serviceWorker', {
        value: originalServiceWorker,
        writable: true,
      });
    });
  });
});