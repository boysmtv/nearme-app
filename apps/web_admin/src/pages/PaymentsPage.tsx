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
    { key: 'bookingCode', label: 'Booking', render: (p: Payment) => <span className="font-medium text-primary-600">{p.bookingCode}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (p: Payment) => <span className="text-gray-900">{p.customerName}</span> },
    { key: 'providerName', label: 'Provider', render: (p: Payment) => <span className="text-gray-700">{p.providerName}</span> },
    { key: 'amount', label: 'Jumlah', render: (p: Payment) => <span className="font-medium text-gray-900">{fmt(p.amount)}</span> },
    { key: 'method', label: 'Metode', render: (p: Payment) => <span className="text-gray-700 capitalize">{p.method}</span> },
    { key: 'status', label: 'Status', render: (p: Payment) => <StatusBadge status={p.status} /> },
    { key: 'createdAt', label: 'Tanggal', render: (p: Payment) => <span className="text-gray-500">{new Date(p.createdAt).toLocaleDateString('id-ID')}</span> },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Payments</h1><p className="mt-1 text-sm text-gray-500">Rekonsiliasi dan status pembayaran</p></div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
          <option value="">Semua Status</option>
          {['PENDING','PAID','FAILED','REFUNDED','EXPIRED','CANCELLED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada pembayaran" />
      </div>
    </AdminLayout>
  );
}
