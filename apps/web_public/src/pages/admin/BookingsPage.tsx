import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import type { AdminBooking } from '../../lib/types';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }

export default function BookingsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'bookings', page, status], queryFn: () => adminApi.bookings.list({ page, limit: 20, status }) });
  const handleExport = async () => { setExporting(true); try { const response = await adminApi.export.bookings('csv'); downloadBlob(response as unknown as Blob, 'bookings.csv'); } catch (e) { console.error('Export failed:', e); } finally { setExporting(false); } };

  const columns = [
    { key: 'code', label: 'Kode', render: (b: AdminBooking) => <span className="font-medium text-primary-600">{b.code}</span> },
    { key: 'customerName', label: 'Pelanggan', render: (b: AdminBooking) => <span className="text-gray-900">{b.customerName}</span> },
    { key: 'providerName', label: 'Provider', render: (b: AdminBooking) => <span className="text-gray-700">{b.providerName}</span> },
    { key: 'serviceName', label: 'Layanan', render: (b: AdminBooking) => <span className="text-gray-700">{b.serviceName}</span> },
    { key: 'startTime', label: 'Waktu', render: (b: AdminBooking) => <span className="text-gray-500">{new Date(b.startTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })}</span> },
    { key: 'status', label: 'Status', render: (b: AdminBooking) => <StatusBadge status={b.status} /> },
    { key: 'totalAmount', label: 'Total', render: (b: AdminBooking) => <span className="font-medium text-gray-900">{fmt(b.totalAmount)}</span> },
  ];

  return (<AdminLayout><div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900">Bookings</h1><p className="mt-1 text-sm text-gray-500">Semua booking di platform</p></div><div className="flex items-center gap-4"><select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm"><option value="">Semua Status</option>{['CONFIRMED','PENDING_PAYMENT','PENDING_APPROVAL','COMPLETED','CANCELLED','NO_SHOW'].map((s) => <option key={s} value={s}>{s}</option>)}</select><button onClick={handleExport} disabled={exporting} className="ml-auto inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{exporting ? 'Mengekspor...' : 'Export CSV'}</button></div><DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada booking" /></div></AdminLayout>);
}
