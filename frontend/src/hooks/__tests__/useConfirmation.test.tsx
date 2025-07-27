import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useConfirmation } from '../useConfirmation';

describe('useConfirmation', () => {
  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useConfirmation());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.options).toBeNull();
  });

  it('should open confirmation dialog', async () => {
    const { result } = renderHook(() => useConfirmation());

    const confirmPromise = act(() => 
      result.current.confirm({
        title: 'Test Title',
        description: 'Test Description',
      })
    );

    expect(result.current.isOpen).toBe(true);
    expect(result.current.options?.title).toBe('Test Title');
    expect(result.current.options?.description).toBe('Test Description');

    // Close the dialog to resolve the promise
    act(() => {
      result.current.close();
    });

    const confirmed = await confirmPromise;
    expect(confirmed).toBe(false);
  });

  it('should handle confirm action', async () => {
    const { result } = renderHook(() => useConfirmation());
    const mockOnConfirm = vi.fn().mockResolvedValue(undefined);

    const confirmPromise = act(() => 
      result.current.confirm({
        title: 'Test Title',
        description: 'Test Description',
        onConfirm: mockOnConfirm,
      })
    );

    expect(result.current.isOpen).toBe(true);

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(mockOnConfirm).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);

    const confirmed = await confirmPromise;
    expect(confirmed).toBe(true);
  });

  it('should handle cancel action', async () => {
    const { result } = renderHook(() => useConfirmation());
    const mockOnCancel = vi.fn();

    const confirmPromise = act(() => 
      result.current.confirm({
        title: 'Test Title',
        description: 'Test Description',
        onCancel: mockOnCancel,
      })
    );

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.handleCancel();
    });

    expect(mockOnCancel).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);

    const confirmed = await confirmPromise;
    expect(confirmed).toBe(false);
  });

  it('should handle loading state during confirm', async () => {
    const { result } = renderHook(() => useConfirmation());
    const mockOnConfirm = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    act(() => {
      result.current.confirm({
        title: 'Test Title',
        description: 'Test Description',
        onConfirm: mockOnConfirm,
      });
    });

    const confirmPromise = act(async () => {
      const promise = result.current.handleConfirm();
      expect(result.current.loading).toBe(true);
      await promise;
    });

    await confirmPromise;
    expect(result.current.loading).toBe(false);
    expect(result.current.isOpen).toBe(false);
  });

  it('should handle errors during confirm', async () => {
    const { result } = renderHook(() => useConfirmation());
    const mockOnConfirm = vi.fn().mockRejectedValue(new Error('Test error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    act(() => {
      result.current.confirm({
        title: 'Test Title',
        description: 'Test Description',
        onConfirm: mockOnConfirm,
      });
    });

    await act(async () => {
      await result.current.handleConfirm();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Confirmation action failed:', expect.any(Error));
    expect(result.current.loading).toBe(false);
    expect(result.current.isOpen).toBe(true); // Should remain open on error

    consoleSpy.mockRestore();
  });

  it('should close dialog manually', () => {
    const { result } = renderHook(() => useConfirmation());

    act(() => {
      result.current.confirm({
        title: 'Test Title',
        description: 'Test Description',
      });
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});