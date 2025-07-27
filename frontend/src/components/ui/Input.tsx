import React, { useState, useCallback } from 'react';
import { cn } from '../../utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  state?: 'default' | 'error' | 'success' | 'warning';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showValidationIcon?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  realTimeValidation?: boolean;
  validationDelay?: number;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    state = 'default', 
    leftIcon, 
    rightIcon, 
    showValidationIcon = true,
    onValidationChange,
    realTimeValidation = false,
    validationDelay = 300,
    id,
    onChange,
    onBlur,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasBeenTouched, setHasBeenTouched] = useState(false);
    
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = error || state === 'error';
    const hasSuccess = state === 'success' && !hasError;
    const hasWarning = state === 'warning' && !hasError;

    const baseStyles = 'flex h-12 w-full rounded-md border px-3 py-2 text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation min-h-[48px] sm:h-10 sm:min-h-[40px] sm:text-sm transition-colors duration-200';
    
    const stateStyles = {
      default: 'border-gray-300 bg-white focus-visible:ring-primary-500 hover:border-gray-400',
      error: 'border-error bg-white focus-visible:ring-error hover:border-red-400',
      success: 'border-success bg-white focus-visible:ring-success hover:border-green-400',
      warning: 'border-yellow-400 bg-white focus-visible:ring-yellow-500 hover:border-yellow-500',
    };

    const getCurrentState = () => {
      if (hasError) return 'error';
      if (hasSuccess) return 'success';
      if (hasWarning) return 'warning';
      return 'default';
    };

    const currentState = getCurrentState();

    const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    }, [props]);

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setHasBeenTouched(true);
      onBlur?.(e);
      props.onFocus?.(e);
    }, [onBlur, props]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      
      if (realTimeValidation && hasBeenTouched) {
        // Trigger validation change callback
        const isValid = !error && e.target.value.length > 0;
        onValidationChange?.(isValid);
      }
    }, [onChange, realTimeValidation, hasBeenTouched, error, onValidationChange]);

    // Validation icon component
    const ValidationIcon = () => {
      if (!showValidationIcon || (!hasError && !hasSuccess && !hasWarning)) return null;

      if (hasError) {
        return (
          <svg className="h-5 w-5 text-error" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
      }

      if (hasSuccess) {
        return (
          <svg className="h-5 w-5 text-success" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      }

      if (hasWarning) {
        return (
          <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      }

      return null;
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              "block text-sm font-medium mb-1 transition-colors duration-200",
              hasError ? 'text-error' : hasSuccess ? 'text-success' : hasWarning ? 'text-yellow-600' : 'text-gray-700',
              isFocused && !hasError && 'text-primary-600'
            )}
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            className={cn(
              baseStyles,
              stateStyles[currentState],
              leftIcon && 'pl-10',
              (rightIcon || showValidationIcon) && 'pr-10',
              isFocused && 'ring-2 ring-offset-2',
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            ref={ref}
            {...props}
          />
          
          {rightIcon && !showValidationIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}

          {showValidationIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon />
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-error flex items-center">
                <svg className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {helperText && !error && (
              <p className="text-sm text-gray-600">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;