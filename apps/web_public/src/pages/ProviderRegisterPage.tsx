import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { providerApi } from '../lib/api';
import { useAuth } from '../lib/auth';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  slug: z.string().min(2, 'Slug minimal 2 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').optional().or(z.literal('')),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
});

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setPhone('');
      setEmail(user.email ?? '');
    }
  }, [user]);

  const autoSlug = (v: string) =>
    v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    setFieldErrors({});

    const result = schema.safeParse({ name, slug, phone, email });
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      });
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      await providerApi.tenant.create({
        name: result.data.name,
        slug: result.data.slug,
        phone: result.data.phone || undefined,
        email: result.data.email || undefined,
      });
      setMsg('Registrasi berhasil! Menunggu verifikasi admin.');
      setTimeout(() => navigate('/provider/dashboard'), 2000);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal mendaftar';
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 text-center space-y-4">
              <h1 className="text-2xl font-bold text-gray-900">Daftar sebagai Provider</h1>
              <p className="text-sm text-gray-500">Anda perlu login terlebih dahulu untuk mendaftar sebagai provider.</p>
              <Link
                to="/login"
                className="inline-block rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700"
              >
                Login / Daftar
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Daftar sebagai Provider</h1>
            <p className="mt-2 text-sm text-gray-500">
              Buka toko Anda di DEKAT — kelola layanan, staf, dan booking dalam satu dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 space-y-4">
            {msg && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
            {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Bisnis *</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setSlug(autoSlug(e.target.value));
                }}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="Barbershop Central"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Slug *</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="barbershop-central"
              />
              <p className="mt-1 text-xs text-gray-400">URL: /provider/{slug || '...'}</p>
              {fieldErrors.slug && <p className="mt-1 text-xs text-red-500">{fieldErrors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telepon</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="08123456789"
              />
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                placeholder="info@barbershop.com"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Mengirim...' : 'Daftar Provider'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Hubungi admin@dekat.id untuk aktivasi akun provider Anda.
            </p>
            <div className="text-center">
              <Link to="/about" className="text-sm text-primary-600 hover:underline">
                Pelajari tentang DEKAT
              </Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
