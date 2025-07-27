import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QuestionGenerator } from '../QuestionGenerator';
import type { QuestionParams } from '../../../types/question';

describe('QuestionGenerator', () => {
  it('should render form fields', () => {
    const onGenerate = vi.fn();
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
      />
    );

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByLabelText(/difficulty/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of questions/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/education level/i)).toBeInTheDocument();
  });

  it('should have default values', () => {
    const onGenerate = vi.fn();
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
      />
    );

    const difficultySelect = screen.getByLabelText(/difficulty/i) as HTMLSelectElement;
    const countInput = screen.getByLabelText(/number of questions/i) as HTMLInputElement;
    const levelSelect = screen.getByLabelText(/education level/i) as HTMLSelectElement;

    expect(difficultySelect.value).toBe('medium');
    expect(countInput.value).toBe('5');
    expect(levelSelect.value).toBe('high');
  });

  it('should update form values', async () => {
    const onGenerate = vi.fn();
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
      />
    );

    const difficultySelect = screen.getByLabelText(/difficulty/i);
    const countInput = screen.getByLabelText(/number of questions/i);
    const levelSelect = screen.getByLabelText(/education level/i);

    fireEvent.change(difficultySelect, { target: { value: 'hard' } });
    fireEvent.change(countInput, { target: { value: '10' } });
    fireEvent.change(levelSelect, { target: { value: 'university' } });

    expect((difficultySelect as HTMLSelectElement).value).toBe('hard');
    expect((countInput as HTMLInputElement).value).toBe('10');
    expect((levelSelect as HTMLSelectElement).value).toBe('university');
  });

  it('should call onGenerate with correct parameters', async () => {
    const onGenerate = vi.fn();
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
      />
    );

    const difficultySelect = screen.getByLabelText(/difficulty/i);
    const countInput = screen.getByLabelText(/number of questions/i);
    const levelSelect = screen.getByLabelText(/education level/i);
    const generateButton = screen.getByText('Generate Questions');

    fireEvent.change(difficultySelect, { target: { value: 'hard' } });
    fireEvent.change(countInput, { target: { value: '8' } });
    fireEvent.change(levelSelect, { target: { value: 'university' } });

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(onGenerate).toHaveBeenCalledWith({
        subject: 'Mathematics',
        topic: 'Algebra',
        difficulty: 'hard',
        count: 8,
        education_level: 'university',
      } as QuestionParams);
    });
  });

  it('should validate question count limits', async () => {
    const onGenerate = vi.fn();
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
      />
    );

    const countInput = screen.getByLabelText(/number of questions/i);
    const generateButton = screen.getByText('Generate Questions');

    // Test minimum limit
    fireEvent.change(countInput, { target: { value: '0' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/must be at least 1/i)).toBeInTheDocument();
    });

    // Test maximum limit
    fireEvent.change(countInput, { target: { value: '21' } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/cannot exceed 20/i)).toBeInTheDocument();
    });

    expect(onGenerate).not.toHaveBeenCalled();
  });

  it('should show loading state', () => {
    const onGenerate = vi.fn();
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
        loading={true}
      />
    );

    const generateButton = screen.getByText('Generating...');
    expect(generateButton).toBeDisabled();
  });

  it('should show error message', () => {
    const onGenerate = vi.fn();
    const errorMessage = 'Failed to generate questions';
    
    render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should reset form after successful generation', async () => {
    const onGenerate = vi.fn();
    
    const { rerender } = render(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
        loading={true}
      />
    );

    // Simulate successful generation
    rerender(
      <QuestionGenerator
        subject="Mathematics"
        topic="Algebra"
        onGenerate={onGenerate}
        loading={false}
      />
    );

    const countInput = screen.getByLabelText(/number of questions/i) as HTMLInputElement;
    expect(countInput.value).toBe('5'); // Should reset to default
  });
});