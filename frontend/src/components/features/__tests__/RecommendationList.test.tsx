import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import RecommendationList from '../RecommendationList';
import type { ResourceRecommendation } from '../../../types';

const mockRecommendations: ResourceRecommendation[] = [
  {
    id: 1,
    resource_type: 'youtube',
    title: 'React Hooks Tutorial',
    url: 'https://youtube.com/watch?v=example1',
    description: 'Learn React Hooks with practical examples',
    relevance_score: 0.85,
  },
  {
    id: 2,
    resource_type: 'book',
    title: 'Clean Code',
    url: 'https://example.com/clean-code',
    description: 'A handbook of agile software craftsmanship',
    relevance_score: 0.92,
  },
  {
    id: 3,
    resource_type: 'website',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    description: 'Comprehensive web development documentation',
    relevance_score: 0.75,
  },
  {
    id: 4,
    resource_type: 'youtube',
    title: 'JavaScript Fundamentals',
    url: 'https://youtube.com/watch?v=example2',
    description: 'Master JavaScript basics',
    relevance_score: 0.68,
  },
];

describe('RecommendationList', () => {
  it('renders recommendations correctly', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    expect(screen.getByText('Kaynak Önerileri')).toBeInTheDocument();
    expect(screen.getByText('4 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('MDN Web Docs')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<RecommendationList recommendations={[]} loading={true} />);

    expect(screen.getByText('Öneriler yükleniyor...')).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    const mockOnRetry = vi.fn();
    render(
      <RecommendationList 
        recommendations={[]} 
        error="Network error" 
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText('Network error')).toBeInTheDocument();
    
    const retryButton = screen.getByText('Tekrar Dene');
    fireEvent.click(retryButton);
    
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('shows empty state when no recommendations', () => {
    render(<RecommendationList recommendations={[]} />);

    expect(screen.getByText('Henüz kaynak önerisi bulunmuyor.')).toBeInTheDocument();
  });

  it('filters recommendations by type', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    // Initially shows all recommendations
    expect(screen.getByText('4 / 4 öneri')).toBeInTheDocument();

    // Filter by YouTube
    const youtubeFilter = screen.getByText('Videolar (2)');
    fireEvent.click(youtubeFilter);

    expect(screen.getByText('2 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();

    // Filter by Books
    const bookFilter = screen.getByText('Kitaplar (1)');
    fireEvent.click(bookFilter);

    expect(screen.getByText('1 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.queryByText('React Hooks Tutorial')).not.toBeInTheDocument();
  });

  it('searches recommendations by title and description', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    const searchInput = screen.getByPlaceholderText('Önerilerde ara...');
    
    // Search for "React"
    fireEvent.change(searchInput, { target: { value: 'React' } });

    expect(screen.getByText('1 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument();
    expect(screen.queryByText('Clean Code')).not.toBeInTheDocument();

    // Search for "JavaScript"
    fireEvent.change(searchInput, { target: { value: 'JavaScript' } });

    expect(screen.getByText('1 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
    expect(screen.queryByText('React Hooks Tutorial')).not.toBeInTheDocument();
  });

  it('sorts recommendations correctly', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    // Default sort should be by relevance (descending)
    // Look for recommendation titles specifically, not the main page title
    expect(screen.getByText('Clean Code')).toBeInTheDocument(); // 0.92 relevance
    expect(screen.getByText('React Hooks Tutorial')).toBeInTheDocument(); // 0.85 relevance

    // Change sort to title
    const sortSelect = screen.getByDisplayValue('İlgililik');
    fireEvent.change(sortSelect, { target: { value: 'title' } });

    // Should still show all recommendations
    expect(screen.getByText('Clean Code')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
  });

  it('toggles sort order', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    // Default is descending (highest relevance first)
    expect(screen.getByText('Clean Code')).toBeInTheDocument(); // 0.92 relevance

    // Click sort order toggle
    const sortToggle = screen.getByTitle('Artan sıralama');
    fireEvent.click(sortToggle);

    // Should now be ascending (lowest relevance first)
    // All recommendations should still be visible
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument(); // 0.68 relevance
    expect(screen.getByText('Clean Code')).toBeInTheDocument(); // 0.92 relevance
  });

  it('shows filter counts correctly', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    expect(screen.getByText('Tümü (4)')).toBeInTheDocument();
    expect(screen.getByText('Videolar (2)')).toBeInTheDocument();
    expect(screen.getByText('Kitaplar (1)')).toBeInTheDocument();
    expect(screen.getByText('Web Siteleri (1)')).toBeInTheDocument();
  });

  it('clears filters when no results found', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    // Apply search that returns no results
    const searchInput = screen.getByPlaceholderText('Önerilerde ara...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    expect(screen.getByText('Filtrelere uygun öneri bulunamadı.')).toBeInTheDocument();

    // Click clear filters
    const clearButton = screen.getByText('Filtreleri Temizle');
    fireEvent.click(clearButton);

    // Should reset to show all recommendations
    expect(screen.getByText('4 / 4 öneri')).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
  });

  it('hides filters when showFilters is false', () => {
    render(<RecommendationList recommendations={mockRecommendations} showFilters={false} />);

    expect(screen.queryByPlaceholderText('Önerilerde ara...')).not.toBeInTheDocument();
    expect(screen.queryByText('Tür:')).not.toBeInTheDocument();
    expect(screen.queryByText('Sırala:')).not.toBeInTheDocument();
  });

  it('passes callbacks to ResourceRecommendation components', () => {
    const mockOnResourceClick = vi.fn();
    const mockOnRate = vi.fn();
    const mockOnMarkUsed = vi.fn();

    render(
      <RecommendationList 
        recommendations={mockRecommendations}
        onResourceClick={mockOnResourceClick}
        onRate={mockOnRate}
        onMarkUsed={mockOnMarkUsed}
      />
    );

    // Click on first resource
    const resourceButtons = screen.getAllByText('Kaynağa Git');
    fireEvent.click(resourceButtons[0]);

    expect(mockOnResourceClick).toHaveBeenCalled();
    expect(mockOnMarkUsed).toHaveBeenCalled();
  });

  it('uses custom title when provided', () => {
    render(
      <RecommendationList 
        recommendations={mockRecommendations} 
        title="Özel Öneriler"
      />
    );

    expect(screen.getByText('Özel Öneriler')).toBeInTheDocument();
    expect(screen.queryByText('Kaynak Önerileri')).not.toBeInTheDocument();
  });

  it('handles empty search results correctly', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    const searchInput = screen.getByPlaceholderText('Önerilerde ara...');
    fireEvent.change(searchInput, { target: { value: 'xyz123notfound' } });

    expect(screen.getByText('0 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('Filtrelere uygun öneri bulunamadı.')).toBeInTheDocument();
  });

  it('maintains filter state when switching between types', () => {
    render(<RecommendationList recommendations={mockRecommendations} />);

    // Apply search first
    const searchInput = screen.getByPlaceholderText('Önerilerde ara...');
    fireEvent.change(searchInput, { target: { value: 'JavaScript' } });

    expect(screen.getByText('1 / 4 öneri')).toBeInTheDocument();

    // Then filter by type - should combine filters
    const youtubeFilter = screen.getByText('Videolar (2)');
    fireEvent.click(youtubeFilter);

    expect(screen.getByText('1 / 4 öneri')).toBeInTheDocument();
    expect(screen.getByText('JavaScript Fundamentals')).toBeInTheDocument();
  });
});