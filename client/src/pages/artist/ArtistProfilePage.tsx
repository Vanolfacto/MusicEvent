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
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
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
          <input {...register('stageName')} placeholder="Umetničko ime" className="input" />
          {errors.stageName && <p className="mt-1 text-sm text-red-400">{errors.stageName.message}</p>}
        </div>
        <textarea {...register('biography')} placeholder="Biografija" className="input min-h-24" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <input {...register('city')} placeholder="Grad" className="input" />
            {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>}
          </div>
          <select {...register('artistType')} className="input">
            <option value="SOLO">Solo</option>
            <option value="BAND">Bend</option>
            <option value="DJ">DJ</option>
          </select>
          <div>
            <input {...register('memberCount')} type="number" placeholder="Broj članova" className="input" />
            {errors.memberCount && <p className="mt-1 text-sm text-red-400">{errors.memberCount.message}</p>}
          </div>
          <div>
            <input {...register('yearsOfExperience')} type="number" placeholder="Godine iskustva" className="input" />
            {errors.yearsOfExperience && <p className="mt-1 text-sm text-red-400">{errors.yearsOfExperience.message}</p>}
          </div>
          <div>
            <input {...register('minimumFee')} type="number" placeholder="Min honorar" className="input" />
            {errors.minimumFee && <p className="mt-1 text-sm text-red-400">{errors.minimumFee.message}</p>}
          </div>
          <div>
            <input {...register('maximumFee')} type="number" placeholder="Max honorar" className="input" />
            {errors.maximumFee && <p className="mt-1 text-sm text-red-400">{errors.maximumFee.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <input {...register('spotifyUrl')} placeholder="Spotify URL" className="input" />
            {errors.spotifyUrl && <p className="mt-1 text-sm text-red-400">{errors.spotifyUrl.message}</p>}
          </div>
          <div>
            <input {...register('youtubeUrl')} placeholder="YouTube URL" className="input" />
            {errors.youtubeUrl && <p className="mt-1 text-sm text-red-400">{errors.youtubeUrl.message}</p>}
          </div>
          <div>
            <input {...register('instagramUrl')} placeholder="Instagram URL" className="input" />
            {errors.instagramUrl && <p className="mt-1 text-sm text-red-400">{errors.instagramUrl.message}</p>}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-slate-300">Žanrovi</p>
          <div className="flex flex-wrap gap-2">
            {genres?.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleGenre(g.id)}
                className={`rounded px-3 py-1 text-sm ${selectedGenres.includes(g.id) ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-300'}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
          {isSubmitting || mutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
        </button>
      </form>
    </div>
  );
}
