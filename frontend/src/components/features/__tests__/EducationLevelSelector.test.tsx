import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
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

describe('EducationLevelSelector', () => {
  const mockOnLevelSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(educationService.getEducationLevels).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    // Should show loading skeletons
    const loadingElements = screen.getAllByRole('generic');
    expect(loadingElements.some(el => el.classList.contains('animate-pulse'))).toBe(true);
  });

  it('renders education levels after successful fetch', async () => {
    vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
      expect(screen.getByText('Ortaokul')).toBeInTheDocument();
      expect(screen.getByText('Lise')).toBeInTheDocument();
    });

    // Should show grade ranges
    expect(screen.getByText('1-4. Sınıf')).toBeInTheDocument();
    expect(screen.getByText('5-8. Sınıf')).toBeInTheDocument();
    expect(screen.getByText('9-12. Sınıf')).toBeInTheDocument();
  });

  it('handles education level selection', async () => {
    vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    // Click on İlkokul
    const ilkokulCard = screen.getByRole('button', { name: /İlkokul eğitim seviyesini seç/i });
    fireEvent.click(ilkokulCard);

    expect(mockOnLevelSelect).toHaveBeenCalledWith('ilkokul');
  });

  it('shows selected state correctly', async () => {
    vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);

    render(
      <EducationLevelSelector
        selectedLevel="ortaokul"
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Ortaokul')).toBeInTheDocument();
    });

    // Check that the selected card has the correct aria-pressed attribute
    const ortaokulCard = screen.getByRole('button', { name: /Ortaokul eğitim seviyesini seç/i });
    expect(ortaokulCard).toHaveAttribute('aria-pressed', 'true');

    // Other cards should not be selected
    const ilkokulCard = screen.getByRole('button', { name: /İlkokul eğitim seviyesini seç/i });
    const liseCard = screen.getByRole('button', { name: /Lise eğitim seviyesini seç/i });
    expect(ilkokulCard).toHaveAttribute('aria-pressed', 'false');
    expect(liseCard).toHaveAttribute('aria-pressed', 'false');
  });

  it('handles keyboard navigation', async () => {
    vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    const ilkokulCard = screen.getByRole('button', { name: /İlkokul eğitim seviyesini seç/i });
    
    // Test Enter key
    fireEvent.keyDown(ilkokulCard, { key: 'Enter' });
    expect(mockOnLevelSelect).toHaveBeenCalledWith('ilkokul');

    // Test Space key
    mockOnLevelSelect.mockClear();
    fireEvent.keyDown(ilkokulCard, { key: ' ' });
    expect(mockOnLevelSelect).toHaveBeenCalledWith('ilkokul');
  });

  it('displays error state when API fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(educationService.getEducationLevels).mockRejectedValue(new Error('API Error'));

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Eğitim seviyeleri yüklenirken bir hata oluştu/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('handles retry functionality', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // First call fails
    vi.mocked(educationService.getEducationLevels)
      .mockRejectedValueOnce(new Error('API Error'))
      .mockResolvedValueOnce(mockEducationLevels);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Eğitim seviyeleri yüklenirken bir hata oluştu/i)).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Tekrar Dene');
    fireEvent.click(retryButton);

    // Should show success state after retry
    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    expect(educationService.getEducationLevels).toHaveBeenCalledTimes(2);
    consoleErrorSpy.mockRestore();
  });

  it('displays empty state when no education levels are returned', async () => {
    vi.mocked(educationService.getEducationLevels).mockResolvedValue([]);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Henüz eğitim seviyesi bulunmuyor.')).toBeInTheDocument();
    });
  });

  it('filters out unknown education levels', async () => {
    const mixedEducationLevels = [
      ...mockEducationLevels,
      {
        id: 4,
        name: 'Unknown Level',
        description: 'Unknown',
        sort_order: 4,
        grade_range: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: null
      }
    ];

    vi.mocked(educationService.getEducationLevels).mockResolvedValue(mixedEducationLevels);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
      expect(screen.getByText('Ortaokul')).toBeInTheDocument();
      expect(screen.getByText('Lise')).toBeInTheDocument();
    });

    // Unknown level should not be displayed
    expect(screen.queryByText('Unknown Level')).not.toBeInTheDocument();
  });

  it('sorts education levels by sort_order', async () => {
    const unsortedLevels = [
      mockEducationLevels[2], // Lise (sort_order: 3)
      mockEducationLevels[0], // İlkokul (sort_order: 1)
      mockEducationLevels[1]  // Ortaokul (sort_order: 2)
    ];

    vi.mocked(educationService.getEducationLevels).mockResolvedValue(unsortedLevels);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    // Get all education level cards
    const cards = screen.getAllByRole('button');
    
    // Should be in correct order: İlkokul, Ortaokul, Lise
    expect(cards[0]).toHaveTextContent('İlkokul');
    expect(cards[1]).toHaveTextContent('Ortaokul');
    expect(cards[2]).toHaveTextContent('Lise');
  });

  it('applies custom className', async () => {
    vi.mocked(educationService.getEducationLevels).mockResolvedValue(mockEducationLevels);

    const { container } = render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
        className="custom-class"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('uses fallback description when grade_range is not available', async () => {
    const levelsWithoutGradeRange = mockEducationLevels.map(level => ({
      ...level,
      grade_range: null
    }));

    vi.mocked(educationService.getEducationLevels).mockResolvedValue(levelsWithoutGradeRange);

    render(
      <EducationLevelSelector
        selectedLevel={null}
        onLevelSelect={mockOnLevelSelect}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    // Should use fallback descriptions from config
    expect(screen.getByText('1-4. Sınıf')).toBeInTheDocument();
    expect(screen.getByText('5-8. Sınıf')).toBeInTheDocument();
    expect(screen.getByText('9-12. Sınıf')).toBeInTheDocument();
  });
});