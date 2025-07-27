import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';
import { createValidationRules } from '../../utils/validation';

describe('useFormValidation', () => {
  const mockSchema = {
    username: createValidationRules.username(),
    email: createValidationRules.email(),
  };

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useFormValidation());

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(true);
    expect(result.current.isValidating).toBe(false);
  });

  it('should validate field correctly', async () => {
    const { result } = renderHook(() => 
      useFormValidation({ schema: mockSchema })
    );

    await act(async () => {
      await result.current.validateField('username', 'ab');
    });

    expect(result.current.errors.username).toBeDefined();
    expect(result.current.isValid).toBe(false);
  });

  it('should validate form correctly', async () => {
    const { result } = renderHook(() => 
      useFormValidation({ schema: mockSchema })
    );

    const invalidData = {
      username: 'ab',
      email: 'invalid-email',
    };

    await act(async () => {
      await result.current.validateForm(invalidData);
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);
    expect(result.current.isValid).toBe(false);
  });

  it('should set and clear field errors', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setFieldError('username', 'Custom error');
    });

    expect(result.current.errors.username).toBe('Custom error');
    expect(result.current.isValid).toBe(false);

    act(() => {
      result.current.clearFieldError('username');
    });

    expect(result.current.errors.username).toBeUndefined();
    expect(result.current.isValid).toBe(true);
  });

  it('should set field touched state', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setFieldTouched('username', true);
    });

    expect(result.current.touched.username).toBe(true);

    act(() => {
      result.current.setFieldTouched('username', false);
    });

    expect(result.current.touched.username).toBe(false);
  });

  it('should reset form state', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setFieldError('username', 'Error');
      result.current.setFieldTouched('username', true);
    });

    expect(result.current.errors.username).toBe('Error');
    expect(result.current.touched.username).toBe(true);

    act(() => {
      result.current.reset();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useFormValidation());

    act(() => {
      result.current.setFieldError('username', 'Error 1');
      result.current.setFieldError('email', 'Error 2');
    });

    expect(Object.keys(result.current.errors)).toHaveLength(2);

    act(() => {
      result.current.clearAllErrors();
    });

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });
});