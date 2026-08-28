import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';

function fmt(n: number, currency = 'IDR') {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency, minimumFractionDigits: 0 }).format(n);
}

export default function ReportsPage() {
  const [start] = useState<string>(() => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] ?? ''; });
  const [end] = useState<string>(() => new Date().toISOString().split('T')[0] ?? '');
  const { data: res, isLoading } = useQuery({
    queryKey: ['reports', start, end],
    queryFn: () => providerApi.reports.getReport({ startDate: start ?? '', endDate: end ?? '' }),
  });
  const report = res?.data;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Laporan</h1><p className="mt-1 text-sm text-gray-500">Analisis performa bisnis</p></div>
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
          </div>
        )}
      </div>
    </Layout>
  );
}
