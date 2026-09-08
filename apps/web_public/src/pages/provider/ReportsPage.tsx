import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerApi, analyticsApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

function fmt(n: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n);
}

export default function ReportsPage() {
  const [start] = useState<string>(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] ?? ''; });
  const [end] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '');
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const { data: res, isLoading } = useQuery({
    queryKey: ['reports', start, end],
    queryFn: () => providerApi.reports.getReport({ startDate: start ?? '', endDate: end ?? '' }),
  });
  const report = res?.data as unknown as { totalBookings: number; completedBookings: number; cancelledBookings: number; totalRevenue: number; avgRating: number; currency: string } | undefined;

  const { data: analyticsRes, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', start, end, granularity],
    queryFn: () => analyticsApi.getAnalytics({ startDate: start ?? '', endDate: end ?? '', granularity }).then((r) => (r as unknown as { data: import('../../lib/types').AnalyticsData }).data),
  });
  const analytics = analyticsRes as unknown as import('../../lib/types').AnalyticsData | undefined;

  const revenueByDay = analytics?.revenueByDay ?? [];
  const bookingsByStatus = analytics?.bookingsByStatus ?? {};
  const funnel = analytics?.funnel ?? {};
  const topServices = analytics?.topServices ?? [];
  const staffUtilization = analytics?.staffUtilization ?? [];
  const retention = analytics?.retention;

  const barData = Object.entries(bookingsByStatus).map(([name, value]) => ({ name, value }));
  const funnelData = Object.entries(funnel).map(([name, value]) => ({ name, value }));
  const COLORS = ['#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

  const handleExportCsv = async () => {
    try {
      const res = await analyticsApi.exportCsv({ startDate: start ?? '', endDate: end ?? '' }) as unknown as string;
      const text = typeof res === 'string' ? res : (res as unknown as { data: string }).data ?? '';
      const blob = new Blob([text as string], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `dekat-analytics-${start}-${end}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Laporan</h1><p className="mt-1 text-sm text-gray-500">Analisis performa bisnis • Advanced analytics</p></div>
          <div className="flex gap-2">
            <select value={granularity} onChange={(e) => setGranularity(e.target.value as never)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="day">Harian</option>
              <option value="week">Mingguan</option>
              <option value="month">Bulanan</option>
            </select>
            <button onClick={handleExportCsv} className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black">Export CSV</button>
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-xl bg-gray-100" />)}
            </div>
          </div>
        ) : report && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-medium text-gray-500">Total Booking</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{report.totalBookings}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-medium text-gray-500">Selesai</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{report.completedBookings}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-medium text-gray-500">Dibatalkan</p>
              <p className="mt-2 text-3xl font-bold text-red-600">{report.cancelledBookings}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-medium text-gray-500">Total Pendapatan</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{fmt(report.totalRevenue, report.currency)}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-sm font-medium text-gray-500">Rating Rata-rata</p>
              <p className="mt-2 text-3xl font-bold text-amber-500">{report.avgRating.toFixed(1)}</p>
            </div>
            {retention && (
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <p className="text-sm font-medium text-gray-500">Retention</p>
                <p className="mt-2 text-3xl font-bold text-primary-600">{retention.retentionPercent}%</p>
                <p className="mt-1 text-xs text-gray-500">{retention.returningCustomers} / {retention.totalCustomers} returning</p>
              </div>
            )}
          </div>
        )}

        {analyticsLoading ? (
          <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        ) : analytics ? (
          <>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Revenue by Day (AreaChart)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByDay} margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: unknown) => [fmt(Number(value) || 0, 'IDR'), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#6C63FF" fill="#6C63FF33" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-gray-400">Data analitik periode {start} — {end} ({granularity})</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Bookings by Status (BarChart)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6C63FF" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 className="mb-4 text-sm font-semibold text-gray-900">Funnel search→view→hold→confirm (Pie)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={funnelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}:${value}`}>
                        {funnelData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Top Services</h3>
                <table className="w-full text-sm">
                  <thead className="text-left text-xs text-gray-500"><tr><th className="py-2">Layanan</th><th>Bookings</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {topServices.map((s) => (
                      <tr key={s.serviceId} className="border-t">
                        <td className="py-2 font-medium">{s.serviceName}</td>
                        <td>{s.bookingCount}</td>
                        <td>{fmt(s.revenue)}</td>
                      </tr>
                    ))}
                    {topServices.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-400">Tidak ada data</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Staff Utilization (booking count per staff)</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={staffUtilization} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="staffName" type="category" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="bookingCount" fill="#10B981" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <table className="mt-4 w-full text-sm">
                  <thead className="text-left text-xs text-gray-500"><tr><th>Staff</th><th>Bookings</th></tr></thead>
                  <tbody>
                    {staffUtilization.map((s) => (
                      <tr key={s.staffId} className="border-t">
                        <td className="py-2">{s.staffName}</td>
                        <td>{s.bookingCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </ProviderLayout>
  );
}
