import { useState, useCallback } from 'react';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ConfirmationState {
  isOpen: boolean;
  loading: boolean;
  options: ConfirmationOptions | null;
}

export interface ConfirmationActions {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
  close: () => void;
  handleConfirm: () => Promise<void>;
  handleCancel: () => void;
}

export const useConfirmation = (): ConfirmationState & ConfirmationActions => {
  const [state, setState] = useState<ConfirmationState>({
    isOpen: false,
    loading: false,
    options: null,
  });

  const confirm = useCallback(
    (options: ConfirmationOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        setState({
          isOpen: true,
          loading: false,
          options: {
            ...options,
            onConfirm: async () => {
              try {
                if (options.onConfirm) {
                  await options.onConfirm();
                }
                resolve(true);
              } catch (error) {
                console.error('Confirmation action failed:', error);
                resolve(false);
              }
            },
            onCancel: () => {
              if (options.onCancel) {
                options.onCancel();
              }
              resolve(false);
            },
          },
        });
      });
    },
    []
  );

  const close = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      loading: false,
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!state.options?.onConfirm) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      await state.options.onConfirm();
      close();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.options, close]);

  const handleCancel = useCallback(() => {
    if (state.options?.onCancel) {
      state.options.onCancel();
    }
    close();
  }, [state.options, close]);

  return {
    ...state,
    confirm,
    close,
    handleConfirm,
    handleCancel,
  };
};