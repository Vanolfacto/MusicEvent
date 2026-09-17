import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, EventItem, Genre } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toLocalDateTimeInput } from '../../lib/datetime';

const schema = z
  .object({
    title: z.string().min(3, 'Minimum 3 karaktera'),
    description: z.string().optional(),
    eventType: z.enum(['CONCERT', 'FESTIVAL', 'PRIVATE_PARTY', 'WEDDING', 'CORPORATE', 'CLUB_NIGHT', 'OTHER']),
    city: z.string().min(2, 'Minimum 2 karaktera'),
    venue: z.string().min(2, 'Minimum 2 karaktera'),
    address: z.string().optional(),
    startDateTime: z.string().min(1, 'Datum i vreme početka su obavezni'),
    endDateTime: z.string().min(1, 'Datum i vreme završetka su obavezni'),
    expectedAudience: z.coerce.number().min(1, 'Mora biti bar 1'),
    minimumBudget: z.coerce.number().min(0, 'Ne može biti negativan'),
    maximumBudget: z.coerce.number().min(0, 'Ne može biti negativan'),
    preferredArtistType: z.enum(['SOLO', 'BAND', 'DJ']),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
    genreIds: z.array(z.coerce.number()).min(1, 'Izaberite bar jedan žanr'),
  })
  .superRefine((data, ctx) => {
    if (data.startDateTime && data.endDateTime && new Date(data.endDateTime) <= new Date(data.startDateTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Kraj događaja mora biti posle početka',
        path: ['endDateTime'],
      });
    }
    if (data.minimumBudget > data.maximumBudget) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimalni budžet ne može biti veći od maksimalnog',
        path: ['maximumBudget'],
      });
    }
  });

type FormData = z.infer<typeof schema>;

