import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/forms';
import { AnimatedBackground } from '../components/ui';
import { useAuth } from '../hooks';
import type { RegisterData } from '../types';

const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (userData: RegisterData) => {
    try {
      setError('');
      setSuccess(false);
      setLoading(true);
      
      await registerUser(userData);
      
      // Show success message briefly before redirecting
      setSuccess(true);
      
      // Redirect to dashboard after successful registration
      setTimeout(() => {
        navigate('/app/dashboard', { replace: true });
      }, 1500);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Handle different types of errors
      if (err.response?.status === 409) {
        setError('Bu kullanıcı adı veya e-posta adresi zaten kullanılıyor');
      } else if (err.response?.status === 422) {
        // Handle validation errors from backend
        const detail = err.response?.data?.detail;
        if (Array.isArray(detail)) {
          const errorMessages = detail.map((error: any) => error.msg).join(', ');
          setError(`Geçersiz veriler: ${errorMessages}`);
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError('Geçersiz kayıt bilgileri');
        }
      } else if (err.response?.status >= 500) {
        setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 relative">
        <AnimatedBackground variant="register" />
        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="bg-white/90 backdrop-blur-sm py-6 px-4 sm:py-8 sm:px-6 shadow-xl rounded-xl border border-white/20 text-center animate-fade-in">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Kayıt Başarılı!
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Hesabınız başarıyla oluşturuldu. Dashboard'a yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 relative">
      <AnimatedBackground variant="register" />
      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            EduAI'ya Kayıt Ol
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 touch-manipulation transition-colors duration-200"
            >
              Giriş yapın
            </Link>
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm py-6 px-4 sm:py-8 sm:px-6 shadow-xl rounded-xl border border-white/20 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <RegisterForm
            onSubmit={handleRegister}
            loading={loading}
            error={error}
            onSuccess={() => {
              setSuccess(true);
              setTimeout(() => {
                navigate('/app/dashboard', { replace: true });
              }, 1500);
            }}
          />
        </div>

        <div className="text-center text-xs text-gray-500 px-2">
          Kayıt olarak{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500 touch-manipulation">
            Kullanım Şartları
          </Link>{' '}
          ve{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500 touch-manipulation">
            Gizlilik Politikası
          </Link>
          'nı kabul etmiş olursunuz.
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;