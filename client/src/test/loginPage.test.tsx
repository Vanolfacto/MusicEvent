import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    isLoading: false,
    isAuthenticated: false,
    register: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('LoginPage', () => {
  it('prikazuje formu za prijavu', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Prijava' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('admin@demo.local')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prijavi se' })).toBeInTheDocument();
  });
});
