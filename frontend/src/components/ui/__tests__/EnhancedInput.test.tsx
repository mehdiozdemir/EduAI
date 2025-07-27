import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Input from '../Input';

describe('Enhanced Input Component', () => {
  it('should render with label and placeholder', () => {
    render(
      <Input
        label="Test Label"
        placeholder="Test placeholder"
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument();
  });

  it('should show required indicator when required', () => {
    render(
      <Input
        label="Required Field"
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should display error state correctly', () => {
    render(
      <Input
        label="Test Field"
        error="This field is required"
        state="error"
      />
    );

    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveClass('border-error');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('should display success state correctly', () => {
    render(
      <Input
        label="Test Field"
        state="success"
        showValidationIcon
      />
    );

    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveClass('border-success');
    
    // Check for success icon
    const successIcon = screen.getByRole('img', { hidden: true });
    expect(successIcon).toBeInTheDocument();
  });

  it('should display warning state correctly', () => {
    render(
      <Input
        label="Test Field"
        state="warning"
        showValidationIcon
      />
    );

    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveClass('border-yellow-400');
  });

  it('should show helper text when provided', () => {
    render(
      <Input
        label="Test Field"
        helperText="This is helper text"
      />
    );

    expect(screen.getByText('This is helper text')).toBeInTheDocument();
  });

  it('should prioritize error over helper text', () => {
    render(
      <Input
        label="Test Field"
        error="Error message"
        helperText="Helper text"
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('should handle focus and blur events', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(
      <Input
        label="Test Field"
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );

    const input = screen.getByLabelText('Test Field');
    
    await user.click(input);
    expect(onFocus).toHaveBeenCalled();

    await user.tab();
    expect(onBlur).toHaveBeenCalled();
  });

  it('should call validation change callback', async () => {
    const user = userEvent.setup();
    const onValidationChange = vi.fn();

    render(
      <Input
        label="Test Field"
        realTimeValidation
        onValidationChange={onValidationChange}
      />
    );

    const input = screen.getByLabelText('Test Field');
    
    // First blur to mark as touched
    await user.click(input);
    await user.tab();
    
    // Then type to trigger validation
    await user.click(input);
    await user.type(input, 'test');

    await waitFor(() => {
      expect(onValidationChange).toHaveBeenCalled();
    });
  });

  it('should show validation icons when enabled', () => {
    const { rerender } = render(
      <Input
        label="Test Field"
        state="error"
        showValidationIcon
      />
    );

    // Error icon should be present
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

    rerender(
      <Input
        label="Test Field"
        state="success"
        showValidationIcon
      />
    );

    // Success icon should be present
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();

    rerender(
      <Input
        label="Test Field"
        state="warning"
        showValidationIcon
      />
    );

    // Warning icon should be present
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('should not show validation icons when disabled', () => {
    render(
      <Input
        label="Test Field"
        state="error"
        showValidationIcon={false}
      />
    );

    expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
  });

  it('should handle left and right icons', () => {
    const leftIcon = <span data-testid="left-icon">L</span>;
    const rightIcon = <span data-testid="right-icon">R</span>;

    render(
      <Input
        label="Test Field"
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        showValidationIcon={false}
      />
    );

    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('should apply correct padding for icons', () => {
    const leftIcon = <span data-testid="left-icon">L</span>;

    render(
      <Input
        label="Test Field"
        leftIcon={leftIcon}
        showValidationIcon
      />
    );

    const input = screen.getByLabelText('Test Field');
    expect(input).toHaveClass('pl-10'); // Left padding for left icon
    expect(input).toHaveClass('pr-10'); // Right padding for validation icon
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <Input
        label="Test Field"
        disabled
      />
    );

    const input = screen.getByLabelText('Test Field');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('should handle different input types', () => {
    const { rerender } = render(
      <Input
        label="Email Field"
        type="email"
      />
    );

    expect(screen.getByLabelText('Email Field')).toHaveAttribute('type', 'email');

    rerender(
      <Input
        label="Password Field"
        type="password"
      />
    );

    expect(screen.getByLabelText('Password Field')).toHaveAttribute('type', 'password');
  });

  it('should update label color based on state', () => {
    const { rerender } = render(
      <Input
        label="Test Field"
        state="error"
      />
    );

    expect(screen.getByText('Test Field')).toHaveClass('text-error');

    rerender(
      <Input
        label="Test Field"
        state="success"
      />
    );

    expect(screen.getByText('Test Field')).toHaveClass('text-success');

    rerender(
      <Input
        label="Test Field"
        state="warning"
      />
    );

    expect(screen.getByText('Test Field')).toHaveClass('text-yellow-600');
  });

  it('should show focus ring when focused', async () => {
    const user = userEvent.setup();

    render(
      <Input
        label="Test Field"
      />
    );

    const input = screen.getByLabelText('Test Field');
    
    await user.click(input);
    
    expect(input).toHaveClass('ring-2', 'ring-offset-2');
  });
});