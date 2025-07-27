// Tests for useAuth hook

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useAuth } from '../useAuth';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { TokenManager } from '../../services/api';
import type { User } from '../../types';

// Mock dependencies
vi.mock('../../services/authService');
vi.mock('../../services/api');

const mockAuthService = vi.mocked(authService);
const mockTokenManager = vi.mocked(TokenManager);

// Test component using the hook
const TestComponent: React.FC = () => {
  const auth = useAuth();
  
  return (
    <div>
      <div data-testid="user">{auth.user?.username || 'null'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.isLoading.toString()}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <div data-testid="has-admin-role">{auth.hasRole('admin').toString()}</div>
      <div data-testid="is-current-user-1">{auth.isCurrentUser(1).toString()}</div>
      <div data-testid="is-current-user-2">{auth.isCurrentUser(2).toString()}</div>
      <button onClick={() => auth.login({ username: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={() => auth.register({ username: 'test', email: 'test@test.com', password: 'test' })}>
        Register
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.clearError()}>Clear Error</button>
      <button onClick={() => auth.checkAuthStatus()}>Check Auth</button>
    </div>
  );
};

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it('should provide auth state and functions', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    // Check that all functions are available
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Clear Error')).toBeInTheDocument();
    expect(screen.getByText('Check Auth')).toBeInTheDocument();
  });

  it('should handle login through hook', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    mockAuthService.login.mockImplementation(async (_credentials) => {
      // Simulate token storage that happens in real authService
      mockTokenManager.getToken.mockReturnValue('mock-token');
      return mockUser;
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'test',
      password: 'test',
    });
  });

  it('should handle register through hook', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    mockAuthService.register.mockImplementation(async (_userData) => {
      // Simulate token storage that happens in real authService
      mockTokenManager.getToken.mockReturnValue('mock-token');
      return mockUser;
    });

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    });
  });

  it('should handle logout through hook', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue();

    renderWithProvider(<TestComponent />);

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should check if user has role (returns false for now)', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('has-admin-role')).toHaveTextContent('false');
    });
  });

  it('should check if user is current user', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('is-current-user-1')).toHaveTextContent('true');
      expect(screen.getByTestId('is-current-user-2')).toHaveTextContent('false');
    });
  });

  it('should handle auth status check', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    renderWithProvider(<TestComponent />);

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Manually trigger auth check
    await act(async () => {
      screen.getByText('Check Auth').click();
    });

    // Wait for the manual check to complete
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
    
    expect(mockAuthService.getProfile).toHaveBeenCalledTimes(2); // Initial + manual check
  });

  it('should handle error clearing', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    const loginError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValue(loginError);

    renderWithProvider(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Trigger error
    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
    });

    // Clear error
    await act(async () => {
      screen.getByText('Clear Error').click();
    });

    expect(screen.getByTestId('error')).toHaveTextContent('null');
  });

  it('should handle login error and re-throw', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    const loginError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValue(loginError);

    const TestComponentWithErrorHandling: React.FC = () => {
      const auth = useAuth();
      const [localError, setLocalError] = React.useState<string | null>(null);
      
      const handleLogin = async () => {
        try {
          await auth.login({ username: 'test', password: 'test' });
        } catch (error: unknown) {
          setLocalError(error instanceof Error ? error.message : 'Unknown error');
        }
      };
      
      return (
        <div>
          <div data-testid="local-error">{localError || 'null'}</div>
          <button onClick={handleLogin}>Login</button>
        </div>
      );
    };

    renderWithProvider(<TestComponentWithErrorHandling />);

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('local-error')).toHaveTextContent('Invalid credentials');
    });
  });

  it('should handle register error and re-throw', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    const registerError = new Error('Username already exists');
    mockAuthService.register.mockRejectedValue(registerError);

    const TestComponentWithErrorHandling: React.FC = () => {
      const auth = useAuth();
      const [localError, setLocalError] = React.useState<string | null>(null);
      
      const handleRegister = async () => {
        try {
          await auth.register({ username: 'test', email: 'test@test.com', password: 'test' });
        } catch (error: unknown) {
          setLocalError(error instanceof Error ? error.message : 'Unknown error');
        }
      };
      
      return (
        <div>
          <div data-testid="local-error">{localError || 'null'}</div>
          <button onClick={handleRegister}>Register</button>
        </div>
      );
    };

    renderWithProvider(<TestComponentWithErrorHandling />);

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('local-error')).toHaveTextContent('Username already exists');
    });
  });

  it('should handle logout error and re-throw', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);
    const logoutError = new Error('Logout failed');
    mockAuthService.logout.mockRejectedValue(logoutError);

    const TestComponentWithErrorHandling: React.FC = () => {
      const auth = useAuth();
      const [localError, setLocalError] = React.useState<string | null>(null);
      
      const handleLogout = async () => {
        try {
          await auth.logout();
        } catch (error: unknown) {
          setLocalError(error instanceof Error ? error.message : 'Unknown error');
        }
      };
      
      return (
        <div>
          <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
          <div data-testid="local-error">{localError || 'null'}</div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      );
    };

    renderWithProvider(<TestComponentWithErrorHandling />);

    // Wait for initial auth
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('local-error')).toHaveTextContent('Logout failed');
      // Should still logout locally even if API call fails
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });
});