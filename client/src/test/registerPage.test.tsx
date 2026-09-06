import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '../pages/auth/RegisterPage';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    register: vi.fn(),
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe('RegisterPage', () => {
  it('shows a validation error for every required field on empty submit', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Kreiraj nalog' }));

    // Regression test: these errors used to be silently swallowed (only
    // the password field ever showed a message) even though the schema
    // validated all of them.
    await waitFor(() => {
      expect(document.getElementById('reg-firstName-error')).toBeInTheDocument();
    });
    expect(document.getElementById('reg-lastName-error')).toBeInTheDocument();
    expect(document.getElementById('reg-email-error')).toBeInTheDocument();
    expect(document.getElementById('reg-city-error')).toBeInTheDocument();
    // Default role is ORGANIZER, so organizationName is required and empty.
    expect(document.getElementById('reg-organizationName-error')).toBeInTheDocument();
  });

  it('associates every label with its input via htmlFor/id', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Ime')).toBeInTheDocument();
    expect(screen.getByLabelText('Prezime')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Grad')).toBeInTheDocument();
  });

  it('switches to artist-specific fields when the role is changed', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Uloga'), { target: { value: 'ARTIST' } });

    expect(screen.getByLabelText('Umetničko ime')).toBeInTheDocument();
    expect(screen.getByLabelText('Tip izvođača')).toBeInTheDocument();
    expect(screen.queryByLabelText('Naziv organizacije')).not.toBeInTheDocument();
  });
});
