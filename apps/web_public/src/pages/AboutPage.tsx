import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#e8e8ff] via-[#f0e8ff] to-[#ffe8ec]" />
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#8B8CFF]/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-[#FF8E9E]/10 blur-3xl" />
          <div className="relative mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 text-center">
            <span className="inline-flex rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#8B8CFF] shadow-sm ring-1 ring-[#E8E8FF]">✦ Tentang DEKAT</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Dekat di hati, <span className="bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] bg-clip-text text-transparent">dekat di jarak</span>
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-gray-600">
              DEKAT adalah platform booking layanan lokal (barbershop, salon, kecantikan) dengan model provider-first hybrid (SaaS + marketplace).
              Kami membantu pelanggan menemukan layanan terdekat dengan harga transparan dan jadwal real-time — semua dengan sentuhan warna lembut.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <span className="rounded-full bg-[#e8e8ff] px-3 py-1 text-xs font-bold text-[#6a6acc]">🎨 Soft UI</span>
              <span className="rounded-full bg-[#e6f7ee] px-3 py-1 text-xs font-bold text-emerald-700">⚡ Real-time</span>
              <span className="rounded-full bg-[#fff4d6] px-3 py-1 text-xs font-bold text-amber-700">🔒 Aman</span>
              <span className="rounded-full bg-[#ffe8ec] px-3 py-1 text-xs font-bold text-rose-600">💖 Lokal</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF] hover:shadow-md hover:-translate-y-1 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8e8ff] to-[#e8f2ff] text-[#8B8CFF]">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </div>
              <h3 className="mt-3 font-black text-gray-900">Transparan</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">Harga jelas, tanpa biaya tersembunyi. Bayar via Midtrans/Xendit dengan UI yang ramah.</p>
              <span className="mt-3 inline-flex rounded-full bg-[#e8e8ff] px-2.5 py-1 text-xs font-bold text-[#6a6acc]">✦ No hidden fee</span>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF] hover:shadow-md hover:-translate-y-1 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#e6f7ee] to-[#e8f2ff] text-emerald-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="mt-3 font-black text-gray-900">Real-time</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">Slot tersedia live, anti-double-booking dengan exclusion constraint yang canggih.</p>
              <span className="mt-3 inline-flex rounded-full bg-[#e6f7ee] px-2.5 py-1 text-xs font-bold text-emerald-700">⚡ Live update</span>
            </div>
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#E8E8FF] hover:shadow-md hover:-translate-y-1 transition">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffe8ec] to-[#fff4d6] text-rose-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <h3 className="mt-3 font-black text-gray-900">Provider-First</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">Dashboard lengkap untuk layanan, staf, kalender, laporan & blocked dates — warna-warni!</p>
              <span className="mt-3 inline-flex rounded-full bg-[#ffe8ec] px-2.5 py-1 text-xs font-bold text-rose-600">💼 SaaS + Marketplace</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] p-[1.5px] shadow-lg">
            <div className="rounded-[15px] bg-white p-6">
              <h3 className="font-black text-gray-900 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FAF9FF] text-[#8B8CFF] ring-1 ring-[#E8E8FF]">✦</span> Misi Kami</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">Membuat setiap booking terasa menyenangkan — dengan palette lembut #FAF9FF, aksen violet #8B8CFF, dan interaksi yang halus. Dari barbershop ke salon, semua jadi lebih dekat dan berwarna.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['#e8e8ff',' #ffe8ec',' #e6f7ee',' #fff4d6',' #e8f2ff',' #f0e8ff'].map(c => <span key={c} className="h-8 w-8 rounded-full ring-2 ring-white shadow" style={{background:c.trim()}} />)}
                <span className="inline-flex items-center rounded-full bg-[#FAF9FF] px-3 py-1 text-xs font-bold text-gray-600 ring-1 ring-[#E8E8FF]">Soft palette</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link to="/search" className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-7 py-3 text-sm font-black text-white shadow-md hover:shadow-lg">✦ Jelajahi Layanan</Link>
            <Link to="/provider/register" className="inline-flex items-center justify-center rounded-full border border-[#E8E8FF] bg-white px-7 py-3 text-sm font-bold text-[#6a6acc] hover:bg-[#FAF9FF]">Daftar sebagai Provider →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
