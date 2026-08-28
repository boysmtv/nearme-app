import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProviderCard from '../components/ProviderCard';
import { publicApi } from '../lib/api';

const softCategoryStyles = [
  'bg-[#e8e8ff] text-[#6a6acc] ring-[#d0d0ff]',
  'bg-[#ffe8ec] text-[#cc304a] ring-[#ffb5c2]',
  'bg-[#e6f7ee] text-emerald-700 ring-emerald-200',
  'bg-[#fff4d6] text-amber-700 ring-amber-200',
  'bg-[#e8f2ff] text-[#5a7ab3] ring-[#dbe9ff]',
  'bg-[#f0e8ff] text-[#7a4ec2] ring-[#e0d0ff]',
];

export default function HomePage() {
  const {
    data: categoriesRes,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => publicApi.categories.list(),
    staleTime: 30 * 60 * 1000,
  });

  const { data: featuredRes, isLoading: featuredLoading } = useQuery({
    queryKey: ['providers', 'featured'],
    queryFn: () => publicApi.providers.getFeatured(),
    staleTime: 10 * 60 * 1000,
  });

  const categories = categoriesRes?.data ?? [];
  const featured = featuredRes?.data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B8CFF] via-[#A5A6FF] to-[#FF8E9E]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#ffe8ec]/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:24px_24px] opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#fff4d6] animate-pulse" /> Booking #1 di Indonesia
                </span>
                <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-[52px] leading-[1.05]">
                  Lihat harga.<br />
                  <span className="bg-gradient-to-r from-[#fff4d6] to-white bg-clip-text text-transparent">Pilih jadwal.</span><br />
                  Langsung booking.
                </h1>
                <p className="mt-5 text-lg text-white/85 sm:text-xl leading-relaxed">
                  Temukan layanan kecantikan dan kesehatan terdekat. Booking instan tanpa chat berulang, warna ceria setiap hari.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/search"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6a6acc] shadow-xl shadow-[#6a6acc]/20 transition-all hover:scale-[1.02] hover:shadow-2xl"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    Cari Layanan
                    <span className="rounded-full bg-[#e8e8ff] px-2 py-0.5 text-xs">✦</span>
                  </Link>
                  <Link
                    to="/provider/register"
                    className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur transition-all hover:border-white/50 hover:bg-white/20"
                  >
                    Jadi Provider
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                </div>
                <div className="mt-6 flex items-center gap-4 text-sm text-white/80">
                  <span className="inline-flex items-center gap-1.5"><span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span> Harga transparan</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span> Slot real-time</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span> Bayar mudah</span>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative mx-auto max-w-md">
                  <div className="rounded-[28px] bg-white p-4 shadow-2xl shadow-black/10">
                    <div className="rounded-2xl bg-[#FAF9FF] p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] flex items-center justify-center text-white font-black">✦</div>
                        <div><p className="text-sm font-bold text-gray-900">Barbershop Central</p><p className="text-xs text-gray-500">⭐ 4.9 • 2.1 km • Buka</p></div>
                        <span className="ml-auto rounded-full bg-[#e6f7ee] px-2.5 py-1 text-xs font-bold text-emerald-700">Tersedia</span>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {['09:00','10:30','13:00'].map(t => <span key={t} className="rounded-xl bg-white px-2 py-2 text-center text-xs font-bold text-[#6a6acc] ring-1 ring-[#E8E8FF]">{t}</span>)}
                      </div>
                      <div className="mt-3 rounded-xl bg-gradient-to-r from-[#8B8CFF] to-[#FF8E9E] px-4 py-2.5 text-center text-sm font-bold text-white">Booking Rp 75.000 →</div>
                    </div>
                  </div>
                  <div className="absolute -right-4 -top-4 rounded-2xl bg-[#fff4d6] px-4 py-2 shadow-lg">
                    <p className="text-xs font-bold text-amber-700">🔥 1.2k booking minggu ini</p>
                  </div>
                  <div className="absolute -left-4 -bottom-4 rounded-2xl bg-[#e6f7ee] px-4 py-2 shadow-lg">
                    <p className="text-xs font-bold text-emerald-700">✦ Anti double-booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex rounded-full bg-[#FAF9FF] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#8B8CFF] ring-1 ring-[#E8E8FF]">✦ Jelajahi</span>
              <h2 className="mt-3 text-3xl font-black text-gray-900">Kategori Populer</h2>
              <p className="mt-2 text-gray-500">Temukan layanan sesuai mood & kebutuhan Anda</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categoriesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-[#E8E8FF] bg-[#FAF9FF] p-6">
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-[#e8e8ff]" />
                    <div className="mx-auto mt-3 h-4 w-16 rounded bg-gray-100" />
                  </div>
                ))
              ) : categoriesError ? (
                <div className="col-span-full rounded-2xl border border-dashed border-rose-200 bg-[#ffe8ec]/50 p-10 text-center">
                  <p className="text-gray-700 font-medium">Gagal memuat kategori</p>
                  <button
                    onClick={() => refetchCategories()}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-5 py-2 text-sm font-bold text-white shadow"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : categories.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-dashed border-[#E8E8FF] bg-[#FAF9FF] p-10 text-center">
                  <p className="text-gray-500">Belum ada kategori tersedia</p>
                  <button
                    onClick={() => refetchCategories()}
                    className="mt-4 inline-flex items-center justify-center rounded-full bg-[#8B8CFF] px-5 py-2 text-sm font-bold text-white"
                  >
                    Muat Ulang
                  </button>
                </div>
              ) : (
                categories.map((cat, idx) => (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.id}`}
                    className={`group flex flex-col items-center rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${softCategoryStyles[idx % softCategoryStyles.length]} ring-1 hover:shadow-[#8B8CFF]/10`}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">{cat.icon}</span>
                    <span className="mt-3 text-sm font-bold text-gray-800 group-hover:text-gray-900 text-center">
                      {cat.name}
                    </span>
                    {cat.serviceCount > 0 && (
                      <span className="mt-1 rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-gray-600">{cat.serviceCount} layanan</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section className="bg-[#FAF9FF] py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                  Provider Unggulan
                  <span className="rounded-full bg-gradient-to-r from-[#ffe8ec] to-[#fff4d6] px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200">✦ Featured</span>
                </h2>
                <p className="mt-2 text-gray-500">Pilihan terbaik, warna-warni & terpercaya</p>
              </div>
              <Link
                to="/search"
                className="hidden rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#6a6acc] shadow-sm ring-1 ring-[#E8E8FF] transition hover:shadow-md sm:inline-flex items-center gap-1"
              >
                Lihat Semua
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>

            {featuredLoading ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-white">
                    <div className="h-40 bg-[#e8e8ff] rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-full rounded bg-gray-100" />
                      <div className="h-4 w-1/2 rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featured.length > 0 ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-[#E8E8FF] bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8e8ff] text-[#8B8CFF]">
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <p className="mt-4 font-semibold text-gray-700">Belum ada provider unggulan saat ini</p>
                <p className="text-sm text-gray-400">Provider akan muncul di sini setelah terdaftar</p>
              </div>
            )}
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-flex rounded-full bg-[#e6f7ee] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-700">✦ Mudah</span>
              <h2 className="mt-3 text-3xl font-black text-gray-900">Cara Kerja</h2>
              <p className="mt-2 text-gray-500">Booking dalam 4 langkah mudah & berwarna</p>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Cari Layanan',
                  desc: 'Temukan provider dan layanan yang Anda butuhkan',
                  bg: 'from-[#e8e8ff] to-[#e8f2ff]',
                  accent: 'text-[#6a6acc]',
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  ),
                },
                {
                  step: '02',
                  title: 'Pilih Jadwal',
                  desc: 'Lihat slot waktu yang tersedia secara real-time',
                  bg: 'from-[#ffe8ec] to-[#fff4d6]',
                  accent: 'text-rose-500',
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ),
                },
                {
                  step: '03',
                  title: 'Bayar Deposit',
                  desc: 'Bayar deposit untuk mengamankan slot Anda',
                  bg: 'from-[#e6f7ee] to-[#e8f2ff]',
                  accent: 'text-emerald-600',
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  ),
                },
                {
                  step: '04',
                  title: 'Selesai!',
                  desc: 'Datang sesuai jadwal dan nikmati layanannya',
                  bg: 'from-[#fff4d6] to-[#ffe8ec]',
                  accent: 'text-amber-600',
                  icon: (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div key={item.step} className="relative rounded-2xl border border-[#E8E8FF] bg-white p-6 text-center shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} ${item.accent} shadow-inner`}>
                    {item.icon}
                  </div>
                  <div className="mt-4">
                    <span className="rounded-full bg-[#FAF9FF] px-2.5 py-1 text-xs font-black uppercase tracking-widest text-[#8B8CFF] ring-1 ring-[#E8E8FF]">
                      Langkah {item.step}
                    </span>
                    <h3 className="mt-3 text-base font-black text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B8CFF] via-[#A5A6FF] to-[#FF8E9E]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <span className="inline-flex rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">✦ Untuk Provider</span>
            <h2 className="mt-3 text-3xl font-black text-white">Punya Usaha Jasa?</h2>
            <p className="mt-3 text-lg text-white/85 max-w-2xl mx-auto">
              Bergabung dengan DEKAT dan dapatkan booking 24/7. Kurangi no-show dengan deposit otomatis. Gratis setup!
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/provider/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-black text-[#6a6acc] shadow-xl transition hover:scale-[1.02]"
              >
                Daftar Gratis
                <span className="rounded-full bg-[#e8e8ff] px-2 py-0.5 text-xs">✦</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/10 px-8 py-3.5 text-base font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Pelajari Lebih Lanjut
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
