import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { MobileNavigation } from '../MobileNavigation';
import type { User } from '../../../types';

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MobileNavigation', () => {
  const mockOnLogout = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('EduAI')).not.toBeInTheDocument();
  });

  it('renders navigation when open', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.getByText('Learning Platform')).toBeInTheDocument();
  });

  it('renders navigation items', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('Recommendations')).toBeInTheDocument();
  });

  it('renders user information when user is provided', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Profile Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close navigation');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const backdrop = document.querySelector('.fixed.inset-0.bg-black');
    expect(backdrop).toBeInTheDocument();
    
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('calls onLogout when sign out is clicked', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when navigation item is clicked', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.click(dashboardLink);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('applies touch-friendly classes', () => {
    renderWithRouter(
      <MobileNavigation
        user={mockUser}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('touch-manipulation', 'min-h-[56px]');
  });

  it('renders without user information when user is not provided', () => {
    renderWithRouter(
      <MobileNavigation
        user={undefined}
        onLogout={mockOnLogout}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });
});