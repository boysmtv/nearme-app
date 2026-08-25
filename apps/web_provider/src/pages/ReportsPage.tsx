import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

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
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Export CSV</button>
        </div>
        {isLoading ? <div className="animate-pulse space-y-4"><div className="h-48 rounded-xl bg-gray-100" /><div className="h-48 rounded-xl bg-gray-100" /></div>
        : report && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Booking per Hari</h3>
              <div className="mt-4 flex items-end gap-1 h-40">
                {report.bookingsOverTime.map((d, i) => { const max = Math.max(...report.bookingsOverTime.map((x) => x.count), 1); return <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-primary-500 rounded-t" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 4 : 0 }} /><span className="text-[10px] text-gray-400">{d.date.slice(5)}</span></div>; })}
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Pendapatan per Hari</h3>
              <div className="mt-4 flex items-end gap-1 h-40">
                {report.revenueOverTime.map((d, i) => { const max = Math.max(...report.revenueOverTime.map((x) => x.amount), 1); return <div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full bg-green-500 rounded-t" style={{ height: `${(d.amount / max) * 100}%`, minHeight: d.amount > 0 ? 4 : 0 }} /><span className="text-[10px] text-gray-400">{d.date.slice(5)}</span></div>; })}
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Utilisasi Staf</h3>
              <div className="mt-4 space-y-3">
                {report.staffUtilization.map((s) => (
                  <div key={s.staffId}>
                    <div className="flex justify-between text-sm"><span className="text-gray-700">{s.name}</span><span className="font-medium text-gray-900">{s.utilization}%</span></div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-primary-500" style={{ width: `${s.utilization}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Layanan Terlaris</h3>
              <div className="mt-4 space-y-3">
                {report.topServices.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                    <div><span className="text-sm font-medium text-gray-900">{s.name}</span><span className="ml-2 text-xs text-gray-500">{s.count} booking</span></div>
                    <span className="text-sm font-medium text-green-600">{fmt(s.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
