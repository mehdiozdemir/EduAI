import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { SubjectListPage } from '../SubjectListPage';
import { subjectService } from '../../services/subjectService';
import AuthProvider from '../../contexts/AuthContext';
import type { Subject } from '../../types';

// Mock the services
vi.mock('../../services/subjectService');
const mockSubjectService = vi.mocked(subjectService);

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSubjects: Subject[] = [
  {
    id: 1,
    name: 'Matematik',
    description: 'Temel matematik konuları',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Fizik',
    description: 'Temel fizik konuları',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('SubjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders loading state initially', () => {
    mockSubjectService.getSubjects.mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<SubjectListPage />);

    expect(screen.getByText('Dersler')).toBeInTheDocument();
    expect(
      screen.getByText('Çalışmak istediğiniz dersi seçin')
    ).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders subjects when loaded successfully', async () => {
    mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
      expect(screen.getByText('Fizik')).toBeInTheDocument();
    });
  });

  it('renders empty state when no subjects', async () => {
    mockSubjectService.getSubjects.mockResolvedValue([]);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Henüz ders bulunmuyor')).toBeInTheDocument();
      expect(
        screen.getByText('Sistemde henüz ders eklenmemiş.')
      ).toBeInTheDocument();
    });
  });

  it('renders error state when loading fails', async () => {
    const errorMessage = 'Network error';
    mockSubjectService.getSubjects.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });
  });

  it('retries loading when retry button is clicked', async () => {
    mockSubjectService.getSubjects
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockSubjects);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Tekrar Dene'));

    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
    });

    expect(mockSubjectService.getSubjects).toHaveBeenCalledTimes(2);
  });

  it('navigates to subject detail when subject is clicked', async () => {
    mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
    });

    const subjectCard = screen
      .getByText('Matematik')
      .closest('.cursor-pointer');
    fireEvent.click(subjectCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/subjects/1');
  });

  it('displays subjects in grid layout', async () => {
    mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      const grid = screen.getByText('Matematik').closest('.grid');
      expect(grid).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3'
      );
    });
  });
});
