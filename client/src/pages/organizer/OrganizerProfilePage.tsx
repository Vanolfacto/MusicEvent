import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../lib/api';
import type { ApiResponse, OrganizerProfile } from '../../types';
import PageHeader from '../../components/PageHeader';
import LoadingSpinner from '../../components/LoadingSpinner';

const schema = z.object({
  organizationName: z.string().trim().min(2, 'Minimum 2 karaktera').max(100),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Minimum 2 karaktera').max(100),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function OrganizerProfilePage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['organizer', 'profile'],
    queryFn: async () => (await api.get<ApiResponse<OrganizerProfile>>('/organizers/me')).data.data,
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data
      ? {
          organizationName: data.organizationName,
          description: data.description || '',
          city: data.city,
          phone: data.phone || '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => api.put('/organizers/me', payload),
    onSuccess: () => {
      toast.success('Profil ažuriran');
      queryClient.invalidateQueries({ queryKey: ['organizer', 'profile'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onSubmit = (form: FormData) => {
    mutation.mutate({
      ...form,
      description: form.description || null,
      phone: form.phone || null,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-xl">
      <PageHeader title="Moj profil" />
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
        <div>
          <label htmlFor="org-name" className="mb-1 block text-sm text-slate-300">Naziv organizacije</label>
          <input
            {...register('organizationName')}
            id="org-name"
            aria-invalid={errors.organizationName ? true : undefined}
            aria-describedby={errors.organizationName ? 'org-name-error' : undefined}
            className="input"
          />
          {errors.organizationName && (
            <p id="org-name-error" role="alert" className="mt-1 text-sm text-red-400">{errors.organizationName.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="org-description" className="mb-1 block text-sm text-slate-300">Opis</label>
          <textarea {...register('description')} id="org-description" className="input min-h-24" />
        </div>
        <div>
          <label htmlFor="org-city" className="mb-1 block text-sm text-slate-300">Grad</label>
          <input
            {...register('city')}
            id="org-city"
            aria-invalid={errors.city ? true : undefined}
            aria-describedby={errors.city ? 'org-city-error' : undefined}
            className="input"
          />
          {errors.city && <p id="org-city-error" role="alert" className="mt-1 text-sm text-red-400">{errors.city.message}</p>}
        </div>
        <div>
          <label htmlFor="org-phone" className="mb-1 block text-sm text-slate-300">Telefon</label>
          <input {...register('phone')} id="org-phone" autoComplete="tel" className="input" />
        </div>

        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
          {isSubmitting || mutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
        </button>
      </form>
    </div>
  );
}
