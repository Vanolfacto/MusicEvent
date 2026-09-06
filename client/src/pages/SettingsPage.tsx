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
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4" noValidate>
        <h2 className="font-display text-lg font-semibold text-white">Promeni lozinku</h2>

        <div>
          <label htmlFor="settings-currentPassword" className="mb-1 block text-sm text-slate-300">
            Trenutna lozinka
          </label>
          <input
            {...register('currentPassword')}
            id="settings-currentPassword"
            type="password"
            autoComplete="current-password"
            aria-invalid={errors.currentPassword ? true : undefined}
            aria-describedby={errors.currentPassword ? 'settings-currentPassword-error' : undefined}
            className="input"
          />
          {errors.currentPassword && (
            <p id="settings-currentPassword-error" role="alert" className="mt-1 text-sm text-red-400">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="settings-newPassword" className="mb-1 block text-sm text-slate-300">
            Nova lozinka
          </label>
          <input
            {...register('newPassword')}
            id="settings-newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.newPassword ? true : undefined}
            aria-describedby={errors.newPassword ? 'settings-newPassword-error' : undefined}
            className="input"
          />
          {errors.newPassword && (
            <p id="settings-newPassword-error" role="alert" className="mt-1 text-sm text-red-400">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="settings-confirmPassword" className="mb-1 block text-sm text-slate-300">
            Potvrdi novu lozinku
          </label>
          <input
            {...register('confirmPassword')}
            id="settings-confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={errors.confirmPassword ? 'settings-confirmPassword-error' : undefined}
            className="input"
          />
          {errors.confirmPassword && (
            <p id="settings-confirmPassword-error" role="alert" className="mt-1 text-sm text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
          {isSubmitting || mutation.isPending ? 'Čuvanje...' : 'Sačuvaj'}
        </button>
      </form>
    </div>
  );
}
