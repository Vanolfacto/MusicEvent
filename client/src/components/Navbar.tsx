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

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const links =
    isAuthenticated && user
      ? [...roleLinks[user.role], { to: '/settings', label: 'Podešavanja' }]
      : publicLinks;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <span className="font-display text-xl font-bold text-white">Music Event AI</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? 'text-primary-400' : 'text-slate-300 hover:text-white'}`
              }
            >
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
              <button onClick={handleLogout} className="btn-primary bg-slate-800 hover:bg-slate-700">
                Odjava
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-slate-300 hover:text-white">
                Prijava
              </Link>
              <Link to="/register" className="btn-primary">
                Registracija
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
