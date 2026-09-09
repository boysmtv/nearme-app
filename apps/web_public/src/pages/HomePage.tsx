import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProviderCard from '../components/ProviderCard';
import { publicApi } from '../lib/api';

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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNnY2aDJ2Mmgydi0yaDJ2LTJoLTJ2LTJoMnYtMmgtMnYtMmgyVjhoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2MmgyVjhoLTJ2MmgydjJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0VjhoLTIuMXYySDEzdjJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTJ2Mmg0djJoLTIuMXY0Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="relative mx-auto max-w-screen-2xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Lihat harga. Pilih jadwal. Langsung booking.
              </h1>
              <p className="mt-6 text-lg text-primary-100 sm:text-xl">
                Temukan layanan kecantikan dan kesehatan terdekat. Booking instan tanpa chat berulang.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/search"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
                >
                  <svg
                    className="mr-2 h-5 w-5"
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
                </Link>
                <Link
                  to="/provider/register"
                  className="inline-flex items-center justify-center rounded-lg border-2 border-primary-400/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
                >
                  Jadi Provider
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Seasonal Promo Banner */}
        <section className="bg-gradient-to-r from-yellow-500 to-orange-500 py-4">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-3 text-white">
              <span className="text-2xl">🎉</span>
              <p className="font-semibold text-sm sm:text-base">
                Promo Spesial! Gunakan kode <span className="bg-white/20 px-2 py-0.5 rounded">DEKAT2024</span> untuk diskon 10% booking pertama Anda
              </p>
              <Link to="/search" className="ml-2 underline text-sm font-medium hover:text-yellow-100">
                Booking Sekarang
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Kategori Populer</h2>
              <p className="mt-2 text-gray-500">Temukan layanan sesuai kebutuhan Anda</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categoriesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl border border-gray-200 p-6">
                    <div className="mx-auto h-10 w-10 rounded-full bg-gray-200" />
                    <div className="mx-auto mt-3 h-4 w-16 rounded bg-gray-100" />
                  </div>
                ))
              ) : categoriesError ? (
                <div className="col-span-full rounded-xl border border-dashed border-red-200 bg-red-50 p-10 text-center">
                  <p className="text-gray-700">Gagal memuat kategori</p>
                  <button
                    onClick={() => refetchCategories()}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Coba Lagi
                  </button>
                </div>
              ) : categories.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                  <p className="text-gray-500">Belum ada kategori tersedia</p>
                  <button
                    onClick={() => refetchCategories()}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Muat Ulang
                  </button>
                </div>
              ) : (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/search?category=${cat.id}`}
                    className="group flex flex-col items-center rounded-xl border border-gray-200 p-6 transition-all hover:border-primary-200 hover:bg-primary-50 hover:shadow-md"
                  >
                    <span className="text-4xl">{cat.icon}</span>
                    <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-primary-600">
                      {cat.name}
                    </span>
                    {cat.serviceCount > 0 && (
                      <span className="mt-1 text-xs text-gray-400">{cat.serviceCount} layanan</span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Providers */}
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Provider Unggulan</h2>
                <p className="mt-2 text-gray-500">Pilihan terbaik untuk kebutuhan Anda</p>
              </div>
              <Link
                to="/search"
                className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white sm:inline-block"
              >
                Lihat Semua
              </Link>
            </div>

            {featuredLoading ? (
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white">
                    <div className="h-40 bg-gray-200 rounded-t-xl" />
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
              <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
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
                <p className="mt-4 text-gray-500">Belum ada provider unggulan saat ini</p>
                <p className="text-sm text-gray-400">Provider akan muncul di sini setelah terdaftar</p>
              </div>
            )}
          </div>
        </section>

        {/* Most Booked This Week */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Paling Laris Minggu Ini</h2>
                <p className="mt-2 text-gray-500">Provider yang paling banyak dibooking minggu ini</p>
              </div>
              <Link
                to="/search"
                className="hidden rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white sm:inline-block"
              >
                Lihat Semua
              </Link>
            </div>

            {featuredLoading ? (
              <div className="mt-8 flex gap-6 overflow-hidden">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="min-w-[300px] animate-pulse rounded-xl bg-white">
                    <div className="h-40 bg-gray-200 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-5 w-3/4 rounded bg-gray-200" />
                      <div className="h-4 w-full rounded bg-gray-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featured.length > 0 ? (
              <div className="mt-8 flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {featured.slice(0, 3).map((provider) => (
                  <div key={provider.id} className="min-w-[300px] flex-shrink-0">
                    <ProviderCard provider={provider} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <p className="text-gray-500">Belum ada data booking minggu ini</p>
              </div>
            )}
          </div>
        </section>

        {/* How it Works */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Cara Kerja</h2>
              <p className="mt-2 text-gray-500">Booking dalam 4 langkah mudah</p>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: '01',
                  title: 'Cari Layanan',
                  desc: 'Temukan provider dan layanan yang Anda butuhkan',
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
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                    {item.icon}
                  </div>
                  <div className="mt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-500">
                      Langkah {item.step}
                    </span>
                    <h3 className="mt-2 text-lg font-semibold text-gray-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-700 py-16">
          <div className="mx-auto max-w-screen-2xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white">Punya Usaha Jasa?</h2>
            <p className="mt-3 text-lg text-primary-100">
              Bergabung dengan DEKAT dan dapatkan booking 24/7. Kurangi no-show dengan deposit otomatis.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/provider/register"
                className="inline-flex items-center rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
              >
                Daftar Gratis
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-lg border-2 border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