export default function EventFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => (await api.get<ApiResponse<Genre[]>>('/artists/genres/list')).data.data,
  });

  const { data: existing, isLoading: eventLoading } = useQuery({
    queryKey: ['event', id, 'edit'],
    enabled: isEdit,
    queryFn: async () => (await api.get<ApiResponse<EventItem>>(`/events/${id}`)).data.data,
  });

  const isTerminalStatus = existing?.status === 'CANCELLED' || existing?.status === 'COMPLETED';

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: existing
      ? {
          title: existing.title,
          description: existing.description || '',
          eventType: existing.eventType as FormData['eventType'],
          city: existing.city,
          venue: existing.venue,
          address: existing.address || '',
          startDateTime: toLocalDateTimeInput(existing.startDateTime),
          endDateTime: toLocalDateTimeInput(existing.endDateTime),
          expectedAudience: existing.expectedAudience,
          minimumBudget: Number(existing.minimumBudget),
          maximumBudget: Number(existing.maximumBudget),
          preferredArtistType: existing.preferredArtistType as FormData['preferredArtistType'],
          status: existing.status as FormData['status'],
          genreIds: existing.genres?.map((g) => g.genre.id) || [],
        }
      : undefined,
    defaultValues: { status: 'DRAFT', genreIds: [], eventType: 'CONCERT', preferredArtistType: 'BAND' },
  });

  const selectedGenres = watch('genreIds') || [];

  const toggleGenre = (genreId: number) => {
    const current = selectedGenres;
    setValue(
      'genreIds',
      current.includes(genreId) ? current.filter((g) => g !== genreId) : [...current, genreId],
      { shouldValidate: true },
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        startDateTime: new Date(data.startDateTime).toISOString(),
        endDateTime: new Date(data.endDateTime).toISOString(),
      };
      if (isEdit) {
        await api.put(`/events/${id}`, payload);
        toast.success('Događaj ažuriran');
      } else {
        await api.post('/events', payload);
        toast.success('Događaj kreiran');
      }
      navigate('/organizer/events');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (genresLoading || (isEdit && eventLoading)) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <PageHeader title={isEdit ? 'Uredi događaj' : 'Novi događaj'} />
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
        <div>
          <label htmlFor="event-title" className="mb-1 block text-sm text-slate-300">Naslov</label>
          <input
            {...register('title')}
            id="event-title"
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? 'event-title-error' : undefined}
            className="input"
          />
          {errors.title && (
            <p id="event-title-error" role="alert" className="mt-1 text-sm text-red-400">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="event-description" className="mb-1 block text-sm text-slate-300">Opis</label>
          <textarea {...register('description')} id="event-description" className="input min-h-24" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-eventType" className="mb-1 block text-sm text-slate-300">Tip događaja</label>
            <select {...register('eventType')} id="event-eventType" className="input">
              {['CONCERT','FESTIVAL','PRIVATE_PARTY','WEDDING','CORPORATE','CLUB_NIGHT','OTHER'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="event-preferredArtistType" className="mb-1 block text-sm text-slate-300">Tip izvođača</label>
            <select {...register('preferredArtistType')} id="event-preferredArtistType" className="input">
              <option value="SOLO">Solo</option><option value="BAND">Bend</option><option value="DJ">DJ</option>
            </select>
          </div>
          <div>
            <label htmlFor="event-city" className="mb-1 block text-sm text-slate-300">Grad</label>
            <input
              {...register('city')}
              id="event-city"
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? 'event-city-error' : undefined}
              className="input"
            />
            {errors.city && (
              <p id="event-city-error" role="alert" className="mt-1 text-sm text-red-400">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="event-venue" className="mb-1 block text-sm text-slate-300">Lokacija</label>
            <input
              {...register('venue')}
              id="event-venue"
              aria-invalid={errors.venue ? true : undefined}
              aria-describedby={errors.venue ? 'event-venue-error' : undefined}
              className="input"
            />
            {errors.venue && (
              <p id="event-venue-error" role="alert" className="mt-1 text-sm text-red-400">{errors.venue.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="event-startDateTime" className="mb-1 block text-sm text-slate-300">Početak</label>
            <input {...register('startDateTime')} id="event-startDateTime" type="datetime-local" className="input" />
          </div>
          <div>
            <label htmlFor="event-endDateTime" className="mb-1 block text-sm text-slate-300">Kraj</label>
            <input
              {...register('endDateTime')}
              id="event-endDateTime"
              type="datetime-local"
              aria-invalid={errors.endDateTime ? true : undefined}
              aria-describedby={errors.endDateTime ? 'event-endDateTime-error' : undefined}
              className="input"
            />
            {errors.endDateTime && (
              <p id="event-endDateTime-error" role="alert" className="mt-1 text-sm text-red-400">{errors.endDateTime.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="event-expectedAudience" className="mb-1 block text-sm text-slate-300">Očekivana publika</label>
            <input {...register('expectedAudience')} id="event-expectedAudience" type="number" className="input" />
          </div>
          <div>
            <label htmlFor="event-minimumBudget" className="mb-1 block text-sm text-slate-300">Min budžet (RSD)</label>
            <input {...register('minimumBudget')} id="event-minimumBudget" type="number" className="input" />
          </div>
          <div>
            <label htmlFor="event-maximumBudget" className="mb-1 block text-sm text-slate-300">Max budžet (RSD)</label>
            <input
              {...register('maximumBudget')}
              id="event-maximumBudget"
              type="number"
              aria-invalid={errors.maximumBudget ? true : undefined}
              aria-describedby={errors.maximumBudget ? 'event-maximumBudget-error' : undefined}
              className="input"
            />
            {errors.maximumBudget && (
              <p id="event-maximumBudget-error" role="alert" className="mt-1 text-sm text-red-400">{errors.maximumBudget.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="event-status" className="mb-1 block text-sm text-slate-300">Status</label>
            <select {...register('status')} id="event-status" className="input" disabled={isTerminalStatus}>
              <option value="DRAFT">Nacrt</option>
              <option value="PUBLISHED">Objavljen</option>
              {isEdit && <option value="CANCELLED">Otkazan</option>}
              {isTerminalStatus && <option value="COMPLETED">Završen</option>}
            </select>
            {isTerminalStatus && (
              <p className="mt-1 text-xs text-slate-400">
                Status otkazanog ili završenog događaja se više ne može menjati.
              </p>
            )}
          </div>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm text-slate-300">Žanrovi</legend>
          <div className="flex flex-wrap gap-2">
            {genres?.map((g) => (
              <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                aria-pressed={selectedGenres.includes(g.id)}
                className={`rounded px-3 py-1 text-sm ${selectedGenres.includes(g.id) ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {g.name}
              </button>
            ))}
          </div>
          {errors.genreIds && <p role="alert" className="mt-1 text-sm text-red-400">Izaberite bar jedan žanr</p>}
        </fieldset>
        <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}</button>
      </form>
    </div>
  );
}
