import { describe, it, expect, vi } from 'vitest';
import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext';

function renderWithRouter(ui: ReactElement, initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<div>Login stranica</div>} />
        <Route path="/organizer" element={ui} />
        <Route path="/" element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('preusmerava na login kada korisnik nije autentifikovan', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute roles={['ORGANIZER']}>
        <div>Tajna stranica</div>
      </ProtectedRoute>,
      '/organizer',
    );

    expect(screen.getByText('Login stranica')).toBeInTheDocument();
  });

  it('prikazuje sadržaj za odgovarajuću ulogu', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        firstName: 'Test',
        lastName: 'Org',
        email: 'org@test.local',
        role: 'ORGANIZER',
        status: 'ACTIVE',
        createdAt: '',
        updatedAt: '',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute roles={['ORGANIZER']}>
        <div>Tajna stranica</div>
      </ProtectedRoute>,
      '/organizer',
    );

    expect(screen.getByText('Tajna stranica')).toBeInTheDocument();
  });
});
