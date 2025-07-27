# Test Suite Documentation

This document describes the comprehensive test suite for the EduAI React frontend application.

## Overview

The test suite includes:
- **Unit Tests**: Testing individual functions, hooks, and components
- **Integration Tests**: Testing complete user flows and interactions
- **API Tests**: Testing service layer with MSW mocking
- **Component Tests**: Testing React components with React Testing Library

## Test Structure

```
src/test/
├── setup.ts                 # Test configuration and global mocks
├── mocks/
│   ├── handlers.ts          # MSW request handlers
│   ├── server.ts            # MSW server for Node.js (tests)
│   └── browser.ts           # MSW worker for browser (development)
├── integration/             # Integration test suites
│   ├── authFlow.test.tsx
│   ├── questionFlow.test.tsx
│   └── performanceFlow.test.tsx
└── testRunner.ts            # Test utilities and commands
```

## Test Categories

### 1. Unit Tests

#### Utility Functions (`src/utils/__tests__/`)
- `validation.test.ts` - Form validation utilities
- `cn.test.ts` - Class name utility function
- `serviceWorker.test.ts` - Service worker registration

#### Custom Hooks (`src/hooks/__tests__/`)
- `useAuth.test.tsx` - Authentication hook
- `useApi.test.tsx` - API request hook
- `useConfirmation.test.tsx` - Confirmation dialog hook
- `useFormValidation.test.tsx` - Form validation hook
- `useOffline.test.tsx` - Offline detection hook
- `usePerformance.test.tsx` - Performance monitoring hook
- And more...

#### React Query Hooks (`src/hooks/queries/__tests__/`)
- `useAuthQueries.test.tsx` - Authentication queries
- `useSubjectQueries.test.tsx` - Subject/topic queries
- `useQuestionQueries.test.tsx` - Question generation queries
- `usePerformanceQueries.test.tsx` - Performance analysis queries

#### API Services (`src/services/__tests__/`)
- `authService.test.ts` - Authentication service
- `subjectService.test.ts` - Subject management service
- `questionService.test.ts` - Question generation service
- `performanceService.test.ts` - Performance analysis service

#### React Components (`src/components/**/__tests__/`)
- UI Components: Button, Card, Input, Modal, etc.
- Form Components: LoginForm, RegisterForm
- Feature Components: SubjectCard, QuestionCard, etc.
- Layout Components: Header, Sidebar, Layout

### 2. Integration Tests

#### Authentication Flow (`src/test/integration/authFlow.test.tsx`)
- Complete login/logout flow
- Registration process
- Protected route access
- Error handling

#### Question Flow (`src/test/integration/questionFlow.test.tsx`)
- Subject selection
- Topic selection
- Question generation
- Answer evaluation
- Quiz completion

#### Performance Flow (`src/test/integration/performanceFlow.test.tsx`)
- Performance analysis
- Resource recommendations
- Data visualization
- Filtering and sorting

### 3. API Mocking with MSW

Mock Service Worker (MSW) is used to intercept API requests during testing:

- **Handlers** (`src/test/mocks/handlers.ts`): Define mock responses for all API endpoints
- **Server** (`src/test/mocks/server.ts`): Node.js server for test environment
- **Browser** (`src/test/mocks/browser.ts`): Browser worker for development

## Running Tests

### All Tests
```bash
npm run test:run
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Specific Categories
```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Individual Test Files
```bash
npm run test:run -- src/utils/__tests__/validation.test.ts
```

## Test Configuration

### Vitest Configuration (`vitest.config.ts`)
- Environment: jsdom
- Setup files: `src/test/setup.ts`
- Coverage provider: v8
- Coverage thresholds: 70% for all metrics

### Test Setup (`src/test/setup.ts`)
- Global test utilities
- DOM testing library setup
- Environment variable mocks
- Browser API mocks (localStorage, matchMedia, etc.)
- Chart.js and react-chartjs-2 mocks

## Coverage Requirements

The test suite maintains the following coverage thresholds:
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Best Practices

### Writing Tests
1. Use descriptive test names
2. Follow AAA pattern (Arrange, Act, Assert)
3. Mock external dependencies
4. Test both success and error cases
5. Use React Testing Library for component tests

### Component Testing
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Hook Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('expected');
  });
});
```

### API Testing with MSW
```typescript
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('API Service', () => {
  it('should handle API errors', async () => {
    server.use(
      http.get('/api/endpoint', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );
    
    await expect(apiCall()).rejects.toThrow();
  });
});
```

## Continuous Integration

The test suite is designed to run in CI environments:
- All tests must pass before merging
- Coverage thresholds must be met
- No console errors or warnings allowed
- Tests run in parallel for faster execution

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in test configuration
2. **Mock not working**: Check MSW handler setup
3. **Component not rendering**: Verify test wrapper setup
4. **Coverage too low**: Add tests for uncovered code paths

### Debug Commands
```bash
# Run tests with verbose output
npm run test:run -- --reporter=verbose

# Run specific test with debugging
npm run test:run -- --reporter=verbose src/path/to/test.ts
```

## Future Improvements

- Add visual regression testing
- Implement accessibility testing
- Add performance testing
- Expand E2E test coverage
- Add mutation testing