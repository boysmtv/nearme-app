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
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-400 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Laporan</h1><p className="text-sm font-medium text-gray-500">Analisis performa bisnis • Periode {start} — {end}</p></div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-soft-lavender px-3 py-1.5 text-xs font-bold text-violet-700 ring-1 ring-violet-200"><span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse"/> Live report</span>
        </div>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white ring-1 ring-gray-100" />)}
            </div>
          </div>
        ) : report && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 p-[1px] shadow-sm hover:shadow-lg transition-all">
              <div className="rounded-[15px] bg-white p-6">
                <div className="flex items-center justify-between"><p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Booking</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft-violet text-primary-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></span></div>
                <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">{report.totalBookings}</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-soft-violet"><div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-violet-500" style={{width: '70%'}}/></div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between"><p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Selesai</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft-mint text-emerald-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span></div>
              <p className="mt-3 text-3xl font-bold text-emerald-600">{report.completedBookings}</p>
              <p className="mt-1 text-xs font-medium text-emerald-600/70">Tingkat penyelesaian tinggi</p>
              <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400" />
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between"><p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Dibatalkan</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft-pink text-rose-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></span></div>
              <p className="mt-3 text-3xl font-bold text-rose-600">{report.cancelledBookings}</p>
              <p className="mt-1 text-xs font-medium text-rose-600/70">Perlu perhatian</p>
              <div className="mt-3 h-1 w-12 rounded-full bg-gradient-to-r from-rose-400 to-pink-400" />
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-6 text-white shadow-md hover:shadow-lg transition-all lg:col-span-2">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
              <p className="relative text-sm font-bold text-white/80 uppercase tracking-widest">Total Pendapatan</p>
              <p className="relative mt-3 text-3xl font-bold tracking-tight">{fmt(report.totalRevenue, report.currency)}</p>
              <p className="relative mt-1 text-sm font-medium text-white/80">Periode berjalan • {report.currency}</p>
              <div className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">💰 Pendapatan kotor</div>
            </div>
            <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between"><p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Rating</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-soft-peach text-amber-600"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg></span></div>
              <p className="mt-3 text-3xl font-bold text-amber-500 flex items-baseline gap-1">{report.avgRating.toFixed(1)} <span className="text-sm text-gray-400 font-medium">/ 5.0</span></p>
              <div className="mt-3 flex gap-1">{Array.from({length:5}).map((_,i)=> <span key={i} className={`h-1.5 flex-1 rounded-full ${i < Math.round(report.avgRating) ? 'bg-amber-400' : 'bg-gray-100'}`} />)}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
