import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authService } from '../../services/authService';
import { subjectService } from '../../services/subjectService';
import { questionService } from '../../services/questionService';
import { performanceService } from '../../services/performanceService';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset MSW handlers
    server.resetHandlers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication API Integration', () => {
    it('should successfully register a new user', async () => {
      server.use(
        http.post('/api/auth/register', async ({ request }) => {
          const body = await request.json() as any;
          
          // Validate request body
          expect(body).toEqual({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
          });

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

      const result = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle registration errors', async () => {
      server.use(
        http.post('/api/auth/register', () => {
          return HttpResponse.json(
            { error: 'Username already exists' },
            { status: 400 }
          );
        })
      );

      await expect(authService.register({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123'
      })).rejects.toThrow('Username already exists');
    });

    it('should successfully login with valid credentials', async () => {
      server.use(
        http.post('/api/auth/login', async ({ request }) => {
          const body = await request.json() as any;
          
          expect(body).toEqual({
            username: 'testuser',
            password: 'password123'
          });

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

      const result = await authService.login({
        username: 'testuser',
        password: 'password123'
      });

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should handle login errors', async () => {
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      await expect(authService.login({
        username: 'wronguser',
        password: 'wrongpassword'
      })).rejects.toThrow('Invalid credentials');
    });

    it('should successfully logout', async () => {
      localStorage.setItem('auth_token', 'mock-jwt-token');

      server.use(
        http.post('/api/auth/logout', ({ request }) => {
          // Verify authorization header
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

          return HttpResponse.json({ message: 'Logged out successfully' });
        })
      );

      await authService.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Subject API Integration', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });

    it('should fetch all subjects', async () => {
      server.use(
        http.get('/api/subjects', ({ request }) => {
          // Verify authorization header
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

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
        })
      );

      const subjects = await subjectService.getSubjects();

      expect(subjects).toHaveLength(2);
      expect(subjects[0].name).toBe('Mathematics');
      expect(subjects[1].name).toBe('Physics');
    });

    it('should fetch a specific subject', async () => {
      server.use(
        http.get('/api/subjects/1', ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

          return HttpResponse.json({
            id: 1,
            name: 'Mathematics',
            description: 'Mathematical concepts and problem solving',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          });
        })
      );

      const subject = await subjectService.getSubject(1);

      expect(subject.id).toBe(1);
      expect(subject.name).toBe('Mathematics');
    });

    it('should fetch topics for a subject', async () => {
      server.use(
        http.get('/api/subjects/1/topics', ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

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
        })
      );

      const topics = await subjectService.getTopics(1);

      expect(topics).toHaveLength(2);
      expect(topics[0].name).toBe('Algebra');
      expect(topics[1].name).toBe('Geometry');
    });

    it('should handle subject API errors', async () => {
      server.use(
        http.get('/api/subjects', () => {
          return HttpResponse.json(
            { error: 'Failed to fetch subjects' },
            { status: 500 }
          );
        })
      );

      await expect(subjectService.getSubjects()).rejects.toThrow('Failed to fetch subjects');
    });
  });

  describe('Question API Integration', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });

    it('should generate questions with correct parameters', async () => {
      const questionParams = {
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy' as const,
        count: 2,
        education_level: 'high' as const
      };

      server.use(
        http.post('/api/questions/generate', async ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

          const body = await request.json() as any;
          expect(body).toEqual(questionParams);

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
        })
      );

      const result = await questionService.generateQuestions(questionParams);

      expect(result.questions).toHaveLength(2);
      expect(result.questions[0].content).toBe('What is 2 + 2?');
      expect(result.questions[0].correct_answer).toBe('4');
      expect(result.metadata.subject).toBe('Mathematics');
      expect(result.metadata.topic).toBe('Algebra');
    });

    it('should evaluate answers correctly', async () => {
      const evaluateRequest = {
        question_id: '1',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'What is 2 + 2?'
      };

      server.use(
        http.post('/api/questions/evaluate', async ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

          const body = await request.json() as any;
          expect(body).toEqual(evaluateRequest);

          return HttpResponse.json({
            is_correct: true,
            score: 1,
            feedback: 'Correct answer!',
            explanation: 'Well done! 2 + 2 equals 4.'
          });
        })
      );

      const result = await questionService.evaluateAnswer(evaluateRequest);

      expect(result.is_correct).toBe(true);
      expect(result.score).toBe(1);
      expect(result.feedback).toBe('Correct answer!');
    });

    it('should handle question generation errors', async () => {
      server.use(
        http.post('/api/questions/generate', () => {
          return HttpResponse.json(
            { error: 'Question generation failed' },
            { status: 500 }
          );
        })
      );

      await expect(questionService.generateQuestions({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 2,
        education_level: 'high'
      })).rejects.toThrow('Question generation failed');
    });
  });

  describe('Performance API Integration', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });

    it('should analyze performance correctly', async () => {
      const performanceData = {
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 5,
        correct_answers: 4,
        answers: [
          { question_id: '1', user_answer: '4', is_correct: true },
          { question_id: '2', user_answer: '3', is_correct: false },
          { question_id: '3', user_answer: '7', is_correct: true },
          { question_id: '4', user_answer: '2', is_correct: true },
          { question_id: '5', user_answer: '9', is_correct: true }
        ]
      };

      server.use(
        http.post('/api/performance/analyze', async ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

          const body = await request.json() as any;
          expect(body).toEqual(performanceData);

          return HttpResponse.json({
            id: 1,
            user_id: 1,
            subject_id: 1,
            topic_id: 1,
            total_questions: 5,
            correct_answers: 4,
            accuracy: 80,
            weakness_level: 2,
            created_at: '2024-01-01T00:00:00Z'
          });
        })
      );

      const result = await performanceService.analyzePerformance(performanceData);

      expect(result.accuracy).toBe(80);
      expect(result.total_questions).toBe(5);
      expect(result.correct_answers).toBe(4);
      expect(result.weakness_level).toBe(2);
    });

    it('should fetch user performance history', async () => {
      server.use(
        http.get('/api/performance/user/1', ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

          return HttpResponse.json([
            {
              id: 1,
              user_id: 1,
              subject_id: 1,
              topic_id: 1,
              total_questions: 5,
              correct_answers: 4,
              accuracy: 80,
              weakness_level: 2,
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              user_id: 1,
              subject_id: 2,
              topic_id: 3,
              total_questions: 3,
              correct_answers: 3,
              accuracy: 100,
              weakness_level: 0,
              created_at: '2024-01-02T00:00:00Z'
            }
          ]);
        })
      );

      const result = await performanceService.getUserPerformance(1);

      expect(result).toHaveLength(2);
      expect(result[0].accuracy).toBe(80);
      expect(result[1].accuracy).toBe(100);
    });

    it('should fetch resource recommendations', async () => {
      server.use(
        http.get('/api/performance/1/recommendations', ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          expect(authHeader).toBe('Bearer mock-jwt-token');

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
            },
            {
              id: 3,
              resource_type: 'website',
              title: 'Khan Academy Algebra',
              url: 'https://khanacademy.org/algebra',
              description: 'Interactive algebra lessons',
              relevance_score: 0.92
            }
          ]);
        })
      );

      const result = await performanceService.getRecommendations(1);

      expect(result).toHaveLength(3);
      expect(result[0].resource_type).toBe('youtube');
      expect(result[1].resource_type).toBe('book');
      expect(result[2].resource_type).toBe('website');
      expect(result[0].relevance_score).toBe(0.95);
    });

    it('should handle performance API errors', async () => {
      server.use(
        http.post('/api/performance/analyze', () => {
          return HttpResponse.json(
            { error: 'Performance analysis failed' },
            { status: 500 }
          );
        })
      );

      await expect(performanceService.analyzePerformance({
        user_id: 1,
        subject_id: 1,
        topic_id: 1,
        total_questions: 5,
        correct_answers: 4,
        answers: []
      })).rejects.toThrow('Performance analysis failed');
    });
  });

  describe('API Error Handling', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });

    it('should handle network errors', async () => {
      server.use(
        http.get('/api/subjects', () => {
          return HttpResponse.error();
        })
      );

      await expect(subjectService.getSubjects()).rejects.toThrow();
    });

    it('should handle unauthorized errors', async () => {
      server.use(
        http.get('/api/subjects', () => {
          return HttpResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      await expect(subjectService.getSubjects()).rejects.toThrow('Unauthorized');
    });

    it('should handle validation errors', async () => {
      server.use(
        http.post('/api/questions/generate', () => {
          return HttpResponse.json(
            { 
              error: 'Validation failed',
              details: {
                count: 'Count must be between 1 and 10',
                difficulty: 'Invalid difficulty level'
              }
            },
            { status: 422 }
          );
        })
      );

      await expect(questionService.generateQuestions({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'invalid' as any,
        count: 15,
        education_level: 'high'
      })).rejects.toThrow('Validation failed');
    });

    it('should handle rate limiting', async () => {
      server.use(
        http.post('/api/questions/generate', () => {
          return HttpResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        })
      );

      await expect(questionService.generateQuestions({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'easy',
        count: 5,
        education_level: 'high'
      })).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('API Request/Response Format Validation', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'mock-jwt-token');
    });

    it('should send correct headers for authenticated requests', async () => {
      let capturedHeaders: Headers;

      server.use(
        http.get('/api/subjects', ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json([]);
        })
      );

      await subjectService.getSubjects();

      expect(capturedHeaders.get('Authorization')).toBe('Bearer mock-jwt-token');
      expect(capturedHeaders.get('Content-Type')).toBe('application/json');
    });

    it('should handle malformed JSON responses', async () => {
      server.use(
        http.get('/api/subjects', () => {
          return new HttpResponse('invalid json', {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );

      await expect(subjectService.getSubjects()).rejects.toThrow();
    });

    it('should validate response data structure', async () => {
      server.use(
        http.get('/api/subjects', () => {
          return HttpResponse.json([
            {
              // Missing required fields
              name: 'Mathematics'
              // id, description, created_at, updated_at missing
            }
          ]);
        })
      );

      // This should still work but might log warnings
      const subjects = await subjectService.getSubjects();
      expect(subjects[0].name).toBe('Mathematics');
    });
  });
});