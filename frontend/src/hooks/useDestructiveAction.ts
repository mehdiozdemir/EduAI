import { useCallback } from 'react';
import { useConfirmation } from './useConfirmation';
import { useFormFeedback } from './useFormFeedback';

export interface DestructiveActionOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  successMessage?: string;
  errorMessage?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

export interface DestructiveActionResult {
  execute: (action: () => void | Promise<void>) => Promise<boolean>;
  isLoading: boolean;
}

export const useDestructiveAction = (
  options: DestructiveActionOptions
): DestructiveActionResult => {
  const { confirm, loading } = useConfirmation();
  const feedback = useFormFeedback({
    successMessage: options.successMessage || 'İşlem başarıyla tamamlandı',
    errorMessage: options.errorMessage || 'İşlem sırasında bir hata oluştu',
    showSuccessToast: options.showSuccessToast !== false,
    showErrorToast: options.showErrorToast !== false,
  });

  const execute = useCallback(
    async (action: () => void | Promise<void>): Promise<boolean> => {
      try {
        const confirmed = await confirm({
          title: options.title,
          description: options.description,
          confirmText: options.confirmText || 'Onayla',
          cancelText: options.cancelText || 'İptal',
          variant: options.variant || 'danger',
          onConfirm: async () => {
            await action();
            if (options.showSuccessToast !== false) {
              feedback.showSuccess();
            }
          },
        });

        return confirmed;
      } catch (error: any) {
        if (options.showErrorToast !== false) {
          feedback.showError(error.message || options.errorMessage);
        }
        return false;
      }
    },
    [confirm, feedback, options]
  );

  return {
    execute,
    isLoading: loading,
  };
};