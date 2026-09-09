import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import CustomerLayout from '../../components/CustomerLayout';

const QUICK_ACTIONS = [
  { to: '/search', label: 'Cari Layanan', color: 'bg-blue-500', ring: 'ring-blue-100', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
  { to: '/chats', label: 'Chat', color: 'bg-emerald-500', ring: 'ring-emerald-100', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { to: '/notifications', label: 'Notifikasi', color: 'bg-amber-500', ring: 'ring-amber-100', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
  { to: '/nearby', label: 'Terdekat', color: 'bg-rose-500', ring: 'ring-rose-100', icon: <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
];

const SHORTCUTS = [
  { to: '/account/loyalty', label: 'Poin Loyalitas', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg> },
  { to: '/account/recurring', label: 'Booking Berulang', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> },
  { to: '/feed', label: 'Social Feed', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg> },
  { to: '/account/reviews', label: 'Ulasan Saya', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { to: '/support', label: 'Bantuan', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
];

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  CONFIRMED: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Dikonfirmasi' },
  PENDING_PAYMENT: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Menunggu Pembayaran' },
  IN_PROGRESS: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Sedang Berlangsung' },
  COMPLETED: { bg: 'bg-gray-50', text: 'text-gray-600', label: 'Selesai' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', label: 'Dibatalkan' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function Skeleton() {
  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-8 p-4 sm:p-6">
        <div className="h-36 w-full animate-pulse rounded-2xl bg-gray-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-56 animate-pulse rounded-2xl bg-gray-100" />
          <div className="lg:col-span-2 h-56 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    </CustomerLayout>
  );
}

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const name = user?.name?.split(' ')[0] || 'Pelanggan';

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings-dashboard'],
    queryFn: () => publicApi.bookings.list({ limit: 5 }),
  });

  const { data: profileRes, isLoading: profileLoading } = useQuery({
    queryKey: ['customer-profile-dashboard'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const { data: favoritesRes } = useQuery({
    queryKey: ['customer-favorites-count'],
    queryFn: () => publicApi.favorites.list(),
  });

  const bookingsRaw = bookingsRes?.data;
  const bookings = Array.isArray(bookingsRaw) ? bookingsRaw : (bookingsRaw as any)?.data ?? [];
  const profile = profileRes?.data as any;
  const points = profile?.loyaltyPoints || 0;
  const tier = points >= 1000 ? 'Gold' : points >= 500 ? 'Silver' : 'Bronze';
  const favorites = Array.isArray(favoritesRes?.data) ? favoritesRes.data : [];

  const tierProgress = tier === 'Gold' ? 100 : tier === 'Silver' ? ((points - 500) / 500) * 100 : (points / 500) * 100;
  const nextTierThreshold = tier === 'Gold' ? 1000 : tier === 'Silver' ? 1000 : 500;
  const nextTier = tier === 'Gold' ? null : tier === 'Silver' ? 'Gold' : 'Silver';

  const stats = [
    { label: 'Total Booking', value: bookings.length, icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>, color: 'bg-blue-50 text-blue-600' },
    { label: 'Poin Loyalitas', value: points.toLocaleString('id-ID'), icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, color: 'bg-amber-50 text-amber-600' },
    { label: 'Favorit', value: favorites.length, icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, color: 'bg-rose-50 text-rose-600' },
    { label: 'Ulasan', value: '—', icon: <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>, color: 'bg-violet-50 text-violet-600' },
  ];

  if (bookingsLoading || profileLoading) return <Skeleton />;

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-8 p-4 sm:p-6">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-500 p-6 sm:p-8 text-white">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/5" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold">Halo, {name}</h1>
            <p className="mt-1 text-white/80 text-sm sm:text-base">Selamat datang kembali di DEKAT. Temukan layanan terbaik di sekitarmu.</p>
            <Link to="/search" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm transition hover:bg-white/90">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Cari Sekarang
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-primary-200"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.color} text-white shadow-sm transition group-hover:scale-105`}>
                  {a.icon}
                </div>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Loyalty + Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Loyalty Card */}
          <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-200">Poin Loyalitas</p>
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{tier}</span>
            </div>
            <p className="mt-3 text-4xl font-extrabold">{points.toLocaleString('id-ID')}</p>
            <p className="mt-1 text-sm text-primary-200">poin</p>

            {nextTier && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-primary-200">
                  <span>{tier}</span>
                  <span>{nextTier}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${Math.min(tierProgress, 100)}%` }} />
                </div>
                <p className="mt-2 text-xs text-primary-200">
                  {nextTierThreshold - points > 0
                    ? `${(nextTierThreshold - points).toLocaleString('id-ID')} poin lagi ke ${nextTier}`
                    : `Selamat! Kamu sudah mencapai ${nextTier}`}
                </p>
              </div>
            )}
            {!nextTier && (
              <p className="mt-4 text-xs text-primary-200">Kamu sudah di tier tertinggi!</p>
            )}

            <Link to="/account/loyalty" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-white underline underline-offset-2 hover:text-primary-100 transition">
              Lihat Detail
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Booking Terakhir</h2>
              <Link to="/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-700 transition">
                Lihat Semua
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p className="mt-3 text-sm text-gray-400">Belum ada booking.</p>
                <Link to="/search" className="mt-3 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition">
                  Mulai Booking
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((b: any) => {
                  const status = STATUS_CONFIG[b.status] || { bg: 'bg-gray-50', text: 'text-gray-600', label: b.status?.replace('_', ' ') || '-' };
                  return (
                    <Link
                      key={b.id}
                      to={`/bookings/${b.id}`}
                      className="flex items-center justify-between rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50 hover:border-gray-200"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{b.providerName || b.serviceName || 'Booking'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {b.startsAt ? `${formatDate(b.startsAt)} · ${formatTime(b.startsAt)}` : 'Tanggal belum diatur'}
                          </p>
                        </div>
                      </div>
                      <span className={`ml-3 shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.bg} ${status.text}`}>
                        {status.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Akses Cepat</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SHORTCUTS.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-primary-200"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 transition group-hover:bg-primary-50 group-hover:text-primary-600">
                  {s.icon}
                </div>
                <span className="text-xs font-medium text-gray-600 text-center group-hover:text-primary-600 transition">{s.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </CustomerLayout>
  );
}
