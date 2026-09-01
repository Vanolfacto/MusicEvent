import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, EventItem, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EventCard } from '../../components/EventCard';

export default function ArtistEventsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['events', 'public'],
    queryFn: async () => (await api.get<ApiResponse<Paginated<EventItem>>>('/events/public')).data.data,
  });

  const applyMutation = useMutation({
    mutationFn: (eventId: number) => api.post('/applications/apply', { eventId }),
    onSuccess: () => {
      toast.success('Prijava poslata');
      queryClient.invalidateQueries({ queryKey: ['artist', 'applications'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <div>
      <PageHeader title="Dostupni događaji" subtitle="Objavljeni događaji — prijavite se" />
      {isLoading ? <LoadingSpinner /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.items.map((event) => (
            <div key={event.id}>
              <EventCard event={event} />
              <button onClick={() => applyMutation.mutate(event.id)} className="btn-primary mt-2 text-sm">
                Prijavi se
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
