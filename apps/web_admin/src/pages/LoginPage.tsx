import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../lib/auth';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  mfaCode: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const { login: authLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [requiresMfa, setRequiresMfa] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const loginMut = useMutation({
    mutationFn: async (d: FormData) => {
      const result = await authLogin(d.email, d.password, d.mfaCode);
      if (!result) setRequiresMfa(true);
      return result;
    },
    onError: () => setError(requiresMfa ? 'Kode MFA salah' : 'Email atau password salah'),
  });

  const onSubmit = (d: FormData) => { setError(null); loginMut.mutate(d); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-white">DEKAT</Link>
          <h1 className="mt-6 text-2xl font-bold text-white">Admin Portal</h1>
          <p className="mt-2 text-gray-400">Masuk untuk mengelola platform</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-2xl bg-white p-8 shadow-xl">
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input {...register('email')} type="email" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input {...register('password')} type="password" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>
          {requiresMfa && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Kode MFA</label>
              <input {...register('mfaCode')} type="text" maxLength={6} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-center tracking-[0.5em] focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="000000" />
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
            {isSubmitting ? 'Masuk...' : requiresMfa ? 'Verifikasi MFA' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
