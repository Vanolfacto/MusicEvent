import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, EventItem, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrganizerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['organizer', 'events'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Paginated<EventItem>>>('/events/mine');
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;

  const events = data?.items || [];
  const published = events.filter((e) => e.status === 'PUBLISHED').length;
  const draft = events.filter((e) => e.status === 'DRAFT').length;

  const chartData = [
    { name: 'Objavljeni', value: published },
    { name: 'Nacrti', value: draft },
    { name: 'Ostalo', value: events.length - published - draft },
  ];

  return (
    <div>
      <PageHeader
        title="Organizator dashboard"
        subtitle="Pregled vaših događaja i aktivnosti"
        action={<Link to="/organizer/events/new" className="btn-primary">Novi događaj</Link>}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Ukupno događaja" value={events.length} />
        <StatCard label="Objavljeno" value={published} />
        <StatCard label="Nacrti" value={draft} />
      </div>
      <div className="card h-72">
        <h3 className="mb-4 font-semibold text-white">Status događaja</h3>
        <ResponsiveContainer width="100%" height="90%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              itemStyle={{ color: '#c4b5fd' }}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
