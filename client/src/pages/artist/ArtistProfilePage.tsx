import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, ArtistProfile, Genre } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const urlField = z.string().trim().url('Nevažeći URL').optional().or(z.literal(''));

const schema = z
  .object({
    stageName: z.string().trim().min(2, 'Minimum 2 karaktera').max(100),
    biography: z.string().trim().max(3000).optional().or(z.literal('')),
    city: z.string().trim().min(2, 'Minimum 2 karaktera').max(100),
    artistType: z.enum(['SOLO', 'BAND', 'DJ']),
    memberCount: z.coerce.number().int().min(1).max(50),
    minimumFee: z.coerce.number().min(0),
    maximumFee: z.coerce.number().min(0),
    yearsOfExperience: z.coerce.number().int().min(0).max(80),
    spotifyUrl: urlField,
    youtubeUrl: urlField,
    instagramUrl: urlField,
    isAvailable: z.boolean(),
    genreIds: z.array(z.coerce.number()),
  })
  .superRefine((data, ctx) => {
    if (data.minimumFee > data.maximumFee) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimalni honorar ne može biti veći od maksimalnog',
        path: ['minimumFee'],
      });
    }
  });

type FormData = z.infer<typeof schema>;

export default function ArtistProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['artist', 'profile'],
    queryFn: async () => (await api.get<ApiResponse<ArtistProfile>>('/artists/me')).data.data,
  });

  const { data: genres, isLoading: genresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => (await api.get<ApiResponse<Genre[]>>('/artists/genres/list')).data.data,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data
      ? {
          stageName: data.stageName,
          biography: data.biography || '',
          city: data.city,
          artistType: data.artistType,
          memberCount: data.memberCount,
          minimumFee: Number(data.minimumFee),
          maximumFee: Number(data.maximumFee),
          yearsOfExperience: data.yearsOfExperience,
          spotifyUrl: data.spotifyUrl || '',
          youtubeUrl: data.youtubeUrl || '',
          instagramUrl: data.instagramUrl || '',
          isAvailable: data.isAvailable,
          genreIds: data.genres?.map((g) => g.genre.id) || [],
        }
      : undefined,
  });

  const selectedGenres = watch('genreIds') || [];
  const isAvailable = watch('isAvailable');

  const toggleGenre = (genreId: number) => {
    const current = selectedGenres;
    setValue(
      'genreIds',
      current.includes(genreId) ? current.filter((g) => g !== genreId) : [...current, genreId],
      { shouldValidate: true },
    );
  };

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put('/artists/me', payload),
    onSuccess: () => {
      toast.success('Profil ažuriran');
      queryClient.invalidateQueries({ queryKey: ['artist', 'profile'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onSubmit = (form: FormData) => {
    mutation.mutate({
      ...form,
      biography: form.biography || null,
      spotifyUrl: form.spotifyUrl || null,
      youtubeUrl: form.youtubeUrl || null,
      instagramUrl: form.instagramUrl || null,
    });
  };

  if (isLoading || genresLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Moj profil" />
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
        <label className="flex items-center justify-between rounded border border-primary-700 bg-primary-950/40 px-4 py-3">
          <span className="text-sm font-medium text-white">Dostupan za nove nastupe</span>
          <input type="checkbox" {...register('isAvailable')} className="h-5 w-5" />
        </label>
        {!isAvailable && (
          <p className="text-xs text-amber-400">
            Dok niste označeni kao dostupni, ne možete se prijavljivati na događaje.
          </p>
        )}

        <div>
          <label htmlFor="artist-stageName" className="mb-1 block text-sm text-slate-300">Umetničko ime</label>
          <input
            {...register('stageName')}
            id="artist-stageName"
            aria-invalid={errors.stageName ? true : undefined}
            aria-describedby={errors.stageName ? 'artist-stageName-error' : undefined}
            className="input"
          />
          {errors.stageName && (
            <p id="artist-stageName-error" role="alert" className="mt-1 text-sm text-red-400">{errors.stageName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="artist-biography" className="mb-1 block text-sm text-slate-300">Biografija</label>
          <textarea {...register('biography')} id="artist-biography" className="input min-h-24" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="artist-city" className="mb-1 block text-sm text-slate-300">Grad</label>
            <input
              {...register('city')}
              id="artist-city"
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? 'artist-city-error' : undefined}
              className="input"
            />
            {errors.city && <p id="artist-city-error" role="alert" className="mt-1 text-sm text-red-400">{errors.city.message}</p>}
          </div>
          <div>
            <label htmlFor="artist-artistType" className="mb-1 block text-sm text-slate-300">Tip izvođača</label>
            <select {...register('artistType')} id="artist-artistType" className="input">
              <option value="SOLO">Solo</option>
              <option value="BAND">Bend</option>
              <option value="DJ">DJ</option>
            </select>
          </div>
          <div>
            <label htmlFor="artist-memberCount" className="mb-1 block text-sm text-slate-300">Broj članova</label>
            <input
              {...register('memberCount')}
              id="artist-memberCount"
              type="number"
              aria-invalid={errors.memberCount ? true : undefined}
              aria-describedby={errors.memberCount ? 'artist-memberCount-error' : undefined}
              className="input"
            />
            {errors.memberCount && <p id="artist-memberCount-error" role="alert" className="mt-1 text-sm text-red-400">{errors.memberCount.message}</p>}
          </div>
          <div>
            <label htmlFor="artist-yearsOfExperience" className="mb-1 block text-sm text-slate-300">Godine iskustva</label>
            <input
              {...register('yearsOfExperience')}
              id="artist-yearsOfExperience"
              type="number"
              aria-invalid={errors.yearsOfExperience ? true : undefined}
              aria-describedby={errors.yearsOfExperience ? 'artist-yearsOfExperience-error' : undefined}
              className="input"
            />
            {errors.yearsOfExperience && <p id="artist-yearsOfExperience-error" role="alert" className="mt-1 text-sm text-red-400">{errors.yearsOfExperience.message}</p>}
          </div>
          <div>
            <label htmlFor="artist-minimumFee" className="mb-1 block text-sm text-slate-300">Min honorar (RSD)</label>
            <input
              {...register('minimumFee')}
              id="artist-minimumFee"
              type="number"
              aria-invalid={errors.minimumFee ? true : undefined}
              aria-describedby={errors.minimumFee ? 'artist-minimumFee-error' : undefined}
              className="input"
            />
            {errors.minimumFee && <p id="artist-minimumFee-error" role="alert" className="mt-1 text-sm text-red-400">{errors.minimumFee.message}</p>}
          </div>
          <div>
            <label htmlFor="artist-maximumFee" className="mb-1 block text-sm text-slate-300">Max honorar (RSD)</label>
            <input
              {...register('maximumFee')}
              id="artist-maximumFee"
              type="number"
              aria-invalid={errors.maximumFee ? true : undefined}
              aria-describedby={errors.maximumFee ? 'artist-maximumFee-error' : undefined}
              className="input"
            />
            {errors.maximumFee && <p id="artist-maximumFee-error" role="alert" className="mt-1 text-sm text-red-400">{errors.maximumFee.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="artist-spotifyUrl" className="mb-1 block text-sm text-slate-300">Spotify URL</label>
            <input
              {...register('spotifyUrl')}
              id="artist-spotifyUrl"
              aria-invalid={errors.spotifyUrl ? true : undefined}
              aria-describedby={errors.spotifyUrl ? 'artist-spotifyUrl-error' : undefined}
              className="input"
            />
            {errors.spotifyUrl && <p id="artist-spotifyUrl-error" role="alert" className="mt-1 text-sm text-red-400">{errors.spotifyUrl.message}</p>}
          </div>
          <div>
            <label htmlFor="artist-youtubeUrl" className="mb-1 block text-sm text-slate-300">YouTube URL</label>
            <input
              {...register('youtubeUrl')}
              id="artist-youtubeUrl"
              aria-invalid={errors.youtubeUrl ? true : undefined}
              aria-describedby={errors.youtubeUrl ? 'artist-youtubeUrl-error' : undefined}
              className="input"
            />
            {errors.youtubeUrl && <p id="artist-youtubeUrl-error" role="alert" className="mt-1 text-sm text-red-400">{errors.youtubeUrl.message}</p>}
          </div>
          <div>
            <label htmlFor="artist-instagramUrl" className="mb-1 block text-sm text-slate-300">Instagram URL</label>
            <input
              {...register('instagramUrl')}
              id="artist-instagramUrl"
              aria-invalid={errors.instagramUrl ? true : undefined}
              aria-describedby={errors.instagramUrl ? 'artist-instagramUrl-error' : undefined}
              className="input"
            />
            {errors.instagramUrl && <p id="artist-instagramUrl-error" role="alert" className="mt-1 text-sm text-red-400">{errors.instagramUrl.message}</p>}
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm text-slate-300">Žanrovi</legend>
          <div className="flex flex-wrap gap-2">
            {genres?.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.id)}
                aria-pressed={selectedGenres.includes(g.id)}
                className={`rounded px-3 py-1 text-sm ${selectedGenres.includes(g.id) ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-300'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
          {isSubmitting || mutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
        </button>
      </form>
    </div>
  );
}
