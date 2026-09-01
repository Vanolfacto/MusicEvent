import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roleDashboardPath } from '../lib/roleRoutes';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  const dashboardLink = user ? roleDashboardPath[user.role] : null;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-slate-950 to-accent-600/10" />
      <section className="relative py-16 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-wider text-primary-400">
          Master rad — prototip
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Inteligentni informacioni sistem za organizaciju muzičkih nastupa
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Povezujemo organizatore događaja sa odgovarajućim izvođačima primenom mašinskog učenja.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/events" className="btn-primary">
            Pregledaj događaje
          </Link>
          <Link to="/artists" className="btn-primary bg-slate-800 hover:bg-slate-700">
            Pronađi izvođače
          </Link>
          {isAuthenticated && dashboardLink && (
            <Link to={dashboardLink} className="btn-primary bg-accent-600 hover:bg-accent-500">
              Moj dashboard
            </Link>
          )}
        </div>
        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          <div className="card text-sm text-slate-300">ML preporuke izvođača</div>
          <div className="card text-sm text-slate-300">Upravljanje prijavama i pozivima</div>
          <div className="card text-sm text-slate-300">Raspored nastupa i statistika</div>
        </div>
      </section>
    </div>
  );
}
