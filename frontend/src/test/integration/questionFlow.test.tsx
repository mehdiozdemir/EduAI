import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '../../contexts/AuthContext';
import { SubjectListPage } from '../../pages/SubjectListPage';
import { SubjectDetailPage } from '../../pages/SubjectDetailPage';
import { QuestionPage } from '../../pages/QuestionPage';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockParams = { id: '1', topicId: '1' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Question Flow Integration', () => {
  beforeEach(() => {
    // Mock authenticated user
    localStorage.setItem('auth_token', 'mock-jwt-token');
    vi.clearAllMocks();
  });

  it('should complete subject selection flow', async () => {
    render(
      <TestWrapper>
        <SubjectListPage />
      </TestWrapper>
    );

    // Wait for subjects to load
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
    });

    // Click on Mathematics subject
    const mathSubject = screen.getByText('Mathematics');
    fireEvent.click(mathSubject);

    // Should navigate to subject detail
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/subjects/1');
    });
  });

  it('should complete topic selection flow', async () => {
    render(
      <TestWrapper>
        <SubjectDetailPage />
      </TestWrapper>
    );

    // Wait for topics to load
    await waitFor(() => {
      expect(screen.getByText('Algebra')).toBeInTheDocument();
      expect(screen.getByText('Geometry')).toBeInTheDocument();
    });

    // Click on Algebra topic
    const algebraTopic = screen.getByText('Algebra');
    fireEvent.click(algebraTopic);

    // Should navigate to question page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/questions/1/1');
    });
  });

  it('should complete question generation and answering flow', async () => {
    render(
      <TestWrapper>
        <QuestionPage />
      </TestWrapper>
    );

    // Wait for page to load
    await waitFor(() => {
      expect(screen.getByText('Generate Questions')).toBeInTheDocument();
    });

    // Configure question parameters
    const difficultySelect = screen.getByLabelText(/difficulty/i);
    const countInput = screen.getByLabelText(/number of questions/i);
    const generateButton = screen.getByText('Generate Questions');

    fireEvent.change(difficultySelect, { target: { value: 'easy' } });
    fireEvent.change(countInput, { target: { value: '2' } });
    fireEvent.click(generateButton);

    // Wait for questions to be generated
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    // Answer the first question
    const option4 = screen.getByText('4');
    fireEvent.click(option4);

    // Wait for evaluation
    await waitFor(() => {
      expect(screen.getByText('Correct answer!')).toBeInTheDocument();
    });

    // Move to next question
    const nextButton = screen.getByText('Next Question');
    fireEvent.click(nextButton);

    // Should show second question
    await waitFor(() => {
      expect(screen.getByText('What is the square root of 16?')).toBeInTheDocument();
    });

    // Answer the second question
    const option4Second = screen.getByText('4');
    fireEvent.click(option4Second);

    // Wait for quiz completion
    await waitFor(() => {
      expect(screen.getByText('Quiz Complete!')).toBeInTheDocument();
      expect(screen.getByText('Score: 2/2 (100%)')).toBeInTheDocument();
    });
  });

  it('should handle incorrect answers with feedback', async () => {
    render(
      <TestWrapper>
        <QuestionPage />
      </TestWrapper>
    );

    // Generate questions
    await waitFor(() => {
      expect(screen.getByText('Generate Questions')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Questions');
    fireEvent.click(generateButton);

    // Wait for questions
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    // Answer incorrectly
    const option3 = screen.getByText('3');
    fireEvent.click(option3);

    // Wait for evaluation
    await waitFor(() => {
      expect(screen.getByText('Incorrect. Try again.')).toBeInTheDocument();
    });
  });

  it('should show loading states during question generation', async () => {
    render(
      <TestWrapper>
        <QuestionPage />
      </TestWrapper>
    );

    const generateButton = screen.getByText('Generate Questions');
    fireEvent.click(generateButton);

    // Should show loading state
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });
  });

  it('should handle question generation errors', async () => {
    // Mock error response
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Generation failed'));

    render(
      <TestWrapper>
        <QuestionPage />
      </TestWrapper>
    );

    const countInput = screen.getByLabelText(/number of questions/i);
    const generateButton = screen.getByText('Generate Questions');

    // Request too many questions to trigger error
    fireEvent.change(countInput, { target: { value: '15' } });
    fireEvent.click(generateButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/failed to generate questions/i)).toBeInTheDocument();
    });
  });

  it('should track quiz progress', async () => {
    render(
      <TestWrapper>
        <QuestionPage />
      </TestWrapper>
    );

    // Generate questions
    const generateButton = screen.getByText('Generate Questions');
    fireEvent.click(generateButton);

    // Wait for questions
    await waitFor(() => {
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
    });

    // Answer first question
    const option4 = screen.getByText('4');
    fireEvent.click(option4);

    // Move to next question
    const nextButton = screen.getByText('Next Question');
    fireEvent.click(nextButton);

    // Should show updated progress
    await waitFor(() => {
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });
  });
});