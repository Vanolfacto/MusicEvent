import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, User } from '../../types';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => (await api.get<ApiResponse<User[]>>('/users')).data.data,
  });

  const { data: modelInfo } = useQuery({
    queryKey: ['model', 'info'],
    queryFn: async () => (await api.get('/model/info')).data.data,
  });

  if (isLoading) return <LoadingSpinner />;

  const organizers = users?.filter((u) => u.role === 'ORGANIZER').length || 0;
  const artists = users?.filter((u) => u.role === 'ARTIST').length || 0;

  return (
    <div>
      <PageHeader title="Admin dashboard" />
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Korisnici" value={users?.length || 0} />
        <StatCard label="Organizatori" value={organizers} />
        <StatCard label="Izvođači" value={artists} />
        <StatCard label="ML model" value={modelInfo?.modelVersion || 'N/A'} hint={modelInfo?.algorithm} />
      </div>
    </div>
  );
}
