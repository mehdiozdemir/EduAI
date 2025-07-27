import { renderHook } from '@testing-library/react';
import { useFormFeedback } from '../useFormFeedback';
import { useToast } from '../../components/ui/Toast';

import { vi } from 'vitest';

// Mock the useToast hook
vi.mock('../../components/ui/Toast', () => ({
  useToast: vi.fn(),
}));

const mockAddToast = vi.fn();

describe('useFormFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as any).mockReturnValue({
      addToast: mockAddToast,
    });
  });

  it('should show success toast with default options', () => {
    const { result } = renderHook(() => useFormFeedback());

    result.current.showSuccess();

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Başarılı',
      description: 'İşlem başarıyla tamamlandı',
      duration: 4000,
    });
  });

  it('should show success toast with custom message', () => {
    const { result } = renderHook(() => useFormFeedback());

    result.current.showSuccess('Custom success message', 'Custom Title');

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Custom Title',
      description: 'Custom success message',
      duration: 4000,
    });
  });

  it('should show error toast with default options', () => {
    const { result } = renderHook(() => useFormFeedback());

    result.current.showError();

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Hata',
      description: 'İşlem sırasında bir hata oluştu',
      duration: 6000,
    });
  });

  it('should show error toast with custom message', () => {
    const { result } = renderHook(() => useFormFeedback());

    result.current.showError('Custom error message', 'Custom Error Title');

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Custom Error Title',
      description: 'Custom error message',
      duration: 6000,
    });
  });

  it('should show validation errors', () => {
    const { result } = renderHook(() => useFormFeedback());

    const errors = {
      username: 'Username is required',
      email: 'Invalid email format',
    };

    result.current.showValidationErrors(errors);

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Doğrulama Hataları',
      description: 'username: Username is required\nemail: Invalid email format',
      duration: 6000,
    });
  });

  it('should show field error', () => {
    const { result } = renderHook(() => useFormFeedback());

    result.current.showFieldError('username', 'Username is too short');

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Doğrulama Hatası',
      description: 'username: Username is too short',
      duration: 6000,
    });
  });

  it('should not show toasts when disabled', () => {
    const { result } = renderHook(() => 
      useFormFeedback({
        showSuccessToast: false,
        showErrorToast: false,
      })
    );

    result.current.showSuccess();
    result.current.showError();

    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it('should use custom options', () => {
    const { result } = renderHook(() => 
      useFormFeedback({
        successTitle: 'Custom Success',
        successMessage: 'Custom success message',
        errorTitle: 'Custom Error',
        errorMessage: 'Custom error message',
        successDuration: 2000,
        errorDuration: 8000,
      })
    );

    result.current.showSuccess();
    result.current.showError();

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'success',
      title: 'Custom Success',
      description: 'Custom success message',
      duration: 2000,
    });

    expect(mockAddToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Custom Error',
      description: 'Custom error message',
      duration: 8000,
    });
  });
});