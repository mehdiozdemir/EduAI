// Authentication status indicator component
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { cn } from '../../../utils/cn';

interface AuthStatusIndicatorProps {
  className?: string;
  showIcon?: boolean;
  showText?: boolean;
}

export const AuthStatusIndicator: React.FC<AuthStatusIndicatorProps> = ({
  className = '',
  showIcon = true,
  showText = true
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        {showIcon && <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>}
        {showText && <span className="text-sm text-gray-500">Yükleniyor...</span>}
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={cn('flex items-center space-x-2 text-green-600', className)}>
        {showIcon && (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
        {showText && <span className="text-sm font-medium">Giriş Yapıldı</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center space-x-2 text-gray-500', className)}>
      {showIcon && (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )}
      {showText && <span className="text-sm">Misafir</span>}
    </div>
  );
};
