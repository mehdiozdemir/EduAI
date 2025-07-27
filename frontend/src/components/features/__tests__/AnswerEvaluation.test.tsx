import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnswerEvaluation from '../AnswerEvaluation';
import type { AnswerEvaluation as AnswerEvaluationType, GeneratedQuestion } from '../../../types';

const mockQuestion: GeneratedQuestion = {
  id: '1',
  content: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  correct_answer: '4',
  explanation: 'Basic addition: 2 + 2 equals 4'
};

const mockCorrectEvaluation: AnswerEvaluationType = {
  is_correct: true,
  score: 100,
  feedback: 'Excellent! You got it right.',
  explanation: 'This is a basic arithmetic operation.'
};

const mockIncorrectEvaluation: AnswerEvaluationType = {
  is_correct: false,
  score: 0,
  feedback: 'Not quite right. Try again.',
  explanation: 'Remember that 2 + 2 = 4, not 3.'
};

describe('AnswerEvaluation', () => {
  it('renders correct answer evaluation', () => {
    render(
      <AnswerEvaluation
        evaluation={mockCorrectEvaluation}
        question={mockQuestion}
        userAnswer="4"
      />
    );

    expect(screen.getByText('✓ Doğru Cevap!')).toBeInTheDocument();
    expect(screen.getByText('Puan: 100')).toBeInTheDocument();
    expect(screen.getByText('Excellent! You got it right.')).toBeInTheDocument();
  });

  it('renders incorrect answer evaluation', () => {
    render(
      <AnswerEvaluation
        evaluation={mockIncorrectEvaluation}
        question={mockQuestion}
        userAnswer="3"
      />
    );

    expect(screen.getByText('✗ Yanlış Cevap')).toBeInTheDocument();
    expect(screen.getByText('Puan: 0')).toBeInTheDocument();
    expect(screen.getByText('Not quite right. Try again.')).toBeInTheDocument();
  });

  it('shows user answer', () => {
    render(
      <AnswerEvaluation
        evaluation={mockCorrectEvaluation}
        question={mockQuestion}
        userAnswer="4"
      />
    );

    expect(screen.getByText('Sizin Cevabınız:')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('shows correct answer when user is wrong', () => {
    render(
      <AnswerEvaluation
        evaluation={mockIncorrectEvaluation}
        question={mockQuestion}
        userAnswer="3"
        showCorrectAnswer={true}
      />
    );

    expect(screen.getByText('Doğru Cevap:')).toBeInTheDocument();
    expect(screen.getByText('Sizin Cevabınız:')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // User's wrong answer
    expect(screen.getByText('4')).toBeInTheDocument(); // Correct answer
  });

  it('hides score when showScore is false', () => {
    render(
      <AnswerEvaluation
        evaluation={mockCorrectEvaluation}
        question={mockQuestion}
        userAnswer="4"
        showScore={false}
      />
    );

    expect(screen.queryByText('Puan: 100')).not.toBeInTheDocument();
  });

  it('shows detailed explanation when available', () => {
    render(
      <AnswerEvaluation
        evaluation={mockCorrectEvaluation}
        question={mockQuestion}
        userAnswer="4"
        showExplanation={true}
      />
    );

    expect(screen.getByText('Detaylı Açıklama')).toBeInTheDocument();
    expect(screen.getByText('This is a basic arithmetic operation.')).toBeInTheDocument();
  });

  it('shows question explanation when available', () => {
    render(
      <AnswerEvaluation
        evaluation={mockCorrectEvaluation}
        question={mockQuestion}
        userAnswer="4"
        showExplanation={true}
      />
    );

    expect(screen.getByText('Konu Açıklaması')).toBeInTheDocument();
    expect(screen.getByText('Basic addition: 2 + 2 equals 4')).toBeInTheDocument();
  });
});