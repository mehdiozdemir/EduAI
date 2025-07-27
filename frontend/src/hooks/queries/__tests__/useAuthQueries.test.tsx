import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCurrentUser, useLogin, useRegister, useLogout } from '../useAuthQueries';
import { authService } from '../../../services/authService';
import type { User, LoginCredentials, RegisterData } from '../../../types';

// Mock the auth service
vi.mock('../../../services/authService');
const mockAuthService = authService as any;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('useAuthQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCurrentUser', () => {
    it('should fetch current user successfully', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should handle getCurrentUser error', async () => {
      const error = new Error('Unauthorized');
      mockAuthService.getCurrentUser.mockRejectedValue(error);

      const { result } = renderHook(() => useCurrentUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useLogin', () => {
    it('should login successfully', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'password123',
      };
      
      mockAuthService.login.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(credentials);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
    });

    it('should handle login error', async () => {
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      
      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(credentials);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('useRegister', () => {
    it('should register successfully', async () => {
      const userData: RegisterData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };
      
      mockAuthService.register.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(userData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockUser);
      expect(mockAuthService.register).toHaveBeenCalledWith(userData);
    });
  });

  describe('useLogout', () => {
    it('should logout successfully', async () => {
      mockAuthService.logout.mockResolvedValue();

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockAuthService.logout).toHaveBeenCalledTimes(1);
    });
  });
});