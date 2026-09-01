import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, OrganizerProfile } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../components/EventCard';

export default function OrganizerDetailPage() {
  const { id } = useParams();
  const { data: organizer, isLoading } = useQuery({
    queryKey: ['organizer', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrganizerProfile>>(`/organizers/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!organizer) return <EmptyState title="Organizator nije pronađen" />;

  return (
    <div className="max-w-3xl">
      <div className="card">
        <h1 className="font-display text-3xl font-bold text-white">{organizer.organizationName}</h1>
        <p className="mt-2 text-slate-400">
          {organizer.city}
          {organizer.phone ? ` · ${organizer.phone}` : ''}
        </p>
        {organizer.description && <p className="mt-4 text-slate-300">{organizer.description}</p>}
      </div>

      <h2 className="mb-4 mt-8 text-lg font-semibold text-white">
        Predstojeći događaji ({organizer.events?.length || 0})
      </h2>
      {!organizer.events?.length ? (
        <EmptyState title="Nema objavljenih događaja" />
      ) : (
        <div className="space-y-3">
          {organizer.events.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="card block text-sm transition hover:border-primary-500/50"
            >
              <p className="font-medium text-white">{event.title}</p>
              <p className="mt-1 text-slate-400">
                {event.city} · {event.venue} · {formatDate(event.startDateTime)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
