import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Input from '../Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<Input label="Username" placeholder="Enter username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveClass('border-error');
  });

  it('shows success state', () => {
    render(<Input state="success" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-success');
  });

  it('renders with helper text', () => {
    render(<Input helperText="This is helper text" />);
    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('renders with icons', () => {
    const leftIcon = <span data-testid="left-icon">L</span>;
    const rightIcon = <span data-testid="right-icon">R</span>;
    
    render(<Input leftIcon={leftIcon} rightIcon={rightIcon} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });
});