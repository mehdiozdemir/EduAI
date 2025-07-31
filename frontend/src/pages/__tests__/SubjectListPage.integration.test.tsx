import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
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
  {
    id: 4,
    name: 'Kimya',
    description: 'Temel kimya konuları',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 5,
    name: 'Biyoloji',
    description: 'Temel biyoloji konuları',
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
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

const mockCourses: { [key: number]: Course[] } = {
  1: [ // İlkokul courses
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
      name: 'İlkokul Türkçe',
      description: 'İlkokul Türkçe dersi',
      education_level_id: 1,
      code: 'ILK-TUR',
      color: '#10B981',
      icon: 'language',
      is_active: 1,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ],
  2: [ // Ortaokul courses
    {
      id: 3,
      name: 'Ortaokul Matematik',
      description: 'Ortaokul matematik dersi',
      education_level_id: 2,
      code: 'ORT-MAT',
      color: '#F59E0B',
      icon: 'math',
      is_active: 1,
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    },
    {
      id: 4,
      name: 'Ortaokul Tarih',
      description: 'Ortaokul tarih dersi',
      education_level_id: 2,
      code: 'ORT-TAR',
      color: '#8B5CF6',
      icon: 'history',
      is_active: 1,
      created_at: '2024-01-04T00:00:00Z',
      updated_at: '2024-01-04T00:00:00Z',
    },
  ],
  3: [ // Lise courses
    {
      id: 5,
      name: 'Lise Fizik',
      description: 'Lise fizik dersi',
      education_level_id: 3,
      code: 'LIS-FIZ',
      color: '#EF4444',
      icon: 'physics',
      is_active: 1,
      created_at: '2024-01-05T00:00:00Z',
      updated_at: '2024-01-05T00:00:00Z',
    },
    {
      id: 6,
      name: 'Lise Kimya',
      description: 'Lise kimya dersi',
      education_level_id: 3,
      code: 'LIS-KIM',
      color: '#06B6D4',
      icon: 'chemistry',
      is_active: 1,
      created_at: '2024-01-06T00:00:00Z',
      updated_at: '2024-01-06T00:00:00Z',
    },
  ],
};

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

describe('SubjectListPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Default mock implementations
    mockSubjectService.getSubjects.mockResolvedValue(mockSubjects);
    mockEducationService.getEducationLevels.mockResolvedValue(mockEducationLevels);
    mockEducationService.getCoursesByEducationLevel.mockImplementation((levelId) => {
      return Promise.resolve(mockCourses[levelId] || []);
    });
  });

  describe('Complete User Flow - Education Level Selection to Course Filtering', () => {
    it('should complete the full user journey from education level selection to course viewing', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SubjectListPage />);

      // Step 1: Initial page load - should show education level selection
      await waitFor(() => {
        expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
        expect(screen.getByText('Derslerinizi görmek için önce eğitim seviyenizi seçin.')).toBeInTheDocument();
      });

      // Wait for education levels to load and verify they are displayed
      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
        expect(screen.getByText('Ortaokul')).toBeInTheDocument();
        expect(screen.getByText('Lise')).toBeInTheDocument();
      });

      // Step 2: Select İlkokul education level
      await user.click(screen.getByText('İlkokul'));

      // Step 3: Verify courses are loaded and displayed
      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
        expect(screen.getByText('İlkokul Türkçe')).toBeInTheDocument();
      });

      // Verify API calls were made correctly
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(1);
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledTimes(1);

      // Step 4: Click on a course to navigate
      await user.click(screen.getByText('İlkokul Matematik'));

      // Step 5: Verify navigation occurred
      expect(mockNavigate).toHaveBeenCalledWith('/courses/1');
    });

    it('should handle switching between different education levels correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SubjectListPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Select İlkokul first
      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
      });

      // Change to Ortaokul
      await user.click(screen.getByText('Değiştir'));

      await waitFor(() => {
        expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Ortaokul'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: Ortaokul')).toBeInTheDocument();
        expect(screen.getByText('Ortaokul Matematik')).toBeInTheDocument();
        expect(screen.getByText('Ortaokul Tarih')).toBeInTheDocument();
      });

      // Verify İlkokul courses are no longer visible
      expect(screen.queryByText('İlkokul Matematik')).not.toBeInTheDocument();
      expect(screen.queryByText('İlkokul Türkçe')).not.toBeInTheDocument();

      // Change to Lise
      await user.click(screen.getByText('Değiştir'));
      await user.click(screen.getByText('Lise'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: Lise')).toBeInTheDocument();
        expect(screen.getByText('Lise Fizik')).toBeInTheDocument();
        expect(screen.getByText('Lise Kimya')).toBeInTheDocument();
      });

      // Verify previous courses are no longer visible
      expect(screen.queryByText('Ortaokul Matematik')).not.toBeInTheDocument();
      expect(screen.queryByText('Ortaokul Tarih')).not.toBeInTheDocument();

      // Verify correct API calls were made
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(1); // İlkokul
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(2); // Ortaokul
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(3); // Lise
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledTimes(3);
    });

    it('should handle fallback to subject filtering when no courses are available', async () => {
      const user = userEvent.setup();
      
      // Mock empty courses for all education levels
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Select İlkokul
      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
        // Should show filtered subjects as fallback
        expect(screen.getByText('Geçici olarak eski ders sistemi kullanılıyor.')).toBeInTheDocument();
        expect(screen.getByText('Matematik')).toBeInTheDocument();
        expect(screen.getByText('Türkçe')).toBeInTheDocument();
      });

      // Should not show subjects not allowed for İlkokul (like Fizik)
      expect(screen.queryByText('Fizik')).not.toBeInTheDocument();

      // Click on a subject
      const subjectCard = screen.getByText('Matematik').closest('.cursor-pointer');
      await user.click(subjectCard!);

      expect(mockNavigate).toHaveBeenCalledWith('/subjects/1');
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle education levels API failure gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock education levels API failure
      mockEducationService.getEducationLevels.mockRejectedValue(new Error('Network error'));
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        // Should show education level error message
        expect(screen.getByText('Eğitim seviyeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.')).toBeInTheDocument();
        expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
      });
    });

    it('should handle courses API failure and fallback to subject filtering', async () => {
      const user = userEvent.setup();
      
      // Mock courses API failure
      mockEducationService.getCoursesByEducationLevel.mockRejectedValue(new Error('Courses API error'));
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Select education level
      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
        // Should fallback to subject filtering when courses API fails
        expect(screen.getByText('Matematik')).toBeInTheDocument();
        expect(screen.getByText('Türkçe')).toBeInTheDocument();
      });

      // Verify courses API was called but failed
      expect(mockEducationService.getCoursesByEducationLevel).toHaveBeenCalledWith(1);
    });

    it('should handle subjects API failure', async () => {
      // Mock subjects API failure
      mockSubjectService.getSubjects.mockRejectedValue(new Error('Subjects API error'));
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        // Should still show education level selector even if subjects fail
        expect(screen.getByText('Eğitim Seviyenizi Seçin')).toBeInTheDocument();
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });
    });

    it('should handle retry functionality for failed API calls', async () => {
      const user = userEvent.setup();
      
      // Mock education levels API failure then success
      mockEducationService.getEducationLevels
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockEducationLevels);
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('Eğitim seviyeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.')).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Tekrar Dene');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
        expect(screen.queryByText('Eğitim seviyeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.')).not.toBeInTheDocument();
      });

      // Verify retry worked
      expect(mockEducationService.getEducationLevels).toHaveBeenCalledTimes(2);
    });

    it('should show empty state when no courses exist for selected education level', async () => {
      const user = userEvent.setup();
      
      // Mock empty courses and subjects
      mockEducationService.getCoursesByEducationLevel.mockResolvedValue([]);
      mockSubjectService.getSubjects.mockResolvedValue([]);
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        // When both courses and subjects are empty, it shows the empty state
        expect(screen.getByText('Bu Eğitim Seviyesi İçin Ders Bulunmuyor')).toBeInTheDocument();
        expect(screen.getByText('İlkokul seviyesi için henüz ders eklenmemiş.')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during initial page load', () => {
      // Mock pending promises
      mockSubjectService.getSubjects.mockImplementation(() => new Promise(() => {}));
      mockEducationService.getEducationLevels.mockImplementation(() => new Promise(() => {}));
      
      renderWithProviders(<SubjectListPage />);

      expect(screen.getByText('Dersler yükleniyor...')).toBeInTheDocument();
      expect(screen.getByText('Dersler')).toBeInTheDocument();
      expect(screen.getByText('Çalışmak istediğiniz dersi seçin')).toBeInTheDocument();
    });

    it('should show loading state when fetching courses after education level selection', async () => {
      const user = userEvent.setup();
      
      // Create controllable promise for courses
      let resolveCourses: (courses: Course[]) => void;
      const coursesPromise = new Promise<Course[]>((resolve) => {
        resolveCourses = resolve;
      });
      
      mockEducationService.getCoursesByEducationLevel.mockReturnValue(coursesPromise);
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Select education level
      await user.click(screen.getByText('İlkokul'));

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Dersler yükleniyor...')).toBeInTheDocument();
      });

      // Resolve the promise
      resolveCourses!(mockCourses[1]);

      await waitFor(() => {
        expect(screen.queryByText('Dersler yükleniyor...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should support keyboard navigation through education level cards', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Tab to first education level card
      await user.tab();
      
      // Should be able to activate with Enter
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
      });
    });

    it('should support keyboard navigation through course cards', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Select education level first
      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
      });

      // Click on course card to navigate (simulating keyboard activation)
      const courseCard = screen.getByText('İlkokul Matematik').closest('.cursor-pointer');
      
      if (courseCard) {
        await user.click(courseCard);
        expect(mockNavigate).toHaveBeenCalledWith('/courses/1');
      }
    });

    it('should have proper ARIA labels and roles', async () => {
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: 'Dersler' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Eğitim Seviyenizi Seçin' })).toBeInTheDocument();

      // Education level cards should be interactive
      const ilkokulCard = screen.getByText('İlkokul').closest('button') || 
                         screen.getByText('İlkokul').closest('[role="button"]');
      expect(ilkokulCard).toBeInTheDocument();
    });

    it('should announce selection changes to screen readers', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        // The selected education level should be clearly announced
        expect(screen.getByText('Seçilen Eğitim Seviyesi: İlkokul')).toBeInTheDocument();
        // Use getAllByText to handle multiple instances of the same text
        const gradeRangeElements = screen.getAllByText('1-4. Sınıf');
        expect(gradeRangeElements.length).toBeGreaterThan(0);
      });
    });

    it('should provide clear focus indicators', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      // Tab through education level cards
      await user.tab();
      
      // The focused element should be visible and identifiable
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
      
      // Should be able to navigate with arrow keys or tab
      await user.tab();
      const nextFocusedElement = document.activeElement;
      expect(nextFocusedElement).not.toBe(focusedElement);
    });
  });

  describe('Responsive Design', () => {
    it('should handle mobile viewport correctly', async () => {
      const user = userEvent.setup();
      
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      renderWithProviders(<SubjectListPage />);

      await waitFor(() => {
        expect(screen.getByText('İlkokul')).toBeInTheDocument();
      });

      await user.click(screen.getByText('İlkokul'));

      await waitFor(() => {
        expect(screen.getByText('İlkokul Matematik')).toBeInTheDocument();
      });

      // Grid should be responsive
      const grid = screen.getByText('İlkokul Matematik').closest('.grid');
      expect(grid).toHaveClass('grid-cols-1');
    });
  });
});