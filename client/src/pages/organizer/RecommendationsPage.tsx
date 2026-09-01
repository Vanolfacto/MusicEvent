import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, Application, Recommendation } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { ArtistCard } from '../../components/ArtistCard';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Na čekanju',
  ACCEPTED: 'Prihvaćeno',
  REJECTED: 'Odbijeno',
  WITHDRAWN: 'Povučeno',
  CANCELLED: 'Otkazano',
};

function applicationBadges(applications: Application[], artistId: number) {
  const forArtist = applications.filter((a) => a.artistId === artistId);
  return forArtist.map((app) => {
    const kind = app.applicationType === 'INVITE' ? 'Poziv' : 'Prijava';
    const status = STATUS_LABEL[app.status] || app.status;
    return `${kind}: ${status}`;
  });
}

function canSendInvite(applications: Application[], artistId: number): boolean {
  const invite = applications.find(
    (a) => a.artistId === artistId && a.applicationType === 'INVITE',
  );
  return !invite;
}

export default function RecommendationsPage() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [openInviteArtistId, setOpenInviteArtistId] = useState<number | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['recommendations', eventId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Recommendation[]>>(`/recommendations/events/${eventId}`);
      return res.data.data;
    },
  });

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', 'organizer', eventId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Application[]>>(
        `/applications/organizer?eventId=${eventId}`,
      );
      return res.data.data;
    },
    enabled: Boolean(eventId),
  });

  const applicationsByArtist = useMemo(() => {
    const map = new Map<number, Application[]>();
    for (const app of applications) {
      const list = map.get(app.artistId) || [];
      list.push(app);
      map.set(app.artistId, list);
    }
    return map;
  }, [applications]);

  const noGenreMatch = useMemo(() => {
    if (!data?.length) return false;
    return data.every((rec) => (rec.genreMatch ?? 1) === 0);
  }, [data]);

  const uniqueRecommendations = useMemo(() => {
    if (!data?.length) return [];
    const byArtist = new Map<number, Recommendation>();
    for (const rec of data) {
      const prev = byArtist.get(rec.artistId);
      if (!prev || rec.score > prev.score) {
        byArtist.set(rec.artistId, rec);
      }
    }
    return [...byArtist.values()].sort((a, b) => b.score - a.score);
  }, [data]);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<ApiResponse<{ recommendations: Recommendation[] }>>(
        `/recommendations/events/${eventId}/generate`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Preporuke generisane');
      queryClient.invalidateQueries({ queryKey: ['recommendations', eventId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const inviteMutation = useMutation({
    mutationFn: async ({
      artistId,
      message,
    }: {
      artistId: number;
      message?: string;
    }) => {
      await api.post('/applications/invite', {
        eventId: Number(eventId),
        artistId,
        message: message?.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success('Poziv poslat izvođaču');
      setOpenInviteArtistId(null);
      setInviteMessage('');
      queryClient.invalidateQueries({ queryKey: ['applications', 'organizer', eventId] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <div>
      <PageHeader
        title="Preporučeni izvođači"
        subtitle="ML rangiranje — pošaljite poziv direktno sa preporuke"
        action={
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="btn-primary"
          >
            {generateMutation.isPending ? 'Generisanje...' : 'Generiši preporuke'}
          </button>
        }
      />
      {noGenreMatch && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          ⚠️ Nijedan dostupan izvođač se ne poklapa po žanru sa ovim događajem — preporuke ispod su
          rangirane isključivo po drugim kriterijumima (ocena, budžet, dostupnost).
        </div>
      )}
      {isLoading ? (
        <LoadingSpinner />
      ) : !uniqueRecommendations.length ? (
        <EmptyState
          title="Nema preporuka"
          description="Kliknite dugme da generišete ML preporuke za ovaj događaj."
          action={
            <button onClick={() => generateMutation.mutate()} className="btn-primary">
              Generiši preporuke
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {uniqueRecommendations.map((rec) => {
            const artistApps = applicationsByArtist.get(rec.artistId) || [];
            const badges = applicationBadges(applications, rec.artistId);
            const showInviteForm = openInviteArtistId === rec.artistId;
            const inviteAllowed = canSendInvite(applications, rec.artistId);

            return (
              <ArtistCard
                key={rec.id}
                artist={rec.artist}
                score={rec.score}
                explanation={rec.explanation}
                footer={
                  <div className="space-y-3">
                    {badges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {badges.map((label) => (
                          <span
                            key={label}
                            className="rounded-full bg-slate-800 px-2 py-1 text-xs text-primary-300"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/artists/${rec.artistId}`}
                        className="btn-primary bg-slate-800 text-sm hover:bg-slate-700"
                      >
                        Detaljan profil
                      </Link>
                      {inviteAllowed && (
                        <button
                          type="button"
                          onClick={() => {
                            setOpenInviteArtistId(showInviteForm ? null : rec.artistId);
                            setInviteMessage('');
                          }}
                          className="btn-primary text-sm"
                        >
                          {showInviteForm ? 'Otkaži' : 'Pošalji poziv'}
                        </button>
                      )}
                    </div>
                    {showInviteForm && inviteAllowed && (
                      <div className="space-y-2">
                        <textarea
                          value={inviteMessage}
                          onChange={(e) => setInviteMessage(e.target.value)}
                          placeholder="Opciona poruka izvođaču..."
                          className="input min-h-20 text-sm"
                          maxLength={1000}
                        />
                        <button
                          type="button"
                          disabled={inviteMutation.isPending}
                          onClick={() =>
                            inviteMutation.mutate({
                              artistId: rec.artistId,
                              message: inviteMessage,
                            })
                          }
                          className="btn-primary w-full text-sm"
                        >
                          {inviteMutation.isPending ? 'Slanje...' : 'Potvrdi poziv'}
                        </button>
                      </div>
                    )}
                    {!inviteAllowed && artistApps.some((a) => a.applicationType === 'INVITE') && (
                      <p className="text-xs text-slate-500">
                        Poziv je već poslat ovom izvođaču za ovaj događaj.
                      </p>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
