import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Header from '../Header';
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
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Header', () => {
  const mockOnLogout = vi.fn();

  beforeEach(() => {
    mockOnLogout.mockClear();
  });

  it('renders the EduAI brand logo and name', () => {
    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.getByText('EA')).toBeInTheDocument();
  });

  it('renders navigation links on desktop', () => {
    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /subjects/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /performance/i })).toBeInTheDocument();
  });

  it('displays user information when user is provided', () => {
    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument(); // User avatar initial
  });

  it('opens user menu when user avatar is clicked', async () => {
    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    const userButton = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(userButton);

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
  });

  it('calls onLogout when sign out is clicked', async () => {
    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    // Open user menu
    const userButton = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(userButton);

    // Click sign out
    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
    });

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('opens mobile menu when hamburger button is clicked', async () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });

    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    const mobileMenuButton = screen.getByRole('button', { name: /open main menu/i });
    fireEvent.click(mobileMenuButton);

    await waitFor(() => {
      // Check if mobile navigation links are visible
      const mobileLinks = screen.getAllByRole('link', { name: /dashboard/i });
      expect(mobileLinks.length).toBeGreaterThan(1); // Desktop + mobile versions
    });
  });

  it('handles logout error gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnLogout.mockRejectedValue(new Error('Logout failed'));

    render(
      <RouterWrapper>
        <Header user={mockUser} onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    // Open user menu and click sign out
    const userButton = screen.getByRole('button', { name: /testuser/i });
    fireEvent.click(userButton);

    await waitFor(() => {
      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);
    });

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });

  it('renders without user when user is not provided', () => {
    render(
      <RouterWrapper>
        <Header onLogout={mockOnLogout} />
      </RouterWrapper>
    );

    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.queryByText('testuser')).not.toBeInTheDocument();
  });
});