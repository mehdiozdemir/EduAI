import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QuizProgress from '../QuizProgress';
import type { AnswerEvaluation } from '../../../types';

const mockEvaluations: (AnswerEvaluation | undefined)[] = [
  {
    is_correct: true,
    score: 100,
    feedback: 'Correct!',
    explanation: 'Good job'
  },
  {
    is_correct: false,
    score: 0,
    feedback: 'Wrong',
    explanation: 'Try again'
  },
  undefined, // Unanswered question
];

describe('QuizProgress', () => {
  it('renders basic progress information', () => {
    render(
      <QuizProgress
        currentQuestion={2}
        totalQuestions={5}
        answeredQuestions={2}
        correctAnswers={1}
        totalScore={100}
        maxPossibleScore={500}
        evaluations={mockEvaluations}
      />
    );

    expect(screen.getByText('Quiz İlerlemesi')).toBeInTheDocument();
    expect(screen.getByText('Soru 2 / 5')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument(); // Progress percentage
  });

  it('calculates and displays accuracy correctly', () => {
    render(
      <QuizProgress
        currentQuestion={2}
        totalQuestions={5}
        answeredQuestions={2}
        correctAnswers={1}
        totalScore={100}
        maxPossibleScore={500}
        evaluations={mockEvaluations}
      />
    );

    expect(screen.getByText('50%')).toBeInTheDocument(); // Accuracy: 1/2 = 50%
    expect(screen.getByText('1/2')).toBeInTheDocument(); // Correct/Total answered
  });

  it('displays total score and percentage', () => {
    render(
      <QuizProgress
        currentQuestion={2}
        totalQuestions={5}
        answeredQuestions={2}
        correctAnswers={1}
        totalScore={100}
        maxPossibleScore={500}
        evaluations={mockEvaluations}
      />
    );

    expect(screen.getByText('100')).toBeInTheDocument(); // Total score
    expect(screen.getByText('20% / 500')).toBeInTheDocument(); // Score percentage
  });

  it('shows detailed statistics when enabled', () => {
    render(
      <QuizProgress
        currentQuestion={3}
        totalQuestions={5}
        answeredQuestions={2}
        correctAnswers={1}
        totalScore={100}
        maxPossibleScore={500}
        evaluations={mockEvaluations}
        showDetailedStats={true}
      />
    );

    expect(screen.getByText('Detaylı İstatistikler')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // Correct answers
    expect(screen.getByText('1')).toBeInTheDocument(); // Wrong answers (2-1)
    expect(screen.getByText('3')).toBeInTheDocument(); // Remaining questions (5-2)
  });

  it('displays performance indicator based on accuracy', () => {
    // Test excellent performance (>= 80%)
    render(
      <QuizProgress
        currentQuestion={5}
        totalQuestions={5}
        answeredQuestions={5}
        correctAnswers={4}
        totalScore={400}
        maxPossibleScore={500}
        evaluations={[...mockEvaluations, mockEvaluations[0], mockEvaluations[0]]}
      />
    );

    expect(screen.getByText('Mükemmel')).toBeInTheDocument();
  });

  it('handles zero answered questions gracefully', () => {
    render(
      <QuizProgress
        currentQuestion={1}
        totalQuestions={5}
        answeredQuestions={0}
        correctAnswers={0}
        totalScore={0}
        maxPossibleScore={500}
        evaluations={[]}
      />
    );

    expect(screen.getByText('0%')).toBeInTheDocument(); // Accuracy should be 0%
    expect(screen.getByText('0/0')).toBeInTheDocument(); // Correct/Total answered
  });

  it('shows score breakdown for answered questions', () => {
    render(
      <QuizProgress
        currentQuestion={3}
        totalQuestions={5}
        answeredQuestions={2}
        correctAnswers={1}
        totalScore={100}
        maxPossibleScore={500}
        evaluations={mockEvaluations}
        showDetailedStats={true}
      />
    );

    expect(screen.getByText('Puan Dağılımı')).toBeInTheDocument();
    expect(screen.getByText('Soru 1')).toBeInTheDocument();
    expect(screen.getByText('Soru 2')).toBeInTheDocument();
    expect(screen.getByText('Doğru')).toBeInTheDocument();
    expect(screen.getByText('Yanlış')).toBeInTheDocument();
  });
});