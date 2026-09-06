import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import StatsCard from '../components/StatsCard';

const COLORS = ['#6C63FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', '#FF8A65', '#81C784'];

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);

  const { data: statsRes, isLoading: statsLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => adminApi.dashboard.getStats() });
  const stats = statsRes?.data;

  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin', 'analytics', days],
    queryFn: () => adminApi.dashboard.getAnalytics(days),
  });
  const analytics = analyticsRes?.data;

  const revenueData = analytics?.revenueByDay ?? [];
  const bookingsByStatus = analytics?.bookingsByStatus ?? {};
  const bookingData = Object.entries(bookingsByStatus).map(([status, count]) => ({ status, count }));
  const topServices = analytics?.topServices ?? [];

  const loading = statsLoading || analyticsLoading;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">Statistik dan tren platform DEKAT</p>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value={7}>7 hari</option>
            <option value={30}>30 hari</option>
            <option value={90}>90 hari</option>
          </select>
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
            <StatsCard label="Total Users" value={stats?.totalUsers ?? 0} change={stats?.userGrowth} color="blue" icon="users" />
            <StatsCard label="Total Providers" value={stats?.totalTenants ?? 0} change={stats?.tenantGrowth} color="green" icon="building" />
            <StatsCard label="Total Bookings" value={stats?.totalBookings ?? 0} change={stats?.bookingGrowth} color="purple" icon="calendar" />
            <StatsCard label="Total Revenue" value={fmt(stats?.totalRevenue ?? 0)} change={stats?.revenueGrowth} color="amber" icon="currency" />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Revenue Trend</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
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
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {bookingData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Status Distribution</h3>
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={bookingData} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="status" label>
                    {bookingData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Top Services</h3>
            <div className="mt-4">
              {topServices.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{s.serviceName}</p>
                        <p className="text-xs text-gray-500">{s.bookingCount} booking</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{fmt(s.revenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
