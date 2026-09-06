import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { roleDashboardPath } from '../lib/roleRoutes';
import NotificationBell from './NotificationBell';

type NavItem = { to: string; label: string; end?: boolean };

const publicLinks: NavItem[] = [
  { to: '/events', label: 'Događaji' },
  { to: '/artists', label: 'Izvođači' },
  { to: '/organizers', label: 'Organizatori' },
];

const roleLinks: Record<UserRole, NavItem[]> = {
  ADMIN: [
    { to: roleDashboardPath.ADMIN, label: 'Dashboard', end: true },
    { to: '/admin/users', label: 'Korisnici' },
    { to: '/admin/events', label: 'Događaji' },
    { to: '/admin/model', label: 'ML model' },
  ],
  ORGANIZER: [
    { to: roleDashboardPath.ORGANIZER, label: 'Dashboard', end: true },
    { to: '/organizer/events', label: 'Moji događaji' },
    { to: '/organizer/applications', label: 'Prijave' },
    { to: '/organizer/profile', label: 'Profil' },
  ],
  ARTIST: [
    { to: roleDashboardPath.ARTIST, label: 'Dashboard', end: true },
    { to: '/artist/my-events', label: 'Moji nastupi' },
    { to: '/artist/events', label: 'Ponuda' },
    { to: '/artist/applications', label: 'Prijave' },
    { to: '/artist/profile', label: 'Profil' },
  ],
};

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links =
    isAuthenticated && user
      ? [...roleLinks[user.role], { to: '/settings', label: 'Podešavanja' }]
      : publicLinks;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${isActive ? 'text-primary-400' : 'text-slate-300 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span aria-hidden="true" className="text-2xl">🎵</span>
          <span className="font-display text-xl font-bold text-white">Music Event AI</span>
        </Link>

        <nav aria-label="Glavna navigacija" className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <span className="hidden text-sm text-slate-400 sm:inline">
                {user.firstName} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="btn-primary hidden bg-slate-800 hover:bg-slate-700 md:inline-flex"
              >
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm text-slate-300 hover:text-white md:inline">
                Prijava
              </Link>
              <Link to="/register" className="hidden btn-primary md:inline-flex">
                Registracija
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Zatvori meni' : 'Otvori meni'}
            className="rounded p-2 text-slate-300 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-400 md:hidden"
          >
            <span aria-hidden="true" className="text-xl">{mobileOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-nav"
          aria-label="Glavna navigacija (mobilni prikaz)"
          className="border-t border-slate-800 bg-slate-950 px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `block rounded px-2 py-2 ${navLinkClass({ isActive })}`}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li className="mt-2 border-t border-slate-800 pt-2">
              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="btn-primary w-full bg-slate-800 hover:bg-slate-700"
                >
                  Odjava
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-slate-300 hover:text-white">
                    Prijava
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary w-full">
                    Registracija
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
