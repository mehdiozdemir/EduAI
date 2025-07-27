import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { SubjectCard } from '../SubjectCard';
import type { Subject } from '../../../types';

const mockSubject: Subject = {
  id: 1,
  name: 'Matematik',
  description: 'Temel matematik konuları ve problemleri',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('SubjectCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders subject information correctly', () => {
    render(<SubjectCard subject={mockSubject} onClick={mockOnClick} />);
    
    expect(screen.getByText('Matematik')).toBeInTheDocument();
    expect(screen.getByText('Temel matematik konuları ve problemleri')).toBeInTheDocument();
    expect(screen.getByText('Konuları Gör')).toBeInTheDocument();
  });

  it('displays formatted creation date', () => {
    render(<SubjectCard subject={mockSubject} onClick={mockOnClick} />);
    
    expect(screen.getByText(/Oluşturulma:/)).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<SubjectCard subject={mockSubject} onClick={mockOnClick} />);
    
    const card = screen.getByText('Matematik').closest('.cursor-pointer');
    fireEvent.click(card!);
    
    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('calls onClick when button is clicked', () => {
    render(<SubjectCard subject={mockSubject} onClick={mockOnClick} />);
    
    const button = screen.getByText('Konuları Gör');
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledWith(1);
  });

  it('prevents event propagation when button is clicked', () => {
    render(<SubjectCard subject={mockSubject} onClick={mockOnClick} />);
    
    const button = screen.getByText('Konuları Gör');
    const clickEvent = new MouseEvent('click', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');
    
    fireEvent(button, clickEvent);
    
    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('applies hover styles', () => {
    render(<SubjectCard subject={mockSubject} onClick={mockOnClick} />);
    
    const card = screen.getByText('Matematik').closest('.hover\\:shadow-lg');
    expect(card).toBeInTheDocument();
  });
});