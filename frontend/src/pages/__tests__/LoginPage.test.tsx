import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../LoginPage';

// Mock the useAuth hook
vi.mock('../../hooks', () => ({
  useAuth: () => ({
    login: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LoginPage', () => {
  it('renders login page with form and navigation links', () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByText(/eduai'ya giriş yap/i)).toBeInTheDocument();
    expect(screen.getByText(/hesabınız yok mu/i)).toBeInTheDocument();
    expect(screen.getByText(/kayıt olun/i)).toBeInTheDocument();
    expect(screen.getByText(/şifrenizi mi unuttunuz/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  it('renders login form component', () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
  });
});