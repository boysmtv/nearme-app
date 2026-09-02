import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { providerApi } from '../lib/api';

export default function ProviderRegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      // Use provider tenant creation - requires auth, backend expects JWT with provider role
      await providerApi.settings.get(); // probe auth
      setMsg('Provider registration via API requires login as provider. Silakan login lalu hubungi admin untuk aktivasi tenant.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gagal, perlu login sebagai provider');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Daftar sebagai Provider</h1>
            <p className="mt-2 text-sm text-gray-500">Buka toko Anda di DEKAT — kelola layanan, staf, dan booking dalam satu dashboard.</p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 space-y-4">
            {msg && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{msg}</div>}
            {err && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{err}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Bisnis</label>
              <input value={name} onChange={(e)=> { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')); }} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" placeholder="Barbershop Central" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input value={slug} onChange={(e)=> setSlug(e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" placeholder="barbershop-central" />
              <p className="mt-1 text-xs text-gray-400">Akan menjadi /provider/{slug}</p>
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{loading ? 'Mengirim...' : 'Daftar Provider'}</button>
            <p className="text-center text-xs text-gray-400">Hubungi admin@dekat.id untuk aktivasi akun provider Anda.</p>
            <div className="text-center">
              <Link to="/about" className="text-sm text-primary-600 hover:underline">Pelajari tentang DEKAT</Link>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
