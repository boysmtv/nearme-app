import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import type { Tenant } from '../lib/types';

function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function TenantsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'tenants', page, search, status],
    queryFn: () => adminApi.tenants.list({ page, limit: 20, search, status }),
  });

  const approveMut = useMutation({ mutationFn: (id: string) => adminApi.tenants.approve(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'tenants'] }) });
  const rejectMut = useMutation({ mutationFn: () => adminApi.tenants.reject(rejectId!, rejectReason), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'tenants'] }); setRejectId(null); setRejectReason(''); } });

  const columns = [
    { key: 'name', label: 'Nama', render: (t: Tenant) => <div><p className="font-medium text-gray-900">{t.name}</p><p className="text-xs text-gray-500">{t.category}</p></div> },
    { key: 'ownerName', label: 'Owner', render: (t: Tenant) => <span className="text-gray-700">{t.ownerName}</span> },
    { key: 'status', label: 'Status', render: (t: Tenant) => <StatusBadge status={t.status} /> },
    { key: 'totalBookings', label: 'Bookings', render: (t: Tenant) => <span className="text-gray-700">{t.totalBookings}</span> },
    { key: 'totalRevenue', label: 'Revenue', render: (t: Tenant) => <span className="text-gray-700">{fmt(t.totalRevenue)}</span> },
    { key: 'actions', label: '', render: (t: Tenant) => (
      <div className="flex gap-2">
        {t.status === 'SUBMITTED' && <button onClick={() => approveMut.mutate(t.id)} className="text-xs text-green-600 hover:underline">Approve</button>}
        {t.status === 'SUBMITTED' && <button onClick={() => setRejectId(t.id)} className="text-xs text-red-600 hover:underline">Reject</button>}
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Tenants</h1><p className="mt-1 text-sm text-gray-500">Kelola provider dan verifikasi</p></div>
        <div className="flex gap-3">
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari tenant..." className="flex-1 max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none">
            <option value="">Semua Status</option><option value="SUBMITTED">Diajukan</option><option value="UNDER_REVIEW">Ditinjau</option><option value="APPROVED">Disetujui</option><option value="REJECTED">Ditolak</option><option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada tenant" />
      </div>
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Tolak Tenant</h2>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Alasan penolakan..." className="mt-4 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
            <div className="mt-4 flex justify-end gap-3"><button onClick={() => setRejectId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Batal</button><button onClick={() => rejectMut.mutate()} disabled={!rejectReason} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">Tolak</button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
