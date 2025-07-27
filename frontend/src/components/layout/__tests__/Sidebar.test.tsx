import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';
import type { User } from '../../../types';

// Mock user data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Wrapper component for router
const RouterWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ 
  children, 
  initialEntries = ['/'] 
}) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
);

describe('Sidebar', () => {
  it('renders the EduAI brand and navigation items', () => {
    render(
      <RouterWrapper>
        <Sidebar currentPath="/dashboard" user={mockUser} />
      </RouterWrapper>
    );

    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.getByText('Learning Platform')).toBeInTheDocument();
    
    // Check navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  it('highlights the active route correctly', () => {
    render(
      <RouterWrapper initialEntries={['/subjects']}>
        <Sidebar currentPath="/subjects" user={mockUser} />
      </RouterWrapper>
    );

    const subjectsLink = screen.getByRole('link', { name: /subjects/i });
    expect(subjectsLink).toHaveClass('bg-primary-50', 'text-primary-700');
  });

  it('treats dashboard and root path as the same route', () => {
    render(
      <RouterWrapper initialEntries={['/']}>
        <Sidebar currentPath="/" user={mockUser} />
      </RouterWrapper>
    );

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink).toHaveClass('bg-primary-50', 'text-primary-700');
  });

  it('displays user information when user is provided', () => {
    render(
      <RouterWrapper>
        <Sidebar currentPath="/dashboard" user={mockUser} />
      </RouterWrapper>
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // User avatar initial
  });

  it('does not display user section when user is not provided', () => {
    render(
      <RouterWrapper>
        <Sidebar currentPath="/dashboard" />
      </RouterWrapper>
    );

    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument();
  });

  it('renders footer information', () => {
    render(
      <RouterWrapper>
        <Sidebar currentPath="/dashboard" user={mockUser} />
      </RouterWrapper>
    );

    expect(screen.getByText('© 2024 EduAI Platform')).toBeInTheDocument();
    expect(screen.getByText('Powered by AI')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <RouterWrapper>
        <Sidebar currentPath="/dashboard" user={mockUser} className="custom-class" />
      </RouterWrapper>
    );

    const sidebar = container.firstChild as HTMLElement;
    expect(sidebar).toHaveClass('custom-class');
  });

  it('shows navigation item descriptions', () => {
    render(
      <RouterWrapper>
        <Sidebar currentPath="/dashboard" user={mockUser} />
      </RouterWrapper>
    );

    expect(screen.getByText('Overview and quick access')).toBeInTheDocument();
    expect(screen.getByText('Browse available subjects and topics')).toBeInTheDocument();
    expect(screen.getByText('Take AI-generated quizzes')).toBeInTheDocument();
    expect(screen.getByText('View your learning analytics')).toBeInTheDocument();
    expect(screen.getByText('Personalized learning resources')).toBeInTheDocument();
  });

  it('handles partial path matching for nested routes', () => {
    render(
      <RouterWrapper initialEntries={['/subjects/math']}>
        <Sidebar currentPath="/subjects/math" user={mockUser} />
      </RouterWrapper>
    );

    const subjectsLink = screen.getByRole('link', { name: /subjects/i });
    expect(subjectsLink).toHaveClass('bg-primary-50', 'text-primary-700');
  });
});