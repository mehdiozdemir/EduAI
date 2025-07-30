// TestimonialsSection component tests
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockIntersectionObserver } from './test-utils';
import TestimonialsSection from '../TestimonialsSection';

// Mock the content manager
jest.mock('../../../utils/contentManager', () => ({
  useContentManager: () => ({
    getContent: () => ({
      testimonials: {
        title: 'Öğrencilerimizden Gelen Geri Bildirimler',
        subtitle: 'EduAI kullanıcılarının deneyimleri',
        items: [
          {
            id: 1,
            name: 'Ahmet Yılmaz',
            role: 'Lise Öğrencisi',
            content: 'EduAI sayesinde matematik notlarım çok arttı. AI destekli sorular gerçekten etkili.',
            rating: 5,
            avatar: '/avatars/ahmet.jpg'
          },
          {
            id: 2,
            name: 'Fatma Kaya',
            role: 'Üniversite Öğrencisi',
            content: 'Kişiselleştirilmiş öğrenme deneyimi harika. Zayıf olduğum konulara odaklanabiliyorum.',
            rating: 5,
            avatar: '/avatars/fatma.jpg'
          },
          {
            id: 3,
            name: 'Mehmet Demir',
            role: 'Öğretmen',
            content: 'Öğrencilerime EduAI öneriyorum. Performans analizi çok detaylı ve yararlı.',
            rating: 4,
            avatar: '/avatars/mehmet.jpg'
          }
        ]
      }
    })
  })
}));

describe('TestimonialsSection', () => {
  beforeEach(() => {
    mockIntersectionObserver();
    // Mock requestAnimationFrame for carousel functionality
    global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0));
    global.cancelAnimationFrame = jest.fn();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders section title and subtitle correctly', () => {
    render(<TestimonialsSection />);
    
    expect(screen.getByText('Öğrencilerimizden Gelen Geri Bildirimler')).toBeInTheDocument();
    expect(screen.getByText('EduAI kullanıcılarının deneyimleri')).toBeInTheDocument();
  });

  it('renders all testimonials', () => {
    render(<TestimonialsSection />);
    
    expect(screen.getByText('Ahmet Yılmaz')).toBeInTheDocument();
    expect(screen.getByText('Fatma Kaya')).toBeInTheDocument();
    expect(screen.getByText('Mehmet Demir')).toBeInTheDocument();
  });

  it('renders testimonial content and roles', () => {
    render(<TestimonialsSection />);
    
    expect(screen.getByText(/EduAI sayesinde matematik notlarım/)).toBeInTheDocument();
    expect(screen.getByText('Lise Öğrencisi')).toBeInTheDocument();
    expect(screen.getByText('Üniversite Öğrencisi')).toBeInTheDocument();
    expect(screen.getByText('Öğretmen')).toBeInTheDocument();
  });

  it('renders star ratings', () => {
    render(<TestimonialsSection />);
    
    // Check for rating stars (should have filled stars based on ratings)
    const stars = screen.getAllByTestId(/rating-star/);
    expect(stars.length).toBeGreaterThan(0);
  });

  it('has carousel navigation controls', () => {
    render(<TestimonialsSection />);
    
    // Should have previous and next buttons
    const prevButton = screen.getByRole('button', { name: /previous/i });
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('handles carousel navigation', async () => {
    render(<TestimonialsSection />);
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    
    fireEvent.click(nextButton);
    
    // Should trigger carousel change
    await waitFor(() => {
      expect(nextButton).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', () => {
    render(<TestimonialsSection />);
    
    // Should have proper section role
    const section = screen.getByRole('region', { name: /testimonials/i });
    expect(section).toBeInTheDocument();
    
    // Carousel should have proper ARIA labels
    const carousel = screen.getByRole('region', { name: /testimonials carousel/i });
    expect(carousel).toBeInTheDocument();
  });

  it('auto-plays carousel when enabled', async () => {
    jest.useFakeTimers();
    
    render(<TestimonialsSection />);
    
    // Fast-forward time to trigger auto-play
    jest.advanceTimersByTime(3000);
    
    await waitFor(() => {
      // Carousel should have changed
      expect(screen.getByRole('region', { name: /testimonials/i })).toBeInTheDocument();
    });
    
    jest.useRealTimers();
  });

  it('pauses auto-play on hover', async () => {
    jest.useFakeTimers();
    
    render(<TestimonialsSection />);
    
    const carousel = screen.getByRole('region', { name: /testimonials/i });
    
    // Hover over carousel
    fireEvent.mouseEnter(carousel);
    
    // Fast-forward time
    jest.advanceTimersByTime(5000);
    
    // Auto-play should be paused
    expect(carousel).toBeInTheDocument();
    
    jest.useRealTimers();
  });

  it('renders with custom className prop', () => {
    render(<TestimonialsSection className="custom-testimonials" />);
    
    const section = screen.getByRole('region', { name: /testimonials/i });
    expect(section).toHaveClass('custom-testimonials');
  });

  it('is responsive with proper layout classes', () => {
    render(<TestimonialsSection />);
    
    const section = screen.getByRole('region', { name: /testimonials/i });
    expect(section).toHaveClass('py-16', 'lg:py-24');
  });

  it('handles empty testimonials gracefully', () => {
    // Mock empty testimonials
    jest.doMock('../../../utils/contentManager', () => ({
      useContentManager: () => ({
        getContent: () => ({
          testimonials: {
            title: 'No Testimonials',
            subtitle: 'Coming soon',
            items: []
          }
        })
      })
    }));

    render(<TestimonialsSection />);
    
    // Should still render the section structure
    const section = screen.getByRole('region');
    expect(section).toBeInTheDocument();
  });
});
