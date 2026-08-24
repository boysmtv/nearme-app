import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { publicApi } from '../lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama harus minimal 2 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Nomor telepon tidak valid').optional().or(z.literal('')),
  password: z.string().min(8, 'Password harus minimal 8 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      publicApi.auth.register(data.name, data.email, data.phone || undefined, data.password),
    onSuccess: (res) => {
      localStorage.setItem('auth_token', res.data.accessToken);
      localStorage.setItem('auth_refresh', res.data.refreshToken);
      navigate('/');
    },
    onError: () => {
      setError('Gagal mendaftar. Email mungkin sudah terdaftar.');
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-primary-600">DEKAT</Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Daftar</h1>
          <p className="mt-2 text-gray-500">Buat akun DEKAT baru</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              {...register('name')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Nama Anda"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="email@contoh.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Nomor Telepon (opsional)</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              {...register('phone')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="+6281234567890"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Minimal 8 karakter"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Konfirmasi Password</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Ulangi password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Mendaftar...' : 'Daftar'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
              Masuk
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
