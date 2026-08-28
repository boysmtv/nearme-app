import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../lib/api';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  mfaCode: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [requiresMfa, setRequiresMfa] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const loginMut = useMutation({
    mutationFn: (d: FormData) => adminApi.auth.login(d.email, d.password, d.mfaCode),
    onSuccess: (res) => {
      if (res.data.requiresMfa && !requiresMfa) { setRequiresMfa(true); return; }
      localStorage.setItem('auth_token', res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('auth_refresh', res.data.refreshToken);
      }
      navigate('/dashboard');
    },
    onError: () => setError(requiresMfa ? 'Kode MFA salah' : 'Email atau password salah'),
  });

  const onSubmit = (d: FormData) => { setError(null); loginMut.mutate(d); };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#8B8CFF] via-[#a5a6ff] to-[#ffb5c2] px-4 py-10">
      {/* soft blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-soft-pink/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-primary-900/10">
            <span className="text-xl font-bold bg-gradient-to-br from-primary-600 to-violet-600 bg-clip-text text-transparent">D</span>
          </div>
          <Link to="/" className="mt-3 inline-block text-3xl font-bold tracking-tight text-white drop-shadow-sm">DEKAT</Link>
          <h1 className="mt-2 text-2xl font-bold text-white drop-shadow">Admin Portal</h1>
          <p className="mt-1 text-sm font-medium text-white/80">Masuk untuk mengelola platform</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur ring-1 ring-white/20">
          {error && <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200"><svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg></span>
              <input {...register('email')} type="email" placeholder="admin@dekat.id" className="block w-full rounded-xl border border-gray-200 bg-soft-violet/30 pl-10 pr-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all" />
            </div>
            {errors.email && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
              <input {...register('password')} type="password" placeholder="••••••••" className="block w-full rounded-xl border border-gray-200 bg-soft-violet/30 pl-10 pr-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all" />
            </div>
            {errors.password && <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password.message}</p>}
          </div>
          {requiresMfa && (
            <div className="rounded-xl bg-soft-violet p-4 ring-1 ring-primary-100">
              <label className="block text-sm font-semibold text-gray-700">Kode MFA</label>
              <input {...register('mfaCode')} type="text" maxLength={6} className="mt-1.5 block w-full rounded-xl border border-primary-200 bg-white px-4 py-3 text-center text-sm tracking-[0.5em] font-bold focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100" placeholder="000000" />
            </div>
          )}
          <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-200 hover:from-primary-600 hover:to-violet-600 disabled:opacity-50 transition-all hover:shadow-xl">
            {isSubmitting ? 'Masuk...' : requiresMfa ? 'Verifikasi MFA' : 'Masuk ke Dashboard →'}
          </button>
          <p className="text-center text-xs text-gray-400">Dilindungi dengan enkripsi • DEKAT Platform</p>
        </form>
      </div>
    </div>
  );
}
