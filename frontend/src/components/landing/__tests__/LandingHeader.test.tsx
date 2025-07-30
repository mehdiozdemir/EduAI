// LandingHeader component tests
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render, mockScrollTo, simulateScroll, createMockAuthState } from './test-utils';
import { LandingHeader } from '../LandingHeader';

// Mock the useAuth hook
const mockUseAuth = jest.fn();
jest.mock('../../../hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock smooth scroll utilities
jest.mock('../../../utils/smoothScroll', () => ({
  scrollToSection: jest.fn(),
  LANDING_PAGE_SECTIONS: ['hero', 'features', 'how-it-works', 'testimonials'],
}));

describe('LandingHeader', () => {
  beforeEach(() => {
    mockScrollTo();
    mockUseAuth.mockReturnValue(createMockAuthState(false, null));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and navigation correctly', () => {
    render(<LandingHeader />);
    
    expect(screen.getByText('EduAI')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Özellikler')).toBeInTheDocument();
    expect(screen.getByText('Nasıl Çalışır')).toBeInTheDocument();
  });

  it('shows login button for unauthenticated users', () => {
    render(<LandingHeader />);
    
    expect(screen.getByText('Giriş Yap')).toBeInTheDocument();
  });

  it('shows user profile for authenticated users', () => {
    mockUseAuth.mockReturnValue(
      createMockAuthState(true, { username: 'testuser', email: 'test@example.com' } as any)
    );

    render(<LandingHeader />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.queryByText('Giriş Yap')).not.toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    render(<LandingHeader />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toBeInTheDocument();
    
    fireEvent.click(menuButton);
    
    // Mobile menu should be visible
    expect(screen.getByRole('navigation')).toHaveClass('mobile-menu-open');
  });

  it('applies sticky header styling on scroll', async () => {
    render(<LandingHeader />);
    
    const header = screen.getByRole('banner');
    
    // Simulate scroll
    simulateScroll(100);
    
    await waitFor(() => {
      expect(header).toHaveClass('backdrop-blur-sm');
    });
  });

  it('handles navigation clicks correctly', () => {
    const mockScrollToSection = jest.fn();
    jest.doMock('../../../utils/smoothScroll', () => ({
      scrollToSection: mockScrollToSection,
    }));

    render(<LandingHeader />);
    
    const featuresLink = screen.getByText('Özellikler');
    fireEvent.click(featuresLink);
    
    expect(mockScrollToSection).toHaveBeenCalledWith('features');
  });

  it('has proper accessibility attributes', () => {
    render(<LandingHeader />);
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('aria-label');
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    expect(menuButton).toHaveAttribute('aria-expanded');
  });

  it('closes mobile menu when navigation link is clicked', () => {
    render(<LandingHeader />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);
    
    const featuresLink = screen.getByText('Özellikler');
    fireEvent.click(featuresLink);
    
    // Mobile menu should be closed
    expect(screen.getByRole('navigation')).not.toHaveClass('mobile-menu-open');
  });

  it('renders with custom className', () => {
    render(<LandingHeader className="custom-header" />);
    
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('custom-header');
  });

  it('handles keyboard navigation correctly', () => {
    render(<LandingHeader />);
    
    const featuresLink = screen.getByText('Özellikler');
    
    // Test keyboard events
    fireEvent.keyDown(featuresLink, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(featuresLink, { key: ' ', code: 'Space' });
    
    expect(featuresLink).toBeInTheDocument();
  });
});
