import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/admin/StatusBadge';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function DashboardPage() {
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.dashboard.getStats() });
  const stats = res?.data;
  const { data: bookingsRes, isLoading: bookingsLoading, isError: bookingsError } = useQuery({ queryKey: ['admin', 'bookings', { page: 1, limit: 5 }], queryFn: () => adminApi.bookings.list({ page: 1, limit: 5 }) });
  const { data: casesRes, isLoading: casesLoading, isError: casesError } = useQuery({ queryKey: ['admin', 'cases', { page: 1, limit: 5 }], queryFn: () => adminApi.cases.list({ page: 1, limit: 5 }) });
  const recentBookings = bookingsRes?.data?.data ?? [];
  const openCases = (casesRes?.data?.data ?? []).filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS' || c.status === 'WAITING_CUSTOMER');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="mt-1 text-sm text-gray-500">Ringkasan platform DEKAT</p></div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm">
                <div className="h-12 w-12 rounded-xl bg-gray-100" />
                <div className="mt-4 h-8 w-24 rounded bg-gray-100" />
              </div>
            ))
          ) : (
            <>
              <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} color="blue" change={stats?.userGrowth} icon="users" />
              <StatsCard label="Total Tenants" value={stats?.totalTenants ?? 0} color="green" change={stats?.tenantGrowth} icon="building" />
              <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} color="purple" change={stats?.bookingGrowth} icon="calendar" />
              <StatsCard label="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} color="amber" change={stats?.revenueGrowth} icon="currency" />
            </>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
            {bookingsLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="space-y-2"><div className="h-4 w-32 rounded bg-gray-100" /><div className="h-3 w-24 rounded bg-gray-50" /></div>
                    <div className="h-6 w-16 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : bookingsError ? (
              <p className="mt-4 text-sm text-red-600">Gagal memuat booking.</p>
            ) : recentBookings.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">Belum ada booking di platform.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.code} &middot; {b.customerName}</p>
                      <p className="text-xs text-gray-500 truncate">{b.providerName} &middot; {b.serviceName}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{fmt(b.totalAmount)}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Open Cases</h3>
            {casesLoading ? (
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="space-y-2"><div className="h-4 w-36 rounded bg-gray-100" /><div className="h-3 w-24 rounded bg-gray-50" /></div>
                    <div className="h-6 w-16 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : casesError ? (
              <p className="mt-4 text-sm text-red-600">Gagal memuat kasus.</p>
            ) : openCases.length === 0 ? (
              <p className="mt-4 text-sm text-gray-500">Tidak ada kasus yang perlu ditangani.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {openCases.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.caseNumber} &middot; {c.subject}</p>
                      <p className="text-xs text-gray-500">{c.severity} &middot; {new Date(c.createdAt).toLocaleDateString('id-ID')}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
