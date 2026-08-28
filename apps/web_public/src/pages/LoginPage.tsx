import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../lib/auth';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password harus minimal 6 karakter'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch {
      setError('Email atau password salah');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF9FF] px-4 py-12 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#e8e8ff] blur-3xl opacity-60" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#ffe8ec] blur-3xl opacity-60" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#e8f2ff]/40 to-[#f0e8ff]/40 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-white font-black shadow-md">D</span>
            <span className="bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] bg-clip-text text-2xl font-black text-transparent">DEKAT</span>
          </Link>
          <h1 className="mt-6 text-3xl font-black text-gray-900">Selamat datang kembali ✦</h1>
          <p className="mt-2 text-gray-500">Masuk ke akun DEKAT Anda yang penuh warna</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="rounded-full bg-[#e8e8ff] px-3 py-1 text-xs font-bold text-[#6a6acc]">🎨 Soft</span>
            <span className="rounded-full bg-[#e6f7ee] px-3 py-1 text-xs font-bold text-emerald-700">🔒 Aman</span>
            <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-bold text-amber-700">⚡ Cepat</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5 rounded-[24px] bg-white p-8 shadow-xl shadow-[#8B8CFF]/10 ring-1 ring-[#E8E8FF]">
          {error && (
            <div className="rounded-xl bg-[#ffe8ec] p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8CFF]"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="block w-full rounded-xl border border-[#E8E8FF] bg-[#FAF9FF] px-4 py-3 pl-10 text-sm transition focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
                placeholder="email@contoh.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-500">Password</label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8CFF]"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="block w-full rounded-xl border border-[#E8E8FF] bg-[#FAF9FF] px-4 py-3 pl-10 text-sm transition focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
                placeholder="Masukkan password"
              />
            </div>
            {errors.password && <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-4 py-3.5 text-sm font-black text-white shadow-md shadow-[#8B8CFF]/20 transition hover:shadow-lg disabled:opacity-50"
          >
            {isSubmitting ? '⏳ Masuk...' : '✦ Masuk Sekarang'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-[#6a6acc] hover:text-[#8B8CFF]">
              Daftar sekarang →
            </Link>
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <span className="h-1.5 w-8 rounded-full bg-[#e8e8ff]" />
            <span className="h-1.5 w-8 rounded-full bg-[#ffe8ec]" />
            <span className="h-1.5 w-8 rounded-full bg-[#e6f7ee]" />
            <span className="h-1.5 w-8 rounded-full bg-[#fff4d6]" />
          </div>
        </form>
      </div>
    </div>
  );
}
