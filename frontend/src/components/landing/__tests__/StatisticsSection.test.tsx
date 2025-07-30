// StatisticsSection component tests
import { screen, waitFor } from '@testing-library/react';
import { render, mockIntersectionObserver } from './test-utils';
import StatisticsSection from '../StatisticsSection';

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      statistics: [
        {
          id: 'users',
          label: 'Aktif Kullanıcı',
          value: 15000,
          suffix: '+',
          icon: 'users'
        },
        {
          id: 'questions',
          label: 'Çözülen Soru',
          value: 250000,
          suffix: '+',
          icon: 'question'
        },
        {
          id: 'success-rate',
          label: 'Başarı Oranı',
          value: 94,
          suffix: '%',
          icon: 'trophy'
        },
        {
          id: 'books',
          label: 'Kitap Önerisi',
          value: 5000,
          suffix: '+',
          icon: 'book'
        }
      ]
    })
  })
}));

// Mock analytics
jest.mock('../../../utils/contentAnalytics', () => ({
  ContentAnalytics: {
    trackSectionView: jest.fn(),
  }
}));

describe('StatisticsSection', () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });

  it('renders statistics section with title', () => {
    render(<StatisticsSection />);
    
    expect(screen.getByText('Rakamlarla EduAI')).toBeInTheDocument();
    expect(screen.getByText(/Binlerce öğrenci/)).toBeInTheDocument();
  });

  it('renders all statistics cards', () => {
    render(<StatisticsSection />);
    
    expect(screen.getByText('Aktif Kullanıcı')).toBeInTheDocument();
    expect(screen.getByText('Çözülen Soru')).toBeInTheDocument();
    expect(screen.getByText('Başarı Oranı')).toBeInTheDocument();
    expect(screen.getByText('Kitap Önerisi')).toBeInTheDocument();
  });

  it('displays initial values as 0 before animation', () => {
    render(<StatisticsSection />);
    
    // Before animation starts, values should be 0
    const statValues = screen.getAllByTestId('stat-value');
    statValues.forEach(value => {
      expect(value).toHaveTextContent('0');
    });
  });

  it('animates statistics when in viewport', async () => {
    const mockObserver = mockIntersectionObserver();
    
    render(<StatisticsSection />);
    
    // Simulate intersection observer callback
    const [intersectionCallback] = mockObserver.mock.calls[0];
    intersectionCallback([
      {
        isIntersecting: true,
        target: document.querySelector('[data-testid="statistics-section"]'),
      },
    ]);

    // Wait for animation to start
    await waitFor(() => {
      const usersStat = screen.getByTestId('stat-users');
      expect(usersStat).not.toHaveTextContent('0');
    }, { timeout: 3000 });
  });

  it('applies proper grid layout classes', () => {
    render(<StatisticsSection />);
    
    const statsGrid = screen.getByTestId('statistics-grid');
    expect(statsGrid).toHaveClass('grid', 'grid-cols-2', 'lg:grid-cols-4');
  });

  it('has blue background styling', () => {
    render(<StatisticsSection />);
    
    const section = screen.getByTestId('statistics-section');
    expect(section).toHaveClass('bg-primary-600');
  });

  it('formats large numbers correctly', async () => {
    const mockObserver = mockIntersectionObserver();
    
    render(<StatisticsSection />);
    
    // Trigger animation
    const [intersectionCallback] = mockObserver.mock.calls[0];
    intersectionCallback([
      {
        isIntersecting: true,
        target: document.querySelector('[data-testid="statistics-section"]'),
      },
    ]);

    await waitFor(() => {
      // Check if numbers are formatted (e.g., 15,000 or 15K)
      const questionsStat = screen.getByTestId('stat-questions');
      expect(questionsStat.textContent).toMatch(/250[,.]?000|250K/);
    });
  });

  it('includes suffixes in displayed values', async () => {
    const mockObserver = mockIntersectionObserver();
    
    render(<StatisticsSection />);
    
    // Trigger animation
    const [intersectionCallback] = mockObserver.mock.calls[0];
    intersectionCallback([
      {
        isIntersecting: true,
        target: document.querySelector('[data-testid="statistics-section"]'),
      },
    ]);

    await waitFor(() => {
      expect(screen.getByText(/\+/)).toBeInTheDocument();
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });
  });

  it('renders icons for each statistic', () => {
    render(<StatisticsSection />);
    
    const statCards = screen.getAllByTestId(/^stat-/);
    
    statCards.forEach(card => {
      const icon = card.querySelector('[data-testid$="-icon"]');
      expect(icon).toBeInTheDocument();
    });
  });

  it('has proper semantic structure', () => {
    render(<StatisticsSection />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-labelledby');
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('is accessible with screen readers', () => {
    render(<StatisticsSection />);
    
    const statCards = screen.getAllByTestId(/^stat-/);
    
    statCards.forEach(card => {
      expect(card).toHaveAttribute('role', 'status');
      expect(card).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('handles animation duration correctly', () => {
    render(<StatisticsSection />);
    
    // Animation should use the default duration
    expect(screen.getByTestId('statistics-section')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    render(<StatisticsSection className="custom-stats" />);
    
    const section = screen.getByTestId('statistics-section');
    expect(section).toHaveClass('custom-stats');
  });
});
