import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, EventItem, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { EventCard } from '../../components/EventCard';

export default function OrganizerEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['organizer', 'events'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Paginated<EventItem>>>('/events/mine');
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader
        title="Moji događaji"
        action={<Link to="/organizer/events/new" className="btn-primary">Kreiraj događaj</Link>}
      />
      {isLoading ? (
        <LoadingSpinner />
      ) : data?.items.length === 0 ? (
        <EmptyState title="Nemate događaja" action={<Link to="/organizer/events/new" className="btn-primary">Kreiraj prvi događaj</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.items.map((event) => (
            <div key={event.id} className="relative">
              <EventCard event={event} />
              <div className="mt-2 flex gap-2">
                <Link to={`/organizer/events/${event.id}`} className="text-sm text-primary-400 hover:underline">Detalji</Link>
                <Link to={`/organizer/events/${event.id}/edit`} className="text-sm text-slate-400 hover:underline">Uredi</Link>
                <Link to={`/organizer/events/${event.id}/recommendations`} className="text-sm text-accent-400 hover:underline">Preporuke</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
