import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/admin/StatusBadge';
import type { User } from '../../lib/types';

function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); }

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ['admin', 'users', page, search], queryFn: () => adminApi.users.list({ page, limit: 20, search }) });
  const statusMut = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.users.updateStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }) });
  const handleExport = async () => { setExporting(true); try { const response = await adminApi.export.users('csv'); downloadBlob(response as unknown as Blob, 'users.csv'); } catch (e) { console.error('Export failed:', e); } finally { setExporting(false); } };

  const columns = [
    { key: 'name', label: 'Nama', render: (u: User) => <div><p className="font-medium text-gray-900">{u.name}</p><p className="text-[13px] text-gray-500">{u.email}</p></div> },
    { key: 'role', label: 'Role', render: (u: User) => <span className="capitalize text-gray-700">{u.role}</span> },
    { key: 'status', label: 'Status', render: (u: User) => <StatusBadge status={u.status} /> },
    { key: 'lastLoginAt', label: 'Login Terakhir', render: (u: User) => <span className="text-gray-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('id-ID') : '-'}</span> },
    { key: 'actions', label: '', render: (u: User) => (<div className="flex gap-2">{u.status === 'ACTIVE' && <button disabled={statusMut.isPending} onClick={() => statusMut.mutate({ id: u.id, status: 'SUSPENDED' })} className="text-sm px-2 py-1 text-red-600 hover:underline disabled:opacity-50">Suspend</button>}{u.status === 'SUSPENDED' && <button disabled={statusMut.isPending} onClick={() => statusMut.mutate({ id: u.id, status: 'ACTIVE' })} className="text-sm px-2 py-1 text-green-600 hover:underline disabled:opacity-50">Reactivate</button>}</div>) },
  ];

  return (<AdminLayout><div className="space-y-6"><div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="mt-1 text-sm text-gray-500">Kelola pengguna platform</p></div><div className="flex items-center justify-between"><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama atau email..." className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" /><button onClick={handleExport} disabled={exporting} className="ml-4 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>{exporting ? 'Mengekspor...' : 'Export CSV'}</button></div><DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada pengguna" /></div></AdminLayout>);
}
