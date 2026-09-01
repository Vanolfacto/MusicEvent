import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, Application, Performance } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../components/EventCard';

const PERFORMANCE_STATUS: Record<string, string> = {
  SCHEDULED: 'Zakazan',
  CONFIRMED: 'Potvrđen',
  COMPLETED: 'Završen',
  CANCELLED: 'Otkazan',
};

export default function ArtistMyEventsPage() {
  const { data: performances, isLoading: perfLoading } = useQuery({
    queryKey: ['artist', 'performances'],
    queryFn: async () =>
      (await api.get<ApiResponse<Performance[]>>('/performances/mine')).data.data,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['artist', 'applications'],
    queryFn: async () =>
      (await api.get<ApiResponse<Application[]>>('/applications/artist')).data.data,
  });

  const upcomingPerformances = useMemo(() => {
    const now = Date.now();
    return (performances || [])
      .filter((p) => p.status !== 'CANCELLED' && new Date(p.endDateTime).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime(),
      );
  }, [performances]);

  const confirmedWithoutPerformance = useMemo(() => {
    const eventIdsWithPerformance = new Set(
      (performances || []).filter((p) => p.status !== 'CANCELLED').map((p) => p.eventId),
    );
    return (applications || []).filter(
      (app) =>
        app.status === 'ACCEPTED' &&
        app.event &&
        !eventIdsWithPerformance.has(app.eventId),
    );
  }, [applications, performances]);

  if (perfLoading || appsLoading) return <LoadingSpinner />;

  const hasAny = upcomingPerformances.length > 0 || confirmedWithoutPerformance.length > 0;

  return (
    <div>
      <PageHeader
        title="Događaji na kojima nastupam"
        subtitle="Zakazani nastupi i potvrđena učešća"
      />

      {!hasAny ? (
        <EmptyState
          title="Nemate zakazanih događaja"
          description="Prihvatite poziv ili sačekajte da organizator doda vas u raspored."
          action={
            <Link to="/artist/applications" className="btn-primary">
              Pregledaj prijave i pozive
            </Link>
          }
        />
      ) : (
        <div className="space-y-8">
          {upcomingPerformances.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">Zakazani nastupi</h2>
              <div className="space-y-4">
                {upcomingPerformances.map((perf) => (
                  <div key={perf.id} className="card">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {perf.event?.title || 'Događaj'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-400">
                          {perf.event?.city} · {perf.event?.venue}
                        </p>
                        <p className="mt-2 text-sm text-primary-300">
                          Nastup: {formatDate(perf.startDateTime)} –{' '}
                          {formatDate(perf.endDateTime)}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          Događaj: {formatDate(perf.event?.startDateTime || perf.startDateTime)}
                        </p>
                      </div>
                      <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs text-primary-300">
                        {PERFORMANCE_STATUS[perf.status] || perf.status}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-300">
                      <span>Honorar: {Number(perf.agreedFee).toLocaleString()} RSD</span>
                      {perf.event?.organizer?.organizationName && (
                        <span>Organizator: {perf.event.organizer.organizationName}</span>
                      )}
                    </div>
                    {perf.event?.id && (
                      <Link
                        to={`/events/${perf.event.id}`}
                        className="mt-4 inline-block text-sm text-primary-400 hover:underline"
                      >
                        Detalji događaja →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {confirmedWithoutPerformance.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-white">
                Potvrđeno učešće (raspored uskoro)
              </h2>
              <div className="space-y-4">
                {confirmedWithoutPerformance.map((app) => (
                  <div key={app.id} className="card">
                    <h3 className="text-lg font-semibold text-white">{app.event?.title}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {app.event?.city} · {app.event?.venue}
                    </p>
                    {app.event?.startDateTime && (
                      <p className="mt-2 text-sm text-primary-300">
                        {formatDate(app.event.startDateTime)}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      {app.applicationType === 'INVITE' ? 'Prihvaćen poziv' : 'Prihvaćena prijava'} —
                      organizator će dodati termin nastupa.
                    </p>
                    {app.event?.id && (
                      <Link
                        to={`/events/${app.event.id}`}
                        className="mt-3 inline-block text-sm text-primary-400 hover:underline"
                      >
                        Detalji događaja →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
