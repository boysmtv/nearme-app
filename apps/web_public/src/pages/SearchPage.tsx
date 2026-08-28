import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProviderCard from '../components/ProviderCard';
import { publicApi } from '../lib/api';
import type { SearchFilters } from '../lib/types';

const sortOptions = [
  { value: 'relevance', label: 'Relevansi' },
  { value: 'rating', label: 'Rating Tertinggi' },
  { value: 'price_low', label: 'Harga Terendah' },
  { value: 'price_high', label: 'Harga Tertinggi' },
  { value: 'distance', label: 'Terdekat' },
];

const categoryOptions = [
  { value: '', label: 'Semua Kategori' },
  { value: 'barbershop', label: 'Barbershop' },
  { value: 'salon', label: 'Salon' },
  { value: 'spa-massage', label: 'Spa & Massage' },
  { value: 'kecantikan', label: 'Kecantikan' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'olahraga', label: 'Olahraga' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 0,
    minRating: Number(searchParams.get('minRating')) || 0,
    date: searchParams.get('date') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: Number(searchParams.get('page')) || 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['providers', 'search', filters],
    queryFn: () => publicApi.providers.search(filters),
    staleTime: 2 * 60 * 1000,
  });

  const results = Array.isArray(data?.data) ? data.data : (data?.data?.providers ?? []);
  const pagination = data?.data?.pagination;

  const handleFilterChange = (key: keyof SearchFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== '' && v !== 0 && v !== 1) params.set(k, String(v));
    });
    setSearchParams(params);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice > 0) count++;
    if (filters.minRating > 0) count++;
    if (filters.date) count++;
    return count;
  }, [filters]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9FF]">
      <Header />

      <main className="flex-1">
        {/* Search Bar */}
        <div className="border-b border-[#E8E8FF] bg-white/70 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="flex gap-3 flex-col sm:flex-row">
              <div className="relative flex-1">
                <svg
                  className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8B8CFF]"
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
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder="Cari nama provider, layanan, atau lokasi..."
                  className="w-full rounded-full border border-[#E8E8FF] bg-[#FAF9FF] py-3 pl-11 pr-4 text-sm focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8E8FF] transition"
                />
              </div>
              <div className="relative flex gap-3">
                <div className="relative flex-1 sm:flex-none">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B8CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Lokasi"
                    className="w-full sm:w-44 rounded-full border border-[#E8E8FF] bg-[#FAF9FF] py-3 pl-9 pr-4 text-sm focus:border-[#8B8CFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#E8E8FF]"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#8B8CFF]/20 hover:shadow-lg transition whitespace-nowrap"
                >
                  Cari ✦
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative rounded-full border px-4 py-3 text-sm font-bold transition-all flex items-center gap-1.5 ${
                    showFilters || activeFilterCount > 0
                      ? 'border-[#8B8CFF] bg-[#e8e8ff] text-[#6a6acc] shadow-sm'
                      : 'border-[#E8E8FF] bg-white text-gray-600 hover:bg-[#FAF9FF]'
                  }`}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filter
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B8CFF] text-xs font-black text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </form>

            {/* Filter Panel */}
            {showFilters && (
              <div className="mt-5 rounded-2xl border border-[#E8E8FF] bg-gradient-to-br from-[#FAF9FF] to-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-7 w-7 rounded-full bg-[#e8e8ff] flex items-center justify-center text-[#8B8CFF]"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg></span>
                  <p className="text-sm font-black text-gray-900">Filter Lanjutan</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-[#E8E8FF]">{activeFilterCount} aktif</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Kategori</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none focus:ring-2 focus:ring-[#e8e8ff]"
                    >
                      {categoryOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Harga Minimum</label>
                    <input
                      type="number"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                      placeholder="Rp 0"
                      className="w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Harga Maksimum</label>
                    <input
                      type="number"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                      placeholder="Tanpa batas"
                      className="w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Rating Minimum</label>
                    <select
                      value={filters.minRating}
                      onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                      className="w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none"
                    >
                      <option value={0}>Semua Rating</option>
                      <option value={4}>⭐ 4.0+</option>
                      <option value={3}>⭐ 3.0+</option>
                      <option value={2}>⭐ 2.0+</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Tanggal</label>
                    <input
                      type="date"
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      className="w-full rounded-xl border border-[#E8E8FF] bg-white px-3 py-2.5 text-sm focus:border-[#8B8CFF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#8B8CFF] ring-1 ring-[#E8E8FF]"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isLoading
                    ? 'Mencari provider terbaik...'
                    : `${pagination?.total ?? results.length} provider ditemukan`}
                </p>
                <p className="text-xs text-gray-500">✦ Soft & colorful — hasil diperbarui real-time</p>
              </div>
            </div>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="rounded-full border border-[#E8E8FF] bg-white px-4 py-2.5 text-sm font-medium focus:border-[#8B8CFF] focus:outline-none shadow-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white ring-1 ring-[#E8E8FF]">
                  <div className="h-40 bg-[#e8e8ff] rounded-t-2xl" />
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-100" />
                    <div className="h-4 w-2/3 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((provider) => (
                  <ProviderCard key={provider.id} provider={provider} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handleFilterChange('page', page)}
                      className={`h-9 w-9 rounded-full text-sm font-bold transition-all ${
                        page === filters.page
                          ? 'bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] text-white shadow-md'
                          : 'border border-[#E8E8FF] bg-white text-gray-600 hover:bg-[#FAF9FF]'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="mt-12 rounded-2xl border border-dashed border-[#d0d0ff] bg-white p-12 text-center shadow-sm">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-black text-gray-900">Tidak ada hasil</h3>
              <p className="mt-1 text-sm text-gray-500">Coba ubah filter atau kata kunci pencarian Anda</p>
              <span className="mt-3 inline-flex rounded-full bg-[#FAF9FF] px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-[#E8E8FF]">💡 Tip: Hapus filter untuk hasil lebih banyak</span>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
