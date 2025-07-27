// Custom hook for authentication operations

import { useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import type { LoginCredentials, RegisterData, User } from '../types';

// Auth hook interface
interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkAuthStatus: () => Promise<void>;

  // Utility functions
  hasRole: (role: string) => boolean;
  isCurrentUser: (userId: number) => boolean;
}

/**
 * Custom hook for authentication operations
 * Provides access to auth state and operations with additional utility functions
 */
export const useAuth = (): UseAuthReturn => {
  const authContext = useAuthContext();

  // Check if user has a specific role (if roles are implemented in the future)
  const hasRole = useCallback((_role: string): boolean => {
    // For now, return false as roles are not implemented
    // This can be extended when role-based access control is added
    return false;
  }, []);

  // Check if the given user ID matches the current user
  const isCurrentUser = useCallback(
    (userId: number): boolean => {
      return authContext.user?.id === userId;
    },
    [authContext.user]
  );

  // Memoized login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      await authContext.login(credentials);
    },
    [authContext]
  );

  // Memoized register function
  const register = useCallback(
    async (userData: RegisterData): Promise<void> => {
      await authContext.register(userData);
    },
    [authContext]
  );

  // Memoized logout function
  const logout = useCallback(async (): Promise<void> => {
    await authContext.logout();
  }, [authContext]);

  return {
    // State from context
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: authContext.error,

    // Actions from context
    login,
    register,
    logout,
    clearError: authContext.clearError,
    checkAuthStatus: authContext.checkAuthStatus,

    // Utility functions
    hasRole,
    isCurrentUser,
  };
};
