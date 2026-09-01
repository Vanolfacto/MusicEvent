import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ArtistDashboard() {
  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['artist', 'applications'],
    queryFn: async () => (await api.get('/applications/artist')).data.data,
  });
  const { data: performances, isLoading: perfLoading } = useQuery({
    queryKey: ['artist', 'performances'],
    queryFn: async () => (await api.get('/performances/mine')).data.data,
  });

  if (appsLoading || perfLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Izvođač dashboard" subtitle="Pregled prijava, poziva i nastupa" />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Prijave" value={applications?.length || 0} />
        <StatCard label="Nastupi" value={performances?.length || 0} />
        <StatCard label="Pozivi" value={applications?.filter((a: { applicationType: string }) => a.applicationType === 'INVITE').length || 0} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/artist/my-events" className="card hover:border-primary-500/50">
          Događaji na kojima nastupam →
        </Link>
        <Link to="/artist/events" className="card hover:border-primary-500/50">Dostupni događaji →</Link>
        <Link to="/artist/applications" className="card hover:border-primary-500/50">Prijave i pozivi →</Link>
      </div>
    </div>
  );
}
