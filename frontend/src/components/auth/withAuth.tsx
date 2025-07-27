// Higher-order component for protecting routes with authentication

import React, { type ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

// Higher-order component options
interface WithAuthProps {
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Higher-order component that wraps a component with authentication protection
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };

  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};