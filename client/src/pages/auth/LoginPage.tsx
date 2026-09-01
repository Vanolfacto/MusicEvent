import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../lib/api';

const schema = z.object({
  email: z.string().email('Unesite ispravan email'),
  password: z.string().min(1, 'Lozinka je obavezna'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Uspešna prijava');
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-bold text-white">Prijava</h1>
        <p className="mt-2 text-sm text-slate-400">Pristupite platformi za muzičke događaje</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Email</label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
              placeholder="admin@demo.local"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Lozinka</label>
            <input
              {...register('password')}
              type="password"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? 'Prijava...' : 'Prijavi se'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          Nemate nalog?{' '}
          <Link to="/register" className="text-primary-400 hover:underline">
            Registrujte se
          </Link>
        </p>
      </div>
    </div>
  );
}
