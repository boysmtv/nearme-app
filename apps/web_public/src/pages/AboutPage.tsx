import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { publicApi } from '../lib/api';

export default function AboutPage() {
  const { data: faqRes } = useQuery({
    queryKey: ['faqs-about'],
    queryFn: () => publicApi.faqs.listPublic().then((r) => r.data),
  });
  const { data: policyRes } = useQuery({
    queryKey: ['policies-about'],
    queryFn: () => publicApi.policies.listPublic().then((r) => r.data),
  });
  const faqs = (faqRes as unknown as { data?: { id: string; question: string; answer: string; category?: string }[] })?.data ?? (faqRes as unknown as { id: string; question: string; answer: string; category?: string }[] | undefined) ?? [];
  const policies = (policyRes as unknown as { data?: { id: string; title: string; body: string; type: string }[] })?.data ?? (policyRes as unknown as { id: string; title: string; body: string; type: string }[] | undefined) ?? [];
  const [openFaq, setOpenFaq] = useState<string | null>(null);

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

          {/* FAQ Section Bundle B */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
            <p className="mt-1 text-sm text-gray-500">GET /public/faqs - Pertanyaan umum tentang booking, deposit, reschedule & kalender</p>
            <div className="mt-6 space-y-3">
              {Array.isArray(faqs) && faqs.length > 0 ? faqs.map((f) => (
                <div key={f.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                  <button onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)} className="flex w-full items-center justify-between text-left">
                    <span className="font-medium text-gray-900">{f.question}</span>
                    <span className="ml-4 text-gray-400">{openFaq === f.id ? '−' : '+'}</span>
                  </button>
                  {openFaq === f.id && <p className="mt-3 text-sm text-gray-600">{f.answer}</p>}
                  {f.category && <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{f.category}</span>}
                </div>
              )) : <p className="text-sm text-gray-500">Belum ada FAQ.</p>}
            </div>
          </div>

          {/* Policies Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Kebijakan</h2>
            <p className="mt-1 text-sm text-gray-500">GET /public/policies - Deposit & pembatalan, privasi, S&K</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.isArray(policies) && policies.length > 0 ? policies.map((p) => (
                <div key={p.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                  <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">{p.type}</span>
                  <h3 className="mt-3 font-semibold text-gray-900">{p.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-4">{p.body}</p>
                </div>
              )) : <p className="text-sm text-gray-500">Belum ada kebijakan.</p>}
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
