import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../lib/api';
import PageHeader from '../components/PageHeader';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Trenutna lozinka je obavezna'),
    newPassword: z
      .string()
      .min(8)
      .max(128)
      .regex(/[A-Z]/, 'Lozinka mora sadržati bar jedno veliko slovo')
      .regex(/[a-z]/, 'Lozinka mora sadržati bar jedno malo slovo')
      .regex(/[0-9]/, 'Lozinka mora sadržati bar jednu cifru'),
    confirmPassword: z.string().min(1, 'Potvrda lozinke je obavezna'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Lozinke se ne poklapaju',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function SettingsPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      api.patch('/auth/change-password', payload),
    onSuccess: () => {
      toast.success('Lozinka je promenjena');
      reset();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const onSubmit = (form: FormData) => {
    mutation.mutate({ currentPassword: form.currentPassword, newPassword: form.newPassword });
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Podešavanja" />
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
        <h2 className="font-display text-lg font-semibold text-white">Promeni lozinku</h2>

        <div>
          <input
            {...register('currentPassword')}
            type="password"
            placeholder="Trenutna lozinka"
            className="input"
          />
          {errors.currentPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.currentPassword.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('newPassword')}
            type="password"
            placeholder="Nova lozinka"
            className="input"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <input
            {...register('confirmPassword')}
            type="password"
            placeholder="Potvrdi novu lozinku"
            className="input"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
          {isSubmitting || mutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
        </button>
      </form>
    </div>
  );
}
