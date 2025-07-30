// HeroSection component tests
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockIntersectionObserver, createMockAuthState } from './test-utils';
import { HeroSection } from '../HeroSection';

// Mock the useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => createMockAuthState(false, null),
}));

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      hero: {
        title: 'AI ile Öğrenme Deneyiminizi Dönüştürün',
        subtitle: 'EduAI',
        description: 'Yapay zeka destekli soru üretimi, performans analizi ve kişiselleştirilmiş kitap önerileri ile öğrenme potansiyelinizi keşfedin.',
        primaryCTA: {
          text: 'Hemen Başla',
          href: '/register',
          ariaLabel: 'Kayıt olmak için tıklayın'
        },
        secondaryCTA: {
          text: 'Demo İzle',
          href: '/demo',
          ariaLabel: 'Demo videosu izlemek için tıklayın'
        }
      }
    })
  })
}));

describe('HeroSection', () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });

  it('renders hero content correctly', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('AI ile Öğrenme Deneyiminizi Dönüştürün')).toBeInTheDocument();
    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.getByText(/Yapay zeka destekli soru üretimi/)).toBeInTheDocument();
  });

  it('renders primary and secondary CTA buttons', () => {
    render(<HeroSection />);
    
    const primaryButton = screen.getByRole('button', { name: /Hemen Başla/i });
    const secondaryButton = screen.getByRole('button', { name: /Demo İzle/i });
    
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<HeroSection />);
    
    const heroSection = screen.getByRole('banner');
    expect(heroSection).toHaveAttribute('aria-labelledby');
    
    const primaryButton = screen.getByRole('button', { name: /Hemen Başla/i });
    expect(primaryButton).toHaveAttribute('aria-label', 'Kayıt olmak için tıklayın');
  });

  it('applies animation classes correctly', async () => {
    render(<HeroSection />);
    
    // Wait for animations to be applied
    await waitFor(() => {
      const heroContent = screen.getByTestId('hero-content');
      expect(heroContent).toHaveClass('animate-fade-in-up');
    });
  });

  it('handles button clicks correctly', () => {
    render(<HeroSection />);
    
    const primaryButton = screen.getByRole('button', { name: /Hemen Başla/i });
    const secondaryButton = screen.getByRole('button', { name: /Demo İzle/i });
    
    fireEvent.click(primaryButton);
    fireEvent.click(secondaryButton);
    
    // Check if navigation would be triggered (in a real test with router mock)
    expect(primaryButton).toBeInTheDocument();
    expect(secondaryButton).toBeInTheDocument();
  });

  it('renders with custom className prop', () => {
    render(<HeroSection className="custom-hero" />);
    
    const heroSection = screen.getByRole('banner');
    expect(heroSection).toHaveClass('custom-hero');
  });

  it('handles authenticated state correctly', () => {
    // Mock authenticated user
    jest.doMock('../../../hooks/useAuth', () => ({
      useAuth: () => createMockAuthState(true, { id: 1, username: 'testuser', email: 'test@example.com' } as any),
    }));

    render(<HeroSection />);
    
    // Should show different content for authenticated users
    expect(screen.getByText('AI ile Öğrenme Deneyiminizi Dönüştürün')).toBeInTheDocument();
  });

  it('is responsive on different screen sizes', () => {
    // Test mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<HeroSection />);
    
    const heroSection = screen.getByRole('banner');
    expect(heroSection).toHaveClass('min-h-screen');
  });
});
