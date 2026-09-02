import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';

const COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3'];

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function AnalyticsPage() {
  const { data: statsRes, isLoading: statsLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.dashboard.getStats() });
  const stats = statsRes?.data;

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin', 'bookings', { page: 1, limit: 100 }],
    queryFn: () => adminApi.bookings.list({ page: 1, limit: 100 }),
  });
  const bookings = bookingsRes?.data?.data ?? [];

  // Transform revenue data by date
  const revenueByDate: Record<string, number> = {};
  bookings.forEach((b) => {
    const date = b.createdAt?.substring(0, 10) || 'Unknown';
    revenueByDate[date] = (revenueByDate[date] || 0) + (b.totalAmount || 0);
  });
  const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({ date, revenue }));

  // Transform booking status data
  const statusCounts: Record<string, number> = {};
  bookings.forEach((b) => {
    statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
  });
  const bookingData = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

  const loading = statsLoading || bookingsLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">Statistik dan tren platform DEKAT</p>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="h-12 w-12 rounded-xl bg-gray-100" />
                <div className="mt-4 h-8 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} color="blue" icon="users" />
            <StatsCard label="Total Providers" value={stats?.totalTenants ?? 0} color="green" icon="building" />
            <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} color="purple" icon="calendar" />
            <StatsCard label="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} color="amber" icon="currency" />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Bookings by Status</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6C63FF">
                    {bookingData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="font-semibold text-gray-900">Status Distribution</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={bookingData} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="status" label>
                  {bookingData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
