import { useCallback } from 'react';
import { useToast } from '../components/ui/Toast';

export interface FormFeedbackOptions {
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  autoHideSuccess?: boolean;
  autoHideError?: boolean;
  successDuration?: number;
  errorDuration?: number;
}

export interface FormFeedbackActions {
  showSuccess: (message?: string, title?: string) => void;
  showError: (message?: string, title?: string) => void;
  showValidationErrors: (errors: Record<string, string>) => void;
  showFieldError: (field: string, error: string) => void;
  clear: () => void;
}

export const useFormFeedback = (
  options: FormFeedbackOptions = {}
): FormFeedbackActions => {
  const { addToast } = useToast();

  const {
    successTitle = 'Başarılı',
    successMessage = 'İşlem başarıyla tamamlandı',
    errorTitle = 'Hata',
    errorMessage = 'İşlem sırasında bir hata oluştu',
    showSuccessToast = true,
    showErrorToast = true,
    successDuration = 4000,
    errorDuration = 6000,
  } = options;

  const showSuccess = useCallback(
    (message?: string, title?: string) => {
      if (showSuccessToast) {
        addToast({
          type: 'success',
          title: title || successTitle,
          description: message || successMessage,
          duration: successDuration,
        });
      }
    },
    [addToast, showSuccessToast, successTitle, successMessage, successDuration]
  );

  const showError = useCallback(
    (message?: string, title?: string) => {
      if (showErrorToast) {
        addToast({
          type: 'error',
          title: title || errorTitle,
          description: message || errorMessage,
          duration: errorDuration,
        });
      }
    },
    [addToast, showErrorToast, errorTitle, errorMessage, errorDuration]
  );

  const showValidationErrors = useCallback(
    (errors: Record<string, string>) => {
      const errorMessages = Object.entries(errors)
        .filter(([, error]) => error)
        .map(([field, error]) => `${field}: ${error}`)
        .join('\n');

      if (errorMessages && showErrorToast) {
        addToast({
          type: 'error',
          title: 'Doğrulama Hataları',
          description: errorMessages,
          duration: errorDuration,
        });
      }
    },
    [addToast, showErrorToast, errorDuration]
  );

  const showFieldError = useCallback(
    (field: string, error: string) => {
      if (showErrorToast) {
        addToast({
          type: 'error',
          title: 'Doğrulama Hatası',
          description: `${field}: ${error}`,
          duration: errorDuration,
        });
      }
    },
    [addToast, showErrorToast, errorDuration]
  );

  const clear = useCallback(() => {
    // This would clear any persistent feedback if we had it
    // For now, toasts auto-dismiss, so this is a no-op
  }, []);

  return {
    showSuccess,
    showError,
    showValidationErrors,
    showFieldError,
    clear,
  };
};