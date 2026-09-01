import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, EventItem } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../components/EventCard';

export default function EventDetailPage() {
  const { id } = useParams();
  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<EventItem>>(`/events/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!event) return <EmptyState title="Događaj nije pronađen" />;

  return (
    <div className="max-w-3xl">
      <div className="card">
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs text-primary-300">
          {event.status}
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold text-white">{event.title}</h1>
        <p className="mt-4 text-slate-300">{event.description}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt className="text-slate-500">Grad</dt><dd className="text-white">{event.city}</dd></div>
          <div><dt className="text-slate-500">Lokacija</dt><dd className="text-white">{event.venue}</dd></div>
          <div><dt className="text-slate-500">Početak</dt><dd className="text-white">{formatDate(event.startDateTime)}</dd></div>
          <div><dt className="text-slate-500">Kraj</dt><dd className="text-white">{formatDate(event.endDateTime)}</dd></div>
          <div><dt className="text-slate-500">Publika</dt><dd className="text-white">{event.expectedAudience}</dd></div>
          <div><dt className="text-slate-500">Budžet</dt><dd className="text-white">{Number(event.minimumBudget)}–{Number(event.maximumBudget)} RSD</dd></div>
        </dl>
      </div>
    </div>
  );
}
