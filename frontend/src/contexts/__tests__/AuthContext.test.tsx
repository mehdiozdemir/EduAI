// Tests for AuthContext

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthProvider } from '../AuthContext';
import { useAuthContext } from '../../hooks/useAuthContext';
import { authService } from '../../services/authService';
import { TokenManager } from '../../services/api';
import type { User } from '../../types';

// Mock dependencies
vi.mock('../../services/authService');
vi.mock('../../services/api');

const mockAuthService = vi.mocked(authService);
const mockTokenManager = vi.mocked(TokenManager);

// Test component to access context
const TestComponent: React.FC = () => {
  const auth = useAuthContext();
  
  return (
    <div>
      <div data-testid="user">{auth.user?.username || 'null'}</div>
      <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="loading">{auth.isLoading.toString()}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <button onClick={() => auth.login({ username: 'test', password: 'test' })}>
        Login
      </button>
      <button onClick={() => auth.register({ username: 'test', email: 'test@test.com', password: 'test' })}>
        Register
      </button>
      <button onClick={() => auth.logout()}>Logout</button>
      <button onClick={() => auth.clearError()}>Clear Error</button>
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

describe('AuthContext', () => {
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should provide initial state', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  it('should check auth status on mount with valid token', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockAuthService.getProfile).toHaveBeenCalled();
  });

  it('should handle login successfully', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    mockAuthService.login.mockImplementation(async (_credentials) => {
      // Simulate token storage that happens in real authService
      mockTokenManager.getToken.mockReturnValue('mock-token');
      return mockUser;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockAuthService.login).toHaveBeenCalledWith({
      username: 'test',
      password: 'test',
    });
  });

  it('should handle login error', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    const loginError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValue(loginError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('should handle register successfully', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    mockAuthService.register.mockImplementation(async (_userData) => {
      // Simulate token storage that happens in real authService
      mockTokenManager.getToken.mockReturnValue('mock-token');
      return mockUser;
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockAuthService.register).toHaveBeenCalledWith({
      username: 'test',
      email: 'test@test.com',
      password: 'test',
    });
  });

  it('should handle logout', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);
    mockAuthService.logout.mockResolvedValue();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial auth check
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockTokenManager.removeToken).toHaveBeenCalled();
  });

  it('should clear error', async () => {
    mockTokenManager.getToken.mockReturnValue(null);
    const loginError = new Error('Invalid credentials');
    mockAuthService.login.mockRejectedValue(loginError);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

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

  it('should handle invalid token on mount', async () => {
    mockTokenManager.getToken.mockReturnValue('invalid-token');
    mockAuthService.getProfile.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(mockTokenManager.removeToken).toHaveBeenCalled();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuthContext must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });
});