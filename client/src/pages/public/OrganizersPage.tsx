import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, OrganizerProfile, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function OrganizersPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['organizers', page],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Paginated<OrganizerProfile>>>(
        `/organizers?page=${page}&limit=${limit}`,
      );
      return res.data.data;
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div>
      <PageHeader title="Organizatori" subtitle="Pregledajte organizatore događaja na platformi" />
      {isLoading ? (
        <LoadingSpinner />
      ) : data?.items.length === 0 ? (
        <EmptyState title="Nema organizatora" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {data?.items.map((organizer) => (
              <Link
                key={organizer.id}
                to={`/organizers/${organizer.id}`}
                className="card block transition hover:border-primary-500/50"
              >
                <h3 className="text-lg font-semibold text-white">{organizer.organizationName}</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {organizer.city}
                  {organizer.phone ? ` · ${organizer.phone}` : ''}
                </p>
                {organizer._count && (
                  <p className="mt-2 text-sm text-primary-300">{organizer._count.events} događaja</p>
                )}
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                className="btn-primary bg-slate-700 text-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prethodna
              </button>
              <span className="text-sm text-slate-400">
                Strana {page} od {totalPages}
              </span>
              <button
                type="button"
                className="btn-primary bg-slate-700 text-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sledeća
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
