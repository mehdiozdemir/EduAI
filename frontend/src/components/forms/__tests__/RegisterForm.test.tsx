import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RegisterForm from '../RegisterForm';


describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders register form with all fields', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^şifre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre onayı/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kayıt ol/i })).toBeInTheDocument();
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Registration failed';
    render(<RegisterForm onSubmit={mockOnSubmit} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows loading state when loading prop is true', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} loading={true} />);

    const submitButton = screen.getByRole('button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/kayıt olunuyor/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/e-posta/i);

    await user.type(emailInput, 'invalid-email');
    await waitFor(() => {
      expect(screen.getByText(/geçerli bir e-posta adresi girin/i)).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const passwordInput = screen.getByLabelText(/^şifre$/i);

    // Test minimum length
    await user.type(passwordInput, '1234567');
    await waitFor(() => {
      expect(screen.getByText(/en az 8 karakter olmalıdır/i)).toBeInTheDocument();
    });

    // Clear and test pattern requirement
    await user.clear(passwordInput);
    await user.type(passwordInput, 'password');
    await waitFor(() => {
      expect(screen.getByText(/en az bir küçük harf, bir büyük harf ve bir rakam içermelidir/i)).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const passwordInput = screen.getByLabelText(/^şifre$/i);
    const confirmPasswordInput = screen.getByLabelText(/şifre onayı/i);

    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'DifferentPassword123');

    await waitFor(() => {
      expect(screen.getByText(/şifreler eşleşmiyor/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/^şifre$/i);
    const confirmPasswordInput = screen.getByLabelText(/şifre onayı/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123',
      });
    });
  });

  it('does not submit confirmPassword field', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/^şifre$/i);
    const confirmPasswordInput = screen.getByLabelText(/şifre onayı/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    const submitButton = screen.getByRole('button', { name: /kayıt ol/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.not.objectContaining({
          confirmPassword: expect.anything(),
        })
      );
    });
  });

  it('disables submit button when form is invalid', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const submitButton = screen.getByRole('button', { name: /kayıt ol/i });

    // Enter invalid username
    await user.type(usernameInput, 'ab');

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  it('validates username format', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);

    // Test invalid characters
    await user.type(usernameInput, 'user@name');
    await waitFor(() => {
      expect(screen.getByText(/sadece harf, rakam ve alt çizgi içerebilir/i)).toBeInTheDocument();
    });
  });

  it('enables submit button when all fields are valid', async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={mockOnSubmit} />);

    const usernameInput = screen.getByLabelText(/kullanıcı adı/i);
    const emailInput = screen.getByLabelText(/e-posta/i);
    const passwordInput = screen.getByLabelText(/^şifre$/i);
    const confirmPasswordInput = screen.getByLabelText(/şifre onayı/i);
    const submitButton = screen.getByRole('button', { name: /kayıt ol/i });

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123');
    await user.type(confirmPasswordInput, 'Password123');

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});