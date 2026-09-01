import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, Application } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function OrganizerApplicationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['applications', 'organizer', 'all'],
    queryFn: async () => (await api.get<ApiResponse<Application[]>>('/applications/organizer')).data.data,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/applications/${id}/respond`, { status }),
    onSuccess: () => {
      toast.success('Status ažuriran');
      queryClient.invalidateQueries({ queryKey: ['applications', 'organizer', 'all'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Prijave i pozivi" />
      {!data?.length ? <EmptyState title="Nema prijava" /> : (
        <div className="space-y-4">
          {data.map((app) => (
            <div key={app.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link to={`/organizer/events/${app.eventId}`} className="font-semibold text-white hover:text-primary-400">
                  {app.event?.title}
                </Link>
                <p className="text-sm text-slate-400">{app.artist?.stageName} · {app.applicationType} · {app.status}</p>
                {app.message && <p className="mt-1 text-sm text-slate-300">"{app.message}"</p>}
              </div>
              {app.applicationType === 'APPLY' && app.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => respondMutation.mutate({ id: app.id, status: 'ACCEPTED' })} className="btn-primary text-sm">Prihvati</button>
                  <button onClick={() => respondMutation.mutate({ id: app.id, status: 'REJECTED' })} className="btn-primary bg-slate-700 text-sm">Odbij</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
