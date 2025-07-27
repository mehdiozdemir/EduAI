import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuizResults from '../QuizResults';
import type { QuizResults as QuizResultsType, AnswerEvaluation } from '../../../types';

describe('QuizResults', () => {

  const mockOnRestart = vi.fn();
  const mockOnNewQuiz = vi.fn();
  const mockOnViewPerformance = vi.fn();

  const mockEvaluation: AnswerEvaluation = {
    is_correct: true,
    score: 95,
    feedback: 'Excellent answer!',
    explanation: 'Your answer is correct.'
  };

  const mockIncorrectEvaluation: AnswerEvaluation = {
    is_correct: false,
    score: 30,
    feedback: 'Try again!',
    explanation: 'The correct answer is different.'
  };

  const excellentResults: QuizResultsType = {
    totalQuestions: 10,
    correctAnswers: 9,
    accuracy: 90,
    timeSpent: 300, // 5 minutes
    answers: [
      {
        questionId: 'q1',
        userAnswer: '4',
        isCorrect: true,
        evaluation: mockEvaluation
      },
      {
        questionId: 'q2',
        userAnswer: '6',
        isCorrect: true,
        evaluation: mockEvaluation
      }
    ]
  };

  const poorResults: QuizResultsType = {
    totalQuestions: 10,
    correctAnswers: 4,
    accuracy: 40,
    timeSpent: 600, // 10 minutes
    answers: [
      {
        questionId: 'q1',
        userAnswer: '4',
        isCorrect: true,
        evaluation: mockEvaluation
      },
      {
        questionId: 'q2',
        userAnswer: '5',
        isCorrect: false,
        evaluation: mockIncorrectEvaluation
      }
    ]
  };

  const defaultProps = {
    onRestart: mockOnRestart,
    onNewQuiz: mockOnNewQuiz,
    onViewPerformance: mockOnViewPerformance
  };

  beforeEach(() => {
    mockOnRestart.mockClear();
    mockOnNewQuiz.mockClear();
    mockOnViewPerformance.mockClear();
  });

  describe('Excellent Performance', () => {
    it('renders excellent results correctly', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      expect(screen.getByText('Quiz Tamamlandı!')).toBeInTheDocument();
      expect(screen.getByText('9/10')).toBeInTheDocument(); // Correct answers
      expect(screen.getByText('%90')).toBeInTheDocument(); // Accuracy
      expect(screen.getByText('5:00')).toBeInTheDocument(); // Time formatted
      expect(screen.getByText('Mükemmel')).toBeInTheDocument();
      expect(screen.getByText('Harika bir performans sergiledıniz!')).toBeInTheDocument();
    });

    it('shows correct performance level styling for excellent results', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      const performanceLevel = screen.getByText('Mükemmel');
      expect(performanceLevel).toHaveClass('text-green-600');
    });
  });

  describe('Poor Performance', () => {
    it('renders poor results correctly', () => {
      render(<QuizResults {...defaultProps} results={poorResults} />);
      
      expect(screen.getByText('4/10')).toBeInTheDocument(); // Correct answers
      expect(screen.getByText('%40')).toBeInTheDocument(); // Accuracy
      expect(screen.getByText('10:00')).toBeInTheDocument(); // Time formatted
      expect(screen.getByText('Yetersiz')).toBeInTheDocument();
      expect(screen.getByText('Bu konuyu tekrar gözden geçirmenizi öneririz.')).toBeInTheDocument();
    });

    it('shows correct performance level styling for poor results', () => {
      render(<QuizResults {...defaultProps} results={poorResults} />);
      
      const performanceLevel = screen.getByText('Yetersiz');
      expect(performanceLevel).toHaveClass('text-red-600');
    });
  });

  describe('Additional Statistics', () => {
    it('shows additional statistics correctly', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      expect(screen.getByText('Ortalama Süre')).toBeInTheDocument();
      expect(screen.getByText('0:30 / soru')).toBeInTheDocument(); // 300s / 10 questions = 30s
      expect(screen.getByText('Yanlış Cevap')).toBeInTheDocument();
      expect(screen.getByText('1 soru')).toBeInTheDocument(); // 10 - 9 = 1
    });
  });

  describe('Action Buttons', () => {
    it('renders all action buttons when all handlers are provided', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      expect(screen.getByText('Yeni Quiz Başlat')).toBeInTheDocument();
      expect(screen.getByText('Performans Analizi')).toBeInTheDocument();
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });

    it('calls onNewQuiz when new quiz button is clicked', async () => {
      const user = userEvent.setup();
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      const newQuizButton = screen.getByText('Yeni Quiz Başlat');
      await user.click(newQuizButton);
      
      expect(mockOnNewQuiz).toHaveBeenCalled();
    });

    it('calls onViewPerformance when performance button is clicked', async () => {
      const user = userEvent.setup();
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      const performanceButton = screen.getByText('Performans Analizi');
      await user.click(performanceButton);
      
      expect(mockOnViewPerformance).toHaveBeenCalled();
    });

    it('calls onRestart when restart button is clicked', async () => {
      const user = userEvent.setup();
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      const restartButton = screen.getByText('Tekrar Dene');
      await user.click(restartButton);
      
      expect(mockOnRestart).toHaveBeenCalled();
    });

    it('does not render buttons when handlers are not provided', () => {
      render(<QuizResults results={excellentResults} />);
      
      expect(screen.queryByText('Yeni Quiz Başlat')).not.toBeInTheDocument();
      expect(screen.queryByText('Performans Analizi')).not.toBeInTheDocument();
      expect(screen.queryByText('Tekrar Dene')).not.toBeInTheDocument();
    });
  });

  describe('Detailed Results', () => {
    it('shows detailed results for each answer', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      expect(screen.getByText('Detaylı Sonuçlar')).toBeInTheDocument();
      expect(screen.getByText('Soru 1')).toBeInTheDocument();
      expect(screen.getByText('Soru 2')).toBeInTheDocument();
      
      // Check answer details
      expect(screen.getByText('Verdiğiniz Cevap:')).toBeInTheDocument();
      expect(screen.getByText('Geri Bildirim:')).toBeInTheDocument();
    });

    it('shows correct/incorrect badges for answers', () => {
      render(<QuizResults {...defaultProps} results={poorResults} />);
      
      const correctBadges = screen.getAllByText('Doğru');
      const incorrectBadges = screen.getAllByText('Yanlış');
      
      expect(correctBadges.length).toBeGreaterThan(0);
      expect(incorrectBadges.length).toBeGreaterThan(0);
    });

    it('shows score for each answer', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      expect(screen.getAllByText(/Puan: \d+\/100/)).toHaveLength(excellentResults.answers.length);
    });

    it('shows user answers and feedback', () => {
      render(<QuizResults {...defaultProps} results={excellentResults} />);
      
      expect(screen.getByText('4')).toBeInTheDocument(); // User answer
      expect(screen.getByText('6')).toBeInTheDocument(); // User answer
      expect(screen.getAllByText('Excellent answer!')).toHaveLength(2); // Feedback
    });
  });

  describe('Time Formatting', () => {
    it('formats time correctly for different durations', () => {
      const testCases = [
        { seconds: 30, expected: '0:30' },
        { seconds: 90, expected: '1:30' },
        { seconds: 3661, expected: '61:01' } // Over an hour
      ];

      testCases.forEach(({ seconds, expected }) => {
        const results = { ...excellentResults, timeSpent: seconds };
        const { rerender } = render(<QuizResults {...defaultProps} results={results} />);
        
        expect(screen.getByText(expected)).toBeInTheDocument();
        
        // Clean up for next test
        rerender(<div />);
      });
    });
  });

  describe('Performance Level Calculation', () => {
    const testCases = [
      { accuracy: 95, expectedLevel: 'Mükemmel', expectedColor: 'text-green-600' },
      { accuracy: 85, expectedLevel: 'İyi', expectedColor: 'text-blue-600' },
      { accuracy: 75, expectedLevel: 'Orta', expectedColor: 'text-yellow-600' },
      { accuracy: 65, expectedLevel: 'Geçer', expectedColor: 'text-orange-600' },
      { accuracy: 45, expectedLevel: 'Yetersiz', expectedColor: 'text-red-600' }
    ];

    testCases.forEach(({ accuracy, expectedLevel, expectedColor }) => {
      it(`shows correct performance level for ${accuracy}% accuracy`, () => {
        const results = { ...excellentResults, accuracy };
        render(<QuizResults {...defaultProps} results={results} />);
        
        const performanceElement = screen.getByText(expectedLevel);
        expect(performanceElement).toBeInTheDocument();
        expect(performanceElement).toHaveClass(expectedColor);
      });
    });
  });
});