# API Services

This directory contains all the API service classes for interacting with the EduAI backend.

## Services Overview

### AuthService
Handles user authentication, registration, and profile management.

```typescript
import { authService } from './services';

// Login
const user = await authService.login({ username: 'user', password: 'pass' });

// Register
const newUser = await authService.register({ 
  username: 'newuser', 
  email: 'user@example.com', 
  password: 'password' 
});

// Get current user
const currentUser = authService.getCurrentUser();

// Logout
await authService.logout();
```

### SubjectService
Manages subjects and topics for educational content.

```typescript
import { subjectService } from './services';

// Get all subjects
const subjects = await subjectService.getSubjects();

// Get topics for a subject
const topics = await subjectService.getTopics(subjectId);

// Search subjects
const searchResults = await subjectService.searchSubjects('math');
```

### QuestionService
Handles question generation and answer evaluation.

```typescript
import { questionService } from './services';

// Generate questions
const response = await questionService.generateQuestions({
  subject: 'Mathematics',
  topic: 'Algebra',
  difficulty: 'medium',
  count: 5,
  education_level: 'high'
});

// Evaluate an answer
const evaluation = await questionService.evaluateAnswer({
  question_id: 'q1',
  user_answer: 'x = 5',
  correct_answer: 'x = 5',
  question_content: 'Solve for x: 2x = 10'
});
```

### PerformanceService
Analyzes user performance and provides recommendations.

```typescript
import { performanceService } from './services';

// Analyze performance
const analysis = await performanceService.analyzePerformance({
  user_id: 1,
  subject_id: 1,
  topic_id: 1,
  quiz_results: {
    total_questions: 10,
    correct_answers: 8,
    answers: [/* answer data */]
  }
});

// Get recommendations
const recommendations = await performanceService.getRecommendations(analysisId);

// Get dashboard data
const dashboard = await performanceService.getDashboardData();
```

## Error Handling

All services use consistent error handling. Errors are transformed to the `ApiError` format:

```typescript
try {
  const user = await authService.login(credentials);
} catch (error) {
  if (error.status === 401) {
    console.log('Invalid credentials');
  } else if (error.status === 500) {
    console.log('Server error');
  }
  console.log(error.message);
}
```

## Configuration

Services are configured through environment variables:

- `VITE_API_BASE_URL`: Backend API base URL (default: http://localhost:8000)
- `VITE_API_TIMEOUT`: Request timeout in milliseconds (default: 10000)
- `VITE_API_DEBUG`: Enable debug logging (default: false)

## Authentication

The services automatically handle JWT token management:

- Tokens are stored in localStorage
- Authorization headers are automatically added to requests
- Token refresh is handled automatically (if backend supports it)
- Automatic logout on token expiry

## Retry Logic

Network requests include automatic retry logic:

- Retries on network errors and 5xx server errors
- Exponential backoff strategy
- Maximum of 3 retry attempts
- No retry on 4xx client errors