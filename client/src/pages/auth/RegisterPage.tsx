import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/api';

const schema = z
  .object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
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
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Ime</label>
              <input {...register('firstName')} className="input" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Prezime</label>
              <input {...register('lastName')} className="input" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input {...register('email')} type="email" className="input" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Lozinka</label>
            <input {...register('password')} type="password" className="input" />
            <p className="mt-1 text-xs text-slate-500">
              Najmanje 8 karaktera, jedno veliko slovo, jedno malo slovo i jedna cifra.
            </p>
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Uloga</label>
            <select {...register('role')} className="input">
              <option value="ORGANIZER">Organizator</option>
              <option value="ARTIST">Izvođač</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Grad</label>
            <input {...register('city')} className="input" />
          </div>
          {role === 'ORGANIZER' && (
            <div>
              <label className="mb-1 block text-sm text-slate-300">Naziv organizacije</label>
              <input {...register('organizationName')} className="input" />
            </div>
          )}
          {role === 'ARTIST' && (
            <>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Umetničko ime</label>
                <input {...register('stageName')} className="input" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Tip izvođača</label>
                <select {...register('artistType')} className="input">
                  <option value="SOLO">Solo</option>
                  <option value="BAND">Bend</option>
                  <option value="DJ">DJ</option>
                </select>
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
