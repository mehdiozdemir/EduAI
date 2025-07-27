import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import PerformanceAnalysisPage from '../PerformanceAnalysis';
import { AuthContext } from '../../contexts/AuthContext';
import { performanceService } from '../../services/performanceService';
import { subjectService } from '../../services/subjectService';
import type { User, Subject, PerformanceAnalysis, PerformanceData } from '../../types';

// Mock the services
vi.mock('../../services/performanceService');
vi.mock('../../services/subjectService');
const mockPerformanceService = performanceService as any;
const mockSubjectService = subjectService as any;

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

const mockSubjects: Subject[] = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Math subjects',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Physics subjects',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockPerformanceData: PerformanceAnalysis[] = [
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
];

const mockTrendsData: PerformanceData[] = [
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
];

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
        <PerformanceAnalysisPage />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('PerformanceAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);
    mockPerformanceService.getUserPerformance.mockResolvedValue(mockPerformanceData);
    mockPerformanceService.getPerformanceTrends.mockResolvedValue(mockTrendsData);
  });

  it('renders loading state initially', () => {
    mockSubjectService.getSubjects.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithAuth();

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders performance analysis page successfully', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Performance Analysis')).toBeInTheDocument();
    });

    expect(screen.getByText('Detailed insights into your learning progress')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
  });

  it('renders filters section correctly', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Filters & Options')).toBeInTheDocument();
    });

    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Time Period')).toBeInTheDocument();
  });

  it('renders chart type buttons correctly', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Line Chart')).toBeInTheDocument();
    });

    expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Doughnut Chart')).toBeInTheDocument();
    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('renders performance trends chart', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Performance Trends')).toBeInTheDocument();
    });

    expect(screen.getByTestId('performance-chart')).toBeInTheDocument();
  });

  it('renders performance history table', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Performance History')).toBeInTheDocument();
    });

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Subject')).toBeInTheDocument();
    expect(screen.getByText('Topic')).toBeInTheDocument();
    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
    expect(screen.getByText('Weakness Level')).toBeInTheDocument();
  });

  it('displays performance data in table correctly', async () => {
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // total_questions
    });

    expect(screen.getByText('8')).toBeInTheDocument(); // correct_answers
    expect(screen.getByText('15')).toBeInTheDocument(); // total_questions for second row
    expect(screen.getByText('12')).toBeInTheDocument(); // correct_answers for second row
  });

  it('handles subject filter change', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('All Subjects')).toBeInTheDocument();
    });

    const subjectSelect = screen.getByDisplayValue('All Subjects');
    await user.selectOptions(subjectSelect, '1');

    await waitFor(() => {
      expect(mockPerformanceService.getUserPerformance).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          subject_id: 1,
        })
      );
    });
  });

  it('handles date filter changes', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('From Date')).toBeInTheDocument();
    });

    const fromDateInput = screen.getByLabelText('From Date');
    await user.type(fromDateInput, '2024-01-01');

    await waitFor(() => {
      expect(mockPerformanceService.getUserPerformance).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          date_from: '2024-01-01',
        })
      );
    });
  });

  it('handles chart type changes', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Bar Chart')).toBeInTheDocument();
    });

    const barChartButton = screen.getByText('Bar Chart');
    await user.click(barChartButton);

    expect(screen.getByTestId('performance-chart')).toHaveAttribute('data-type', 'bar');
  });

  it('handles time period changes', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Last Month')).toBeInTheDocument();
    });

    const timePeriodSelect = screen.getByDisplayValue('Last Month');
    await user.selectOptions(timePeriodSelect, 'week');

    await waitFor(() => {
      expect(mockPerformanceService.getPerformanceTrends).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          period: 'week',
        })
      );
    });
  });

  it('handles sorting by clicking column headers', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    const dateHeader = screen.getByText('Date');
    await user.click(dateHeader);

    await waitFor(() => {
      expect(mockPerformanceService.getUserPerformance).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          sort_by: 'created_at',
          sort_order: 'asc',
        })
      );
    });
  });

  it('handles pagination changes', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    });

    const perPageSelect = screen.getByDisplayValue('10');
    await user.selectOptions(perPageSelect, '25');

    await waitFor(() => {
      expect(mockPerformanceService.getUserPerformance).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          per_page: 25,
          page: 1,
        })
      );
    });
  });

  it('handles clear filters', async () => {
    const user = userEvent.setup();
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    // First set some filters
    const subjectSelect = screen.getByDisplayValue('All Subjects');
    await user.selectOptions(subjectSelect, '1');

    // Then clear filters
    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);

    await waitFor(() => {
      expect(mockPerformanceService.getUserPerformance).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          subject_id: undefined,
        })
      );
    });
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(['test data'], { type: 'text/csv' });
    mockPerformanceService.exportPerformanceData.mockResolvedValue(mockBlob);

    // Mock URL.createObjectURL and related methods
    const mockCreateObjectURL = vi.fn(() => 'mock-url');
    const mockRevokeObjectURL = vi.fn();
    Object.defineProperty(window, 'URL', {
      value: {
        createObjectURL: mockCreateObjectURL,
        revokeObjectURL: mockRevokeObjectURL,
      },
    });

    // Mock document.createElement and appendChild
    const mockAnchor = {
      style: { display: '' },
      href: '',
      download: '',
      click: vi.fn(),
    };
    const mockCreateElement = vi.fn(() => mockAnchor);
    const mockAppendChild = vi.fn();
    const mockRemoveChild = vi.fn();
    Object.defineProperty(document, 'createElement', { value: mockCreateElement });
    Object.defineProperty(document.body, 'appendChild', { value: mockAppendChild });
    Object.defineProperty(document.body, 'removeChild', { value: mockRemoveChild });

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export CSV');
    await user.click(exportButton);

    await waitFor(() => {
      expect(mockPerformanceService.exportPerformanceData).toHaveBeenCalledWith(
        mockUser.id,
        'csv',
        {}
      );
    });

    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
    expect(mockAnchor.click).toHaveBeenCalled();
  });

  it('handles error state correctly', async () => {
    mockSubjectService.getSubjects.mockRejectedValue(new Error('API Error'));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('Error Loading Data')).toBeInTheDocument();
    });

    expect(screen.getByText('Failed to load performance data. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('shows empty state when no performance data', async () => {
    mockPerformanceService.getUserPerformance.mockResolvedValue([]);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByText('No performance data found for the selected filters.')).toBeInTheDocument();
    });

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('does not fetch data when user is not available', () => {
    renderWithAuth(null);

    expect(mockSubjectService.getSubjects).not.toHaveBeenCalled();
    expect(mockPerformanceService.getUserPerformance).not.toHaveBeenCalled();
    expect(mockPerformanceService.getPerformanceTrends).not.toHaveBeenCalled();
  });
});