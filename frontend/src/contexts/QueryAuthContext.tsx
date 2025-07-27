// Enhanced Authentication context using React Query for state management

import React, { createContext, useEffect, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useLogin, useRegister, useLogout } from '../hooks/queries/useAuthQueries';
import { cacheStrategies } from '../lib/cacheStrategies';
import { invalidationStrategies } from '../lib/queryInvalidation';
import type { User, LoginCredentials, RegisterData } from '../types';

// Auth context interface
interface QueryAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refetchUser: () => void;
}

// Create context
const QueryAuthContext = createContext<QueryAuthContextType | undefined>(undefined);

// Auth provider props
interface QueryAuthProviderProps {
  children: ReactNode;
}

// Enhanced Auth provider component using React Query
export const QueryAuthProvider: React.FC<QueryAuthProviderProps> = ({ children }) => {
  const queryClient = useQueryClient();
  
  // Use React Query hooks for auth state
  const { 
    data: user, 
    isLoading, 
    error: userError,
    refetch: refetchUser 
  } = useCurrentUser();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Derived state
  const isAuthenticated = !!user;
  const error = userError?.message || loginMutation.error?.message || 
                registerMutation.error?.message || logoutMutation.error?.message || null;

  // Warm cache after successful login
  useEffect(() => {
    if (user && !loginMutation.isPending && !registerMutation.isPending) {
      cacheStrategies.warmCache.afterLogin(user);
    }
  }, [user, loginMutation.isPending, registerMutation.isPending]);

  // Enhanced login function
  const login = async (credentials: LoginCredentials): Promise<User> => {
    try {
      const user = await loginMutation.mutateAsync(credentials);
      
      // Trigger cache warming
      cacheStrategies.warmCache.afterLogin(user);
      
      // Trigger auth invalidation strategy
      invalidationStrategies.auth.onLogin();
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced register function
  const register = async (userData: RegisterData): Promise<User> => {
    try {
      const user = await registerMutation.mutateAsync(userData);
      
      // Trigger cache warming
      cacheStrategies.warmCache.afterLogin(user);
      
      // Trigger auth invalidation strategy
      invalidationStrategies.auth.onLogin();
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Enhanced logout function
  const logout = async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      
      // Trigger logout invalidation strategy
      invalidationStrategies.auth.onLogout();
    } catch (error) {
      // Even if logout API fails, clear local state
      invalidationStrategies.auth.onLogout();
      throw error;
    }
  };

  // Context value
  const contextValue: QueryAuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    error,
    login,
    register,
    logout,
    refetchUser: () => refetchUser(),
  };

  return (
    <QueryAuthContext.Provider value={contextValue}>
      {children}
    </QueryAuthContext.Provider>
  );
};

// Export the context for use in hook
export { QueryAuthContext };
export type { QueryAuthContextType };