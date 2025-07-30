// Authentication-aware CTA component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../ui/Button';

interface AuthAwareCTAProps {
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  redirectPath?: string; // Where to redirect after login/register
  renderButton?: (props: { onClick: () => void; isAuthenticated: boolean; user: any; isLoading: boolean }) => React.ReactNode;
}

export const AuthAwareCTA: React.FC<AuthAwareCTAProps> = ({
  className = '',
  variant = 'primary',
  size = 'md',
  children = 'Başla',
  redirectPath = '/app/dashboard',
  renderButton
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated && user) {
      // User is logged in, redirect to the specified path
      navigate(redirectPath);
    } else {
      // User is not logged in, redirect to registration page
      navigate('/register', { 
        state: { redirectTo: redirectPath } 
      });
    }
  };

  // If custom render function is provided, use it
  if (renderButton) {
    return <>{renderButton({ onClick: handleClick, isAuthenticated, user, isLoading })}</>;
  }

  if (isLoading) {
    return (
      <Button 
        variant={variant} 
        size={size} 
        className={`${className} opacity-50 cursor-wait`}
        disabled
      >
        Yükleniyor...
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={className}
      onClick={handleClick}
    >
      {isAuthenticated 
        ? `Devam Et, ${user?.username || 'Kullanıcı'}` 
        : children
      }
    </Button>
  );
};

// Login-specific CTA
export const LoginCTA: React.FC<Omit<AuthAwareCTAProps, 'children'>> = (props) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate(props.redirectPath || '/app/dashboard');
    } else {
      navigate('/login', { 
        state: { redirectTo: props.redirectPath || '/app/dashboard' } 
      });
    }
  };

  return (
    <Button 
      {...props}
      onClick={handleClick}
    >
      {isAuthenticated ? 'Panele Git' : 'Giriş Yap'}
    </Button>
  );
};

// Register-specific CTA
export const RegisterCTA: React.FC<Omit<AuthAwareCTAProps, 'children'>> = (props) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate(props.redirectPath || '/app/dashboard');
    } else {
      navigate('/register', { 
        state: { redirectTo: props.redirectPath || '/app/dashboard' } 
      });
    }
  };

  return (
    <Button 
      {...props}
      onClick={handleClick}
    >
      {isAuthenticated ? 'Panele Git' : 'Ücretsiz Başla'}
    </Button>
  );
};
