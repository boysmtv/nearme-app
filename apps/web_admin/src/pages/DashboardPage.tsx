import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';
import StatusBadge from '../components/StatusBadge';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function DashboardPage() {
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.dashboard.getStats() });
  const stats = res?.data;

  const { data: bookingsRes, isLoading: bookingsLoading, isError: bookingsError } = useQuery({
    queryKey: ['admin', 'bookings', { page: 1, limit: 5 }],
    queryFn: () => adminApi.bookings.list({ page: 1, limit: 5 }),
  });
  const { data: casesRes, isLoading: casesLoading, isError: casesError } = useQuery({
    queryKey: ['admin', 'cases', { page: 1, limit: 5 }],
    queryFn: () => adminApi.cases.list({ page: 1, limit: 5 }),
  });
  const recentBookings = bookingsRes?.data?.data ?? [];
  const openCases = (casesRes?.data?.data ?? []).filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS' || c.status === 'WAITING_CUSTOMER');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-fuchsia-400 p-[1px]">
          <div className="rounded-[15px] bg-gradient-to-br from-white via-soft-violet/30 to-soft-pink/30 px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-lg shadow-primary-200">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <p className="mt-0.5 text-sm font-medium text-gray-500">Ringkasan platform DEKAT • Pantau performa & aktivitas</p>
              </div>
              <div className="ml-auto hidden sm:flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><div className="h-12 w-12 rounded-xl bg-soft-violet" /><div className="mt-4 h-8 w-24 rounded bg-gray-100" /></div>)
          : <>
              <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} color="blue" change={stats?.userGrowth != null ? { value: stats.userGrowth, isPositive: stats.userGrowth >= 0 } : undefined} icon="users" />
              <StatsCard label="Total Tenants" value={stats?.totalTenants ?? 0} color="green" change={stats?.tenantGrowth != null ? { value: stats.tenantGrowth, isPositive: stats.tenantGrowth >= 0 } : undefined} icon="building" />
              <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} color="purple" change={stats?.bookingGrowth != null ? { value: stats.bookingGrowth, isPositive: stats.bookingGrowth >= 0 } : undefined} icon="calendar" />
              <StatsCard label="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} color="amber" change={stats?.revenueGrowth != null ? { value: stats.revenueGrowth, isPositive: stats.revenueGrowth >= 0 } : undefined} icon="currency" />
            </>
          }
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 shadow">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900">Recent Bookings</h3>
              <span className="ml-auto rounded-full bg-soft-violet px-2.5 py-1 text-xs font-bold text-primary-700">{recentBookings.length} terbaru</span>
            </div>
            {bookingsLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="space-y-2"><div className="h-4 w-32 rounded bg-soft-violet" /><div className="h-3 w-24 rounded bg-gray-50" /></div>
                    <div className="h-6 w-16 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : bookingsError ? (
              <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 ring-1 ring-rose-100">Gagal memuat booking. Coba muat ulang halaman.</div>
            ) : recentBookings.length === 0 ? (
              <div className="mt-6 rounded-xl bg-gradient-to-br from-soft-violet/50 to-soft-pink/30 p-8 text-center">
                <p className="text-sm font-medium text-gray-600">Belum ada booking di platform.</p>
                <p className="mt-1 text-xs text-gray-400">Booking baru akan muncul di sini</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {recentBookings.map((b) => (
                  <div key={b.id} className="group flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-white to-soft-violet/10 p-3.5 transition-all hover:border-primary-100 hover:shadow-sm">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-white text-xs font-bold text-primary-600 shadow-sm ring-1 ring-primary-100 group-hover:bg-primary-500 group-hover:text-white transition-colors">#</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 truncate">{b.code} <span className="font-normal text-gray-400">·</span> {b.customerName}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400"/>{b.providerName} · {b.serviceName}</p>
                      </div>
                    </div>
                    <div className="ml-4 flex flex-shrink-0 items-center gap-3">
                      <span className="hidden sm:inline text-sm font-bold text-gray-900">{fmt(b.totalAmount)}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 shadow">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-semibold text-gray-900">Open Cases</h3>
              <span className="ml-auto rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">{openCases.length} perlu tindakan</span>
            </div>
            {casesLoading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="space-y-2"><div className="h-4 w-36 rounded bg-amber-50" /><div className="h-3 w-24 rounded bg-gray-50" /></div>
                    <div className="h-6 w-16 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : casesError ? (
              <div className="mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-600 ring-1 ring-rose-100">Gagal memuat kasus. Coba muat ulang halaman.</div>
            ) : openCases.length === 0 ? (
              <div className="mt-6 rounded-xl bg-gradient-to-br from-soft-mint/60 to-soft-violet/30 p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm"><svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                <p className="mt-3 text-sm font-medium text-gray-600">Tidak ada kasus yang perlu ditangani.</p>
                <p className="text-xs text-gray-400">Semua aman 🎉</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {openCases.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gradient-to-r from-white to-amber-50/50 p-3.5 hover:border-amber-100 hover:shadow-sm transition-all">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{c.caseNumber} <span className="font-normal text-gray-400">·</span> {c.subject}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5"><span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-bold ${c.severity==='P0'?'bg-rose-100 text-rose-700':c.severity==='P1'?'bg-orange-100 text-orange-700':'bg-amber-100 text-amber-700'}`}>{c.severity}</span> {new Date(c.createdAt).toLocaleDateString('id-ID')}</p>
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
