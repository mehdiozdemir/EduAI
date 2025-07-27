import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizSession from '../QuizSession';
import { questionService } from '../../../services/questionService';
import type { GeneratedQuestion, AnswerEvaluation } from '../../../types';

import { vi } from 'vitest';

// Mock the question service
vi.mock('../../../services/questionService');
const mockQuestionService = questionService as any;

describe('QuizSession', () => {
  const mockOnComplete = jest.fn();
  const mockOnExit = jest.fn();

  const mockQuestions: GeneratedQuestion[] = [
    {
      id: 'q1',
      content: 'What is 2 + 2?',
      correct_answer: '4',
      explanation: 'Basic addition'
    },
    {
      id: 'q2',
      content: 'What is 3 + 3?',
      correct_answer: '6',
      explanation: 'Basic addition'
    }
  ];

  const mockEvaluation: AnswerEvaluation = {
    is_correct: true,
    score: 95,
    feedback: 'Excellent!',
    explanation: 'Correct answer'
  };

  const defaultProps = {
    questions: mockQuestions,
    onComplete: mockOnComplete,
    onExit: mockOnExit
  };

  beforeEach(() => {
    mockOnComplete.mockClear();
    mockOnExit.mockClear();
    mockQuestionService.evaluateAnswer.mockClear();
  });

  it('renders quiz session correctly', () => {
    render(<QuizSession {...defaultProps} />);
    
    expect(screen.getByText('Quiz Oturumu')).toBeInTheDocument();
    expect(screen.getByText('Soru 1 / 2')).toBeInTheDocument();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('Çıkış')).toBeInTheDocument();
  });

  it('shows question overview with correct status', () => {
    render(<QuizSession {...defaultProps} />);
    
    expect(screen.getByText('Soru Durumu')).toBeInTheDocument();
    
    // Should show question numbers
    const questionButtons = screen.getAllByRole('button');
    const questionNumberButtons = questionButtons.filter(button => 
      button.textContent === '1' || button.textContent === '2'
    );
    expect(questionNumberButtons).toHaveLength(2);
  });

  it('evaluates answer and shows result', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Answer the first question
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    
    const submitButton = screen.getByText('Cevabı Gönder');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockQuestionService.evaluateAnswer).toHaveBeenCalledWith({
        question_id: 'q1',
        user_answer: '4',
        correct_answer: '4',
        question_content: 'What is 2 + 2?'
      });
    });

    // Should show evaluation result
    await waitFor(() => {
      expect(screen.getByText('Doğru Cevap!')).toBeInTheDocument();
      expect(screen.getByText('Excellent!')).toBeInTheDocument();
    });
  });

  it('navigates to next question after answering', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Answer the first question
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    
    const submitButton = screen.getByText('Cevabı Gönder');
    await user.click(submitButton);
    
    // Wait for evaluation to complete
    await waitFor(() => {
      expect(screen.getByText('Sonraki Soru →')).toBeInTheDocument();
    });
    
    // Click next question
    const nextButton = screen.getByText('Sonraki Soru →');
    await user.click(nextButton);
    
    // Should show second question
    expect(screen.getByText('Soru 2 / 2')).toBeInTheDocument();
    expect(screen.getByText('What is 3 + 3?')).toBeInTheDocument();
  });

  it('shows complete quiz button on last question', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Answer first question and go to second
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    await user.click(screen.getByText('Cevabı Gönder'));
    
    await waitFor(() => {
      expect(screen.getByText('Sonraki Soru →')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Sonraki Soru →'));
    
    // Answer second question
    const secondInput = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(secondInput, '6');
    await user.click(screen.getByText('Cevabı Gönder'));
    
    await waitFor(() => {
      expect(screen.getByText('Quiz\'i Tamamla')).toBeInTheDocument();
    });
  });

  it('completes quiz and calls onComplete with results', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Answer both questions
    for (let i = 0; i < 2; i++) {
      const input = screen.getByLabelText('Cevabınızı yazınız:');
      await user.type(input, i === 0 ? '4' : '6');
      await user.click(screen.getByText('Cevabı Gönder'));
      
      await waitFor(() => {
        const nextButton = screen.queryByText('Sonraki Soru →');
        const completeButton = screen.queryByText('Quiz\'i Tamamla');
        expect(nextButton || completeButton).toBeInTheDocument();
      });
      
      if (i === 0) {
        await user.click(screen.getByText('Sonraki Soru →'));
      } else {
        await user.click(screen.getByText('Quiz\'i Tamamla'));
      }
    }
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          totalQuestions: 2,
          correctAnswers: 2,
          accuracy: 100,
          answers: expect.arrayContaining([
            expect.objectContaining({
              questionId: 'q1',
              userAnswer: '4',
              isCorrect: true
            }),
            expect.objectContaining({
              questionId: 'q2',
              userAnswer: '6',
              isCorrect: true
            })
          ])
        })
      );
    });
  });

  it('allows navigation to previous questions', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Answer first question and go to second
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    await user.click(screen.getByText('Cevabı Gönder'));
    
    await waitFor(() => {
      expect(screen.getByText('Sonraki Soru →')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Sonraki Soru →'));
    
    // Now go back to previous question
    const prevButton = screen.getByText('← Önceki Soru');
    await user.click(prevButton);
    
    expect(screen.getByText('Soru 1 / 2')).toBeInTheDocument();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
  });

  it('calls onExit when exit button is clicked', async () => {
    const user = userEvent.setup();
    render(<QuizSession {...defaultProps} />);
    
    const exitButton = screen.getByText('Çıkış');
    await user.click(exitButton);
    
    expect(mockOnExit).toHaveBeenCalled();
  });

  it('shows answered questions count', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Initially no questions answered
    expect(screen.getByText('0 / 2 soru cevaplandı')).toBeInTheDocument();
    
    // Answer first question
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    await user.click(screen.getByText('Cevabı Gönder'));
    
    await waitFor(() => {
      expect(screen.getByText('1 / 2 soru cevaplandı')).toBeInTheDocument();
    });
  });

  it('allows clicking on question numbers to navigate', async () => {
    const user = userEvent.setup();
    mockQuestionService.evaluateAnswer.mockResolvedValue(mockEvaluation);
    
    render(<QuizSession {...defaultProps} />);
    
    // Answer first question
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    await user.click(screen.getByText('Cevabı Gönder'));
    
    await waitFor(() => {
      expect(screen.getByText('Sonraki Soru →')).toBeInTheDocument();
    });
    
    // Click on question 2 button in overview
    const questionButtons = screen.getAllByRole('button');
    const question2Button = questionButtons.find(button => button.textContent === '2');
    
    if (question2Button) {
      await user.click(question2Button);
      expect(screen.getByText('Soru 2 / 2')).toBeInTheDocument();
    }
  });

  it('handles evaluation errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockQuestionService.evaluateAnswer.mockRejectedValue(new Error('API Error'));
    
    render(<QuizSession {...defaultProps} />);
    
    const input = screen.getByLabelText('Cevabınızı yazınız:');
    await user.type(input, '4');
    await user.click(screen.getByText('Cevabı Gönder'));
    
    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Error evaluating answer:', expect.any(Error));
    });
    
    consoleError.mockRestore();
  });
});