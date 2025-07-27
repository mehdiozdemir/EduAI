import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RealTimePerformance from '../RealTimePerformance';
import type { AnswerEvaluation } from '../../../types';

const mockEvaluations: AnswerEvaluation[] = [
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
  {
    is_correct: true,
    score: 90,
    feedback: 'Correct!',
    explanation: 'Well done'
  },
];

describe('RealTimePerformance', () => {
  it('renders performance level correctly', () => {
    render(
      <RealTimePerformance
        recentEvaluations={mockEvaluations}
        answeredQuestions={3}
        correctAnswers={2}
      />
    );

    // Should show accuracy percentage (2/3 = 67%)
    expect(screen.getByText('67%')).toBeInTheDocument();
    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('shows excellent performance for high accuracy', () => {
    render(
      <RealTimePerformance
        recentEvaluations={[mockEvaluations[0], mockEvaluations[2]]}
        answeredQuestions={2}
        correctAnswers={2}
      />
    );

    expect(screen.getByText('Mükemmel')).toBeInTheDocument();
    expect(screen.getByText('🎯')).toBeInTheDocument();
  });

  it('shows recent performance trend when enough questions answered', () => {
    render(
      <RealTimePerformance
        recentEvaluations={mockEvaluations}
        answeredQuestions={3}
        correctAnswers={2}
      />
    );

    expect(screen.getByText('Son 3 Soru')).toBeInTheDocument();
  });

  it('shows performance tip for low accuracy', () => {
    render(
      <RealTimePerformance
        recentEvaluations={[mockEvaluations[1], mockEvaluations[1]]}
        answeredQuestions={3}
        correctAnswers={1}
      />
    );

    expect(screen.getByText('Performans İpucu')).toBeInTheDocument();
    expect(screen.getByText('Soruları daha dikkatli okuyun ve acele etmeyin.')).toBeInTheDocument();
  });

  it('shows streak information for consecutive correct answers', () => {
    const streakEvaluations = [
      mockEvaluations[0],
      mockEvaluations[2],
      { ...mockEvaluations[0], score: 95 },
      { ...mockEvaluations[0], score: 85 }
    ];

    render(
      <RealTimePerformance
        recentEvaluations={streakEvaluations}
        answeredQuestions={4}
        correctAnswers={4}
      />
    );

    expect(screen.getByText('Harika Seri!')).toBeInTheDocument();
    expect(screen.getByText('4 doğru cevap üst üste!')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('handles zero answered questions gracefully', () => {
    render(
      <RealTimePerformance
        recentEvaluations={[]}
        answeredQuestions={0}
        correctAnswers={0}
      />
    );

    expect(screen.getByText('0/0')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('displays visual indicators for recent answers', () => {
    render(
      <RealTimePerformance
        recentEvaluations={mockEvaluations}
        answeredQuestions={3}
        correctAnswers={2}
      />
    );

    // Should show colored dots for recent evaluations
    const dots = screen.getAllByTitle(/Soru \d+: (Doğru|Yanlış)/);
    expect(dots).toHaveLength(3);
  });
});