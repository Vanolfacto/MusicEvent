import { Link } from 'react-router-dom';
import type { EventItem } from '../types';

const ARTIST_TYPE_LABELS: Record<string, string> = {
  SOLO: 'Solo izvođač',
  BAND: 'Bend',
  DJ: 'DJ',
};

export function formatDate(date: string) {
  return new Date(date).toLocaleString('sr-Latn-RS', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EventCard({ event }: { event: EventItem }) {
  return (
    <Link to={`/events/${event.id}`} className="card block transition hover:border-primary-500/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{event.title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {event.city} · {event.venue}
          </p>
          <p className="mt-2 text-sm text-primary-300">{formatDate(event.startDateTime)}</p>
        </div>
        <span className="rounded-full bg-primary-500/20 px-3 py-1 text-xs text-primary-300">
          {event.eventType}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded bg-accent-500/20 px-2 py-1 text-xs font-medium text-accent-400">
          Traži se: {ARTIST_TYPE_LABELS[event.preferredArtistType] ?? event.preferredArtistType}
        </span>
        {event.genres?.map((g) => (
          <span key={g.genre.id} className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
            {g.genre.name}
          </span>
        ))}
      </div>
    </Link>
  );
}
