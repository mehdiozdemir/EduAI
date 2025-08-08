import { http, HttpResponse } from 'msw';
import type { User, LoginCredentials, RegisterData } from '../../types/auth';
import type { Subject, Topic } from '../../types/subject';
import type { QuestionGenerationResponse, AnswerEvaluation } from '../../types/question';
import type { PerformanceAnalysis, ResourceRecommendation } from '../../types/performance';

// Mock data
const mockUser: User = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockSubjects: Subject[] = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Basic mathematics concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Physics fundamentals',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockTopics: Topic[] = [
  {
    id: 1,
    subject_id: 1,
    name: 'Algebra',
    description: 'Basic algebra concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    subject_id: 1,
    name: 'Geometry',
    description: 'Basic geometry concepts',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockQuestions: QuestionGenerationResponse = {
  questions: [
    {
      id: '1',
      content: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correct_answer: '4',
      explanation: 'Basic addition: 2 + 2 = 4',
    },
    {
      id: '2',
      content: 'What is the square root of 16?',
      options: ['2', '4', '6', '8'],
      correct_answer: '4',
      explanation: 'The square root of 16 is 4 because 4 × 4 = 16',
    },
  ],
  metadata: {
    subject: 'Mathematics',
    topic: 'Algebra',
    difficulty: 'easy',
    count: 2,
  },
};

const mockPerformanceAnalysis: PerformanceAnalysis = {
  id: 1,
  user_id: 1,
  subject_id: 1,
  topic_id: 1,
  total_questions: 10,
  correct_answers: 8,
  accuracy: 0.8,
  weakness_level: 2,
  created_at: '2024-01-01T00:00:00Z',
};

const mockRecommendations: ResourceRecommendation[] = [
  {
    id: 1,
    resource_type: 'youtube',
    title: 'Algebra Basics',
    url: 'https://youtube.com/watch?v=example',
    description: 'Learn algebra fundamentals',
    relevance_score: 0.9,
  },
  {
    id: 2,
    resource_type: 'book',
    title: 'Mathematics Textbook',
    url: 'https://example.com/book',
    description: 'Comprehensive math textbook',
    relevance_score: 0.8,
  },
];

// Mock education data
const mockEducationLevels = [
  {
    id: 1,
    name: 'İlkokul',
    description: 'İlkokul seviyesi eğitim',
    sort_order: 1,
    grade_range: '1-4. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Ortaokul',
    description: 'Ortaokul seviyesi eğitim',
    sort_order: 2,
    grade_range: '5-8. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Lise',
    description: 'Lise seviyesi eğitim',
    sort_order: 3,
    grade_range: '9-12. Sınıf',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockCourses = [
  {
    id: 3,
    name: 'Matematik',
    description: 'İlkokul matematik dersi',
    education_level_id: 1,
    code: 'MAT_ILK',
    color: '#3B82F6',
    icon: null,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    education_level: {
      id: 1,
      name: 'İlkokul',
      description: 'İlkokul seviyesi eğitim',
      sort_order: 1,
      grade_range: '1-4. Sınıf',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: 4,
    name: 'Türkçe',
    description: 'Lise türkçe dersi',
    education_level_id: 3,
    code: 'TUR_LIS',
    color: '#EF4444',
    icon: null,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    education_level: {
      id: 3,
      name: 'Lise',
      description: 'Lise seviyesi eğitim',
      sort_order: 3,
      grade_range: '9-12. Sınıf',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  },
];

const mockCourseTopics = [
  {
    id: 2,
    name: 'Dört İşlem',
    description: 'Toplama, çıkarma, çarpma, bölme işlemleri',
    course_id: 3,
    sort_order: 1,
    difficulty_level: 1,
    estimated_duration: 60,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const handlers = [
  // Auth endpoints
  http.post('http://localhost:8000/api/v1/auth/login', async ({ request }) => {
    const credentials = await request.json() as LoginCredentials;
    // Backend expects email + password
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: mockUser,
      });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('http://localhost:8000/api/v1/auth/register', async ({ request }) => {
    const userData = await request.json() as RegisterData;
    
    if (userData.username && userData.email && userData.password) {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        token_type: 'bearer',
        user: {
          ...mockUser,
          username: userData.username,
          email: userData.email,
        },
      });
    }
    
    return HttpResponse.json(
      { detail: 'Invalid registration data' },
      { status: 400 }
    );
  }),

  http.post('http://localhost:8000/api/v1/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get('http://localhost:8000/api/v1/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(mockUser);
    }
    
    return HttpResponse.json(
      { detail: 'Not authenticated' },
      { status: 401 }
    );
  }),

  // Subject endpoints
  // Subjects (public)
  http.get('http://localhost:8000/api/v1/subjects/', () => {
    return HttpResponse.json(mockSubjects);
  }),

  http.get('http://localhost:8000/api/v1/subjects/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const subject = mockSubjects.find(s => s.id === id);
    
    if (subject) {
      return HttpResponse.json(subject);
    }
    
    return HttpResponse.json(
      { detail: 'Subject not found' },
      { status: 404 }
    );
  }),

  http.get('http://localhost:8000/api/v1/subjects/:id/topics', ({ params }) => {
    const subjectId = parseInt(params.id as string);
    const topics = mockTopics.filter(t => t.subject_id === subjectId);
    
    return HttpResponse.json(topics);
  }),

  // Question endpoints
  // Questions
  http.post('http://localhost:8000/api/v1/questions/generate', async ({ request: req }) => {
    // Simulate different responses based on parameters (query-based in backend)
    const url = new URL(req.url);
    const countParam = Number(url.searchParams.get('count') ?? 0);
    if (countParam > 10) {
      return HttpResponse.json(
        { detail: 'Too many questions requested' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(mockQuestions);
  }),

  http.post('http://localhost:8000/api/v1/questions/evaluate', async ({ request }) => {
    const evaluationRequest = await request.json();
    
    const evaluation: AnswerEvaluation = {
      is_correct: evaluationRequest.user_answer === evaluationRequest.correct_answer,
      score: evaluationRequest.user_answer === evaluationRequest.correct_answer ? 1 : 0,
      feedback: evaluationRequest.user_answer === evaluationRequest.correct_answer 
        ? 'Correct answer!' 
        : 'Incorrect. Try again.',
      explanation: 'This is a mock explanation for the answer.',
    };
    
    return HttpResponse.json(evaluation);
  }),

  // Performance endpoints
  http.post('http://localhost:8000/api/v1/performance/analyze', async ({ request }) => {
    const analysisRequest = await request.json();
    
    return HttpResponse.json(mockPerformanceAnalysis);
  }),

  http.get('http://localhost:8000/api/v1/performance/user/:userId', ({ params }) => {
    const userId = parseInt(params.userId as string);
    
    if (userId === mockUser.id) {
      return HttpResponse.json([mockPerformanceAnalysis]);
    }
    
    return HttpResponse.json([]);
  }),

  http.get('http://localhost:8000/api/v1/performance/:analysisId/recommendations', ({ params }) => {
    const analysisId = parseInt(params.analysisId as string);
    
    if (analysisId === mockPerformanceAnalysis.id) {
      return HttpResponse.json(mockRecommendations);
    }
    
    return HttpResponse.json([]);
  }),

  // Consolidated user recommendations
  http.get('http://localhost:8000/api/v1/performance/user/all-recommendations', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        total_recommendations: mockRecommendations.length,
        categories: {
          video: mockRecommendations.filter(r => r.resource_type === 'youtube'),
          books: mockRecommendations.filter(r => r.resource_type === 'book'),
          ai_tips: [],
        },
      },
    });
  }),

  // Recommendation stats
  http.get('http://localhost:8000/api/v1/performance/recommendations/stats', () => {
    return HttpResponse.json({
      status: 'success',
      data: {
        by_status: { active: 2, completed: 0, deleted: 0, total: 2 },
        by_category: { video: 1, books: 1 },
        total_active: 2,
        completion_rate: 0,
      },
    });
  }),

  // Error simulation endpoints for testing
  http.get('http://localhost:8000/test/error/500', () => {
    return HttpResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.get('http://localhost:8000/test/error/network', () => {
    return HttpResponse.error();
  }),

  http.get('http://localhost:8000/test/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return HttpResponse.json({ message: 'Slow response' });
  }),

  // Education system endpoints
  http.get('http://localhost:8000/api/v1/education-levels', () => {
    return HttpResponse.json(mockEducationLevels);
  }),

  http.get('http://localhost:8000/api/v1/education-levels/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const level = mockEducationLevels.find(l => l.id === id);
    
    if (level) {
      return HttpResponse.json(level);
    }
    
    return HttpResponse.json(
      { detail: 'Education level not found' },
      { status: 404 }
    );
  }),

  http.get('http://localhost:8000/api/v1/education-levels/:id/courses', ({ params }) => {
    const levelId = parseInt(params.id as string);
    const courses = mockCourses.filter(c => c.education_level_id === levelId);
    
    return HttpResponse.json(courses);
  }),

  http.get('http://localhost:8000/api/v1/courses', () => {
    return HttpResponse.json({
      courses: mockCourses,
      total: mockCourses.length,
      page: 1,
      per_page: 10,
    });
  }),

  http.get('http://localhost:8000/api/v1/courses/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const course = mockCourses.find(c => c.id === id);
    
    if (course) {
      return HttpResponse.json(course);
    }
    
    return HttpResponse.json(
      { detail: 'Course not found' },
      { status: 404 }
    );
  }),

  http.get('http://localhost:8000/api/v1/courses/:id/topics', ({ params }) => {
    const courseId = parseInt(params.id as string);
    const topics = mockCourseTopics.filter(t => t.course_id === courseId);
    
    return HttpResponse.json(topics);
  }),

  http.get('http://localhost:8000/api/v1/courses/:id/with-topics', ({ params }) => {
    const id = parseInt(params.id as string);
    const course = mockCourses.find(c => c.id === id);
    
    if (course) {
      const topics = mockCourseTopics.filter(t => t.course_id === id);
      return HttpResponse.json({
        ...course,
        topics,
      });
    }
    
    return HttpResponse.json(
      { detail: 'Course not found' },
      { status: 404 }
    );
  }),

  http.get('http://localhost:8000/api/v1/education-system/overview', () => {
    return HttpResponse.json({
      education_levels: mockEducationLevels.map(level => ({
        ...level,
        courses: mockCourses.filter(c => c.education_level_id === level.id),
      })),
      total_levels: mockEducationLevels.length,
      total_courses: mockCourses.length,
      total_topics: mockCourseTopics.length,
    });
  }),
];