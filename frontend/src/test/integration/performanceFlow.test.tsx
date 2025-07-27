import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../contexts/AuthContext';
import { Dashboard } from '../../pages/Dashboard';
import { PerformanceAnalysis } from '../../pages/PerformanceAnalysis';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
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

describe('Performance Flow Integration', () => {
  beforeEach(() => {
    // Mock authenticated user
    localStorage.setItem('auth_token', 'mock-jwt-token');
    vi.clearAllMocks();
  });

  it('should display performance overview on dashboard', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    // Should show performance metrics
    await waitFor(() => {
      expect(screen.getByText(/accuracy/i)).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument(); // Mock accuracy
    });

    // Should show recent performance
    expect(screen.getByText(/recent performance/i)).toBeInTheDocument();
  });

  it('should navigate to detailed performance analysis', async () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/view detailed analysis/i)).toBeInTheDocument();
    });

    // Click on detailed analysis link
    const detailedAnalysisLink = screen.getByText(/view detailed analysis/i);
    fireEvent.click(detailedAnalysisLink);

    // Should navigate to performance analysis page
    expect(mockNavigate).toHaveBeenCalledWith('/performance');
  });

  it('should display detailed performance analysis', async () => {
    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Wait for performance data to load
    await waitFor(() => {
      expect(screen.getByText(/performance analysis/i)).toBeInTheDocument();
    });

    // Should show performance charts
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Should show performance metrics
    expect(screen.getByText(/total questions/i)).toBeInTheDocument();
    expect(screen.getByText(/correct answers/i)).toBeInTheDocument();
    expect(screen.getByText(/accuracy rate/i)).toBeInTheDocument();
  });

  it('should display resource recommendations', async () => {
    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/performance analysis/i)).toBeInTheDocument();
    });

    // Should show recommendations section
    await waitFor(() => {
      expect(screen.getByText(/recommended resources/i)).toBeInTheDocument();
    });

    // Should show individual recommendations
    expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    expect(screen.getByText('Mathematics Textbook')).toBeInTheDocument();

    // Should show resource types
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.getByText('Book')).toBeInTheDocument();
  });

  it('should handle clicking on resource recommendations', async () => {
    // Mock window.open
    const mockOpen = vi.fn();
    window.open = mockOpen;

    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Wait for recommendations to load
    await waitFor(() => {
      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
    });

    // Click on a recommendation
    const recommendation = screen.getByText('Algebra Basics');
    fireEvent.click(recommendation);

    // Should open resource in new tab
    expect(mockOpen).toHaveBeenCalledWith(
      'https://youtube.com/watch?v=example',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('should filter performance data by subject', async () => {
    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/performance analysis/i)).toBeInTheDocument();
    });

    // Should show filter options
    const subjectFilter = screen.getByLabelText(/filter by subject/i);
    expect(subjectFilter).toBeInTheDocument();

    // Change filter
    fireEvent.change(subjectFilter, { target: { value: 'Mathematics' } });

    // Should update the displayed data
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });
  });

  it('should show performance trends over time', async () => {
    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText(/performance trends/i)).toBeInTheDocument();
    });

    // Should show chart with trend data
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();

    // Should show time period selector
    const timePeriodSelect = screen.getByLabelText(/time period/i);
    expect(timePeriodSelect).toBeInTheDocument();

    // Change time period
    fireEvent.change(timePeriodSelect, { target: { value: '30days' } });

    // Should update chart data
    await waitFor(() => {
      // Chart should re-render with new data
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('should handle performance analysis errors', async () => {
    // Mock error response
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Failed to load performance data'));

    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load performance data/i)).toBeInTheDocument();
    });

    // Should show retry button
    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeInTheDocument();

    // Click retry
    fireEvent.click(retryButton);

    // Should attempt to reload data
    await waitFor(() => {
      expect(screen.queryByText(/failed to load performance data/i)).not.toBeInTheDocument();
    });
  });

  it('should show loading states for performance data', async () => {
    render(
      <TestWrapper>
        <PerformanceAnalysis />
      </TestWrapper>
    );

    // Should show loading skeleton initially
    expect(screen.getByText(/loading performance data/i)).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByText(/loading performance data/i)).not.toBeInTheDocument();
      expect(screen.getByText(/performance analysis/i)).toBeInTheDocument();
    });
  });
});