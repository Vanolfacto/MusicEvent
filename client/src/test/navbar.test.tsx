import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, firstName: 'Ana', role: 'ORGANIZER' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock('../components/NotificationBell', () => ({
  default: () => <div data-testid="notification-bell" />,
}));

describe('Navbar mobile menu', () => {
  it('is closed by default and opens on click, exposing the role-specific links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: 'Otvori meni' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('navigation', { name: /mobilni prikaz/i })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'Zatvori meni' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    const mobileNav = screen.getByRole('navigation', { name: /mobilni prikaz/i });
    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileNav).getByText('Moji događaji')).toBeInTheDocument();
  });

  it('closes when Escape is pressed', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Otvori meni' }));
    expect(screen.getByRole('navigation', { name: /mobilni prikaz/i })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('navigation', { name: /mobilni prikaz/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Otvori meni' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('closes when a link inside it is clicked', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Otvori meni' }));
    const mobileNav = screen.getByRole('navigation', { name: /mobilni prikaz/i });
    fireEvent.click(within(mobileNav).getByText('Moji događaji'));

    expect(screen.queryByRole('navigation', { name: /mobilni prikaz/i })).not.toBeInTheDocument();
  });
});
