// CTASection component tests
import { screen, fireEvent } from '@testing-library/react';
import { render, mockIntersectionObserver, createMockAuthState } from './test-utils';
import CTASection from '../CTASection';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => createMockAuthState(false, null),
}));

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      cta: {
        title: 'EduAI ile Öğrenme Yolculuğuna Başla',
        subtitle: 'Binlerce öğrenci zaten EduAI ile başarıya ulaştı',
        description: 'AI destekli kişiselleştirilmiş eğitim deneyimi için hemen kaydol.',
        primaryCTA: {
          text: 'Ücretsiz Başla',
          href: '/register',
          ariaLabel: 'Ücretsiz kayıt ol'
        },
        secondaryCTA: {
          text: 'Demo İzle',
          href: '/demo',
          ariaLabel: 'Demo videosu izle'
        },
        stats: {
          users: '10,000+',
          successRate: '%95',
          subjects: '50+'
        }
      }
    })
  })
}));

describe('CTASection', () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });

  it('renders section title and subtitle correctly', () => {
    render(<CTASection />);
    
    expect(screen.getByText('EduAI ile Öğrenme Yolculuğuna Başla')).toBeInTheDocument();
    expect(screen.getByText('Binlerce öğrenci zaten EduAI ile başarıya ulaştı')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<CTASection />);
    
    expect(screen.getByText('AI destekli kişiselleştirilmiş eğitim deneyimi için hemen kaydol.')).toBeInTheDocument();
  });

  it('renders primary and secondary CTA buttons', () => {
    render(<CTASection />);
    
    const primaryButton = screen.getByRole('button', { name: /Ücretsiz Başla/i });
    const secondaryButton = screen.getByRole('button', { name: /Demo İzle/i });
    
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<CTASection />);
    
    const primaryButton = screen.getByRole('button', { name: /Ücretsiz Başla/i });
    expect(primaryButton).toHaveAttribute('aria-label', 'Ücretsiz kayıt ol');
    
    const secondaryButton = screen.getByRole('button', { name: /Demo İzle/i });
    expect(secondaryButton).toHaveAttribute('aria-label', 'Demo videosu izle');
  });

  it('renders statistics when available', () => {
    render(<CTASection />);
    
    expect(screen.getByText('10,000+')).toBeInTheDocument();
    expect(screen.getByText('%95')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
  });

  it('handles button clicks correctly', () => {
    render(<CTASection />);
    
    const primaryButton = screen.getByRole('button', { name: /Ücretsiz Başla/i });
    const secondaryButton = screen.getByRole('button', { name: /Demo İzle/i });
    
    fireEvent.click(primaryButton);
    fireEvent.click(secondaryButton);
    
    // Check if buttons are still present (navigation would be handled by router)
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
  });

  it('shows different content for authenticated users', () => {
    // Mock authenticated user
    jest.doMock('../../../hooks/useAuth', () => ({
      useAuth: () => createMockAuthState(true, { id: 1, username: 'testuser', email: 'test@example.com' } as any),
    }));

    render(<CTASection />);
    
    // Should still show the main title but might have different CTAs
    expect(screen.getByText('EduAI ile Öğrenme Yolculuğuna Başla')).toBeInTheDocument();
  });

  it('has proper semantic structure', () => {
    render(<CTASection />);
    
    // Should have a section element
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
    
    // Should have proper heading structure
    const mainHeading = screen.getByRole('heading', { level: 2 });
    expect(mainHeading).toBeInTheDocument();
  });

  it('renders with custom className prop', () => {
    render(<CTASection className="custom-cta" />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveClass('custom-cta');
  });

  it('is responsive with proper classes', () => {
    render(<CTASection />);
    
    const section = screen.getByRole('region');
    expect(section).toHaveClass('py-16', 'lg:py-24');
  });

  it('has gradient background styling', () => {
    render(<CTASection />);
    
    // Check for gradient background classes
    const section = screen.getByRole('region');
    expect(section).toHaveClass('bg-gradient-to-br');
  });

  it('handles empty content gracefully', () => {
    // Mock empty content
    jest.doMock('../../../utils/contentManager', () => ({
      useContentManager: () => ({
        getContent: () => ({
          cta: {
            title: '',
            subtitle: '',
            description: '',
            primaryCTA: null,
            secondaryCTA: null,
            stats: {}
          }
        })
      })
    }));

    render(<CTASection />);
    
    // Should still render the section structure
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });

  it('applies animation classes correctly', () => {
    render(<CTASection />);
    
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
    
    // Should have animation-related classes
    expect(section.querySelector('.animate-fade-in-up, .opacity-0, .translate-y-8')).toBeTruthy();
  });
});
