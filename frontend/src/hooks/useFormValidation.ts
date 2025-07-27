import { useState, useCallback, useEffect } from 'react';
import { debounce, validateField, type ValidationRule, type ValidationSchema } from '../utils/validation';

export interface FormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  schema?: ValidationSchema;
}

export interface FormValidationState {
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isValidating: boolean;
}

export interface FormValidationActions {
  validateField: (field: string, value: any, rules?: ValidationRule) => Promise<string | undefined>;
  validateForm: (data: Record<string, any>) => Promise<Record<string, string>>;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  setFieldTouched: (field: string, touched?: boolean) => void;
  reset: () => void;
}

export const useFormValidation = (
  options: FormValidationOptions = {}
): FormValidationState & FormValidationActions => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
    schema = {},
  } = options;

  const [state, setState] = useState<FormValidationState>({
    errors: {},
    touched: {},
    isValid: true,
    isValidating: false,
  });

  // Debounced validation function
  const debouncedValidateField = useCallback(
    debounce((field: string, value: any, rules?: ValidationRule) => {
      setState(prev => ({ ...prev, isValidating: true }));
      
      const fieldRules = rules || schema[field];
      if (!fieldRules) {
        setState(prev => ({ ...prev, isValidating: false }));
        return Promise.resolve(undefined);
      }

      const error = validateField(value, fieldRules);
      
      setState(prev => ({
        ...prev,
        errors: error 
          ? { ...prev.errors, [field]: error }
          : { ...prev.errors, [field]: undefined },
        isValidating: false,
      }));

      return Promise.resolve(error);
    }, debounceMs),
    [schema, debounceMs]
  );

  const validateFieldSync = useCallback(
    async (field: string, value: any, rules?: ValidationRule): Promise<string | undefined> => {
      const fieldRules = rules || schema[field];
      if (!fieldRules) return undefined;

      const error = validateField(value, fieldRules);
      
      setState(prev => ({
        ...prev,
        errors: error 
          ? { ...prev.errors, [field]: error }
          : { ...prev.errors, [field]: undefined },
      }));

      return error;
    },
    [schema]
  );

  const validateFormSync = useCallback(
    async (data: Record<string, unknown>): Promise<Record<string, string>> => {
      setState(prev => ({ ...prev, isValidating: true }));
      
      const errors: Record<string, string> = {};
      
      // Validate all fields in schema
      Object.keys(schema).forEach(field => {
        const rules = schema[field];
        const error = validateField(data[field], rules);
        if (error) {
          errors[field] = error;
        }
      });

      setState(prev => ({
        ...prev,
        errors,
        isValidating: false,
      }));

      return errors;
    },
    [schema]
  );

  const setFieldError = useCallback((field: string, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: undefined },
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setState(prev => ({
      ...prev,
      errors: {},
    }));
  }, []);

  const setFieldTouched = useCallback((field: string, touched = true) => {
    setState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      errors: {},
      touched: {},
      isValid: true,
      isValidating: false,
    });
  }, []);

  // Update isValid when errors change
  useEffect(() => {
    const hasErrors = Object.values(state.errors).some(error => error !== undefined && error !== '');
    setState(prev => ({
      ...prev,
      isValid: !hasErrors,
    }));
  }, [state.errors]);

  return {
    ...state,
    validateField: validateOnChange ? debouncedValidateField : validateFieldSync,
    validateForm: validateFormSync,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    setFieldTouched,
    reset,
  };
};