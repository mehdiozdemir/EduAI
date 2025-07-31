import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { EducationLevelCard } from '../EducationLevelCard';
import type { EducationLevelName } from '../../../types/education';

describe('EducationLevelCard', () => {
  const mockOnClick = vi.fn();
  const defaultProps = {
    level: 'ilkokul' as EducationLevelName,
    title: 'İlkokul',
    description: '1-4. Sınıf',
    isSelected: false,
    onClick: mockOnClick,
  };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders education level information correctly', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    expect(screen.getByText('İlkokul')).toBeInTheDocument();
    expect(screen.getByText('1-4. Sınıf')).toBeInTheDocument();
  });

  it('renders without description when not provided', () => {
    const propsWithoutDescription = { ...defaultProps, description: undefined };
    render(<EducationLevelCard {...propsWithoutDescription} />);
    
    expect(screen.getByText('İlkokul')).toBeInTheDocument();
    expect(screen.queryByText('1-4. Sınıf')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith('ilkokul');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Enter' });
    
    expect(mockOnClick).toHaveBeenCalledWith('ilkokul');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Space key is pressed', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: ' ' });
    
    expect(mockOnClick).toHaveBeenCalledWith('ilkokul');
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keys', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    fireEvent.keyDown(card, { key: 'Tab' });
    fireEvent.keyDown(card, { key: 'Escape' });
    
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies selected styles when isSelected is true', () => {
    const selectedProps = { ...defaultProps, isSelected: true };
    render(<EducationLevelCard {...selectedProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('bg-blue-50', 'border-blue-500');
  });

  it('applies default styles when isSelected is false', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('bg-white', 'border-gray-200');
    expect(card).not.toHaveClass('bg-blue-50', 'border-blue-500');
  });

  it('has proper accessibility attributes', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-pressed', 'false');
    expect(card).toHaveAttribute('aria-label', 'İlkokul eğitim seviyesini seç - 1-4. Sınıf');
  });

  it('has proper accessibility attributes when selected', () => {
    const selectedProps = { ...defaultProps, isSelected: true };
    render(<EducationLevelCard {...selectedProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });

  it('has proper accessibility label without description', () => {
    const propsWithoutDescription = { ...defaultProps, description: undefined };
    render(<EducationLevelCard {...propsWithoutDescription} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-label', 'İlkokul eğitim seviyesini seç');
  });

  it('applies hover styles', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('hover:shadow-lg', 'hover:bg-gray-50', 'hover:border-gray-300');
  });

  it('applies focus styles', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500', 'focus:ring-offset-2');
  });

  it('applies transition styles', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('transition-all', 'duration-200');
  });

  it('has cursor pointer style', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('has touch manipulation for mobile', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('touch-manipulation');
  });

  it('has proper minimum height classes', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('min-h-[120px]', 'sm:min-h-[140px]');
  });

  it('has proper layout classes', () => {
    render(<EducationLevelCard {...defaultProps} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveClass('flex', 'flex-col', 'justify-center', 'items-center', 'text-center');
  });
});