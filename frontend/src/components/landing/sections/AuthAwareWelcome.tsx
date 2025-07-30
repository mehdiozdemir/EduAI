// Authentication-aware welcome message component
import React from 'react';
import { useAuth } from '../../../hooks/useAuth';

interface AuthAwareWelcomeProps {
  className?: string;
  defaultTitle: string;
  defaultSubtitle: string;
}

export const AuthAwareWelcome: React.FC<AuthAwareWelcomeProps> = ({
  className = '',
  defaultTitle,
  defaultSubtitle
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-6"></div>
        <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={className}>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Tekrar Hoş Geldin, {user.username}! 👋
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Kaldığın yerden devam etmeye hazır mısın? Son çalışmalarına göz at ve yeni hedefler belirle.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {defaultTitle}
      </h1>
      <p className="text-lg md:text-xl text-gray-600 mb-8">
        {defaultSubtitle}
      </p>
    </div>
  );
};
