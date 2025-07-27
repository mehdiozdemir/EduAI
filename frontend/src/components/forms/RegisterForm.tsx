import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../ui';
import { useFormFeedback } from '../../hooks/useFormFeedback';
import { validationSchemas } from '../../utils/validation';
import type { RegisterData } from '../../types';

export interface RegisterFormProps {
  onSubmit: (userData: RegisterData) => void;
  loading?: boolean;
  error?: string;
  onSuccess?: () => void;
}

interface RegisterFormData extends RegisterData {
  confirmPassword: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSubmit, 
  loading = false, 
  error,
  onSuccess 
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid, touchedFields, isSubmitting },
    clearErrors,
    setError,
  } = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const feedback = useFormFeedback({
    successTitle: 'Kayıt Başarılı',
    successMessage: 'Hesabınız başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...',
    errorTitle: 'Kayıt Hatası',
  });

  // Handle external errors
  useEffect(() => {
    if (error) {
      feedback.showError(error);
      // Set specific field errors based on error message
      if (error.toLowerCase().includes('kullanıcı adı') || error.toLowerCase().includes('username')) {
        setError('username', { message: 'Bu kullanıcı adı zaten kullanılıyor' });
      } else if (error.toLowerCase().includes('e-posta') || error.toLowerCase().includes('email')) {
        setError('email', { message: 'Bu e-posta adresi zaten kayıtlı' });
      }
    }
  }, [error, feedback, setError]);

  const handleFormSubmit = async (data: RegisterFormData) => {
    try {
      clearErrors();
      const registerData: RegisterData = {
        username: data.username,
        email: data.email,
        password: data.password,
      };
      await onSubmit(registerData);
      feedback.showSuccess();
      onSuccess?.();
    } catch (err) {
      // Error handling is done by parent component through error prop
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-5" noValidate>
      <Input
        label="Kullanıcı Adı"
        type="text"
        placeholder="Kullanıcı adınızı girin"
        error={errors.username?.message}
        state={errors.username ? 'error' : touchedFields.username && !errors.username ? 'success' : 'default'}
        showValidationIcon={true}
        realTimeValidation={true}
        helperText="3-50 karakter, sadece harf, rakam ve alt çizgi"
        required
        {...register('username', validationSchemas.register.username)}
      />

      <Input
        label="E-posta"
        type="email"
        placeholder="E-posta adresinizi girin"
        error={errors.email?.message}
        state={errors.email ? 'error' : touchedFields.email && !errors.email ? 'success' : 'default'}
        showValidationIcon={true}
        realTimeValidation={true}
        helperText="Geçerli bir e-posta adresi girin"
        required
        {...register('email', validationSchemas.register.email)}
      />

      <Input
        label="Şifre"
        type="password"
        placeholder="Şifrenizi girin"
        error={errors.password?.message}
        state={errors.password ? 'error' : touchedFields.password && !errors.password ? 'success' : 'default'}
        showValidationIcon={true}
        realTimeValidation={true}
        helperText="En az 8 karakter, büyük harf, küçük harf ve rakam içermeli"
        required
        {...register('password', validationSchemas.register.password)}
      />

      <Input
        label="Şifre Onayı"
        type="password"
        placeholder="Şifrenizi tekrar girin"
        error={errors.confirmPassword?.message}
        state={errors.confirmPassword ? 'error' : touchedFields.confirmPassword && !errors.confirmPassword ? 'success' : 'default'}
        showValidationIcon={true}
        realTimeValidation={true}
        helperText="Yukarıdaki şifre ile aynı olmalı"
        required
        {...register('confirmPassword', validationSchemas.register.confirmPassword(password))}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading || isSubmitting}
        disabled={!isValid || loading || isSubmitting}
        className="w-full"
      >
        {loading || isSubmitting ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
      </Button>
    </form>
  );
};

export default RegisterForm;