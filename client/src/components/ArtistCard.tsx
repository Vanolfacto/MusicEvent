import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ArtistProfile } from '../types';

export function ArtistCard({
  artist,
  score,
  explanation,
  footer,
}: {
  artist: ArtistProfile;
  score?: number;
  explanation?: string | string[];
  footer?: ReactNode;
}) {
  const rating = Number(artist.averageRating).toFixed(2);

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/artists/${artist.id}`} className="text-lg font-semibold text-white hover:text-primary-400">
            {artist.stageName}
          </Link>
          <p className="mt-1 text-sm text-slate-400">
            {artist.city} · {artist.artistType}
          </p>
        </div>
        {score !== undefined && (
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-400">{(score * 100).toFixed(0)}%</p>
            <p className="text-xs text-slate-500">preporuka</p>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
        <span>⭐ {rating}</span>
        <span>
          {Number(artist.minimumFee)}–{Number(artist.maximumFee)} RSD
        </span>
        <span>{artist.isAvailable ? '✅ Dostupan' : '❌ Nedostupan'}</span>
      </div>
      {explanation && (
        <ul className="mt-4 space-y-1 text-sm text-slate-400">
          {(Array.isArray(explanation) ? explanation : explanation.split('; ')).slice(0, 4).map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      )}
      {footer && <div className="mt-4 border-t border-slate-800 pt-4">{footer}</div>}
    </div>
  );
}
