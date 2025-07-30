// Protected route wrapper component for authentication

import React, { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Protected route props
interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  fallback?: ReactNode;
}

/**
 * Protected route component that requires authentication
 * Redirects to login page if user is not authenticated
 */
export type { ProtectedRouteProps };

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requireAuth = true,
  fallback: _fallback = null,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show fallback while loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" role="status" aria-label="Loading"></div>
      </div>
    ) as React.ReactElement;
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If authentication is not required but user is authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect to dashboard or intended location
    const from = location.state?.from?.pathname || '/app/dashboard';
    return <Navigate to={from} replace />;
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
};

// Public route component (opposite of protected route)
interface PublicRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Public route component for pages that should not be accessible when authenticated
 * (e.g., login, register pages)
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = '/app/dashboard',
}) => {
  return (
    <ProtectedRoute requireAuth={false} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
};



// Role-based route protection (for future use)
interface RoleProtectedRouteProps extends ProtectedRouteProps {
  requiredRoles?: string[];
  requireAllRoles?: boolean;
}

/**
 * Role-based protected route component
 * Currently returns children as roles are not implemented
 * Can be extended when role-based access control is added
 */
export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  children,
  requiredRoles: _requiredRoles = [],
  requireAllRoles: _requireAllRoles = false,
  ...protectedRouteProps
}) => {
  // const { hasRole } = useAuth(); // Will be used when roles are implemented

  return (
    <ProtectedRoute {...protectedRouteProps}>
      {/* Role checking logic would go here when roles are implemented */}
      {children}
    </ProtectedRoute>
  );
};

// Default export for the main component (Fast Refresh compatible)
export default ProtectedRoute;