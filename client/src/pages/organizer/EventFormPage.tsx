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
    title: z.string().min(3),
    description: z.string().optional(),
    eventType: z.enum(['CONCERT', 'FESTIVAL', 'PRIVATE_PARTY', 'WEDDING', 'CORPORATE', 'CLUB_NIGHT', 'OTHER']),
    city: z.string().min(2),
    venue: z.string().min(2),
    address: z.string().optional(),
    startDateTime: z.string().min(1),
    endDateTime: z.string().min(1),
    expectedAudience: z.coerce.number().min(1),
    minimumBudget: z.coerce.number().min(0),
    maximumBudget: z.coerce.number().min(0),
    preferredArtistType: z.enum(['SOLO', 'BAND', 'DJ']),
    status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED']),
    genreIds: z.array(z.coerce.number()).min(1),
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
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <input {...register('title')} placeholder="Naslov" className="input" />
        <textarea {...register('description')} placeholder="Opis" className="input min-h-24" />
        <div className="grid gap-4 sm:grid-cols-2">
          <select {...register('eventType')} className="input">{['CONCERT','FESTIVAL','PRIVATE_PARTY','WEDDING','CORPORATE','CLUB_NIGHT','OTHER'].map((t) => <option key={t} value={t}>{t}</option>)}</select>
          <select {...register('preferredArtistType')} className="input"><option value="SOLO">Solo</option><option value="BAND">Bend</option><option value="DJ">DJ</option></select>
          <input {...register('city')} placeholder="Grad" className="input" />
          <input {...register('venue')} placeholder="Lokacija" className="input" />
          <input {...register('startDateTime')} type="datetime-local" className="input" />
          <div>
            <input {...register('endDateTime')} type="datetime-local" className="input" />
            {errors.endDateTime && <p className="mt-1 text-sm text-red-400">{errors.endDateTime.message}</p>}
          </div>
          <input {...register('expectedAudience')} type="number" placeholder="Publika" className="input" />
          <input {...register('minimumBudget')} type="number" placeholder="Min budžet" className="input" />
          <div>
            <input {...register('maximumBudget')} type="number" placeholder="Max budžet" className="input" />
            {errors.maximumBudget && <p className="mt-1 text-sm text-red-400">{errors.maximumBudget.message}</p>}
          </div>
          <div>
            <select {...register('status')} className="input" disabled={isTerminalStatus}>
              <option value="DRAFT">Nacrt</option>
              <option value="PUBLISHED">Objavljen</option>
              {isTerminalStatus && <option value="CANCELLED">Otkazan</option>}
              {isTerminalStatus && <option value="COMPLETED">Završen</option>}
            </select>
            {isTerminalStatus && (
              <p className="mt-1 text-xs text-slate-500">
                Status otkazanog ili završenog događaja se više ne može menjati.
              </p>
            )}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm text-slate-300">Žanrovi</p>
          <div className="flex flex-wrap gap-2">
            {genres?.map((g) => (
              <button key={g.id} type="button" onClick={() => toggleGenre(g.id)}
                className={`rounded px-3 py-1 text-sm ${selectedGenres.includes(g.id) ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
                {g.name}
              </button>
            ))}
          </div>
          {errors.genreIds && <p className="mt-1 text-sm text-red-400">Izaberite bar jedan žanr</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}</button>
      </form>
    </div>
  );
}
