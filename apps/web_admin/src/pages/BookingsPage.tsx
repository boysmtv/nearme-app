import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import type { AdminBooking } from '../lib/types';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function BookingsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'bookings', page, status],
    queryFn: () => adminApi.bookings.list({ page, limit: 20, status }),
  });

  const columns = [
    { key: 'code', label: 'Kode', render: (b: AdminBooking) => <span className="inline-flex items-center rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">{b.code}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (b: AdminBooking) => <div className="flex items-center gap-2"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-soft-violet text-[11px] font-bold text-primary-700">{b.customerName[0]}</span><span className="text-sm font-semibold text-gray-900">{b.customerName}</span></div> },
    { key: 'providerName', label: 'Provider', render: (b: AdminBooking) => <span className="text-sm font-medium text-gray-700">{b.providerName}</span> },
    { key: 'serviceName', label: 'Layanan', render: (b: AdminBooking) => <span className="inline-flex rounded-full bg-soft-lavender px-2 py-1 text-xs font-semibold text-violet-700">{b.serviceName}</span> },
    { key: 'startTime', label: 'Waktu', render: (b: AdminBooking) => <span className="inline-flex items-center gap-1 text-sm text-gray-600"><svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{new Date(b.startTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</span> },
    { key: 'status', label: 'Status', render: (b: AdminBooking) => <StatusBadge status={b.status} /> },
    { key: 'totalAmount', label: 'Total', render: (b: AdminBooking) => <span className="text-sm font-bold text-gray-900">{fmt(b.totalAmount)}</span> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-400 to-fuchsia-400 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Bookings</h1><p className="mt-1 text-sm font-medium text-gray-500">Semua booking di platform</p></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
            <span className="pl-3 text-xs font-bold uppercase tracking-widest text-gray-500">Filter:</span>
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg bg-soft-violet px-3 py-2 text-sm font-semibold text-primary-700 focus:outline-none">
              <option value="">Semua Status</option>
              {['CONFIRMED','PENDING_PAYMENT','PENDING_APPROVAL','COMPLETED','CANCELLED','NO_SHOW'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center rounded-full bg-soft-violet px-3 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100">{res?.data?.pagination.total ?? 0} booking</span>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada booking" />
      </div>
    </AdminLayout>
  );
}
