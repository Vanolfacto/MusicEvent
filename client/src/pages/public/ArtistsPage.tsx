import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ApiResponse, ArtistProfile, Genre, Paginated } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { ArtistCard } from '../../components/ArtistCard';

export default function ArtistsPage() {
  const [city, setCity] = useState('');
  const [genreId, setGenreId] = useState('');
  const [minRating, setMinRating] = useState('');

  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Genre[]>>('/artists/genres/list');
      return res.data.data;
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['artists', city, genreId, minRating],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (genreId) params.set('genreId', genreId);
      if (minRating) params.set('minRating', minRating);
      const res = await api.get<ApiResponse<Paginated<ArtistProfile>>>(`/artists?${params}`);
      return res.data.data;
    },
  });

  return (
    <div>
      <PageHeader title="Izvođači" subtitle="Pretražite izvođače po gradu, žanru i oceni" />
      <div className="card mb-6 grid gap-4 md:grid-cols-3">
        <input className="input" placeholder="Grad" value={city} onChange={(e) => setCity(e.target.value)} />
        <select className="input" value={genreId} onChange={(e) => setGenreId(e.target.value)}>
          <option value="">Svi žanrovi</option>
          {genres?.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <input className="input" placeholder="Min. ocena" type="number" min="0" max="5" step="0.1" value={minRating} onChange={(e) => setMinRating(e.target.value)} />
      </div>
      {isLoading ? (
        <LoadingSpinner />
      ) : data?.items.length === 0 ? (
        <EmptyState title="Nema izvođača" description="Pokušajte sa drugim filterima." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data?.items.map((artist) => <ArtistCard key={artist.id} artist={artist} />)}
        </div>
      )}
    </div>
  );
}
