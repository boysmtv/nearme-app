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
    { key: 'name', label: 'Tenant', render: (t: Tenant) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-400 text-xs font-bold text-white shadow-sm">{t.name[0]}</span><div><p className="font-semibold text-gray-900">{t.name}</p><p className="text-xs font-medium text-gray-500 bg-soft-mint inline-flex px-1.5 py-0.5 rounded-full">{t.category}</p></div></div> },
    { key: 'ownerName', label: 'Owner', render: (t: Tenant) => <span className="text-sm font-medium text-gray-700">{t.ownerName}</span> },
    { key: 'status', label: 'Status', render: (t: Tenant) => <StatusBadge status={t.status} /> },
    { key: 'totalBookings', label: 'Bookings', render: (t: Tenant) => <span className="inline-flex items-center gap-1 rounded-full bg-soft-violet px-2.5 py-1 text-xs font-bold text-primary-700">{t.totalBookings} booking</span> },
    { key: 'totalRevenue', label: 'Revenue', render: (t: Tenant) => <span className="text-sm font-bold text-gray-900">{fmt(t.totalRevenue)}</span> },
    { key: 'actions', label: '', render: (t: Tenant) => (
      <div className="flex gap-1.5">
        {t.status === 'SUBMITTED' && <button onClick={() => approveMut.mutate(t.id)} className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-600 transition-colors">Approve</button>}
        {t.status === 'SUBMITTED' && <button onClick={() => setRejectId(t.id)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 transition-colors">Reject</button>}
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Tenants</h1><p className="mt-1 text-sm font-medium text-gray-500">Kelola provider dan verifikasi</p></div>
          <span className="ml-auto hidden sm:inline-flex items-center rounded-full bg-soft-mint px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">Verifikasi tenant</span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari tenant..." className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100" />
          </div>
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium focus:border-primary-300 focus:outline-none focus:ring-4 focus:ring-primary-100">
            <option value="">Semua Status</option><option value="SUBMITTED">Diajukan</option><option value="UNDER_REVIEW">Ditinjau</option><option value="APPROVED">Disetujui</option><option value="REJECTED">Ditolak</option><option value="SUSPENDED">Ditangguhkan</option>
          </select>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada tenant" />
      </div>
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Tolak Tenant</h2>
            <p className="text-sm text-gray-500">Berikan alasan penolakan dengan jelas</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Alasan penolakan..." className="mt-4 block w-full rounded-xl border border-gray-200 bg-soft-pink/30 px-4 py-3 text-sm focus:border-rose-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-rose-100" />
            <div className="mt-5 flex justify-end gap-3"><button onClick={() => setRejectId(null)} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Batal</button><button onClick={() => rejectMut.mutate()} disabled={!rejectReason} className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50 shadow-md">Tolak</button></div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
