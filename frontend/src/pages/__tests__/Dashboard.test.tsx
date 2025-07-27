import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import { AuthContext } from '../../contexts/AuthContext';
import { performanceService } from '../../services/performanceService';
import type { User } from '../../types';

// Mock the performance service
vi.mock('../../services/performanceService');
const mockPerformanceService = performanceService as any;

// Mock the PerformanceChart component
vi.mock('../../components/features/PerformanceChart', () => ({
  PerformanceChart: ({ data, type, title }: any) => (
    <div data-testid="performance-chart" data-type={type} data-title={title}>
      Performance Chart ({data.length} data points)
    </div>
  ),
}));

const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockDashboardData = {
  overall_stats: {
    total_questions: 150,
    total_correct: 120,
    overall_accuracy: 80.0,
    total_sessions: 15,
  },
  recent_performance: [
    {
      id: 1,
      user_id: 1,
      subject_id: 1,
      topic_id: 1,
      total_questions: 10,
      correct_answers: 8,
      accuracy: 80.0,
      weakness_level: 3,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      user_id: 1,
      subject_id: 2,
      topic_id: 2,
      total_questions: 15,
      correct_answers: 12,
      accuracy: 80.0,
      weakness_level: 2,
      created_at: '2024-01-02T00:00:00Z',
    },
  ],
  subject_breakdown: [
    {
      subject_name: 'Mathematics',
      accuracy: 85.0,
      question_count: 50,
    },
    {
      subject_name: 'Physics',
      accuracy: 75.0,
      question_count: 40,
    },
  ],
  weakness_areas: [
    {
      topic_name: 'Algebra',
      subject_name: 'Mathematics',
      weakness_level: 7,
      recommendation_count: 3,
    },
    {
      topic_name: 'Mechanics',
      subject_name: 'Physics',
      weakness_level: 6,
      recommendation_count: 2,
    },
  ],
  progress_chart: [
    {
      date: '2024-01-01',
      accuracy: 80,
      subject: 'Mathematics',
      topic: 'Algebra',
    },
    {
      date: '2024-01-02',
      accuracy: 85,
      subject: 'Physics',
      topic: 'Mechanics',
    },
  ],
};

const renderWithAuth = (user: User | null = mockUser) => {
  const mockAuthValue = {
    user,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    error: null,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthValue}>
        <Dashboard />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockPerformanceService.getDashboardData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithAuth();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders dashboard with data successfully', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome back, testuser!')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument(); // Total questions
    expect(screen.getByText('120')).toBeInTheDocument(); // Total correct
    expect(screen.getByText('80.0%')).toBeInTheDocument(); // Overall accuracy
    expect(screen.getByText('15')).toBeInTheDocument(); // Total sessions
  });

  it('renders overall stats cards correctly', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Total Questions')).toBeInTheDocument();
    });

    expect(screen.getByText('Correct Answers')).toBeInTheDocument();
    expect(screen.getByText('Overall Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
  });

  it('renders performance charts', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Performance Trend')).toBeInTheDocument();
    });

    expect(screen.getByText('Subject Performance')).toBeInTheDocument();
    expect(screen.getAllByTestId('performance-chart')).toHaveLength(2);
  });

  it('renders subject breakdown table', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Subject Breakdown')).toBeInTheDocument();
    });

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('85.0%')).toBeInTheDocument();
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('renders weakness areas when available', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Areas for Improvement')).toBeInTheDocument();
    });

    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('Mechanics')).toBeInTheDocument();
    expect(screen.getByText('Weakness Level: 7/10')).toBeInTheDocument();
    expect(screen.getByText('3 recommendations')).toBeInTheDocument();
  });

  it('renders recent performance section', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Recent Performance')).toBeInTheDocument();
    });

    expect(screen.getByText('8/10 correct')).toBeInTheDocument();
    expect(screen.getByText('12/15 correct')).toBeInTheDocument();
  });

  it('handles error state correctly', async () => {
    mockPerformanceService.getDashboardData.mockRejectedValue(new Error('API Error'));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load dashboard data. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('handles no data state correctly', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(null as any);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });

    expect(screen.getByText('Start taking quizzes to see your performance data.')).toBeInTheDocument();
    expect(screen.getByText('Browse Subjects')).toBeInTheDocument();
  });

  it('does not render weakness areas when empty', async () => {
    const dataWithoutWeakness = {
      ...mockDashboardData,
      weakness_areas: [],
    };
    mockPerformanceService.getDashboardData.mockResolvedValue(dataWithoutWeakness);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.queryByText('Areas for Improvement')).not.toBeInTheDocument();
  });

  it('does not render recent performance when empty', async () => {
    const dataWithoutRecent = {
      ...mockDashboardData,
      recent_performance: [],
    };
    mockPerformanceService.getDashboardData.mockResolvedValue(dataWithoutRecent);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    expect(screen.queryByText('Recent Performance')).not.toBeInTheDocument();
  });

  it('calls getDashboardData with correct user ID', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(mockPerformanceService.getDashboardData).toHaveBeenCalledWith(mockUser.id);
    });
  });

  it('does not fetch data when user is not available', () => {
    renderWithAuth(null);

    expect(mockPerformanceService.getDashboardData).not.toHaveBeenCalled();
  });

  it('renders navigation links correctly', async () => {
    mockPerformanceService.getDashboardData.mockResolvedValue(mockDashboardData);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('View Detailed Analysis')).toBeInTheDocument();
    });

    const detailedAnalysisLink = screen.getByText('View Detailed Analysis').closest('a');
    expect(detailedAnalysisLink).toHaveAttribute('href', '/performance');
  });
});