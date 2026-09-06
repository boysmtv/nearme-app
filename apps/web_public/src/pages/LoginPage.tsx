import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../lib/auth';
import { publicApi } from '../lib/api';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password harus minimal 6 karakter'),
});

const otpSchema = z.object({
  email: z.string().email('Email tidak valid'),
  code: z.string().length(6, 'Kode OTP harus 6 digit'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword, isSubmitting: isSubmittingPassword },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: errorsOtp, isSubmitting: isSubmittingOtp },
    setValue: setOtpValue,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmitPassword = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
    } catch {
      setError('Email atau password salah');
    }
  };

  const handleRequestOtp = async (email: string) => {
    setError(null);
    try {
      await publicApi.auth.requestOtp(email, 'LOGIN');
      setOtpEmail(email);
      setOtpSent(true);
      setOtpValue('email', email);
    } catch {
      setError('Gagal mengirim kode OTP');
    }
  };

  const onSubmitOtp = async (data: OtpFormData) => {
    setError(null);
    try {
      const res = await publicApi.auth.verifyOtp(data.email, data.code, 'LOGIN');
      const token = res.data?.accessToken;
      if (token) {
        localStorage.setItem('auth_token', token);
        if (res.data?.refreshToken) localStorage.setItem('auth_refresh', res.data.refreshToken);
        setOtpSuccess(true);
        setTimeout(() => navigate('/'), 1000);
      }
    } catch {
      setError('Kode OTP salah atau sudah kedaluwarsa');
    }
  };

  if (otpSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Login Berhasil!</h1>
          <p className="mt-2 text-gray-500">Mengalihkan ke beranda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-primary-600">DEKAT</Link>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Masuk</h1>
          <p className="mt-2 text-gray-500">Masuk ke akun DEKAT Anda</p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
          {/* Mode Toggle */}
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => { setMode('password'); setError(null); }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                mode === 'password' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => { setMode('otp'); setError(null); }}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                mode === 'otp' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Kode OTP
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Password Login */}
          {mode === 'password' && (
            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...registerPassword('email')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="email@contoh.com"
                />
                {errorsPassword.email && <p className="mt-1 text-sm text-red-600">{errorsPassword.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...registerPassword('password')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Masukkan password"
                />
                {errorsPassword.password && <p className="mt-1 text-sm text-red-600">{errorsPassword.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmittingPassword}
                className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
              >
                {isSubmittingPassword ? 'Masuk...' : 'Masuk'}
              </button>
            </form>
          )}

          {/* OTP Login */}
          {mode === 'otp' && (
            <div className="space-y-5">
              {!otpSent ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="email@contoh.com"
                  />
                  <button
                    onClick={() => handleRequestOtp(otpEmail)}
                    disabled={!otpEmail || isSubmittingOtp}
                    className="mt-3 w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    Kirim Kode OTP
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitOtp(onSubmitOtp)} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Kode OTP dikirim ke <span className="font-medium text-gray-900">{otpEmail}</span>
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode OTP (6 digit)</label>
                    <input
                      type="text"
                      maxLength={6}
                      {...registerOtp('code')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setOtpValue('code', val);
                        setOtpValue('email', otpEmail);
                      }}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="000000"
                    />
                    {errorsOtp.code && <p className="mt-1 text-sm text-red-600">{errorsOtp.code.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingOtp}
                    className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isSubmittingOtp ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpEmail(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Ganti email atau kirim ulang
                  </button>
                </form>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Belum punya akun?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
