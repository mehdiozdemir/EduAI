import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { EducationLevelCard } from '../EducationLevelCard';
import { EducationLevelSelector } from '../EducationLevelSelector';
import { educationService } from '../../../services/educationService';
import type { EducationLevelData, EducationLevelName } from '../../../types/education';

// Mock the education service
vi.mock('../../../services/educationService', () => ({
  educationService: {
    getEducationLevels: vi.fn()
  }
}));

const mockEducationLevels: EducationLevelData[] = [
  {
    id: 1,
    name: 'İlkokul',
    description: 'İlkokul seviyesi',
    sort_order: 1,
    grade_range: '1-4. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null
  },
  {
    id: 2,
    name: 'Ortaokul',
    description: 'Ortaokul seviyesi',
    sort_order: 2,
    grade_range: '5-8. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null
  },
  {
    id: 3,
    name: 'Lise',
    description: 'Lise seviyesi',
    sort_order: 3,
    grade_range: '9-12. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null
  }
];

describe('Education Level Components - Responsive Design & Accessibility', () => {
  const mockOnClick = vi.fn();
  const mockOnLevelSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('EducationLevelCard - Responsive Design', () => {
    const defaultProps = {
      level: 'ilkokul' as EducationLevelName,
      title: 'İlkokul',
      description: '1-4. Sınıf',
      isSelected: false,
      onClick: mockOnClick,
    };

    it('has responsive text sizing classes', () => {
      render(<EducationLevelCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      const title = screen.getByText('İlkokul');
      const description = screen.getByText('1-4. Sınıf');
      
      // Check responsive text classes
      expect(title).toHaveClass('text-base', 'xs:text-lg', 'sm:text-xl');
      expect(description).toHaveClass('text-xs', 'xs:text-sm', 'sm:text-base');
    });

    it('has proper mobile touch optimizations', () => {
      render(<EducationLevelCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      
      // Check mobile-specific classes
      expect(card).toHaveClass('touch-manipulation');
      expect(card).toHaveClass('select-none');
      expect(card).toHaveClass('min-w-0', 'w-full');
    });

    it('has enhanced hover and active states', () => {
      render(<EducationLevelCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      
      // Check enhanced hover effects
      expect(card).toHaveClass('hover:scale-[1.02]');
      expect(card).toHaveClass('active:scale-[0.98]');
      expect(card).toHaveClass('active:bg-gray-100');
    });

    it('has enhanced selected state styling', () => {
      const selectedProps = { ...defaultProps, isSelected: true };
      render(<EducationLevelCard {...selectedProps} />);
      
      const card = screen.getByRole('button');
      
      // Check enhanced selected state
      expect(card).toHaveClass('ring-1', 'ring-blue-200');
    });

    it('maintains proper minimum heights for different screen sizes', () => {
      render(<EducationLevelCard {...defaultProps} />);
      
      const card = screen.getByRole('button');
      
      expect(card).toHaveClass('min-h-[120px]', 'sm:min-h-[140px]');
    });
  });

  describe('EducationLevelSelector - Responsive Grid', () => {
    beforeEach(() => {
      vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);
    });

    it('has responsive grid layout with proper gaps', async () => {
      const { container } = render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      // Wait for loading to complete
      await screen.findByText('İlkokul');

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2', 
        'lg:grid-cols-3',
        'gap-3',
        'sm:gap-4',
        'lg:gap-6'
      );
    });

    it('loading state has responsive skeleton elements', () => {
      vi.mocked(educationService.getEducationLevels).mockImplementation(
        () => new Promise(() => {}) // Never resolves to keep loading state
      );

      const { container } = render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);

      // Check skeleton responsive sizing
      skeletons.forEach(skeleton => {
        const titleSkeleton = skeleton.querySelector('.h-5');
        const descSkeleton = skeleton.querySelector('.h-3');
        
        expect(titleSkeleton).toHaveClass('h-5', 'sm:h-6');
        expect(descSkeleton).toHaveClass('h-3', 'sm:h-4');
      });
    });
  });

  describe('Keyboard Navigation & Accessibility', () => {
    beforeEach(() => {
      vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);
    });

    it('supports full keyboard navigation between cards', async () => {
      render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      await screen.findByText('İlkokul');

      const cards = screen.getAllByRole('button');
      
      // All cards should be focusable
      cards.forEach(card => {
        expect(card).toHaveAttribute('tabIndex', '0');
      });

      // Test Tab navigation
      cards[0].focus();
      expect(document.activeElement).toBe(cards[0]);

      // Simulate Tab to next element
      fireEvent.keyDown(cards[0], { key: 'Tab' });
      // Note: jsdom doesn't handle actual focus management, but we can test the tabIndex
    });

    it('provides proper ARIA labels and states', async () => {
      render(
        <EducationLevelSelector
          selectedLevel="ortaokul"
          onLevelSelect={mockOnLevelSelect}
        />
      );

      await screen.findByText('İlkokul');

      const ilkokulCard = screen.getByRole('button', { name: /İlkokul eğitim seviyesini seç/i });
      const ortaokulCard = screen.getByRole('button', { name: /Ortaokul eğitim seviyesini seç/i });
      const liseCard = screen.getByRole('button', { name: /Lise eğitim seviyesini seç/i });

      // Check ARIA states
      expect(ilkokulCard).toHaveAttribute('aria-pressed', 'false');
      expect(ortaokulCard).toHaveAttribute('aria-pressed', 'true');
      expect(liseCard).toHaveAttribute('aria-pressed', 'false');

      // Check ARIA labels include descriptions
      expect(ilkokulCard).toHaveAttribute('aria-label', 'İlkokul eğitim seviyesini seç - 1-4. Sınıf');
      expect(ortaokulCard).toHaveAttribute('aria-label', 'Ortaokul eğitim seviyesini seç - 5-8. Sınıf');
      expect(liseCard).toHaveAttribute('aria-label', 'Lise eğitim seviyesini seç - 9-12. Sınıf');
    });

    it('handles keyboard activation correctly', async () => {
      render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      await screen.findByText('İlkokul');

      const ilkokulCard = screen.getByRole('button', { name: /İlkokul eğitim seviyesini seç/i });

      // Test Enter key
      fireEvent.keyDown(ilkokulCard, { key: 'Enter' });
      expect(mockOnLevelSelect).toHaveBeenCalledWith('ilkokul');

      // Test Space key
      mockOnLevelSelect.mockClear();
      fireEvent.keyDown(ilkokulCard, { key: ' ' });
      expect(mockOnLevelSelect).toHaveBeenCalledWith('ilkokul');

      // Test that other keys don't trigger selection
      mockOnLevelSelect.mockClear();
      fireEvent.keyDown(ilkokulCard, { key: 'Escape' });
      fireEvent.keyDown(ilkokulCard, { key: 'Tab' });
      expect(mockOnLevelSelect).not.toHaveBeenCalled();
    });

    it('has proper focus management and visual indicators', async () => {
      render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      await screen.findByText('İlkokul');

      const cards = screen.getAllByRole('button');
      
      // All cards should have focus styles
      cards.forEach(card => {
        expect(card).toHaveClass(
          'focus:outline-none',
          'focus:ring-2',
          'focus:ring-blue-500',
          'focus:ring-offset-2'
        );
      });
    });
  });

  describe('Mobile-Specific Features', () => {
    beforeEach(() => {
      vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);
    });

    it('has touch-optimized interaction states', async () => {
      render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      await screen.findByText('İlkokul');

      const cards = screen.getAllByRole('button');
      
      cards.forEach(card => {
        // Touch optimization classes
        expect(card).toHaveClass('touch-manipulation');
        expect(card).toHaveClass('select-none');
        
        // Active state for mobile feedback
        expect(card).toHaveClass('active:scale-[0.98]');
        expect(card).toHaveClass('active:bg-gray-100');
      });
    });

    it('maintains proper spacing on mobile devices', async () => {
      const { container } = render(
        <EducationLevelSelector
          selectedLevel={null}
          onLevelSelect={mockOnLevelSelect}
        />
      );

      await screen.findByText('İlkokul');

      const gridContainer = container.querySelector('.grid');
      
      // Mobile-first responsive gaps
      expect(gridContainer).toHaveClass('gap-3', 'sm:gap-4', 'lg:gap-6');
    });
  });
});