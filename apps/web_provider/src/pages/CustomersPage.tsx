import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data: res, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => providerApi.customers.list({ page, limit: 20, search }),
  });
  const customers = res?.data?.data ?? [];
  const pagination = res?.data?.pagination;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-pink-400 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Pelanggan</h1><p className="text-sm font-medium text-gray-500">Daftar pelanggan dan riwayat booking • {pagination?.total ?? 0} pelanggan</p></div>
        </div>
        <div className="rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100 flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama, email, atau telepon..." className="w-full rounded-xl border-0 bg-soft-pink/40 py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-pink-200 focus:outline-none transition-all" />
          </div>
        </div>
        {isLoading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"><div className="h-5 w-1/3 rounded bg-soft-pink" /></div>)}</div>
        : customers.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-pink"><svg className="h-7 w-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div><p className="mt-4 font-semibold text-gray-700">Belum ada pelanggan</p><p className="text-sm text-gray-400">Pelanggan yang booking akan tampil di sini</p></div>
        : <><div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gradient-to-r from-soft-pink/50 via-white to-soft-violet/30"><tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Nama</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Kontak</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Booking</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Total Belanja</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Terakhir</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((c, idx) => {
                const grads = ['from-primary-500 to-violet-500','from-emerald-400 to-teal-400','from-fuchsia-400 to-pink-400','from-amber-400 to-orange-400'];
                const grad = grads[idx % grads.length];
                return (
                <tr key={c.id} className="hover:bg-gradient-to-r hover:from-soft-pink/20 hover:to-soft-violet/20 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-xs font-bold text-white shadow-sm`}>{c.name[0]}</div><span className="text-sm font-semibold text-gray-900">{c.name}</span></div></td>
                  <td className="px-6 py-4"><div className="text-sm font-medium text-gray-700">{c.email}</div><div className="text-xs text-gray-500">{c.phone}</div></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center rounded-full bg-soft-violet px-2.5 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100">{c.totalBookings} kali</span></td>
                  <td className="px-6 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-soft-peach px-2.5 py-1 text-xs font-bold text-amber-700">{fmt(c.totalSpent)}</span></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">{c.lastBookingAt ? new Date(c.lastBookingAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : <span className="text-gray-400">—</span>}</td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
          {pagination && pagination.totalPages > 1 && <div className="flex items-center justify-center gap-2">{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-xl text-sm font-bold transition-all ${p === page ? 'bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-md' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-soft-violet hover:text-primary-700'}`}>{p}</button>)}</div>}
        </>}
      </div>
    </Layout>
  );
}
