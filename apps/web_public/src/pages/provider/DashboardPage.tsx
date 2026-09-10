import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { providerApi, analyticsApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import ProviderLayout from '../../components/ProviderLayout';
import StatsCard from '../../components/StatsCard';

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
  const [copied, setCopied] = useState(false);

  const { data: statsRes, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => providerApi.dashboard.getStats(),
  });

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ['dashboard', 'recent-bookings'],
    queryFn: () => providerApi.dashboard.getRecentBookings(),
  });

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString().split('T')[0]!;
  const endDate = today.toISOString().split('T')[0]!;

  const { data: analyticsRes } = useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: () => analyticsApi.getAnalytics({ startDate, endDate, granularity: 'day' }),
  });

  const stats = statsRes?.data;
  const recentBookings = bookingsRes?.data ?? [];
  const revenueChart = (analyticsRes?.data?.revenueByDay ?? []).map((d: any) => ({
    date: d.date?.substring(5) || d.date,
    revenue: d.revenue || 0,
  }));

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Ringkasan aktivitas bisnis</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                  <div className="h-12 w-12 rounded-xl bg-gray-100" />
                  <div className="mt-4 h-8 w-24 rounded bg-gray-100" />
                  <div className="mt-2 h-4 w-32 rounded bg-gray-50" />
                </div>
              ))
            : [
                <StatsCard key="today" label="Booking Hari Ini" value={stats?.todayBookings ?? 0} icon="calendar" color="blue" />,
                <StatsCard key="today-revenue" label="Pendapatan Hari Ini" value={formatPrice(stats?.todayRevenue ?? 0)} icon="currency" color="green" />,
                <StatsCard key="week-bookings" label="Booking Minggu Ini" value={stats?.weekBookings ?? 0} icon="calendar" color="purple" />,
                <StatsCard key="week-revenue" label="Pendapatan Minggu" value={formatPrice(stats?.weekRevenue ?? 0)} icon="currency" color="amber" />,
              ]}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? null : (
            <>
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-500">Total Pelanggan</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers ?? 0}</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm text-gray-500">Rating Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900">{(stats?.avgRating)?.toFixed(1) ?? '-'}</p>
              </div>
            </>
          )}
        </div>

        {/* Revenue Chart */}
        {revenueChart.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Pendapatan 30 Hari</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => formatPrice(Number(v))} />
                  <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Booking Terbaru</h2>
                <Link to="/provider/calendar" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Lihat Semua
                </Link>
              </div>
              {bookingsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-gray-100" />
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
                  {recentBookings.slice(0, 5).map((booking: any) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                          {booking.customerName?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-[13px] text-gray-500">
                            {booking.serviceName} - {booking.staffName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatPrice(booking.amount ?? 0)}</p>
                        <p className="text-[13px] text-gray-500">
                          {booking.time ?? '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-500">Belum ada booking terbaru</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Tindakan Cepat</h3>
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Lihat Kalender', href: '/provider/calendar', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                  { label: 'Kelola Layanan', href: '/provider/services', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
                  { label: 'Paket Layanan', href: '/provider/bundles', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100' },
                  { label: 'Import CSV', href: '/provider/import', color: 'text-teal-600 bg-teal-50 hover:bg-teal-100' },
                  { label: 'Manajemen Staf', href: '/provider/staff-suite', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
                  { label: 'Smart Scheduling', href: '/provider/smart-scheduling', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                  { label: 'Multi-Lokasi', href: '/provider/locations', color: 'text-pink-600 bg-pink-50 hover:bg-pink-100' },
                  { label: 'Analytics Mendalam', href: '/provider/analytics-deep', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                  { label: 'Upgrade Plan', href: '/provider/upgrade', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                  { label: 'Daftar Tunggu', href: '/provider/waitlist', color: 'text-cyan-600 bg-cyan-50 hover:bg-cyan-100' },
                  { label: 'Komisi Platform', href: '/provider/commission', color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
                  { label: 'Settlement & Payout', href: '/provider/settlement', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                  { label: 'Lihat Laporan', href: '/provider/reports', color: 'text-gray-600 bg-gray-50 hover:bg-gray-100' },
                ].map((action) => (
                  <Link
                    key={action.href}
                    to={action.href}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${action.color}`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 p-6 text-white">
              <h3 className="font-semibold">Link Booking Anda</h3>
              {bookingLink ? (
                <>
                  <p className="mt-1 text-sm text-primary-100">Bagikan link ini kepada pelanggan</p>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      readOnly
                      value={bookingLink}
                      className="flex-1 rounded-lg bg-white/10 px-3 py-2.5 text-sm h-9 text-white placeholder-white/50 backdrop-blur"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookingLink).catch(() => {});
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="rounded-lg bg-white px-3 py-2.5 text-sm h-9 font-medium text-primary-700 hover:bg-primary-50"
                    >
                      {copied ? 'Tersalin!' : 'Salin'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-primary-100">
                  Tautan booking akan tersedia setelah bisnis diverifikasi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
