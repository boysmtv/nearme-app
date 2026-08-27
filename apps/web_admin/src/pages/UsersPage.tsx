import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/api';
import AdminLayout from '../components/AdminLayout';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import type { User } from '../lib/types';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: () => adminApi.users.list({ page, limit: 20, search }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.users.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  const columns = [
    { key: 'name', label: 'Nama', render: (u: User) => <div><p className="font-medium text-gray-900">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div> },
    { key: 'role', label: 'Role', render: (u: User) => <span className="capitalize text-gray-700">{u.role}</span> },
    { key: 'status', label: 'Status', render: (u: User) => <StatusBadge status={u.status} /> },
    { key: 'lastLoginAt', label: 'Login Terakhir', render: (u: User) => <span className="text-gray-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('id-ID') : '-'}</span> },
    { key: 'actions', label: '', render: (u: User) => (
      <div className="flex gap-2">
        {u.status === 'ACTIVE' && <button disabled={statusMut.isPending} onClick={() => statusMut.mutate({ id: u.id, status: 'SUSPENDED' })} className="text-xs text-red-600 hover:underline disabled:opacity-50">Suspend</button>}
        {u.status === 'SUSPENDED' && <button disabled={statusMut.isPending} onClick={() => statusMut.mutate({ id: u.id, status: 'ACTIVE' })} className="text-xs text-green-600 hover:underline disabled:opacity-50">Reactivate</button>}
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Users</h1><p className="mt-1 text-sm text-gray-500">Kelola pengguna platform</p></div>
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama atau email..." className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada pengguna" />
      </div>
    </AdminLayout>
  );
}
