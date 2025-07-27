import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { router } from '../index';

// Mock the auth context with authenticated user
const mockAuthContext = {
  user: { id: '1', username: 'testuser', email: 'test@example.com' },
  isAuthenticated: true,
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

// Mock page components with navigation capabilities
vi.mock('../../pages', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
  RegisterPage: () => <div data-testid="register-page">Register Page</div>,
  Dashboard: () => {
    const { Link } = require('react-router-dom');
    return (
      <div data-testid="dashboard">
        <h1>Dashboard</h1>
        <Link to="/subjects" data-testid="nav-subjects">Go to Subjects</Link>
        <Link to="/performance" data-testid="nav-performance">Go to Performance</Link>
      </div>
    );
  },
  SubjectListPage: () => {
    const { Link, useNavigate } = require('react-router-dom');
    const navigate = useNavigate();
    return (
      <div data-testid="subject-list">
        <h1>Subject List</h1>
        <Link to="/subjects/1" data-testid="subject-link">Math Subject</Link>
        <button onClick={() => navigate(-1)} data-testid="back-button">Back</button>
      </div>
    );
  },
  SubjectDetailPage: () => {
    const { useParams, Link, useNavigate } = require('react-router-dom');
    const { subjectId } = useParams();
    const navigate = useNavigate();
    return (
      <div data-testid="subject-detail">
        <h1>Subject {subjectId}</h1>
        <Link to={`/subjects/${subjectId}/topics/1/questions`} data-testid="start-quiz">Start Quiz</Link>
        <button onClick={() => navigate(-1)} data-testid="back-button">Back</button>
      </div>
    );
  },
  QuestionPage: () => {
    const { useParams, useNavigate } = require('react-router-dom');
    const { subjectId, topicId } = useParams();
    const navigate = useNavigate();
    return (
      <div data-testid="question-page">
        <h1>Questions for Subject {subjectId}, Topic {topicId}</h1>
        <button onClick={() => navigate(-1)} data-testid="back-button">Back</button>
        <button onClick={() => navigate('/dashboard')} data-testid="home-button">Home</button>
      </div>
    );
  },
  PerformanceAnalysisPage: () => {
    const { useNavigate } = require('react-router-dom');
    const navigate = useNavigate();
    return (
      <div data-testid="performance">
        <h1>Performance Analysis</h1>
        <button onClick={() => navigate(-1)} data-testid="back-button">Back</button>
      </div>
    );
  },
  RecommendationsDemo: () => <div data-testid="recommendations">Recommendations</div>,
}));

vi.mock('../../pages/NotFoundPage', () => ({
  NotFoundPage: () => {
    const { useNavigate } = require('react-router-dom');
    const navigate = useNavigate();
    return (
      <div data-testid="not-found">
        <h1>404 Not Found</h1>
        <button onClick={() => navigate(-1)} data-testid="back-button">Back</button>
      </div>
    );
  },
}));

vi.mock('../../components/layout/Layout', () => ({
  Layout: ({ children }: { children?: React.ReactNode }) => {
    const { Outlet } = require('react-router-dom');
    return (
      <div data-testid="layout">
        {children || <Outlet />}
      </div>
    );
  },
}));

vi.mock('../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
  PublicRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="public-route">{children}</div>
  ),
}));

describe('Router Navigation and History', () => {
  const renderWithRouter = (initialEntries: string[] = ['/dashboard']) => {
    const testRouter = createMemoryRouter(router.routes, {
      initialEntries,
    });

    return render(
      <AuthProvider>
        <RouterProvider router={testRouter} />
      </AuthProvider>
    );
  };

  it('should support client-side navigation between routes', async () => {
    renderWithRouter(['/dashboard']);
    
    // Start at dashboard
    expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    
    // Navigate to subjects
    fireEvent.click(screen.getByTestId('nav-subjects'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-list')).toBeInTheDocument();
    });
  });

  it('should support navigation with URL parameters', async () => {
    renderWithRouter(['/dashboard']);
    
    // Navigate to subjects
    fireEvent.click(screen.getByTestId('nav-subjects'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-list')).toBeInTheDocument();
    });
    
    // Navigate to specific subject
    fireEvent.click(screen.getByTestId('subject-link'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-detail')).toBeInTheDocument();
      expect(screen.getByText('Subject 1')).toBeInTheDocument();
    });
  });

  it('should support nested route navigation', async () => {
    renderWithRouter(['/subjects/1']);
    
    expect(screen.getByTestId('subject-detail')).toBeInTheDocument();
    
    // Navigate to nested question route
    fireEvent.click(screen.getByTestId('start-quiz'));
    
    await waitFor(() => {
      expect(screen.getByTestId('question-page')).toBeInTheDocument();
      expect(screen.getByText('Questions for Subject 1, Topic 1')).toBeInTheDocument();
    });
  });

  it('should support back button navigation', async () => {
    renderWithRouter(['/dashboard']);
    
    // Navigate to subjects
    fireEvent.click(screen.getByTestId('nav-subjects'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-list')).toBeInTheDocument();
    });
    
    // Navigate to specific subject
    fireEvent.click(screen.getByTestId('subject-link'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-detail')).toBeInTheDocument();
    });
    
    // Use back button
    fireEvent.click(screen.getByTestId('back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-list')).toBeInTheDocument();
    });
  });

  it('should support programmatic navigation', async () => {
    renderWithRouter(['/subjects/1/topics/1/questions']);
    
    expect(screen.getByTestId('question-page')).toBeInTheDocument();
    
    // Navigate programmatically to home
    fireEvent.click(screen.getByTestId('home-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('should handle navigation history correctly', async () => {
    renderWithRouter(['/dashboard']);
    
    // Navigate through multiple pages
    fireEvent.click(screen.getByTestId('nav-subjects'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-list')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('subject-link'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-detail')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('start-quiz'));
    
    await waitFor(() => {
      expect(screen.getByTestId('question-page')).toBeInTheDocument();
    });
    
    // Go back through history
    fireEvent.click(screen.getByTestId('back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-detail')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByTestId('back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('subject-list')).toBeInTheDocument();
    });
  });

  it('should handle 404 page with back navigation', async () => {
    renderWithRouter(['/dashboard', '/invalid-route']);
    
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    
    // Back button should work from 404 page
    fireEvent.click(screen.getByTestId('back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('should maintain navigation state across route changes', async () => {
    renderWithRouter(['/dashboard']);
    
    // Navigate to performance page
    fireEvent.click(screen.getByTestId('nav-performance'));
    
    await waitFor(() => {
      expect(screen.getByTestId('performance')).toBeInTheDocument();
    });
    
    // Back button should return to dashboard
    fireEvent.click(screen.getByTestId('back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });
});