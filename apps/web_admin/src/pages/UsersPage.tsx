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
    { key: 'name', label: 'Pengguna', render: (u: User) => <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-xs font-bold text-white shadow-sm">{u.name[0]}</span><div><p className="font-semibold text-gray-900">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></div></div> },
    { key: 'role', label: 'Role', render: (u: User) => <span className="inline-flex items-center rounded-full bg-soft-violet px-2.5 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100 capitalize">{u.role.replace('ROLE_','').toLowerCase()}</span> },
    { key: 'status', label: 'Status', render: (u: User) => <StatusBadge status={u.status} /> },
    { key: 'lastLoginAt', label: 'Login Terakhir', render: (u: User) => <span className="inline-flex items-center gap-1.5 text-sm text-gray-600"><svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('id-ID') : '-'}</span> },
    { key: 'actions', label: '', render: (u: User) => (
      <div className="flex gap-1.5">
        {u.status === 'ACTIVE' && <button disabled={statusMut.isPending} onClick={() => statusMut.mutate({ id: u.id, status: 'SUSPENDED' })} className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-colors">Suspend</button>}
        {u.status === 'SUSPENDED' && <button disabled={statusMut.isPending} onClick={() => statusMut.mutate({ id: u.id, status: 'ACTIVE' })} className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors">Aktifkan</button>}
      </div>
    )},
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-primary-500 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Users</h1><p className="mt-1 text-sm font-medium text-gray-500">Kelola pengguna platform • {res?.data?.pagination.total ?? 0} total</p></div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-sky px-3 py-1.5 text-xs font-bold text-sky-700 ring-1 ring-sky-200"><span className="h-2 w-2 rounded-full bg-sky-500"/>Manajemen User</span>
        </div>
        <div className="rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-gray-100 flex gap-2">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Cari nama atau email..." className="w-full rounded-xl border-0 bg-soft-violet/40 py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-primary-200 focus:outline-none transition-all" />
          </div>
        </div>
        <DataTable columns={columns} data={res?.data?.data ?? []} pagination={res?.data?.pagination} onPageChange={setPage} isLoading={isLoading} emptyMessage="Tidak ada pengguna" />
      </div>
    </AdminLayout>
  );
}
