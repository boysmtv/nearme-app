import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { providerApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const bookingLink = user && user.id ? `${window.location.origin}/booking/${user.id}` : null;

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => providerApi.dashboard.getStats(),
  });

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ['dashboard', 'recent-bookings'],
    queryFn: () => providerApi.dashboard.getRecentBookings(),
  });

  const stats = statsRes?.data;
  const recentBookings = bookingsRes?.data ?? [];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-400 p-[1px]">
          <div className="rounded-[15px] bg-gradient-to-br from-white via-soft-violet/30 to-soft-pink/30 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-lg shadow-primary-200">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="mt-0.5 text-sm font-medium text-gray-500">Ringkasan aktivitas bisnis hari ini • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <div className="h-12 w-12 rounded-xl bg-soft-violet" />
                  <div className="mt-4 h-8 w-24 rounded bg-gray-100" />
                  <div className="mt-2 h-4 w-32 rounded bg-gray-50" />
                </div>
              ))
            : [
                <StatsCard key="today" label="Booking Hari Ini" value={stats?.todayBookings ?? 0} icon="calendar" color="blue" />,
                <StatsCard key="revenue" label="Pendapatan Minggu Ini" value={formatPrice(stats?.weekRevenue ?? 0)} icon="currency" color="green" />,
                <StatsCard key="customers" label="Total Pelanggan" value={stats?.totalCustomers ?? 0} icon="users" color="purple" />,
                <StatsCard key="rating" label="Rating Rata-rata" value={(stats?.avgRating)?.toFixed(1) ?? '-'} icon="star" color="amber" />,
              ]}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft-violet text-primary-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h2 className="text-base font-bold text-gray-900">Booking Terbaru</h2>
                  <span className="rounded-full bg-soft-violet px-2 py-0.5 text-xs font-bold text-primary-700">{recentBookings.length}</span>
                </div>
                <Link to="/calendar" className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary-500 to-violet-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:shadow-md transition-all">Lihat Semua <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></Link>
              </div>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-soft-violet" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-1/3 rounded bg-gray-100" />
                        <div className="h-3 w-1/2 rounded bg-gray-50" />
                      </div>
                      <div className="h-6 w-16 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-3">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-white to-soft-violet/10 p-3.5 hover:border-primary-100 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-sm font-bold text-white shadow-sm">
                          {booking.customerName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{booking.customerName}</p>
                          <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5"><span className="inline-block h-1 w-1 rounded-full bg-violet-400"/> {booking.serviceName} · {booking.staffName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatPrice(booking.amount ?? 0)}</p>
                        <p className="inline-flex items-center gap-1 rounded-full bg-soft-violet px-2 py-0.5 text-xs font-semibold text-primary-700">{booking.time ?? '-'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-gradient-to-br from-soft-violet/40 to-soft-pink/20 p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm"><svg className="h-6 w-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                  <p className="mt-3 text-sm font-semibold text-gray-700">Belum ada booking terbaru</p>
                  <p className="text-xs text-gray-500">Jadwal Anda akan tampil di sini</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-violet text-primary-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></span>Tindakan Cepat</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Kalender', href: '/calendar', grad: 'from-sky-400 to-primary-400', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
                  { label: 'Layanan', href: '/services', grad: 'from-emerald-400 to-teal-400', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
                  { label: 'Staf', href: '/staff', grad: 'from-amber-400 to-orange-400', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
                  { label: 'Laporan', href: '/reports', grad: 'from-fuchsia-400 to-pink-400', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className={`group flex flex-col items-center gap-2 rounded-xl bg-gradient-to-br ${action.grad} p-4 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all`}
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={action.icon} /></svg>
                    <span className="text-xs font-bold">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-violet-500 to-fuchsia-500 p-6 text-white shadow-lg">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <h3 className="relative flex items-center gap-2 font-bold"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>Link Booking Anda</h3>
              {bookingLink ? (
                <>
                  <p className="relative mt-1 text-sm text-white/80">Bagikan link ini kepada pelanggan</p>
                  <div className="relative mt-4 flex items-center gap-2">
                    <input
                      readOnly
                      value={bookingLink}
                      className="flex-1 rounded-xl bg-white/15 px-3 py-2.5 text-xs font-medium text-white placeholder-white/50 backdrop-blur ring-1 ring-white/20 focus:outline-none"
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(bookingLink).catch(() => {}); }}
                      className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-primary-600 hover:bg-white/90 shadow transition-colors"
                    >
                      Salin
                    </button>
                  </div>
                </>
              ) : (
                <p className="relative mt-2 text-sm text-white/80">
                  Tautan booking akan tersedia setelah bisnis diverifikasi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
