// Basic test to verify API services are properly configured

import { describe, it, expect } from 'vitest';
import { authService, subjectService, questionService, performanceService } from '../index';

describe('API Services', () => {
  it('should export all required services', () => {
    expect(authService).toBeDefined();
    expect(subjectService).toBeDefined();
    expect(questionService).toBeDefined();
    expect(performanceService).toBeDefined();
  });

  it('should have all required methods on AuthService', () => {
    expect(typeof authService.login).toBe('function');
    expect(typeof authService.register).toBe('function');
    expect(typeof authService.logout).toBe('function');
    expect(typeof authService.getCurrentUser).toBe('function');
    expect(typeof authService.isAuthenticated).toBe('function');
    expect(typeof authService.getProfile).toBe('function');
  });

  it('should have all required methods on SubjectService', () => {
    expect(typeof subjectService.getSubjects).toBe('function');
    expect(typeof subjectService.getSubject).toBe('function');
    expect(typeof subjectService.getTopics).toBe('function');
    expect(typeof subjectService.getTopic).toBe('function');
    expect(typeof subjectService.searchSubjects).toBe('function');
    expect(typeof subjectService.searchTopics).toBe('function');
  });

  it('should have all required methods on QuestionService', () => {
    expect(typeof questionService.generateQuestions).toBe('function');
    expect(typeof questionService.evaluateAnswer).toBe('function');
    expect(typeof questionService.evaluateAnswers).toBe('function');
    expect(typeof questionService.getQuestionHistory).toBe('function');
    expect(typeof questionService.getQuestionStats).toBe('function');
  });

  it('should have all required methods on PerformanceService', () => {
    expect(typeof performanceService.analyzePerformance).toBe('function');
    expect(typeof performanceService.getUserPerformance).toBe('function');
    expect(typeof performanceService.getRecommendations).toBe('function');
    expect(typeof performanceService.getDashboardData).toBe('function');
    expect(typeof performanceService.getPerformanceTrends).toBe('function');
  });
});