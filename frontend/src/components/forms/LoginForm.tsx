import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../ui';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import { validationSchemas } from '../../utils/validation';
import type { LoginCredentials } from '../../types';

export interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => void;
  loading?: boolean;
  error?: string;
  onSuccess?: () => void;
}

type LoginFormData = LoginCredentials;

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  loading = false,
  error,
  onSuccess,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields, isSubmitting },
    clearErrors,
    setError,
  } = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const feedback = useFormFeedback({
    successTitle: 'Giriş Başarılı',
    successMessage: 'Hoş geldiniz! Ana sayfaya yönlendiriliyorsunuz...',
    errorTitle: 'Giriş Hatası',
  });

  // Handle external errors
  useEffect(() => {
    if (error) {
      feedback.showError(error);
      // Set form-level error for specific fields if needed
      if (
        error.toLowerCase().includes('kullanıcı') ||
        error.toLowerCase().includes('username')
      ) {
        setError('username', { message: 'Kullanıcı adı bulunamadı' });
      } else if (
        error.toLowerCase().includes('şifre') ||
        error.toLowerCase().includes('password')
      ) {
        setError('password', { message: 'Şifre hatalı' });
      }
    }
  }, [error, feedback, setError]);

  const handleFormSubmit = async (data: LoginFormData) => {
    try {
      clearErrors();
      await onSubmit(data);
      feedback.showSuccess();
      onSuccess?.();
    } catch {
      // Error handling is done by parent component through error prop
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-4 sm:space-y-5"
      noValidate
    >
      <Input
        label="Kullanıcı Adı"
        type="text"
        placeholder="Kullanıcı adınızı girin"
        error={errors.username?.message}
        state={
          errors.username
            ? 'error'
            : touchedFields.username && !errors.username
              ? 'success'
              : 'default'
        }
        showValidationIcon={true}
        realTimeValidation={true}
        required
        {...register('username', validationSchemas.login.username)}
      />

      <Input
        label="Şifre"
        type="password"
        placeholder="Şifrenizi girin"
        error={errors.password?.message}
        state={
          errors.password
            ? 'error'
            : touchedFields.password && !errors.password
              ? 'success'
              : 'default'
        }
        showValidationIcon={true}
        realTimeValidation={true}
        required
        {...register('password', validationSchemas.login.password)}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading || isSubmitting}
        disabled={!isValid || loading || isSubmitting}
        className="w-full"
      >
        {loading || isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
      </Button>
    </form>
  );
};

export default LoginForm;
