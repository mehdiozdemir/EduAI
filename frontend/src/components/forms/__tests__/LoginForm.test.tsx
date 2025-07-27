import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../LoginForm';


describe('LoginForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders login form with all fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid credentials';
    render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(<LoginForm onSubmit={mockOnSubmit} loading={true} />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/giriş yapılıyor/i)).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    // Initially button should be disabled due to empty form
    expect(submitButton).toBeDisabled();

    // Try to submit empty form
    await user.click(submitButton);

    // Should not call onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates username format', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);

    // Test invalid characters
    await user.type(usernameInput, 'user@name');
    await waitFor(() => {
      expect(screen.getByText(/sadece harf, rakam ve alt çizgi içerebilir/i)).toBeInTheDocument();
    });

    // Clear and test minimum length
    await user.clear(usernameInput);
    await user.type(usernameInput, 'ab');
    await waitFor(() => {
      expect(screen.getByText(/en az 3 karakter olmalıdır/i)).toBeInTheDocument();
    });
  });

  it('validates password minimum length', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const passwordInput = screen.getByLabelText(/şifre/i);

    await user.type(passwordInput, '12345');
    await waitFor(() => {
      expect(screen.getByText(/en az 6 karakter olmalıdır/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const passwordInput = screen.getByLabelText(/şifre/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123',
      });
    });
  });

  it('disables submit button when form is invalid', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });

    // Enter invalid username
    await user.type(usernameInput, 'ab');

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('enables submit button when form is valid', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const passwordInput = screen.getByLabelText(/şifre/i);
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});