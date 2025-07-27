import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import App from '../../App';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock window.matchMedia for responsive tests
const mockMatchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

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

// Helper function to simulate different screen sizes
const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Update matchMedia to match the new viewport
  window.matchMedia = vi.fn().mockImplementation((query) => {
    const mediaQuery = mockMatchMedia(query);
    
    // Parse common media queries
    if (query.includes('max-width: 640px')) {
      mediaQuery.matches = width <= 640;
    } else if (query.includes('max-width: 768px')) {
      mediaQuery.matches = width <= 768;
    } else if (query.includes('max-width: 1024px')) {
      mediaQuery.matches = width <= 1024;
    } else if (query.includes('min-width: 768px')) {
      mediaQuery.matches = width >= 768;
    } else if (query.includes('min-width: 1024px')) {
      mediaQuery.matches = width >= 1024;
    }
    
    return mediaQuery;
  });

  // Trigger resize event
  window.dispatchEvent(new Event('resize'));
};

describe('Responsive Design Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear localStorage and reset viewport
    localStorage.clear();
    setViewport(1024, 768); // Default desktop size
    
    // Reset MSW handlers
    server.resetHandlers();
    
    // Mock successful authentication
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-jwt-token'
        });
      }),
      http.get('/api/subjects', () => {
        return HttpResponse.json([
          {
            id: 1,
            name: 'Mathematics',
            description: 'Mathematical concepts',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        ]);
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Mobile Responsive Design (320px - 640px)', () => {
    beforeEach(() => {
      setViewport(375, 667); // iPhone SE size
    });

    it('should display mobile navigation correctly', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Should show hamburger menu button on mobile
      const hamburgerButton = screen.getByLabelText(/toggle navigation/i);
      expect(hamburgerButton).toBeInTheDocument();

      // Navigation should be hidden initially
      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('hidden', 'md:block');

      // Click hamburger to open mobile menu
      await user.click(hamburgerButton);

      // Navigation should now be visible
      expect(navigation).not.toHaveClass('hidden');
      expect(screen.getByText(/subjects/i)).toBeVisible();
      expect(screen.getByText(/performance/i)).toBeVisible();
    });

    it('should stack form elements vertically on mobile', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should be on login page
      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });

      const loginForm = screen.getByRole('form');
      expect(loginForm).toBeInTheDocument();

      // Form should use mobile-friendly spacing
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(usernameInput).toHaveClass('w-full');
      expect(passwordInput).toHaveClass('w-full');

      // Button should be full width on mobile
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      expect(loginButton).toHaveClass('w-full');
    });

    it('should display cards in single column on mobile', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to subjects
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const subjectsLink = screen.getByText(/subjects/i);
      await user.click(subjectsLink);

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
      });

      // Subject cards should be in single column layout
      const subjectGrid = screen.getByTestId('subjects-grid');
      expect(subjectGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('should handle touch interactions properly', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Buttons should have appropriate touch target sizes (min 44px)
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const styles = window.getComputedStyle(button);
        const minHeight = parseInt(styles.minHeight) || parseInt(styles.height);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Tablet Responsive Design (641px - 1024px)', () => {
    beforeEach(() => {
      setViewport(768, 1024); // iPad size
    });

    it('should display tablet layout correctly', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Should show sidebar navigation on tablet
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).toBeVisible();
      expect(sidebar).not.toHaveClass('hidden');

      // Should not show hamburger menu on tablet
      const hamburgerButton = screen.queryByLabelText(/toggle navigation/i);
      expect(hamburgerButton).not.toBeInTheDocument();
    });

    it('should display cards in two columns on tablet', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to subjects
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const subjectsLink = screen.getByText(/subjects/i);
      await user.click(subjectsLink);

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
      });

      // Subject cards should be in two-column layout on tablet
      const subjectGrid = screen.getByTestId('subjects-grid');
      expect(subjectGrid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('should handle form layouts appropriately on tablet', async () => {
      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });

      // Form should be centered with appropriate width on tablet
      const loginForm = screen.getByRole('form');
      expect(loginForm).toHaveClass('max-w-md', 'mx-auto');
    });
  });

  describe('Desktop Responsive Design (1025px+)', () => {
    beforeEach(() => {
      setViewport(1440, 900); // Desktop size
    });

    it('should display full desktop layout', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Should show full sidebar navigation
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).toBeVisible();
      expect(sidebar).toHaveClass('w-64'); // Full width sidebar

      // Main content should have appropriate margins
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('ml-64'); // Margin for sidebar
    });

    it('should display cards in three columns on desktop', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to subjects
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const subjectsLink = screen.getByText(/subjects/i);
      await user.click(subjectsLink);

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
      });

      // Subject cards should be in three-column layout on desktop
      const subjectGrid = screen.getByTestId('subjects-grid');
      expect(subjectGrid).toHaveClass('lg:grid-cols-3', 'xl:grid-cols-4');
    });

    it('should handle large screen layouts properly', async () => {
      setViewport(1920, 1080); // Large desktop

      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Content should be contained and centered on very large screens
      const container = screen.getByTestId('main-container');
      expect(container).toHaveClass('max-w-7xl', 'mx-auto');
    });
  });

  describe('Responsive Navigation', () => {
    it('should toggle mobile navigation correctly', async () => {
      setViewport(375, 667); // Mobile size
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const hamburgerButton = screen.getByLabelText(/toggle navigation/i);
      const navigation = screen.getByRole('navigation');

      // Initially hidden
      expect(navigation).toHaveClass('hidden');

      // Open menu
      await user.click(hamburgerButton);
      expect(navigation).not.toHaveClass('hidden');

      // Close menu
      await user.click(hamburgerButton);
      expect(navigation).toHaveClass('hidden');
    });

    it('should close mobile menu when clicking outside', async () => {
      setViewport(375, 667); // Mobile size
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const hamburgerButton = screen.getByLabelText(/toggle navigation/i);
      const navigation = screen.getByRole('navigation');
      const mainContent = screen.getByRole('main');

      // Open menu
      await user.click(hamburgerButton);
      expect(navigation).not.toHaveClass('hidden');

      // Click outside menu
      await user.click(mainContent);
      expect(navigation).toHaveClass('hidden');
    });

    it('should handle navigation on different screen sizes', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Start on desktop
      setViewport(1440, 900);
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      let navigation = screen.getByRole('navigation');
      expect(navigation).toBeVisible();
      expect(screen.queryByLabelText(/toggle navigation/i)).not.toBeInTheDocument();

      // Resize to mobile
      setViewport(375, 667);
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        const hamburgerButton = screen.getByLabelText(/toggle navigation/i);
        expect(hamburgerButton).toBeInTheDocument();
      });

      navigation = screen.getByRole('navigation');
      expect(navigation).toHaveClass('hidden');

      // Resize back to desktop
      setViewport(1440, 900);
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        navigation = screen.getByRole('navigation');
        expect(navigation).toBeVisible();
        expect(screen.queryByLabelText(/toggle navigation/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Responsive Forms and Inputs', () => {
    it('should adapt form layouts to screen size', async () => {
      // Test mobile form layout
      setViewport(375, 667);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });

      let loginForm = screen.getByRole('form');
      expect(loginForm).toHaveClass('w-full', 'px-4');

      // Test desktop form layout
      setViewport(1440, 900);
      window.dispatchEvent(new Event('resize'));

      await waitFor(() => {
        loginForm = screen.getByRole('form');
        expect(loginForm).toHaveClass('max-w-md', 'mx-auto');
      });
    });

    it('should handle input focus and keyboard navigation on mobile', async () => {
      setViewport(375, 667);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Focus should work properly
      usernameInput.focus();
      expect(document.activeElement).toBe(usernameInput);

      // Tab navigation should work
      fireEvent.keyDown(usernameInput, { key: 'Tab' });
      expect(document.activeElement).toBe(passwordInput);
    });
  });

  describe('Responsive Content and Images', () => {
    it('should handle responsive images correctly', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Check if images have responsive classes
      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveClass('w-full', 'h-auto');
      });
    });

    it('should handle text scaling appropriately', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Headings should have responsive text sizes
      const headings = screen.getAllByRole('heading');
      headings.forEach(heading => {
        const classes = heading.className;
        expect(classes).toMatch(/text-(sm|base|lg|xl|2xl|3xl|4xl)/);
      });
    });
  });

  describe('Cross-Browser Compatibility', () => {
    it('should handle different user agents', async () => {
      // Mock different user agents
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
      ];

      for (const userAgent of userAgents) {
        Object.defineProperty(navigator, 'userAgent', {
          value: userAgent,
          configurable: true
        });

        render(
          <TestWrapper>
            <App />
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(/sign in/i)).toBeInTheDocument();
        });

        // Basic functionality should work across browsers
        const usernameInput = screen.getByLabelText(/username/i);
        expect(usernameInput).toBeInTheDocument();
        expect(usernameInput).toBeEnabled();
      }
    });

    it('should handle CSS feature detection', async () => {
      // Mock CSS.supports for feature detection
      global.CSS = {
        supports: vi.fn().mockImplementation((property: string, value: string) => {
          // Mock support for modern CSS features
          if (property === 'display' && value === 'grid') return true;
          if (property === 'display' && value === 'flex') return true;
          return false;
        })
      } as any;

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      });

      // Should use modern layout features when supported
      expect(global.CSS.supports).toHaveBeenCalled();
    });
  });

  describe('Performance on Different Devices', () => {
    it('should handle slow connections gracefully', async () => {
      // Mock slow network
      server.use(
        http.get('/api/subjects', async () => {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return HttpResponse.json([]);
        })
      );

      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to subjects
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      const subjectsLink = screen.getByText(/subjects/i);
      await user.click(subjectsLink);

      // Should show loading state
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Should eventually load content
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should optimize for touch devices', async () => {
      setViewport(375, 667);
      
      // Mock touch device
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 5,
        configurable: true
      });

      localStorage.setItem('auth_token', 'mock-jwt-token');

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });

      // Interactive elements should have appropriate touch targets
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(Math.min(rect.width, rect.height)).toBeGreaterThanOrEqual(44);
      });
    });
  });
});