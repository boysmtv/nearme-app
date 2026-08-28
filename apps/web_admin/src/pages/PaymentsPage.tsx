import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import type { Payment } from '../lib/types';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function PaymentsPage() {
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'payments', page, filterStatus],
    queryFn: () => adminApi.payments.list({ page, limit: 20, status: filterStatus }),
  });

  const columns = [
    { key: 'bookingCode', label: 'Booking', render: (p: Payment) => <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-xs font-bold text-primary-600 ring-1 ring-primary-100 shadow-sm">{p.bookingCode}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (p: Payment) => <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft-mint text-[11px] font-bold text-emerald-700">{p.customerName[0]}</span><span className="text-sm font-semibold text-gray-900">{p.customerName}</span></div> },
    { key: 'providerName', label: 'Provider', render: (p: Payment) => <span className="text-sm font-medium text-gray-600">{p.providerName}</span> },
    { key: 'amount', label: 'Jumlah', render: (p: Payment) => <span className="inline-flex items-center gap-1 text-sm font-bold text-gray-900"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-soft-peach text-amber-600"><svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg></span>{fmt(p.amount)}</span> },
    { key: 'method', label: 'Metode', render: (p: Payment) => <span className="inline-flex rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 capitalize">{p.method}</span> },
    { key: 'status', label: 'Status', render: (p: Payment) => <StatusBadge status={p.status} /> },
    { key: 'createdAt', label: 'Tanggal', render: (p: Payment) => <span className="text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Payments</h1><p className="mt-1 text-sm font-medium text-gray-500">Rekonsiliasi dan status pembayaran</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
            <span className="pl-3 text-xs font-bold uppercase tracking-widest text-gray-500">Status:</span>
            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="rounded-lg bg-soft-mint px-3 py-2 text-sm font-semibold text-emerald-700 focus:outline-none">
              <option value="">Semua Status</option>
              {['PENDING','PAID','FAILED','REFUNDED','EXPIRED','CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="ml-auto hidden sm:inline-flex rounded-full bg-soft-mint px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">{res?.data?.pagination.total ?? 0} transaksi</span>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada pembayaran" />
      </div>
    </AdminLayout>
  );
}
