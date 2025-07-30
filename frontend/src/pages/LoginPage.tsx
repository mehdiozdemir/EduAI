import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../components/forms';
import { useAuth } from '../hooks';
import type { LoginCredentials } from '../types';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, default to dashboard
  const from = (location.state as any)?.from?.pathname || '/app/dashboard';

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setError('');
      setLoading(true);
      
      await login(credentials);
      
      // Redirect to intended destination or dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      if (err.response?.status === 401) {
        setError('Kullanıcı adı veya şifre hatalı');
      } else if (err.response?.status === 422) {
        setError('Geçersiz giriş bilgileri');
      } else if (err.response?.status >= 500) {
        setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            EduAI'ya Giriş Yap
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Kayıt olun
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            onSuccess={() => {
              // Success feedback is handled by the form component
              navigate(from, { replace: true });
            }}
          />
        </div>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Şifrenizi mi unuttunuz?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;