// Test runner utility to check test status and coverage

export const testCategories = {
  unit: {
    utils: [
      'src/utils/__tests__/validation.test.ts',
      'src/utils/__tests__/cn.test.ts',
      'src/utils/__tests__/serviceWorker.test.ts',
    ],
    hooks: [
      'src/hooks/__tests__/useAuth.test.tsx',
      'src/hooks/__tests__/useApi.test.tsx',
      'src/hooks/__tests__/useConfirmation.test.tsx',
      'src/hooks/__tests__/useDestructiveAction.test.tsx',
      'src/hooks/__tests__/useFormFeedback.test.tsx',
      'src/hooks/__tests__/useFormValidation.test.tsx',
      'src/hooks/__tests__/useOffline.test.tsx',
      'src/hooks/__tests__/usePerformance.test.tsx',
      'src/hooks/__tests__/useRecommendations.test.tsx',
      'src/hooks/__tests__/useRetry.test.tsx',
      'src/hooks/__tests__/useBreakpoint.test.tsx',
    ],
    services: [
      'src/services/__tests__/api.test.ts',
      'src/services/__tests__/authService.test.ts',
      'src/services/__tests__/subjectService.test.ts',
      'src/services/__tests__/questionService.test.ts',
      'src/services/__tests__/performanceService.test.ts',
    ],
    components: [
      'src/components/ui/__tests__/Button.test.tsx',
      'src/components/ui/__tests__/Card.test.tsx',
      'src/components/ui/__tests__/Input.test.tsx',
      'src/components/ui/__tests__/Loading.test.tsx',
      'src/components/ui/__tests__/Modal.test.tsx',
      'src/components/ui/__tests__/Toast.test.tsx',
      'src/components/ui/__tests__/ErrorBoundary.test.tsx',
      'src/components/forms/__tests__/LoginForm.test.tsx',
      'src/components/forms/__tests__/RegisterForm.test.tsx',
      'src/components/features/__tests__/SubjectCard.test.tsx',
      'src/components/features/__tests__/QuestionCard.test.tsx',
      'src/components/features/__tests__/QuestionGenerator.test.tsx',
      'src/components/features/__tests__/TopicList.test.tsx',
    ],
  },
  integration: [
    'src/test/integration/authFlow.test.tsx',
    'src/test/integration/questionFlow.test.tsx',
    'src/test/integration/performanceFlow.test.tsx',
  ],
  queries: [
    'src/hooks/queries/__tests__/useAuthQueries.test.tsx',
    'src/hooks/queries/__tests__/useSubjectQueries.test.tsx',
    'src/hooks/queries/__tests__/useQuestionQueries.test.tsx',
    'src/hooks/queries/__tests__/usePerformanceQueries.test.tsx',
  ],
};

export const testSummary = {
  totalTests: Object.values(testCategories).flat().length,
  categories: Object.keys(testCategories).length,
  coverage: {
    target: 70,
    current: 0, // Will be updated by coverage reports
  },
};

export function getTestCommand(category?: keyof typeof testCategories) {
  if (category) {
    const tests = testCategories[category];
    if (Array.isArray(tests)) {
      return `npm run test:run -- ${tests.join(' ')}`;
    } else {
      return `npm run test:run -- ${Object.values(tests).flat().join(' ')}`;
    }
  }
  return 'npm run test:run';
}

export function getCoverageCommand() {
  return 'npm run test:coverage';
}