import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import type { Booking } from '../../lib/types';
import CustomerLayout from '../../components/CustomerLayout';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Dikonfirmasi' },
  PENDING_PAYMENT: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Menunggu Bayar' },
  PENDING_APPROVAL: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Menunggu Persetujuan' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', label: 'Sedang Berlangsung' },
  COMPLETED: { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: 'Selesai' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-400', label: 'Dibatalkan' },
  NO_SHOW: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-400', label: 'Tidak Hadir' },
  EXPIRED: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-300', label: 'Kedaluwarsa' },
  HELD: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', label: 'Ditahan' },
};

const PROVIDER_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-sky-100 text-sky-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-cyan-100 text-cyan-700',
];

function getProviderColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PROVIDER_COLORS[Math.abs(hash) % PROVIDER_COLORS.length];
}

function formatPrice(amount: number) {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(iso: string | undefined) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 animate-pulse">
      <div className="flex gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-100" />
          <div className="flex gap-4">
            <div className="h-3 w-36 rounded bg-gray-100" />
            <div className="h-3 w-20 rounded bg-gray-100" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 w-24 rounded-full bg-gray-100" />
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <svg className="w-32 h-32 text-gray-200 mb-6" viewBox="0 0 128 128" fill="none">
        <rect x="16" y="28" width="96" height="84" rx="8" fill="currentColor" opacity="0.3" />
        <rect x="28" y="16" width="72" height="16" rx="4" fill="currentColor" opacity="0.5" />
        <rect x="36" y="48" width="56" height="6" rx="3" fill="white" opacity="0.7" />
        <rect x="36" y="62" width="40" height="6" rx="3" fill="white" opacity="0.5" />
        <rect x="36" y="76" width="48" height="6" rx="3" fill="white" opacity="0.4" />
        <rect x="36" y="90" width="32" height="6" rx="3" fill="white" opacity="0.3" />
        <circle cx="100" cy="96" r="20" fill="currentColor" opacity="0.2" />
        <path d="M94 96l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Booking</h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-6">
        Mulai jelajahi layanan terbaik di sekitar Anda dan buat booking pertama.
      </p>
      <Link
        to="/search"
        className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Cari Provider
      </Link>
    </div>
  );
}

export default function CustomerBookingsPage() {
  const [filter, setFilter] = useState('ALL');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['customer-bookings', filter],
    queryFn: () => publicApi.bookings.list({ status: filter !== 'ALL' ? filter : undefined }),
  });

  const allBookings: Booking[] = data?.data ?? [];

  const bookings = [...allBookings].sort((a, b) => {
    const dateA = new Date(a.startsAt || a.createdAt).getTime();
    const dateB = new Date(b.startsAt || b.createdAt).getTime();
    return sort === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const statusCounts: Record<string, number> = { ALL: allBookings.length };
  for (const b of allBookings) {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  }

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Booking Saya</h1>
            {!isLoading && allBookings.length > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-700">
                {allBookings.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {STATUS_FILTERS.map((s) => {
            const count = statusCounts[s.value] ?? 0;
            const isActive = filter === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setFilter(s.value)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-200'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {s.label}
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const st = STATUS_STYLES[b.status] ?? { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400', label: b.status };
              const providerInitial = (b.customerName || 'P').charAt(0).toUpperCase();
              const providerColor = getProviderColor(b.customerName || 'Provider');

              return (
                <Link
                  key={b.id}
                  to={`/bookings/${b.id}`}
                  className="group block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-primary-100"
                >
                  <div className="flex gap-4">
                    {/* Provider Logo */}
                    <div className={`h-12 w-12 flex-shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${providerColor}`}>
                      {providerInitial}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{b.serviceName || 'Layanan'}</p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{b.customerName || 'Provider'}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${st.bg} ${st.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(b.startsAt || b.createdAt)}
                        </span>
                        {(b.startsAt || b.time) && (
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(b.startsAt || b.time)}
                            {b.endTime && ` - ${formatTime(b.endTime)}`}
                          </span>
                        )}
                      </div>

                      {/* Bottom Row */}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(b.amount || 0)}</p>
                        {b.status === 'COMPLETED' && (
                          <span
                            onClick={(e) => e.preventDefault()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 transition-colors hover:bg-primary-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Booking Lagi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
