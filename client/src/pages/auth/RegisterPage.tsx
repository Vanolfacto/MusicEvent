import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/api';

const schema = z
  .object({
    firstName: z.string().min(2, 'Minimum 2 karaktera'),
    lastName: z.string().min(2, 'Minimum 2 karaktera'),
    email: z.string().email('Unesite ispravan email'),
    password: z
      .string()
      .min(8, 'Minimum 8 karaktera')
      .regex(/[A-Z]/, 'Mora sadržati veliko slovo')
      .regex(/[a-z]/, 'Mora sadržati malo slovo')
      .regex(/[0-9]/, 'Mora sadržati cifru'),
    role: z.enum(['ORGANIZER', 'ARTIST']),
    organizationName: z.string().optional(),
    stageName: z.string().optional(),
    city: z.string().optional(),
    artistType: z.enum(['SOLO', 'BAND', 'DJ']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'ORGANIZER' && !data.organizationName) {
      ctx.addIssue({ code: 'custom', message: 'Obavezno', path: ['organizationName'] });
    }
    if (data.role === 'ARTIST' && !data.stageName) {
      ctx.addIssue({ code: 'custom', message: 'Obavezno', path: ['stageName'] });
    }
    if (!data.city) {
      ctx.addIssue({ code: 'custom', message: 'Grad je obavezan', path: ['city'] });
    }
    if (data.role === 'ARTIST' && !data.artistType) {
      ctx.addIssue({ code: 'custom', message: 'Obavezno', path: ['artistType'] });
    }
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'ORGANIZER' },
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    const payload: Record<string, unknown> = { ...data };
    if (data.role === 'ARTIST') {
      delete payload.organizationName;
    } else {
      delete payload.stageName;
      delete payload.artistType;
    }

    try {
      await registerUser(payload);
      toast.success('Nalog kreiran');
      navigate(data.role === 'ORGANIZER' ? '/organizer' : '/artist');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card">
        <h1 className="font-display text-2xl font-bold text-white">Registracija</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="reg-firstName" className="mb-1 block text-sm text-slate-300">Ime</label>
              <input
                {...register('firstName')}
                id="reg-firstName"
                autoComplete="given-name"
                aria-invalid={errors.firstName ? true : undefined}
                aria-describedby={errors.firstName ? 'reg-firstName-error' : undefined}
                className="input"
              />
              {errors.firstName && (
                <p id="reg-firstName-error" role="alert" className="mt-1 text-sm text-red-400">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="reg-lastName" className="mb-1 block text-sm text-slate-300">Prezime</label>
              <input
                {...register('lastName')}
                id="reg-lastName"
                autoComplete="family-name"
                aria-invalid={errors.lastName ? true : undefined}
                aria-describedby={errors.lastName ? 'reg-lastName-error' : undefined}
                className="input"
              />
              {errors.lastName && (
                <p id="reg-lastName-error" role="alert" className="mt-1 text-sm text-red-400">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="reg-email" className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              {...register('email')}
              id="reg-email"
              type="email"
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? 'reg-email-error' : undefined}
              className="input"
            />
            {errors.email && (
              <p id="reg-email-error" role="alert" className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="reg-password" className="mb-1 block text-sm text-slate-300">Lozinka</label>
            <input
              {...register('password')}
              id="reg-password"
              type="password"
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
              aria-describedby="reg-password-hint reg-password-error"
              className="input"
            />
            <p id="reg-password-hint" className="mt-1 text-xs text-slate-400">
              Najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedna cifra.
            </p>
            {errors.password && (
              <p id="reg-password-error" role="alert" className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="reg-role" className="mb-1 block text-sm text-slate-300">Uloga</label>
            <select {...register('role')} id="reg-role" className="input">
              <option value="ORGANIZER">Organizator</option>
              <option value="ARTIST">Izvođač</option>
            </select>
          </div>
          <div>
            <label htmlFor="reg-city" className="mb-1 block text-sm text-slate-300">Grad</label>
            <input
              {...register('city')}
              id="reg-city"
              autoComplete="address-level2"
              aria-invalid={errors.city ? true : undefined}
              aria-describedby={errors.city ? 'reg-city-error' : undefined}
              className="input"
            />
            {errors.city && (
              <p id="reg-city-error" role="alert" className="mt-1 text-sm text-red-400">
                {errors.city.message}
              </p>
            )}
          </div>
          {role === 'ORGANIZER' && (
            <div>
              <label htmlFor="reg-organizationName" className="mb-1 block text-sm text-slate-300">
                Naziv organizacije
              </label>
              <input
                {...register('organizationName')}
                id="reg-organizationName"
                aria-invalid={errors.organizationName ? true : undefined}
                aria-describedby={errors.organizationName ? 'reg-organizationName-error' : undefined}
                className="input"
              />
              {errors.organizationName && (
                <p id="reg-organizationName-error" role="alert" className="mt-1 text-sm text-red-400">
                  {errors.organizationName.message}
                </p>
              )}
            </div>
          )}
          {role === 'ARTIST' && (
            <>
              <div>
                <label htmlFor="reg-stageName" className="mb-1 block text-sm text-slate-300">
                  Umetničko ime
                </label>
                <input
                  {...register('stageName')}
                  id="reg-stageName"
                  aria-invalid={errors.stageName ? true : undefined}
                  aria-describedby={errors.stageName ? 'reg-stageName-error' : undefined}
                  className="input"
                />
                {errors.stageName && (
                  <p id="reg-stageName-error" role="alert" className="mt-1 text-sm text-red-400">
                    {errors.stageName.message}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="reg-artistType" className="mb-1 block text-sm text-slate-300">
                  Tip izvođača
                </label>
                <select {...register('artistType')} id="reg-artistType" className="input">
                  <option value="SOLO">Solo</option>
                  <option value="BAND">Bend</option>
                  <option value="DJ">DJ</option>
                </select>
                {errors.artistType && (
                  <p role="alert" className="mt-1 text-sm text-red-400">{errors.artistType.message}</p>
                )}
              </div>
            </>
          )}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Kreiranje...' : 'Kreiraj nalog'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-400">
          Već imate nalog? <Link to="/login" className="text-primary-400">Prijavite se</Link>
        </p>
      </div>
    </div>
  );
}
