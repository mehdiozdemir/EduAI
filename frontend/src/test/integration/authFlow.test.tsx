import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { Dashboard } from '../../pages/Dashboard';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Authentication Flow Integration', () => {
  it('should complete login flow successfully', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill login form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(loginButton);

    // Wait for successful login
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  it('should show error for invalid login credentials', async () => {
    render(
      <TestWrapper>
        <LoginPage />
      </TestWrapper>
    );

    // Fill login form with invalid credentials
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('should complete registration flow successfully', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Fill registration form
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    // Wait for successful registration
    await waitFor(() => {
      expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
    });
  });

  it('should validate password confirmation in registration', async () => {
    render(
      <TestWrapper>
        <RegisterPage />
      </TestWrapper>
    );

    // Fill registration form with mismatched passwords
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
    fireEvent.click(registerButton);

    // Wait for validation error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should protect routes when not authenticated', async () => {
    render(
      <TestWrapper>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should redirect to login or show login prompt
    await waitFor(() => {
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    });
  });

  it('should allow access to protected routes when authenticated', async () => {
    // Mock authenticated state
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    // Mock localStorage to have token
    localStorage.setItem('auth_token', 'mock-jwt-token');

    render(
      <TestWrapper>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Should show dashboard content
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });

  it('should handle logout flow', async () => {
    // Mock authenticated state
    localStorage.setItem('auth_token', 'mock-jwt-token');

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Find and click logout button
    const logoutButton = screen.getByText(/logout/i);
    fireEvent.click(logoutButton);

    // Should clear token and redirect
    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
    });
  });
});