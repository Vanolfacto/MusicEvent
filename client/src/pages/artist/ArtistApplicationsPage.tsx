import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function ArtistApplicationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['artist', 'applications'],
    queryFn: async () => (await api.get('/applications/artist')).data.data,
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/applications/${id}/respond`, { status }),
    onSuccess: () => {
      toast.success('Status ažuriran');
      queryClient.invalidateQueries({ queryKey: ['artist', 'applications'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const withdrawMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/applications/${id}/withdraw`),
    onSuccess: () => {
      toast.success('Prijava je povučena');
      queryClient.invalidateQueries({ queryKey: ['artist', 'applications'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Moje prijave i pozivi" />
      {!data?.length ? <EmptyState title="Nema prijava" /> : (
        <div className="space-y-4">
          {data.map((app: { id: number; status: string; applicationType: string; message?: string | null; event?: { title: string } }) => (
            <div key={app.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{app.event?.title}</p>
                <p className="text-sm text-slate-400">{app.applicationType} · {app.status}</p>
                {app.message && <p className="mt-1 text-sm text-slate-300">"{app.message}"</p>}
              </div>
              {app.applicationType === 'INVITE' && app.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => respondMutation.mutate({ id: app.id, status: 'ACCEPTED' })} className="btn-primary text-sm">Prihvati</button>
                  <button onClick={() => respondMutation.mutate({ id: app.id, status: 'REJECTED' })} className="btn-primary bg-slate-700 text-sm">Odbij</button>
                </div>
              )}
              {app.applicationType === 'APPLY' && app.status === 'PENDING' && (
                <button
                  onClick={() => withdrawMutation.mutate(app.id)}
                  disabled={withdrawMutation.isPending}
                  className="btn-primary bg-slate-700 text-sm"
                >
                  Povuci prijavu
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
