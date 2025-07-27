import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import ResourceRecommendation from '../ResourceRecommendation';
import type { ResourceRecommendation as ResourceRecommendationType } from '../../../types';

// Mock window.open
const mockOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockOpen,
});

const mockRecommendation: ResourceRecommendationType = {
  id: 1,
  resource_type: 'youtube',
  title: 'React Hooks Tutorial',
  url: 'https://youtube.com/watch?v=example',
  description: 'Learn React Hooks with practical examples',
  relevance_score: 0.85,
};

const mockBookRecommendation: ResourceRecommendationType = {
  id: 2,
  resource_type: 'book',
  title: 'Clean Code',
  url: 'https://example.com/clean-code',
  description: 'A handbook of agile software craftsmanship',
  relevance_score: 0.92,
};

const mockWebsiteRecommendation: ResourceRecommendationType = {
  id: 3,
  resource_type: 'website',
  title: 'MDN Web Docs',
  url: 'https://developer.mozilla.org',
  description: 'Comprehensive web development documentation',
  relevance_score: 0.75,
};

describe('ResourceRecommendation', () => {
  beforeEach(() => {
    mockOpen.mockClear();
  });

  it('renders recommendation with correct information', () => {
    render(<ResourceRecommendation recommendation={mockRecommendation} />);

    expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Learn React Hooks with practical examples')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('85%')).toBeInTheDocument();
    expect(screen.getByText('İlgililik')).toBeInTheDocument();
    expect(screen.getByText('Yüksek İlgili')).toBeInTheDocument();
  });

  it('displays correct icon for YouTube resource', () => {
    render(<ResourceRecommendation recommendation={mockRecommendation} />);
    
    expect(screen.getByText('Video')).toBeInTheDocument();
    // Check that the YouTube icon SVG is present by looking for the specific path
    const youtubeIcon = document.querySelector('svg path[d*="23.498 6.186"]');
    expect(youtubeIcon).toBeInTheDocument();
  });

  it('displays correct icon for book resource', () => {
    render(<ResourceRecommendation recommendation={mockBookRecommendation} />);
    
    expect(screen.getByText('Kitap')).toBeInTheDocument();
    expect(screen.getByText('Yüksek İlgili')).toBeInTheDocument();
  });

  it('displays correct icon for website resource', () => {
    render(<ResourceRecommendation recommendation={mockWebsiteRecommendation} />);
    
    expect(screen.getByText('Web Sitesi')).toBeInTheDocument();
    expect(screen.getByText('Orta İlgili')).toBeInTheDocument();
  });

  it('shows correct relevance labels based on score', () => {
    const lowScoreRecommendation = { ...mockRecommendation, relevance_score: 0.4 };
    const { rerender } = render(<ResourceRecommendation recommendation={lowScoreRecommendation} />);
    
    expect(screen.getByText('Düşük İlgili')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();

    const mediumScoreRecommendation = { ...mockRecommendation, relevance_score: 0.65 };
    rerender(<ResourceRecommendation recommendation={mediumScoreRecommendation} />);
    
    expect(screen.getByText('Orta İlgili')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
  });

  it('opens resource in new tab when clicked', () => {
    const mockNewWindow = { opener: {} };
    mockOpen.mockReturnValue(mockNewWindow);

    render(<ResourceRecommendation recommendation={mockRecommendation} />);
    
    const resourceButton = screen.getByText('Kaynağa Git');
    fireEvent.click(resourceButton);

    expect(mockOpen).toHaveBeenCalledWith(
      'https://youtube.com/watch?v=example',
      '_blank',
      'noopener,noreferrer'
    );
    expect(mockNewWindow.opener).toBeNull();
  });

  it('calls custom onResourceClick when provided', () => {
    const mockOnResourceClick = vi.fn();
    render(
      <ResourceRecommendation 
        recommendation={mockRecommendation} 
        onResourceClick={mockOnResourceClick}
      />
    );
    
    const resourceButton = screen.getByText('Kaynağa Git');
    fireEvent.click(resourceButton);

    expect(mockOnResourceClick).toHaveBeenCalledWith('https://youtube.com/watch?v=example');
    expect(mockOpen).not.toHaveBeenCalled();
  });

  it('calls onMarkUsed when resource is clicked', () => {
    const mockOnMarkUsed = vi.fn();
    render(
      <ResourceRecommendation 
        recommendation={mockRecommendation} 
        onMarkUsed={mockOnMarkUsed}
      />
    );
    
    const resourceButton = screen.getByText('Kaynağa Git');
    fireEvent.click(resourceButton);

    expect(mockOnMarkUsed).toHaveBeenCalledWith(1);
  });

  it('shows rating stars when onRate is provided', () => {
    const mockOnRate = vi.fn();
    render(
      <ResourceRecommendation 
        recommendation={mockRecommendation} 
        onRate={mockOnRate}
      />
    );
    
    expect(screen.getByText('Değerlendir:')).toBeInTheDocument();
    
    const stars = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')?.getAttribute('viewBox') === '0 0 24 24'
    );
    
    // Should have 5 rating stars plus the main resource button
    expect(stars).toHaveLength(6); // 5 stars + 1 resource button
  });

  it('calls onRate when star is clicked', () => {
    const mockOnRate = vi.fn();
    render(
      <ResourceRecommendation 
        recommendation={mockRecommendation} 
        onRate={mockOnRate}
      />
    );
    
    const stars = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')?.getAttribute('viewBox') === '0 0 24 24' &&
      button.querySelector('path')?.getAttribute('d')?.includes('12 2l3.09')
    );
    
    // Click the third star (rating 3)
    fireEvent.click(stars[2]);

    expect(mockOnRate).toHaveBeenCalledWith(1, 3);
  });

  it('hides actions when showActions is false', () => {
    render(
      <ResourceRecommendation 
        recommendation={mockRecommendation} 
        showActions={false}
      />
    );
    
    expect(screen.queryByText('Kaynağa Git')).not.toBeInTheDocument();
    expect(screen.queryByText('Değerlendir:')).not.toBeInTheDocument();
  });

  it('handles unknown resource type gracefully', () => {
    const unknownTypeRecommendation = { 
      ...mockRecommendation, 
      resource_type: 'unknown' 
    };
    
    render(<ResourceRecommendation recommendation={unknownTypeRecommendation} />);
    
    expect(screen.getByText('Kaynak')).toBeInTheDocument();
  });

  it('applies correct CSS classes for relevance score colors', () => {
    const { rerender } = render(<ResourceRecommendation recommendation={mockRecommendation} />);
    
    // High relevance (>= 0.8) should have green colors
    let relevanceElement = screen.getByText('Yüksek İlgili');
    expect(relevanceElement).toHaveClass('text-green-600', 'bg-green-100');

    // Medium relevance (0.6-0.8) should have yellow colors
    const mediumRecommendation = { ...mockRecommendation, relevance_score: 0.65 };
    rerender(<ResourceRecommendation recommendation={mediumRecommendation} />);
    
    relevanceElement = screen.getByText('Orta İlgili');
    expect(relevanceElement).toHaveClass('text-yellow-600', 'bg-yellow-100');

    // Low relevance (< 0.6) should have red colors
    const lowRecommendation = { ...mockRecommendation, relevance_score: 0.4 };
    rerender(<ResourceRecommendation recommendation={lowRecommendation} />);
    
    relevanceElement = screen.getByText('Düşük İlgili');
    expect(relevanceElement).toHaveClass('text-red-600', 'bg-red-100');
  });

  it('has proper accessibility attributes', () => {
    render(<ResourceRecommendation recommendation={mockRecommendation} />);
    
    const resourceButton = screen.getByText('Kaynağa Git');
    expect(resourceButton).toBeInTheDocument();
    expect(resourceButton.closest('button')).toBeInTheDocument();
  });
});