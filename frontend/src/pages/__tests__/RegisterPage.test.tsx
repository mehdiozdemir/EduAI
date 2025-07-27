import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import RegisterPage from '../RegisterPage';

// Mock the useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: () => ({
    register: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RegisterPage', () => {
  it('renders register page with form and navigation links', () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByText(/eduai'ya kayıt ol/i)).toBeInTheDocument();
    expect(screen.getByText(/zaten hesabınız var mı/i)).toBeInTheDocument();
    expect(screen.getByText(/giriş yapın/i)).toBeInTheDocument();
    expect(screen.getByText(/kullanım şartları/i)).toBeInTheDocument();
    expect(screen.getByText(/gizlilik politikası/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /kayıt ol/i })
    ).toBeInTheDocument();
  });

  it('renders register form component', () => {
    renderWithRouter(<RegisterPage />);

    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^şifre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre onayı/i)).toBeInTheDocument();
  });
});
