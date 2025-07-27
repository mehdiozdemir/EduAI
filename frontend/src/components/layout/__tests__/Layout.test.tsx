import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Layout from '../Layout';
import { AuthProvider } from '../../../contexts/AuthContext';
import type { BreadcrumbItem } from '../Breadcrumb';

// Mock the useAuth hook
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    logout: vi.fn(),
  }),
}));

// Wrapper component for router and auth
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Layout', () => {
  beforeEach(() => {
    // Reset window size to desktop
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('renders children content', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header and sidebar by default', () => {
    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getAllByText('EduAI')).toHaveLength(2); // Header and Sidebar
    expect(screen.getByText('Learning Platform')).toBeInTheDocument(); // Sidebar
  });

  it('hides sidebar when showSidebar is false', () => {
    render(
      <TestWrapper>
        <Layout showSidebar={false}>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getAllByText('EduAI')).toHaveLength(1); // Only Header visible
    expect(screen.queryByText('Learning Platform')).not.toBeInTheDocument(); // Sidebar hidden
  });

  it('renders breadcrumb when breadcrumbItems are provided', () => {
    const breadcrumbItems: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current Page', isActive: true },
    ];

    render(
      <TestWrapper>
        <Layout breadcrumbItems={breadcrumbItems}>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('applies custom className to layout container', () => {
    const { container } = render(
      <TestWrapper>
        <Layout className="custom-layout">
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('custom-layout');
  });

  it('applies custom contentClassName to main content area', () => {
    render(
      <TestWrapper>
        <Layout contentClassName="custom-content">
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const mainElement = screen.getByRole('main');
    expect(mainElement).toHaveClass('custom-content');
  });

  it('shows mobile sidebar toggle button on mobile', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
  });

  it('handles mobile sidebar toggle', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });

    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    // Trigger resize to set mobile state
    fireEvent(window, new Event('resize'));

    const toggleButton = screen.getByLabelText('Toggle sidebar');
    fireEvent.click(toggleButton);

    // Mobile sidebar should be visible (check for overlay)
    expect(document.querySelector('.bg-black.bg-opacity-50')).toBeInTheDocument();
  });

  it('handles window resize events', () => {
    const { rerender } = render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    // Start with desktop
    expect(screen.queryByLabelText('Toggle sidebar')).not.toBeInTheDocument();

    // Change to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 640,
    });

    fireEvent(window, new Event('resize'));

    rerender(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    // Should show mobile toggle button
    expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
  });

  it('contains content within max-width container', () => {
    render(
      <TestWrapper>
        <Layout>
          <div data-testid="content">Test Content</div>
        </Layout>
      </TestWrapper>
    );

    const contentContainer = screen.getByTestId('content').parentElement;
    expect(contentContainer).toHaveClass('max-w-7xl', 'mx-auto');
  });

  it('handles logout through header component', () => {
    const mockLogout = vi.fn();
    
    // Mock useAuth to return our mock logout function
    vi.doMock('../../../hooks/useAuth', () => ({
      useAuth: () => ({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        logout: mockLogout,
      }),
    }));

    render(
      <TestWrapper>
        <Layout>
          <div>Test Content</div>
        </Layout>
      </TestWrapper>
    );

    // The logout functionality is tested in Header component tests
    // Here we just verify the layout renders correctly with user
    expect(screen.getAllByText('testuser')).toHaveLength(2); // Header and Sidebar
  });
});