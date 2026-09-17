import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, ArtistProfile } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

export default function ArtistDetailPage() {
  const { id } = useParams();
  const { data: artist, isLoading } = useQuery({
    queryKey: ['artist', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ArtistProfile>>(`/artists/${id}`);
      return res.data.data;
    },
  });

  if (isLoading) return <LoadingSpinner />;
  if (!artist) return <EmptyState title="Izvođač nije pronađen" />;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('sr-Latn-RS', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-3xl">
      <div className="card">
        <div className="flex items-center gap-4">
          {artist.photoUrl && (
            <img
              src={artist.photoUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-white">{artist.stageName}</h1>
            <p className="mt-1 text-slate-400">{artist.city} · {artist.artistType}</p>
          </div>
        </div>
        <p className="mt-4 text-slate-300">{artist.biography}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt className="text-slate-400">Ocena</dt><dd className="text-white"><span aria-hidden="true">⭐</span> {Number(artist.averageRating).toFixed(2)}</dd></div>
          <div><dt className="text-slate-400">Honorar</dt><dd className="text-white">{Number(artist.minimumFee)}–{Number(artist.maximumFee)} RSD</dd></div>
          <div><dt className="text-slate-400">Nastupa</dt><dd className="text-white">{artist.totalPerformances}</dd></div>
          <div><dt className="text-slate-400">Iskustvo</dt><dd className="text-white">{artist.yearsOfExperience} god.</dd></div>
        </dl>
        {artist.genres && (
          <div className="mt-4 flex flex-wrap gap-2">
            {artist.genres.map((g) => (
              <span key={g.genre.id} className="rounded bg-slate-800 px-2 py-1 text-xs">{g.genre.name}</span>
            ))}
          </div>
        )}

        <div className="mt-6 border-t border-slate-800 pt-4">
          <h2 className="mb-2 font-semibold text-white">Zauzeti termini</h2>
          {!artist.isAvailable && (
            <p className="mb-2 text-sm text-amber-400">
              Izvođač je trenutno označio da ne prima nove prijave.
            </p>
          )}
          {artist.performances && artist.performances.length > 0 ? (
            <ul className="space-y-1 text-sm text-slate-300">
              {artist.performances.map((p, i) => (
                <li key={i}>
                  {formatDate(p.startDateTime)} · {p.event.city}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-400">Nema zakazanih nastupa u narednom periodu.</p>
          )}
        </div>
      </div>
    </div>
  );
}
