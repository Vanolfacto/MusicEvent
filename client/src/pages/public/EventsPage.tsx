import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, EventItem, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { EventCard } from '../../components/EventCard';

export default function EventsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events', 'public'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Paginated<EventItem>>>('/events/public');
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Greška" description="Nije moguće učitati događaje." />;

  return (
    <div>
      <PageHeader title="Javni događaji" subtitle="Pregled objavljenih muzičkih događaja" />
      {data?.items.length === 0 ? (
        <EmptyState title="Nema događaja" description="Trenutno nema objavljenih događaja." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.items.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </div>
  );
}
