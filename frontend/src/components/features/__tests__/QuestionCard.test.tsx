import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionCard } from '../QuestionCard';
import type { GeneratedQuestion, AnswerEvaluation } from '../../../types/question';

const mockQuestion: GeneratedQuestion = {
  id: '1',
  content: 'What is 2 + 2?',
  options: ['2', '3', '4', '5'],
  correct_answer: '4',
  explanation: 'Basic addition: 2 + 2 = 4',
};

const mockEvaluation: AnswerEvaluation = {
  is_correct: true,
  score: 1,
  feedback: 'Correct answer!',
  explanation: 'Well done!',
};

describe('QuestionCard', () => {
  it('should render question content', () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
      />
    );

    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
  });

  it('should render multiple choice options', () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
      />
    );

    mockQuestion.options?.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument();
    });
  });

  it('should call onAnswer when option is selected', async () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
      />
    );

    const option = screen.getByText('4');
    fireEvent.click(option);

    await waitFor(() => {
      expect(onAnswer).toHaveBeenCalledWith('4');
    });
  });

  it('should show evaluation when provided', () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
        showResult={true}
        evaluation={mockEvaluation}
      />
    );

    expect(screen.getByText('Correct answer!')).toBeInTheDocument();
    expect(screen.getByText('Well done!')).toBeInTheDocument();
  });

  it('should show incorrect evaluation', () => {
    const onAnswer = vi.fn();
    const incorrectEvaluation: AnswerEvaluation = {
      is_correct: false,
      score: 0,
      feedback: 'Incorrect answer',
      explanation: 'Try again!',
    };
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
        showResult={true}
        evaluation={incorrectEvaluation}
      />
    );

    expect(screen.getByText('Incorrect answer')).toBeInTheDocument();
    expect(screen.getByText('Try again!')).toBeInTheDocument();
  });

  it('should handle text input for open-ended questions', async () => {
    const openEndedQuestion: GeneratedQuestion = {
      id: '2',
      content: 'Explain photosynthesis',
      correct_answer: 'Process by which plants make food',
    };
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={openEndedQuestion}
        onAnswer={onAnswer}
      />
    );

    const textInput = screen.getByRole('textbox');
    fireEvent.change(textInput, { target: { value: 'My answer' } });
    
    const submitButton = screen.getByText('Submit Answer');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onAnswer).toHaveBeenCalledWith('My answer');
    });
  });

  it('should disable options when result is shown', () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
        showResult={true}
        evaluation={mockEvaluation}
      />
    );

    const options = screen.getAllByRole('button');
    options.forEach(option => {
      expect(option).toBeDisabled();
    });
  });

  it('should highlight correct answer when result is shown', () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
        showResult={true}
        evaluation={mockEvaluation}
      />
    );

    const correctOption = screen.getByText('4');
    expect(correctOption.closest('button')).toHaveClass('bg-green-100');
  });

  it('should show question explanation when available', () => {
    const onAnswer = vi.fn();
    
    render(
      <QuestionCard
        question={mockQuestion}
        onAnswer={onAnswer}
        showResult={true}
        evaluation={mockEvaluation}
      />
    );

    expect(screen.getByText('Basic addition: 2 + 2 = 4')).toBeInTheDocument();
  });
});