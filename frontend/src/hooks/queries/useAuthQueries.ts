import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../lib/queryClient';
import type { LoginCredentials, RegisterData, User } from '../../types';

// Get current user query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 10 * 60 * 1000, // 10 minutes - user data doesn't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: false, // Don't retry auth failures
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (user: User) => {
      // Update user cache
      queryClient.setQueryData(queryKeys.auth.user, user);
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
    },
    onError: () => {
      // Clear user cache on login failure
      queryClient.removeQueries({ queryKey: queryKeys.auth.user });
    },
  });
};

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: RegisterData) => authService.register(userData),
    onSuccess: (user: User) => {
      // Update user cache
      queryClient.setQueryData(queryKeys.auth.user, user);
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });
};