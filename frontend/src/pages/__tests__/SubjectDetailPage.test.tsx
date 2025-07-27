import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { SubjectDetailPage } from '../SubjectDetailPage';
import { subjectService } from '../../services/subjectService';
import { AuthProvider } from '../../contexts/AuthContext';
import type { Subject, Topic } from '../../types';

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
    useParams: () => ({ subjectId: '1' }),
  };
});

const mockSubject: Subject = {
  id: 1,
  name: 'Matematik',
  description: 'Temel matematik konuları ve problemleri',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockTopics: Topic[] = [
  {
    id: 1,
    subject_id: 1,
    name: 'Cebir',
    description: 'Temel cebir konuları',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    subject_id: 1,
    name: 'Geometri',
    description: 'Temel geometri konuları',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('SubjectDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders loading state initially', () => {
    mockSubjectService.getSubject.mockImplementation(() => new Promise(() => {}));
    mockSubjectService.getTopics.mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<SubjectDetailPage />);
    
    expect(screen.getByText('← Derslere Dön')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders subject and topics when loaded successfully', async () => {
    mockSubjectService.getSubject.mockResolvedValue(mockSubject);
    mockSubjectService.getTopics.mockResolvedValue(mockTopics);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
      expect(screen.getByText('Temel matematik konuları ve problemleri')).toBeInTheDocument();
      expect(screen.getByText('Cebir')).toBeInTheDocument();
      expect(screen.getByText('Geometri')).toBeInTheDocument();
    });
  });

  it('renders error state when loading fails', async () => {
    const errorMessage = 'Network error';
    mockSubjectService.getSubject.mockRejectedValue(new Error(errorMessage));
    mockSubjectService.getTopics.mockRejectedValue(new Error(errorMessage));
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bir hata oluştu')).toBeInTheDocument();
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });
  });

  it('renders empty topics state', async () => {
    mockSubjectService.getSubject.mockResolvedValue(mockSubject);
    mockSubjectService.getTopics.mockResolvedValue([]);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
      expect(screen.getByText('Henüz konu bulunmuyor')).toBeInTheDocument();
    });
  });

  it('retries loading when retry button is clicked', async () => {
    mockSubjectService.getSubject
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockSubject);
    mockSubjectService.getTopics
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockTopics);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Tekrar Dene'));
    
    await waitFor(() => {
      expect(screen.getByText('Matematik')).toBeInTheDocument();
    });
    
    expect(mockSubjectService.getSubject).toHaveBeenCalledTimes(2);
    expect(mockSubjectService.getTopics).toHaveBeenCalledTimes(2);
  });

  it('navigates back to subjects when back button is clicked', async () => {
    mockSubjectService.getSubject.mockResolvedValue(mockSubject);
    mockSubjectService.getTopics.mockResolvedValue(mockTopics);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('← Derslere Dön')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('← Derslere Dön'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/subjects');
  });

  it('navigates to question generation when topic is selected', async () => {
    mockSubjectService.getSubject.mockResolvedValue(mockSubject);
    mockSubjectService.getTopics.mockResolvedValue(mockTopics);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Cebir')).toBeInTheDocument();
    });
    
    const topicCard = screen.getByText('Cebir').closest('.cursor-pointer');
    fireEvent.click(topicCard!);
    
    expect(mockNavigate).toHaveBeenCalledWith('/questions/generate?subject=1&topic=1');
  });

  it('refreshes topics when refresh button is clicked', async () => {
    mockSubjectService.getSubject.mockResolvedValue(mockSubject);
    mockSubjectService.getTopics.mockResolvedValue(mockTopics);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Yenile')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Yenile'));
    
    expect(mockSubjectService.getTopics).toHaveBeenCalledTimes(2);
  });

  it('displays subject creation date', async () => {
    mockSubjectService.getSubject.mockResolvedValue(mockSubject);
    mockSubjectService.getTopics.mockResolvedValue(mockTopics);
    
    renderWithProviders(<SubjectDetailPage />);
    
    await waitFor(() => {
      const creationDates = screen.getAllByText(/Oluşturulma:/);
      expect(creationDates.length).toBeGreaterThan(0);
    });
  });
});