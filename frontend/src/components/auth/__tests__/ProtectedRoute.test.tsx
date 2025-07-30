// Tests for ProtectedRoute component

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProtectedRoute, PublicRoute } from '../ProtectedRoute';
import AuthProvider from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';
import { TokenManager } from '../../../services/api';
import type { User } from '../../../types';

// Mock dependencies
vi.mock('../../../services/authService');
vi.mock('../../../services/api');

const mockAuthService = vi.mocked(authService);
const mockTokenManager = vi.mocked(TokenManager);

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Test components
const ProtectedContent: React.FC = () => <div>Protected Content</div>;
const PublicContent: React.FC = () => <div>Public Content</div>;
const LoginPage: React.FC = () => <div>Login Page</div>;
const DashboardPage: React.FC = () => <div>Dashboard Page</div>;

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries: string[] = ['/']
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/protected" element={component} />
          <Route path="/" element={component} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
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

  it('should show loading spinner while checking auth', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    // Delay the profile response to test loading state
    mockAuthService.getProfile.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
    );

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    );

    // Should show loading spinner initially
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

    // Wait for auth check to complete
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should render children when user is authenticated', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    renderWithRouter(
      <ProtectedRoute>
        <ProtectedContent />
      </ProtectedRoute>,
      ['/protected']
    );

    await waitFor(() => {
      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('should redirect to custom path when specified', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    renderWithRouter(
      <ProtectedRoute redirectTo="/custom-login">
        <ProtectedContent />
      </ProtectedRoute>,
      ['/protected']
    );

    await waitFor(() => {
      // Since we don't have a /custom-login route, it should not render anything
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  it('should allow access when requireAuth is false', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    renderWithRouter(
      <ProtectedRoute requireAuth={false}>
        <PublicContent />
      </ProtectedRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  it('should redirect authenticated users away from public routes', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    renderWithRouter(
      <ProtectedRoute requireAuth={false}>
        <PublicContent />
      </ProtectedRoute>,
      ['/']
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    });
  });
});

describe('PublicRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  it('should render children when user is not authenticated', async () => {
    mockTokenManager.getToken.mockReturnValue(null);

    renderWithRouter(
      <PublicRoute>
        <PublicContent />
      </PublicRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });
  });

  it('should redirect to dashboard when user is authenticated', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    renderWithRouter(
      <PublicRoute>
        <PublicContent />
      </PublicRoute>
    );

    await waitFor(() => {
      expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
    });
  });

  it('should redirect to custom path when specified', async () => {
    mockTokenManager.getToken.mockReturnValue('valid-token');
    mockAuthService.getProfile.mockResolvedValue(mockUser);

    renderWithRouter(
      <PublicRoute redirectTo="/custom-dashboard">
        <PublicContent />
      </PublicRoute>
    );

    await waitFor(() => {
      // Since we don't have a /custom-dashboard route, it should not render anything
      expect(screen.queryByText('Public Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
    });
  });
});