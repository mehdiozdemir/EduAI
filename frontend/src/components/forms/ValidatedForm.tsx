import React, { type ReactNode } from 'react';
import { useForm, type UseFormProps, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import type { ValidationSchema } from '../../utils/validation';

export interface ValidatedFormProps<T extends FieldValues> {
  children: (methods: UseFormReturn<T>) => ReactNode;
  onSubmit: (data: T) => void | Promise<void>;
  validationSchema?: ValidationSchema;
  formOptions?: UseFormProps<T>;
  feedbackOptions?: {
    successTitle?: string;
    successMessage?: string;
    errorTitle?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  };
  className?: string;
  loading?: boolean;
  error?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

function ValidatedForm<T extends FieldValues>({
  children,
  onSubmit,
  formOptions,
  feedbackOptions,
  className = '',
  error,
  onSuccess,
  onError,
}: ValidatedFormProps<T>) {
  const methods = useForm<T>({
    mode: 'onChange',
    ...formOptions,
  });

  const feedback = useFormFeedback(feedbackOptions);

  const handleSubmit = async (data: T) => {
    try {
      methods.clearErrors();
      await onSubmit(data);
      
      if (feedbackOptions?.showSuccessToast !== false) {
        feedback.showSuccess();
      }
      
      onSuccess?.();
    } catch (err: any) {
      if (feedbackOptions?.showErrorToast !== false) {
        feedback.showError(err.message || 'İşlem sırasında bir hata oluştu');
      }
      
      onError?.(err);
    }
  };

  // Handle external errors
  React.useEffect(() => {
    if (error && feedbackOptions?.showErrorToast !== false) {
      feedback.showError(error);
    }
  }, [error, feedback, feedbackOptions]);

  return (
    <form 
      onSubmit={methods.handleSubmit(handleSubmit)} 
      className={className}
      noValidate
    >
      {children(methods)}
    </form>
  );
}

export default ValidatedForm;