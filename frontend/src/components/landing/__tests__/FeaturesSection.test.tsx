// FeaturesSection component tests
import { screen, waitFor } from '@testing-library/react';
import { render, mockIntersectionObserver } from './test-utils';
import FeaturesSection from '../FeaturesSection';

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      features: [
        {
          id: 'ai-question-generation',
          title: 'AI Soru Üretimi',
          description: 'Yapay zeka ile kişiselleştirilmiş sorular oluşturun',
          icon: 'brain',
          featured: true
        },
        {
          id: 'performance-analysis',
          title: 'Performans Analizi',
          description: 'Detaylı analiz ve geri bildirim alın',
          icon: 'chart',
          featured: true
        },
        {
          id: 'book-recommendations',
          title: 'Kitap Önerileri',
          description: 'Size özel kitap önerileri keşfedin',
          icon: 'book',
          featured: false
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

describe('FeaturesSection', () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });

  it('renders features section with title', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Özellikler')).toBeInTheDocument();
    expect(screen.getByText(/EduAI'nin güçlü özellikleri/)).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('AI Soru Üretimi')).toBeInTheDocument();
    expect(screen.getByText('Performans Analizi')).toBeInTheDocument();
    expect(screen.getByText('Kitap Önerileri')).toBeInTheDocument();
  });

  it('displays feature descriptions correctly', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Yapay zeka ile kişiselleştirilmiş sorular oluşturun')).toBeInTheDocument();
    expect(screen.getByText('Detaylı analiz ve geri bildirim alın')).toBeInTheDocument();
    expect(screen.getByText('Size özel kitap önerileri keşfedin')).toBeInTheDocument();
  });

  it('applies proper grid layout classes', () => {
    render(<FeaturesSection />);
    
    const featuresGrid = screen.getByTestId('features-grid');
    expect(featuresGrid).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('has proper semantic structure', () => {
    render(<FeaturesSection />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-labelledby');
    
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
  });

  it('renders with animations when in viewport', async () => {
    const mockObserver = mockIntersectionObserver();
    
    render(<FeaturesSection />);
    
    // Simulate intersection observer callback
    const [intersectionCallback] = mockObserver.mock.calls[0];
    intersectionCallback([
      {
        isIntersecting: true,
        target: document.querySelector('[data-testid="features-section"]'),
      },
    ]);

    await waitFor(() => {
      const featureCards = screen.getAllByTestId('feature-card');
      featureCards.forEach(card => {
        expect(card).toHaveClass('animate-fade-in-up');
      });
    });
  });

  it('renders with custom className', () => {
    render(<FeaturesSection className="custom-features" />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveClass('custom-features');
  });

  it('handles empty features gracefully', () => {
    // Mock empty features
    jest.doMock('../../../utils/contentManager', () => ({
      useContentManager: () => ({
        getContent: () => ({
          features: []
        })
      })
    }));

    render(<FeaturesSection />);
    
    expect(screen.getByText('Özellikler')).toBeInTheDocument();
    expect(screen.queryByTestId('feature-card')).not.toBeInTheDocument();
  });

  it('displays icons correctly', () => {
    render(<FeaturesSection />);
    
    const featureCards = screen.getAllByTestId('feature-card');
    
    featureCards.forEach(card => {
      const icon = card.querySelector('[data-testid="feature-icon"]');
      expect(icon).toBeInTheDocument();
    });
  });

  it('is accessible with screen readers', () => {
    render(<FeaturesSection />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveAttribute('aria-labelledby');
    
    const featureCards = screen.getAllByTestId('feature-card');
    featureCards.forEach(card => {
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  it('has proper responsive behavior', () => {
    render(<FeaturesSection />);
    
    const container = screen.getByTestId('features-container');
    expect(container).toHaveClass('container', 'mx-auto', 'px-4');
  });
});
