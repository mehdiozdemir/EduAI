import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '../../contexts/AuthContext';
import App from '../../App';

// Mock MSW handlers for complete API integration
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

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

describe('Complete User Flow Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();
    
    // Reset MSW handlers
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full user journey: registration → login → subject selection → quiz → performance analysis', async () => {
    // Mock successful API responses
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-jwt-token'
        });
      }),
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-jwt-token'
        });
      }),
      http.get('/api/subjects', () => {
        return HttpResponse.json([
          {
            id: 1,
            name: 'Mathematics',
            description: 'Mathematical concepts and problem solving',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            name: 'Physics',
            description: 'Physical sciences and natural phenomena',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        ]);
      }),
      http.get('/api/subjects/1/topics', () => {
        return HttpResponse.json([
          {
            id: 1,
            subject_id: 1,
            name: 'Algebra',
            description: 'Algebraic equations and expressions',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 2,
            subject_id: 1,
            name: 'Geometry',
            description: 'Geometric shapes and calculations',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        ]);
      }),
      http.post('/api/questions/generate', () => {
        return HttpResponse.json({
          questions: [
            {
              id: '1',
              content: 'What is 2 + 2?',
              options: ['2', '3', '4', '5'],
              correct_answer: '4',
              explanation: 'Basic addition: 2 + 2 = 4'
            },
            {
              id: '2',
              content: 'What is the square root of 16?',
              options: ['2', '3', '4', '8'],
              correct_answer: '4',
              explanation: 'Square root of 16 is 4 because 4 × 4 = 16'
            }
          ],
          metadata: {
            subject: 'Mathematics',
            topic: 'Algebra',
            difficulty: 'easy',
            count: 2
          }
        });
      }),
      http.post('/api/questions/evaluate', () => {
        return HttpResponse.json({
          is_correct: true,
          score: 1,
          feedback: 'Correct answer!',
          explanation: 'Well done!'
        });
      }),
      http.post('/api/performance/analyze', () => {
        return HttpResponse.json({
          id: 1,
          user_id: 1,
          subject_id: 1,
          topic_id: 1,
          total_questions: 2,
          correct_answers: 2,
          accuracy: 100,
          weakness_level: 0,
          created_at: '2024-01-01T00:00:00Z'
        });
      }),
      http.get('/api/performance/1/recommendations', () => {
        return HttpResponse.json([
          {
            id: 1,
            resource_type: 'youtube',
            title: 'Algebra Basics',
            url: 'https://youtube.com/watch?v=example',
            description: 'Learn algebra fundamentals',
            relevance_score: 0.95
          },
          {
            id: 2,
            resource_type: 'book',
            title: 'Mathematics Textbook',
            url: 'https://example.com/book',
            description: 'Comprehensive math textbook',
            relevance_score: 0.88
          }
        ]);
      })
    );

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Step 1: Registration
    // Should start at login page, navigate to register
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    const registerLink = screen.getByText(/sign up/i);
    await user.click(registerLink);

    // Fill registration form
    await waitFor(() => {
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const registerButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(registerButton);

    // Step 2: Should be redirected to dashboard after registration
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // Step 3: Navigate to subjects
    const subjectsLink = screen.getByText(/subjects/i);
    await user.click(subjectsLink);

    // Step 4: Select Mathematics subject
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });

    const mathSubject = screen.getByText('Mathematics');
    await user.click(mathSubject);

    // Step 5: Select Algebra topic
    await waitFor(() => {
      expect(screen.getByText('Algebra')).toBeInTheDocument();
    });

    const algebraTopic = screen.getByText('Algebra');
    await user.click(algebraTopic);

    // Step 6: Generate questions
    await waitFor(() => {
      expect(screen.getByText(/generate questions/i)).toBeInTheDocument();
    });

    const difficultySelect = screen.getByLabelText(/difficulty/i);
    const countInput = screen.getByLabelText(/number of questions/i);
    const generateButton = screen.getByText(/generate questions/i);

    await user.selectOptions(difficultySelect, 'easy');
    await user.clear(countInput);
    await user.type(countInput, '2');
    await user.click(generateButton);

    // Step 7: Answer questions
    await waitFor(() => {
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    // Answer first question
    const option4 = screen.getByText('4');
    await user.click(option4);

    await waitFor(() => {
      expect(screen.getByText('Correct answer!')).toBeInTheDocument();
    });

    // Move to next question
    const nextButton = screen.getByText(/next question/i);
    await user.click(nextButton);

    // Answer second question
    await waitFor(() => {
      expect(screen.getByText('What is the square root of 16?')).toBeInTheDocument();
    });

    const option4Second = screen.getByText('4');
    await user.click(option4Second);

    await waitFor(() => {
      expect(screen.getByText('Correct answer!')).toBeInTheDocument();
    });

    // Complete quiz
    const finishButton = screen.getByText(/finish quiz/i);
    await user.click(finishButton);

    // Step 8: View quiz results
    await waitFor(() => {
      expect(screen.getByText(/quiz complete/i)).toBeInTheDocument();
      expect(screen.getByText(/score: 2\/2/i)).toBeInTheDocument();
    });

    // Step 9: Navigate to performance analysis
    const viewPerformanceButton = screen.getByText(/view performance/i);
    await user.click(viewPerformanceButton);

    // Step 10: Verify performance analysis page
    await waitFor(() => {
      expect(screen.getByText(/performance analysis/i)).toBeInTheDocument();
      expect(screen.getByText(/accuracy: 100%/i)).toBeInTheDocument();
    });

    // Step 11: Verify resource recommendations
    await waitFor(() => {
      expect(screen.getByText(/recommended resources/i)).toBeInTheDocument();
      expect(screen.getByText('Algebra Basics')).toBeInTheDocument();
      expect(screen.getByText('Mathematics Textbook')).toBeInTheDocument();
    });

    // Verify complete flow completed successfully
    expect(localStorage.getItem('auth_token')).toBe('mock-jwt-token');
  });

  it('should handle errors gracefully throughout the user flow', async () => {
    // Mock error responses
    server.use(
      http.post('/api/auth/register', () => {
        return HttpResponse.json(
          { error: 'Username already exists' },
          { status: 400 }
        );
      }),
      http.get('/api/subjects', () => {
        return HttpResponse.json(
          { error: 'Failed to load subjects' },
          { status: 500 }
        );
      }),
      http.post('/api/questions/generate', () => {
        return HttpResponse.json(
          { error: 'Question generation failed' },
          { status: 500 }
        );
      })
    );

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Test registration error
    const registerLink = screen.getByText(/sign up/i);
    await user.click(registerLink);

    await waitFor(() => {
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    // Fill form and submit
    const usernameInput = screen.getByLabelText(/username/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'existinguser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const registerButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(registerButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
    });

    // Test subjects loading error (mock successful login first)
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-jwt-token'
        });
      })
    );

    // Navigate to login
    const loginLink = screen.getByText(/sign in/i);
    await user.click(loginLink);

    // Login successfully
    const loginUsernameInput = screen.getByLabelText(/username/i);
    const loginPasswordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(loginUsernameInput, 'testuser');
    await user.type(loginPasswordInput, 'password123');
    await user.click(loginButton);

    // Navigate to subjects (should show error)
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    const subjectsLink = screen.getByText(/subjects/i);
    await user.click(subjectsLink);

    // Should show subjects loading error
    await waitFor(() => {
      expect(screen.getByText(/failed to load subjects/i)).toBeInTheDocument();
    });

    // Should show retry button
    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeInTheDocument();
  });

  it('should maintain state across navigation', async () => {
    // Mock successful responses
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-jwt-token'
        });
      }),
      http.get('/api/subjects', () => {
        return HttpResponse.json([
          {
            id: 1,
            name: 'Mathematics',
            description: 'Mathematical concepts',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          }
        ]);
      })
    );

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Login
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    // Navigate to subjects
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    const subjectsLink = screen.getByText(/subjects/i);
    await user.click(subjectsLink);

    // Verify subjects loaded
    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });

    // Navigate back to dashboard
    const dashboardLink = screen.getByText(/dashboard/i);
    await user.click(dashboardLink);

    // Should still be authenticated
    await waitFor(() => {
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    });

    // Navigate back to subjects - should use cached data
    await user.click(subjectsLink);

    // Should show subjects immediately (from cache)
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('should handle logout and require re-authentication', async () => {
    // Mock successful login
    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json({
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          token: 'mock-jwt-token'
        });
      }),
      http.post('/api/auth/logout', () => {
        return HttpResponse.json({ message: 'Logged out successfully' });
      })
    );

    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );

    // Login
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    // Should be on dashboard
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    // Logout
    const logoutButton = screen.getByText(/logout/i);
    await user.click(logoutButton);

    // Should be redirected to login
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });

    // Token should be cleared
    expect(localStorage.getItem('auth_token')).toBeNull();

    // Trying to access protected route should redirect to login
    window.history.pushState({}, '', '/dashboard');
    
    await waitFor(() => {
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });
});