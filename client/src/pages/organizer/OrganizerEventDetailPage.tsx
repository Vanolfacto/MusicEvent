import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, Application, EventItem, Performance, Review } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../components/EventCard';
import { toLocalDateTimeInput } from '../../lib/datetime';

const PERFORMANCE_STATUSES = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const;

export default function OrganizerEventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [schedulingAppId, setSchedulingAppId] = useState<number | null>(null);
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [agreedFee, setAgreedFee] = useState('');
  const [editingPerfId, setEditingPerfId] = useState<number | null>(null);
  const [editStartDateTime, setEditStartDateTime] = useState('');
  const [editEndDateTime, setEditEndDateTime] = useState('');
  const [editAgreedFee, setEditAgreedFee] = useState('');
  const [reviewingArtistId, setReviewingArtistId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => (await api.get<ApiResponse<EventItem>>(`/events/${id}`)).data.data,
  });

  const { data: applications } = useQuery({
    queryKey: ['applications', 'organizer', id],
    queryFn: async () =>
      (await api.get<ApiResponse<Application[]>>(`/applications/organizer?eventId=${id}`)).data.data,
  });

  const { data: performances } = useQuery({
    queryKey: ['performances', id],
    queryFn: async () =>
      (await api.get<ApiResponse<Performance[]>>(`/performances/event/${id}`)).data.data,
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () =>
      (await api.get<ApiResponse<Review[]>>(`/reviews/event/${id}`)).data.data,
  });

  const artistIdsWithPerformance = useMemo(
    () => new Set((performances || []).map((p) => p.artistId)),
    [performances],
  );

  const reviewsByArtist = useMemo(
    () => new Map((reviews || []).map((r) => [r.artistId, r])),
    [reviews],
  );

  const respondMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: string }) =>
      api.patch(`/applications/${appId}/respond`, { status }),
    onSuccess: () => {
      toast.success('Status ažuriran');
      queryClient.invalidateQueries({ queryKey: ['applications', 'organizer', id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const scheduleMutation = useMutation({
    mutationFn: (payload: { artistId: number; startDateTime: string; endDateTime: string; agreedFee: number }) =>
      api.post('/performances', {
        eventId: Number(id),
        artistId: payload.artistId,
        startDateTime: new Date(payload.startDateTime).toISOString(),
        endDateTime: new Date(payload.endDateTime).toISOString(),
        agreedFee: payload.agreedFee,
      }),
    onSuccess: () => {
      toast.success('Nastup je zakazan');
      setSchedulingAppId(null);
      setStartDateTime('');
      setEndDateTime('');
      setAgreedFee('');
      queryClient.invalidateQueries({ queryKey: ['performances', id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const openScheduleForm = (app: Application) => {
    setSchedulingAppId(app.id);
    setStartDateTime(event ? toLocalDateTimeInput(event.startDateTime) : '');
    setEndDateTime(event ? toLocalDateTimeInput(event.endDateTime) : '');
    setAgreedFee('');
  };

  const updatePerformanceMutation = useMutation({
    mutationFn: ({
      perfId,
      data,
    }: {
      perfId: number;
      data: Partial<{ startDateTime: string; endDateTime: string; agreedFee: number; status: string }>;
    }) => api.put(`/performances/${perfId}`, data),
    onSuccess: () => {
      toast.success('Nastup je ažuriran');
      setEditingPerfId(null);
      queryClient.invalidateQueries({ queryKey: ['performances', id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteEventMutation = useMutation({
    mutationFn: () => api.delete(`/events/${id}`),
    onSuccess: () => {
      toast.success('Događaj je obrisan');
      navigate('/organizer/events');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleDeleteEvent = () => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj događaj?')) {
      deleteEventMutation.mutate();
    }
  };

  const reviewMutation = useMutation({
    mutationFn: (payload: { artistId: number; rating: number; comment?: string }) =>
      api.post('/reviews', {
        eventId: Number(id),
        artistId: payload.artistId,
        rating: payload.rating,
        comment: payload.comment || undefined,
      }),
    onSuccess: () => {
      toast.success('Ocena je sačuvana');
      setReviewingArtistId(null);
      setReviewRating('5');
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const openReviewForm = (artistId: number) => {
    setReviewingArtistId(artistId);
    setReviewRating('5');
    setReviewComment('');
  };

  const openEditPerformance = (p: Performance) => {
    setEditingPerfId(p.id);
    setEditStartDateTime(toLocalDateTimeInput(p.startDateTime));
    setEditEndDateTime(toLocalDateTimeInput(p.endDateTime));
    setEditAgreedFee(String(p.agreedFee));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title={event?.title || 'Događaj'}
        action={
          <div className="flex gap-2">
            <Link to={`/organizer/events/${id}/edit`} className="btn-primary bg-slate-700">Uredi</Link>
            <Link to={`/organizer/events/${id}/recommendations`} className="btn-primary">Preporuke</Link>
            <button
              type="button"
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
              className="btn-primary bg-red-900 hover:bg-red-800"
            >
              {deleteEventMutation.isPending ? 'Brisanje...' : 'Obriši događaj'}
            </button>
          </div>
        }
      />
      <div className="card mb-6 text-sm">
        <p className="text-slate-300">{event?.description}</p>
        <p className="mt-2 text-slate-400">{event?.city} · {event?.venue} · {formatDate(event?.startDateTime || '')}</p>
        <p className="mt-1 text-primary-300">Status: {event?.status}</p>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-white">Prijave ({applications?.length || 0})</h2>
      <div className="mb-8 space-y-3">
        {applications?.map((app) => {
          const needsScheduling = app.status === 'ACCEPTED' && !artistIdsWithPerformance.has(app.artistId);
          const showScheduleForm = schedulingAppId === app.id;

          return (
            <div key={app.id} className="card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{app.artist?.stageName}</p>
                  <p className="text-sm text-slate-400">{app.applicationType} · {app.status}</p>
                  {app.message && <p className="mt-1 text-sm text-slate-300">"{app.message}"</p>}
                </div>
                <div className="flex gap-2">
                  {app.status === 'PENDING' && app.applicationType === 'APPLY' && (
                    <>
                      <button onClick={() => respondMutation.mutate({ appId: app.id, status: 'ACCEPTED' })} className="btn-primary text-sm">Prihvati</button>
                      <button onClick={() => respondMutation.mutate({ appId: app.id, status: 'REJECTED' })} className="btn-primary bg-slate-700 text-sm">Odbij</button>
                    </>
                  )}
                  {needsScheduling && (
                    <button
                      type="button"
                      onClick={() => (showScheduleForm ? setSchedulingAppId(null) : openScheduleForm(app))}
                      className="btn-primary text-sm"
                    >
                      {showScheduleForm ? 'Otkaži' : 'Zakaži nastup'}
                    </button>
                  )}
                </div>
              </div>
              {showScheduleForm && (
                <div className="grid gap-2 border-t border-slate-800 pt-3 sm:grid-cols-3">
                  <input
                    type="datetime-local"
                    value={startDateTime}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={endDateTime}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Honorar (RSD)"
                    value={agreedFee}
                    onChange={(e) => setAgreedFee(e.target.value)}
                    className="input text-sm"
                  />
                  <button
                    type="button"
                    disabled={scheduleMutation.isPending || !startDateTime || !endDateTime || !agreedFee}
                    onClick={() =>
                      scheduleMutation.mutate({
                        artistId: app.artistId,
                        startDateTime,
                        endDateTime,
                        agreedFee: Number(agreedFee),
                      })
                    }
                    className="btn-primary text-sm sm:col-span-3"
                  >
                    {scheduleMutation.isPending ? 'Zakazivanje...' : 'Potvrdi termin'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="mb-4 text-lg font-semibold text-white">Nastupi ({performances?.length || 0})</h2>
      <div className="space-y-3">
        {performances?.map((p) => {
          const isCompleted = p.status === 'COMPLETED';
          const isEditing = editingPerfId === p.id;

          return (
            <div key={p.id} className="card text-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-white">{p.artist?.stageName}</p>
                  <p className="text-slate-400">{formatDate(p.startDateTime)} — {Number(p.agreedFee).toLocaleString()} RSD</p>
                  <p className="mt-1 text-primary-300">Status: {p.status}</p>
                </div>
                {!isCompleted && (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="input text-sm"
                      value={p.status}
                      disabled={updatePerformanceMutation.isPending}
                      onChange={(e) =>
                        updatePerformanceMutation.mutate({ perfId: p.id, data: { status: e.target.value } })
                      }
                    >
                      {PERFORMANCE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingPerfId(null) : openEditPerformance(p))}
                      className="btn-primary bg-slate-700 text-sm"
                    >
                      {isEditing ? 'Otkaži' : 'Uredi'}
                    </button>
                  </div>
                )}
              </div>
              {isCompleted && (() => {
                const existingReview = reviewsByArtist.get(p.artistId);
                if (existingReview) {
                  return (
                    <div className="border-t border-slate-800 pt-3 text-sm">
                      <p className="text-amber-400">⭐ {existingReview.rating}/5</p>
                      {existingReview.comment && (
                        <p className="mt-1 text-slate-400">{existingReview.comment}</p>
                      )}
                    </div>
                  );
                }
                const showReviewForm = reviewingArtistId === p.artistId;
                return (
                  <div className="border-t border-slate-800 pt-3">
                    {!showReviewForm ? (
                      <button
                        type="button"
                        onClick={() => openReviewForm(p.artistId)}
                        className="btn-primary text-sm"
                      >
                        Oceni izvođača
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={reviewRating}
                          onChange={(e) => setReviewRating(e.target.value)}
                          className="input text-sm"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} ⭐</option>
                          ))}
                        </select>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Komentar (opciono)"
                          className="input min-h-16 text-sm"
                          maxLength={1000}
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={reviewMutation.isPending}
                            onClick={() =>
                              reviewMutation.mutate({
                                artistId: p.artistId,
                                rating: Number(reviewRating),
                                comment: reviewComment,
                              })
                            }
                            className="btn-primary text-sm"
                          >
                            {reviewMutation.isPending ? 'Čuvanje...' : 'Sačuvaj ocenu'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewingArtistId(null)}
                            className="btn-primary bg-slate-700 text-sm"
                          >
                            Otkaži
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
              {isEditing && (
                <div className="grid gap-2 border-t border-slate-800 pt-3 sm:grid-cols-3">
                  <input
                    type="datetime-local"
                    value={editStartDateTime}
                    onChange={(e) => setEditStartDateTime(e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="datetime-local"
                    value={editEndDateTime}
                    onChange={(e) => setEditEndDateTime(e.target.value)}
                    className="input text-sm"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Honorar (RSD)"
                    value={editAgreedFee}
                    onChange={(e) => setEditAgreedFee(e.target.value)}
                    className="input text-sm"
                  />
                  <button
                    type="button"
                    disabled={updatePerformanceMutation.isPending || !editStartDateTime || !editEndDateTime || !editAgreedFee}
                    onClick={() =>
                      updatePerformanceMutation.mutate({
                        perfId: p.id,
                        data: {
                          startDateTime: new Date(editStartDateTime).toISOString(),
                          endDateTime: new Date(editEndDateTime).toISOString(),
                          agreedFee: Number(editAgreedFee),
                        },
                      })
                    }
                    className="btn-primary text-sm sm:col-span-3"
                  >
                    {updatePerformanceMutation.isPending ? 'Čuvanje...' : 'Sačuvaj izmene'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
