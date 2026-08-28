import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';

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
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Staf</h1><p className="text-sm font-medium text-gray-500">Kelola staf dan jadwal kerja • {staff.length} anggota</p></div>
          </div>
          <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-200 hover:shadow-lg transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Undang Staf
          </button>
        </div>

        {isLoading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><div className="h-14 w-14 rounded-full bg-soft-violet" /></div>)}</div>
        : staff.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg"><svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 4.354a4 4 0 110 7.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></div><h3 className="mt-4 text-lg font-bold text-gray-900">Belum ada staf</h3><p className="mt-1 text-sm text-gray-500">Undang staf pertama Anda untuk mulai berkolaborasi ✨</p></div>
        : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s, idx) => {
            const grads = ['from-primary-500 to-violet-500', 'from-emerald-400 to-teal-400', 'from-sky-400 to-primary-400', 'from-amber-400 to-orange-400', 'from-fuchsia-400 to-pink-400'];
            const grad = grads[idx % grads.length]!;
            return (
            <div key={s.id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
              <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${grad}`} />
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-sm font-bold text-white shadow-md`}>
                  {s.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{s.displayName}</h3>
                  <p className="text-xs font-medium text-gray-500 truncate">{s.title || s.email || 'Staf'}</p>
                  <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${s.isActive ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-500 ring-gray-200'}`}><span className={`h-1.5 w-1.5 rounded-full ${s.isActive?'bg-emerald-500':'bg-gray-300'}`} />{s.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
              {editingId === s.id ? (
                <form onSubmit={(e) => { e.preventDefault(); if (editName.trim()) renameMut.mutate({ id: s.id, displayName: editName.trim() }); }} className="mt-5 flex gap-2">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="flex-1 rounded-xl border border-primary-200 bg-soft-violet/30 px-3 py-2 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100" />
                  <button type="submit" disabled={renameMut.isPending} className="rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-4 py-2 text-xs font-bold text-white shadow disabled:opacity-50">Simpan</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50">Batal</button>
                </form>
              ) : (
                <div className="mt-5 flex gap-2">
                  <button onClick={() => { setEditingId(s.id); setEditName(s.displayName); }} className="flex-1 rounded-xl bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-soft-violet hover:text-primary-700 hover:ring-primary-200 transition-colors">Edit</button>
                  {s.isActive && (
                    <button onClick={() => { if (confirm('Nonaktifkan staf ini?')) deactivateMut.mutate(s.id); }} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 transition-colors">Nonaktifkan</button>
                  )}
                </div>
              )}
            </div>
          )})}
        </div>}
      </div>

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-100">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div><h2 className="text-lg font-bold text-gray-900">Undang Staf Baru</h2></div>
            <p className="mt-1 text-sm text-gray-500">Kirim undangan via email untuk bergabung sebagai staf</p>
            <form onSubmit={(e) => { e.preventDefault(); inviteMut.mutate(); }} className="mt-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700">Nama</label><input value={inviteName} onChange={(e) => setInviteName(e.target.value)} required placeholder="Nama lengkap" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-violet/20 px-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
              <div><label className="block text-sm font-semibold text-gray-700">Email</label><input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="staff@bisnis.com" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-violet/20 px-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
              <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowInvite(false)} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Batal</button><button type="submit" disabled={inviteMut.isPending} className="rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-primary-600 hover:to-violet-600 disabled:opacity-50">Kirim Undangan</button></div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
