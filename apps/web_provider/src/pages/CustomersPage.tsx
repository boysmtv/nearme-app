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
  const customers = res?.data ?? [];
  const pagination = res?.pagination;

  return (
    <Layout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1><p className="mt-1 text-sm text-gray-500">Daftar pelanggan dan riwayat booking</p></div>
        <div className="flex gap-3">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama, email, atau telepon..." className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        </div>
        {isLoading ? <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm"><div className="h-5 w-1/3 rounded bg-gray-200" /></div>)}</div>
        : customers.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><p className="text-gray-500">Belum ada pelanggan</p></div>
        : <><div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Kontak</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Booking</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Total Belanja</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Terakhir</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">{c.name[0]}</div><span className="text-sm font-medium text-gray-900">{c.name}</span></div></td>
                  <td className="px-6 py-4"><div className="text-sm text-gray-700">{c.email}</div><div className="text-xs text-gray-500">{c.phone}</div></td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.totalBookings}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{fmt(c.totalSpent)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{c.lastBookingAt ? new Date(c.lastBookingAt).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          {pagination && pagination.totalPages > 1 && <div className="flex items-center justify-center gap-2">{Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => <button key={p} onClick={() => setPage(p)} className={`h-9 w-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>{p}</button>)}</div>}
        </>}
      </div>
    </Layout>
  );
}
