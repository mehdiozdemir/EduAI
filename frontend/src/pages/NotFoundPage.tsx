import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/ui/Card';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    // Go back in history if possible, otherwise navigate to appropriate home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/dashboard' : '/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="p-8 text-center">
          {/* 404 Icon */}
          <div className="text-6xl text-gray-400 mb-4">🔍</div>
          
          {/* Error Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600 mb-8">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoBack}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Geri Dön
            </button>
            
            <div className="flex space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                  >
                    Ana Sayfa
                  </Link>
                  <Link
                    to="/subjects"
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                  >
                    Dersler
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center font-medium"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Sorun devam ederse, lütfen{' '}
              <a
                href="mailto:support@eduai.com"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                destek ekibi
              </a>
              {' '}ile iletişime geçin.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotFoundPage;