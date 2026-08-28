import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Tentang DEKAT</h1>
          <p className="mt-4 text-gray-600 leading-relaxed">
            DEKAT adalah platform booking layanan lokal (barbershop, salon, kecantikan) dengan model provider-first hybrid (SaaS + marketplace).
            Kami membantu pelanggan menemukan layanan terdekat dengan harga transparan dan jadwal real-time.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Transparan</h3>
              <p className="mt-2 text-sm text-gray-500">Harga jelas, tanpa biaya tersembunyi. Bayar via Midtrans/Xendit.</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Real-time</h3>
              <p className="mt-2 text-sm text-gray-500">Slot tersedia live, anti-double-booking dengan exclusion constraint.</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Provider-First</h3>
              <p className="mt-2 text-sm text-gray-500">Dashboard lengkap untuk layanan, staf, kalender, laporan & blocked dates.</p>
            </div>
          </div>
          <div className="mt-10 flex gap-3">
            <Link to="/search" className="rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700">Jelajahi Layanan</Link>
            <Link to="/provider/register" className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-white">Daftar sebagai Provider</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
