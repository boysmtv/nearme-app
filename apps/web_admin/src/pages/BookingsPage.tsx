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
    { key: 'code', label: 'Kode', render: (b: AdminBooking) => <span className="font-medium text-primary-600">{b.code}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (b: AdminBooking) => <span className="text-gray-900">{b.customerName}</span> },
    { key: 'providerName', label: 'Provider', render: (b: AdminBooking) => <span className="text-gray-700">{b.providerName}</span> },
    { key: 'serviceName', label: 'Layanan', render: (b: AdminBooking) => <span className="text-gray-700">{b.serviceName}</span> },
    { key: 'startTime', label: 'Waktu', render: (b: AdminBooking) => <span className="text-gray-500">{new Date(b.startTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</span> },
    { key: 'status', label: 'Status', render: (b: AdminBooking) => <StatusBadge status={b.status} /> },
    { key: 'totalAmount', label: 'Total', render: (b: AdminBooking) => <span className="font-medium text-gray-900">{fmt(b.totalAmount)}</span> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Bookings</h1><p className="mt-1 text-sm text-gray-500">Semua booking di platform</p></div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Semua Status</option>
          {['CONFIRMED','PENDING_PAYMENT','PENDING_APPROVAL','COMPLETED','CANCELLED','NO_SHOW'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <DataTable columns={columns} data={res?.data ?? []} pagination={res?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada booking" />
      </div>
    </AdminLayout>
  );
}
