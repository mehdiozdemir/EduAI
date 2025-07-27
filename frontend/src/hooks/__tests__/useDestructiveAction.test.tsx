import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useDestructiveAction } from '../useDestructiveAction';
import { useConfirmation } from '../useConfirmation';
import { useFormFeedback } from '../useFormFeedback';

// Mock the dependencies
vi.mock('../useConfirmation');
vi.mock('../useFormFeedback');

const mockConfirm = vi.fn();
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

describe('useDestructiveAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useConfirmation as any).mockReturnValue({
      confirm: mockConfirm,
      loading: false,
    });

    (useFormFeedback as any).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
    });
  });

  const defaultOptions = {
    title: 'Delete Item',
    description: 'Are you sure you want to delete this item?',
  };

  it('should execute action when confirmed', async () => {
    const { result } = renderHook(() => useDestructiveAction(defaultOptions));
    const mockAction = vi.fn().mockResolvedValue(undefined);

    mockConfirm.mockResolvedValue(true);

    await act(async () => {
      const success = await result.current.execute(mockAction);
      expect(success).toBe(true);
    });

    expect(mockConfirm).toHaveBeenCalledWith({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this item?',
      confirmText: 'Onayla',
      cancelText: 'İptal',
      variant: 'danger',
      onConfirm: expect.any(Function),
    });
  });

  it('should not execute action when cancelled', async () => {
    const { result } = renderHook(() => useDestructiveAction(defaultOptions));
    const mockAction = vi.fn();

    mockConfirm.mockResolvedValue(false);

    await act(async () => {
      const success = await result.current.execute(mockAction);
      expect(success).toBe(false);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it('should show success message when action completes', async () => {
    const { result } = renderHook(() => 
      useDestructiveAction({
        ...defaultOptions,
        successMessage: 'Item deleted successfully',
      })
    );
    const mockAction = vi.fn().mockResolvedValue(undefined);

    // Mock the onConfirm callback execution
    mockConfirm.mockImplementation(async ({ onConfirm }) => {
      await onConfirm();
      return true;
    });

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockAction).toHaveBeenCalled();
    expect(mockShowSuccess).toHaveBeenCalled();
  });

  it('should show error message when action fails', async () => {
    const { result } = renderHook(() => 
      useDestructiveAction({
        ...defaultOptions,
        errorMessage: 'Failed to delete item',
      })
    );
    const mockAction = vi.fn().mockRejectedValue(new Error('Delete failed'));

    mockConfirm.mockRejectedValue(new Error('Delete failed'));

    await act(async () => {
      const success = await result.current.execute(mockAction);
      expect(success).toBe(false);
    });

    expect(mockShowError).toHaveBeenCalledWith('Delete failed', 'Failed to delete item');
  });

  it('should use custom confirmation options', async () => {
    const customOptions = {
      title: 'Custom Title',
      description: 'Custom Description',
      confirmText: 'Custom Confirm',
      cancelText: 'Custom Cancel',
      variant: 'warning' as const,
    };

    const { result } = renderHook(() => useDestructiveAction(customOptions));
    const mockAction = vi.fn();

    mockConfirm.mockResolvedValue(false);

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockConfirm).toHaveBeenCalledWith({
      title: 'Custom Title',
      description: 'Custom Description',
      confirmText: 'Custom Confirm',
      cancelText: 'Custom Cancel',
      variant: 'warning',
      onConfirm: expect.any(Function),
    });
  });

  it('should not show success toast when disabled', async () => {
    const { result } = renderHook(() => 
      useDestructiveAction({
        ...defaultOptions,
        showSuccessToast: false,
      })
    );
    const mockAction = vi.fn().mockResolvedValue(undefined);

    mockConfirm.mockImplementation(async ({ onConfirm }) => {
      await onConfirm();
      return true;
    });

    await act(async () => {
      await result.current.execute(mockAction);
    });

    expect(mockShowSuccess).not.toHaveBeenCalled();
  });

  it('should not show error toast when disabled', async () => {
    const { result } = renderHook(() => 
      useDestructiveAction({
        ...defaultOptions,
        showErrorToast: false,
      })
    );
    const mockAction = vi.fn().mockRejectedValue(new Error('Test error'));

    mockConfirm.mockRejectedValue(new Error('Test error'));

    await act(async () => {
      const success = await result.current.execute(mockAction);
      expect(success).toBe(false);
    });

    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('should return loading state from confirmation hook', () => {
    (useConfirmation as jest.Mock).mockReturnValue({
      confirm: mockConfirm,
      loading: true,
    });

    const { result } = renderHook(() => useDestructiveAction(defaultOptions));

    expect(result.current.isLoading).toBe(true);
  });
});