import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { SubjectListPage } from '../SubjectListPage';
import { subjectService } from '../../services/subjectService';
import { educationService } from '../../services/educationService';
import AuthProvider from '../../contexts/AuthContext';
import { ErrorBoundaryProvider } from '../../components/ui/ErrorBoundaryProvider';
import type { Subject, EducationLevelData, Course } from '../../types';

// Mock the services
vi.mock('../../services/subjectService');
vi.mock('../../services/educationService');
const mockSubjectService = vi.mocked(subjectService);
const mockEducationService = vi.mocked(educationService);

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
  {
    id: 3,
    name: 'Türkçe',
    description: 'Türkçe dil bilgisi',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

const mockEducationLevels: EducationLevelData[] = [
  {
    id: 1,
    name: 'İlkokul',
    description: 'İlkokul seviyesi',
    sort_order: 1,
    grade_range: '1-4. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Ortaokul',
    description: 'Ortaokul seviyesi',
    sort_order: 2,
    grade_range: '5-8. Sınıf',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Lise',
    description: 'Lise seviyesi',
    sort_order: 3,
    grade_range: '9-12. Sınıf',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

const mockCourses: Course[] = [
  {
    id: 1,
    name: 'İlkokul Matematik',
    description: 'İlkokul matematik dersi',
    education_level_id: 1,
    code: 'ILK-MAT',
    color: '#3B82F6',
    icon: 'math',
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Lise Fizik',
    description: 'Lise fizik dersi',
    education_level_id: 3,
    code: 'LIS-FIZ',
    color: '#10B981',
    icon: 'physics',
    is_active: 1,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundaryProvider>
          {component}
        </ErrorBoundaryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SubjectListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Default mock implementations
    mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);
    mockEducationService.getEducationLevels.mockResolvedValue(mockEducationLevels);
    mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);
  });

  it('renders loading state initially', () => {
    mockSubjectService.getSubjects.mockImplementation(
      () => new Promise(() => {})
    );
    mockEducationService.getEducationLevels.mockImplementation(
      () => new Promise(() => {})
    );

    renderWithProviders(<SubjectListPage />);

    expect(screen.getByText('Dersler')).toBeInTheDocument();
    expect(
      screen.getByText('Çalışmak istediğiniz dersi seçin')
    ).toBeInTheDocument();
    expect(screen.getByText('Dersler yükleniyor...')).toBeInTheDocument();
  });

  it('renders education level selection when loaded successfully', async () => {
    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
      expect(screen.getByText('Ortaokul')).toBeInTheDocument();
      expect(screen.getByText('Lise')).toBeInTheDocument();
    });
  });

  it('renders empty state when no education levels or subjects', async () => {
    mockSubjectService.getSubjects.mockResolvedValue([]);
    mockEducationService.getEducationLevels.mockResolvedValue([]);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('No Content Available')).toBeInTheDocument();
      expect(
        screen.getByText('No education levels or subjects have been added to the system yet.')
      ).toBeInTheDocument();
    });
  });

  it('renders error state when loading fails', async () => {
    const errorMessage = 'Network error';
    mockSubjectService.getSubjects.mockRejectedValue(new Error(errorMessage));
    mockEducationService.getEducationLevels.mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      // When both education levels and subjects fail to load, it shows the general empty state
      expect(screen.getByText('No Content Available')).toBeInTheDocument();
      expect(screen.getByText('No education levels or subjects have been added to the system yet.')).toBeInTheDocument();
    });
  });

  it('loads data successfully after initial load', async () => {
    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
    });

    expect(mockSubjectService.getSubjects).toHaveBeenCalledTimes(1);
    expect(mockEducationService.getEducationLevels).toHaveBeenCalledTimes(1);
  });

  it('navigates to subject detail when subject is clicked after selecting education level', async () => {
    mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    // Select education level first
    fireEvent.click(screen.getByText('İlkokul'));

    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
    });

    const subjectCard = screen
      .getByText('Matematik')
      .closest('.cursor-pointer');
    fireEvent.click(subjectCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/subjects/1');
  });

  it('displays subjects in grid layout after selecting education level', async () => {
    mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);

    renderWithProviders(<SubjectListPage />);

    await waitFor(() => {
      expect(screen.getByText('İlkokul')).toBeInTheDocument();
    });

    // Select education level first
    fireEvent.click(screen.getByText('İlkokul'));

    await waitFor(() => {
      const grid = screen.getByText('Matematik').closest('.grid');
      expect(grid).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-4'
      );
    });
  });

  describe('Education Level Filtering', () => {
    it('displays education level selection when no level is selected', async () => {
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
        expect(screen.getByText('Ortaokul')).toBeInTheDocument();
        expect(screen.getByText('Lise')).toBeInTheDocument();
      });
    });

    it('shows empty state when no education level is selected', async () => {
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
        expect(screen.getByText('Derslerinizi görmek için önce eğitim seviyenizi seçin.')).toBeInTheDocument();
      });
    });

    it('fetches courses when education level is selected', async () => {
      const ilkokulCourses = [mockCourses[0]]; // İlkokul Matematik
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue(ilkokulCourses);

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(1);
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
      });
    });

    it('displays courses for selected education level', async () => {
      const ilkokulCourses = [mockCourses[0]]; // İlkokul Matematik
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue(ilkokulCourses);

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
        expect(screen.getByText('İlkokul matematik dersi')).toBeInTheDocument();
        expect(screen.getByText('ILK-MAT')).toBeInTheDocument();
      });
    });

    it('filters subjects correctly when no courses available', async () => {
      // No courses available, should fall back to subject filtering
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        // Should show filtered subjects for İlkokul (Matematik, Türkçe should be visible, Fizik should not)
        expect(screen.getByText('Matematik')).toBeInTheDocument();
        expect(screen.getByText('Türkçe')).toBeInTheDocument();
        expect(screen.queryByText('Fizik')).not.toBeInTheDocument();
        expect(screen.getByText('Geçici olarak eski ders sistemi kullanılıyor.')).toBeInTheDocument();
      });
    });

    it('allows changing education level selection', async () => {
      const ilkokulCourses = [mockCourses[0]];
      const liseCourses = [mockCourses[1]];
      
      mockEducationService.getCoursesByEducationLevel
        .mockResolvedValueOnce(ilkokulCourses)
        .mockResolvedValueOnce(liseCourses);

      renderWithProviders(<SubjectListPage />);

      // Select İlkokul first
      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
      });

      // Change to Lise
      fireEvent.click(screen.getByText('Değiştir'));

      await waitFor(() => {
        expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Lise'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: Lise')).toBeInTheDocument();
        expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(3);
      });
    });

    it('shows empty state when no courses for selected education level', async () => {
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);
      // Also mock empty subjects to test the empty state
      mockSubjectService.getSubjects.mockResolvedValue([]);

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('Bu Eğitim Seviyesi İçin Ders Bulunmuyor')).toBeInTheDocument();
        expect(screen.getByText('İlkokul seviyesi için henüz ders eklenmemiş.')).toBeInTheDocument();
      });
    });

    it('navigates to course detail when course is clicked', async () => {
      const ilkokulCourses = [mockCourses[0]];
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue(ilkokulCourses);

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul Matematik'));

      expect(mockNavigate).toHaveBeenCalledWith('/courses/1');
    });

    it('shows loading state when fetching courses', async () => {
      // Create a promise that we can control
      let resolveCourses: (courses: Course[]) => void;
      const coursesPromise = new Promise<Course[]>((resolve) => {
        resolveCourses = resolve;
      });
      
      mockEducationService.getCoursesByEducationLevel.mockReturnValue(coursesPromise);

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Dersler yükleniyor...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveCourses!([mockCourses[0]]);

      await waitFor(() => {
        expect(screen.queryByText('Dersler yükleniyor...')).not.toBeInTheDocument();
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
      });
    });

    it('handles course loading errors gracefully', async () => {
      mockEducationService.getCoursesByEducationLevel.mockRejectedValue(new Error('Network error'));

      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        // Should fall back to subject filtering when course loading fails
        expect(screen.getByText('Matematik')).toBeInTheDocument();
        expect(screen.getByText('Türkçe')).toBeInTheDocument();
      });
    });
  });
});
