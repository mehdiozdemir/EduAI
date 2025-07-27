import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import Input, { type InputProps } from '../ui/Input';

export interface FormFieldProps extends Omit<InputProps, 'error' | 'state'> {
  name: string;
  label: string;
  error?: FieldError;
  touched?: boolean;
  register?: UseFormRegisterReturn;
  showSuccess?: boolean;
  validationIcon?: boolean;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  error,
  touched,
  register,
  showSuccess = true,
  validationIcon = true,
  helperText,
  ...inputProps
}) => {
  const getFieldState = () => {
    if (error) return 'error';
    if (showSuccess && touched && !error) return 'success';
    return 'default';
  };

  return (
    <Input
      label={label}
      error={error?.message}
      state={getFieldState()}
      showValidationIcon={validationIcon}
      helperText={helperText}
      {...register}
      {...inputProps}
    />
  );
};

export default FormField;