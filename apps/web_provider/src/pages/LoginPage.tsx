import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { providerApi } from '../lib/api';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password harus minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormData) => providerApi.auth.login(data.email, data.password),
    onSuccess: (res) => {
      localStorage.setItem('auth_token', res.data.accessToken);
      localStorage.setItem('auth_refresh', res.data.refreshToken);
      try {
        const token = res.data.accessToken as string;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roles = (payload.roles ?? []) as string[];
        const role = roles[0] ?? '';
        if (role === 'ROLE_CUSTOMER') {
          window.location.href = 'http://localhost:4100';
          return;
        }
        if (role === 'ROLE_PLATFORM_ADMIN') {
          window.location.href = 'http://localhost:3002';
          return;
        }
      } catch {}
      navigate('/dashboard');
    },
    onError: () => {
      setError('Email atau password salah');
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8B8CFF] via-[#a5a6ff] to-[#ffb5c2] px-4 py-10">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-soft-pink/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl">
            <svg className="h-7 w-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M12 7v10m-4-4h8" /></svg>
          </div>
          <Link to="/" className="mt-3 inline-block text-3xl font-bold tracking-tight text-white drop-shadow-sm">DEKAT</Link>
          <h1 className="mt-2 text-2xl font-bold text-white drop-shadow">Portal Provider</h1>
          <p className="mt-1 text-sm font-medium text-white/80">Masuk untuk mengelola bisnis Anda</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur ring-1 ring-white/20">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg></span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block w-full rounded-xl border border-gray-200 bg-soft-violet/30 pl-10 pr-4 py-3 text-sm font-medium transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                placeholder="email@bisnis.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="block w-full rounded-xl border border-gray-200 bg-soft-violet/30 pl-10 pr-4 py-3 text-sm font-medium transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100"
                placeholder="Masukkan password"
              />
            </div>
            {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
              <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              Ingat saya
            </label>
            <a href="#" className="text-sm font-bold text-primary-600 hover:text-primary-700">Lupa password?</a>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-200 hover:from-primary-600 hover:to-violet-600 disabled:opacity-50 transition-all hover:shadow-xl"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Masuk...
              </span>
            ) : (
              'Masuk ke Dashboard →'
            )}
          </button>

          <p className="text-center text-sm font-medium text-gray-500">Belum punya akun provider? <a href="#" className="font-bold text-primary-600 hover:text-primary-700">Daftar sekarang</a></p>
        </form>
      </div>
    </div>
  );
}
