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

  return (
    <div className="max-w-3xl">
      <div className="card">
        <h1 className="font-display text-3xl font-bold text-white">{artist.stageName}</h1>
        <p className="mt-2 text-slate-400">{artist.city} · {artist.artistType}</p>
        <p className="mt-4 text-slate-300">{artist.biography}</p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div><dt className="text-slate-500">Ocena</dt><dd className="text-white">⭐ {Number(artist.averageRating).toFixed(2)}</dd></div>
          <div><dt className="text-slate-500">Honorar</dt><dd className="text-white">{Number(artist.minimumFee)}–{Number(artist.maximumFee)} RSD</dd></div>
          <div><dt className="text-slate-500">Nastupa</dt><dd className="text-white">{artist.totalPerformances}</dd></div>
          <div><dt className="text-slate-500">Iskustvo</dt><dd className="text-white">{artist.yearsOfExperience} god.</dd></div>
        </dl>
        {artist.genres && (
          <div className="mt-4 flex flex-wrap gap-2">
            {artist.genres.map((g) => (
              <span key={g.genre.id} className="rounded bg-slate-800 px-2 py-1 text-xs">{g.genre.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
