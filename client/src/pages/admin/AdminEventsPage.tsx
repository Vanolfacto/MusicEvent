import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, EventItem, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { EventCard } from '../../components/EventCard';

export default function AdminEventsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => (await api.get<ApiResponse<Paginated<EventItem>>>('/events')).data.data,
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: number) => api.delete(`/events/${eventId}`),
    onSuccess: () => {
      toast.success('Događaj je obrisan');
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleDelete = (eventId: number) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj događaj?')) {
      deleteMutation.mutate(eventId);
    }
  };

  return (
    <div>
      <PageHeader title="Svi događaji" subtitle="Administratorski pregled svih događaja u sistemu" />
      {isLoading ? <LoadingSpinner /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.items.map((event) => (
            <div key={event.id}>
              <EventCard event={event} />
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-500">
                  Organizator: {event.organizer?.organizationName || 'N/A'} · {event.status}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(event.id)}
                  disabled={deleteMutation.isPending}
                  className="btn-primary bg-red-900 text-xs hover:bg-red-800"
                >
                  Obriši
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
