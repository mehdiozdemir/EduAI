// HowItWorksSection component tests
import { screen } from '@testing-library/react';
import { render, mockIntersectionObserver } from './test-utils';
import HowItWorksSection from '../HowItWorksSection';

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      howItWorks: {
        title: 'Nasıl Çalışır',
        subtitle: 'EduAI ile öğrenme süreciniz',
        steps: [
          {
            id: 1,
            title: 'Kayıt Ol',
            description: 'Hızlı kayıt ile EduAI ailesine katıl',
            icon: 'user-plus'
          },
          {
            id: 2,
            title: 'Konu Seç',
            description: 'Öğrenmek istediğin konuları seç',
            icon: 'book-open'
          },
          {
            id: 3,
            title: 'AI ile Çöz',
            description: 'AI destekli sorularla pratik yap',
            icon: 'brain'
          },
          {
            id: 4,
            title: 'Gelişimini Takip Et',
            description: 'Performans analiziyle ilerleme kaydet',
            icon: 'chart-line'
          }
        ]
      }
    })
  })
}));

describe('HowItWorksSection', () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });

  it('renders section title and subtitle correctly', () => {
    render(<HowItWorksSection />);
    
    expect(screen.getByText('Nasıl Çalışır')).toBeInTheDocument();
    expect(screen.getByText('EduAI ile öğrenme süreciniz')).toBeInTheDocument();
  });

  it('renders all workflow steps', () => {
    render(<HowItWorksSection />);
    
    expect(screen.getByText('Kayıt Ol')).toBeInTheDocument();
    expect(screen.getByText('Konu Seç')).toBeInTheDocument();
    expect(screen.getByText('AI ile Çöz')).toBeInTheDocument();
    expect(screen.getByText('Gelişimini Takip Et')).toBeInTheDocument();
  });

  it('renders step descriptions', () => {
    render(<HowItWorksSection />);
    
    expect(screen.getByText('Hızlı kayıt ile EduAI ailesine katıl')).toBeInTheDocument();
    expect(screen.getByText('Öğrenmek istediğin konuları seç')).toBeInTheDocument();
    expect(screen.getByText('AI destekli sorularla pratik yap')).toBeInTheDocument();
    expect(screen.getByText('Performans analiziyle ilerleme kaydet')).toBeInTheDocument();
  });

  it('renders step numbers correctly', () => {
    render(<HowItWorksSection />);
    
    // Check for step numbers (1, 2, 3, 4)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<HowItWorksSection />);
    
    // Should have a section element
    const section = screen.getByRole('region', { name: /nasıl çalışır/i });
    expect(section).toBeInTheDocument();
    
    // Should have proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 2, name: /nasıl çalışır/i });
    expect(mainHeading).toBeInTheDocument();
  });

  it('is responsive with proper classes', () => {
    render(<HowItWorksSection />);
    
    const section = screen.getByRole('region', { name: /nasıl çalışır/i });
    expect(section).toHaveClass('py-16', 'lg:py-24');
  });

  it('renders with custom className prop', () => {
    render(<HowItWorksSection className="custom-how-it-works" />);
    
    const section = screen.getByRole('region', { name: /nasıl çalışır/i });
    expect(section).toHaveClass('custom-how-it-works');
  });

  it('handles empty content gracefully', () => {
    // Mock empty content
    jest.doMock('../../../utils/contentManager', () => ({
      useContentManager: () => ({
        getContent: () => ({
          howItWorks: {
            title: '',
            subtitle: '',
            steps: []
          }
        })
      })
    }));

    render(<HowItWorksSection />);
    
    // Should still render the section structure
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });
});
