import React from 'react';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom';
import AuthProvider from '../../contexts/AuthContext';
import { router } from '../index';
import { vi } from 'vitest';

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  clearError: vi.fn(),
  checkAuthStatus: vi.fn(),
};

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock page components
vi.mock('../../pages', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
  RegisterPage: () => <div data-testid="register-page">Register Page</div>,
  Dashboard: () => <div data-testid="dashboard">Dashboard</div>,
  SubjectListPage: () => <div data-testid="subject-list">Subject List</div>,
  SubjectDetailPage: () => <div data-testid="subject-detail">Subject Detail</div>,
  QuestionPage: () => <div data-testid="question-page">Question Page</div>,
  PerformanceAnalysisPage: () => <div data-testid="performance">Performance</div>,
  RecommendationsDemo: () => <div data-testid="recommendations">Recommendations</div>,
}));

vi.mock('../../pages/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found">404 Not Found</div>,
}));

vi.mock('../../components/layout/Layout', () => ({
  Layout: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="layout">
      {children || <Outlet />}
    </div>
  ),
}));

vi.mock('../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
  PublicRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-route">{children}</div>
  ),
}));

describe('Router Configuration', () => {
  const renderWithRouter = (initialEntries: string[] = ['/']) => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries,
    });

    return render(
      <AuthProvider>
        <RouterProvider router={testRouter} />
      </AuthProvider>
    );
  };

  it('should render login page for /login route', () => {
    renderWithRouter(['/login']);
    expect(screen.getByTestId('public-route')).toBeInTheDocument();
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('should render register page for /register route', () => {
    renderWithRouter(['/register']);
    expect(screen.getByTestId('public-route')).toBeInTheDocument();
    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });

  it('should redirect root path to dashboard', () => {
    renderWithRouter(['/']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('should render dashboard for /dashboard route', () => {
    renderWithRouter(['/dashboard']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
  });

  it('should render subjects page for /subjects route', () => {
    renderWithRouter(['/subjects']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('subject-list')).toBeInTheDocument();
  });

  it('should render subject detail page for /subjects/:subjectId route', () => {
    renderWithRouter(['/subjects/1']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('subject-detail')).toBeInTheDocument();
  });

  it('should render question page for nested route', () => {
    renderWithRouter(['/subjects/1/topics/2/questions']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('question-page')).toBeInTheDocument();
  });

  it('should render performance page for /performance route', () => {
    renderWithRouter(['/performance']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('performance')).toBeInTheDocument();
  });

  it('should render recommendations page for /recommendations route', () => {
    renderWithRouter(['/recommendations']);
    expect(screen.getByTestId('protected-route')).toBeInTheDocument();
    expect(screen.getByTestId('layout')).toBeInTheDocument();
    expect(screen.getByTestId('recommendations')).toBeInTheDocument();
  });

  it('should render 404 page for invalid routes', () => {
    renderWithRouter(['/invalid-route']);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
  });
});