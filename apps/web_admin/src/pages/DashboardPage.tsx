import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function DashboardPage() {
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.dashboard.getStats() });
  const stats = res?.data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="mt-1 text-sm text-gray-500">Ringkasan platform DEKAT</p></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm"><div className="h-12 w-12 rounded-xl bg-gray-100" /><div className="mt-4 h-8 w-24 rounded bg-gray-100" /></div>)
          : <>
              <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} color="blue" change={stats ? { value: stats.userGrowth, isPositive: stats.userGrowth >= 0 } : undefined} icon="users" />
              <StatsCard label="Total Tenants" value={stats?.totalTenants ?? 0} color="green" change={stats ? { value: stats.tenantGrowth, isPositive: stats.tenantGrowth >= 0 } : undefined} icon="building" />
              <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} color="purple" change={stats ? { value: stats.bookingGrowth, isPositive: stats.bookingGrowth >= 0 } : undefined} icon="calendar" />
              <StatsCard label="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} color="amber" change={stats ? { value: stats.revenueGrowth, isPositive: stats.revenueGrowth >= 0 } : undefined} icon="currency" />
            </>
          }
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><h3 className="font-semibold text-gray-900">Recent Bookings</h3><p className="mt-4 text-sm text-gray-500">Booking data will appear here.</p></div>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><h3 className="font-semibold text-gray-900">Open Cases</h3><p className="mt-4 text-sm text-gray-500">Support cases will appear here.</p></div>
        </div>
      </div>
    </AdminLayout>
  );
}
