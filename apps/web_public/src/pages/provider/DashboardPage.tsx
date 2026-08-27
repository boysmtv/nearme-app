import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { providerApi } from '../../lib/api';
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
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Ringkasan aktivitas bisnis hari ini</p>
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
                <StatsCard key="revenue" label="Pendapatan Minggu Ini" value={formatPrice(stats?.weekRevenue ?? 0)} icon="currency" color="green" />,
                <StatsCard key="customers" label="Total Pelanggan" value={stats?.totalCustomers ?? 0} icon="users" color="purple" />,
                <StatsCard key="rating" label="Rating Rata-rata" value={(stats?.avgRating)?.toFixed(1) ?? '-'} icon="star" color="amber" />,
              ]}
        </div>

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
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                          {booking.customerName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{booking.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {booking.serviceName} - {booking.staffName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatPrice(booking.amount ?? 0)}</p>
                        <p className="text-xs text-gray-500">
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
                  { label: 'Kelola Staf', href: '/provider/staff', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
                  { label: 'Lihat Laporan', href: '/provider/reports', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
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
                      className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-xs text-white placeholder-white/50 backdrop-blur"
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(bookingLink).catch(() => {}); }}
                      className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-primary-700 hover:bg-primary-50"
                    >
                      Salin
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
