import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';

export default function StaffPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ['staff'], queryFn: () => providerApi.staff.list() });
  const staff = res?.data ?? [];

  const inviteMut = useMutation({
    mutationFn: () => providerApi.staff.invite({ displayName: inviteName, email: inviteEmail }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); setShowInvite(false); setInviteEmail(''); setInviteName(''); },
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => providerApi.staff.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['staff'] }),
  });

  const renameMut = useMutation({
    mutationFn: ({ id, displayName }: { id: string; displayName: string }) =>
      providerApi.staff.update(id, { displayName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['staff'] }); setEditingId(null); },
  });

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Staf</h1><p className="mt-1 text-sm text-gray-500">Kelola staf dan jadwal kerja</p></div>
          <button onClick={() => setShowInvite(true)} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">+ Undang Staf</button>
        </div>

        {isLoading ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm"><div className="h-12 w-12 rounded-full bg-gray-100" /></div>)}</div>
        : staff.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><h3 className="text-lg font-semibold text-gray-900">Belum ada staf</h3><p className="mt-2 text-gray-500">Undang staf pertama Anda</p></div>
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600">
                  {s.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{s.displayName}</h3>
                  <p className="text-xs text-gray-500 truncate">{s.title || s.email || 'Staf'}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
              {editingId === s.id ? (
                <form onSubmit={(e) => { e.preventDefault(); if (editName.trim()) renameMut.mutate({ id: s.id, displayName: editName.trim() }); }} className="mt-4 flex gap-2">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none" />
                  <button type="submit" disabled={renameMut.isPending} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50">Simpan</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Batal</button>
                </form>
              ) : (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => { setEditingId(s.id); setEditName(s.displayName); }} className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Edit</button>
                  {s.isActive && (
                    <button onClick={() => { if (confirm('Nonaktifkan staf ini?')) deactivateMut.mutate(s.id); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Nonaktifkan</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Undang Staf Baru</h2>
            <form onSubmit={(e) => { e.preventDefault(); inviteMut.mutate(); }} className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Nama</label><input value={inviteName} onChange={(e) => setInviteName(e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
              <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowInvite(false)} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Batal</button><button type="submit" disabled={inviteMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">Kirim Undangan</button></div>
            </form>
          </div>
        </div>
      )}
    </ProviderLayout>
  );
}
