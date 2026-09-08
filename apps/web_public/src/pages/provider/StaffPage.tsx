import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import type { StaffSchedule } from '../../lib/types';

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

  const [scheduleFor, setScheduleFor] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<StaffSchedule[]>([
    { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isOff: false },
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isOff: false },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isOff: false },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isOff: false },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isOff: false },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isOff: false },
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isOff: true },
  ]);
  const scheduleMut = useMutation({
    mutationFn: () => providerApi.staff.updateSchedule(scheduleFor!, schedule),
    onSuccess: () => { setScheduleFor(null); },
  });
  const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

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
                  <p className="text-[13px] text-gray-500 truncate">{s.title || s.email || 'Staf'}</p>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[13px] font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
              {editingId === s.id ? (
                <form onSubmit={(e) => { e.preventDefault(); if (editName.trim()) renameMut.mutate({ id: s.id, displayName: editName.trim() }); }} className="mt-4 flex gap-2">
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none h-9" />
                  <button type="submit" disabled={renameMut.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">Simpan</button>
                  <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Batal</button>
                </form>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => { setEditingId(s.id); setEditName(s.displayName); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Edit</button>
                  <button onClick={() => setScheduleFor(s.id)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Jadwal</button>
                  {s.isActive && (
                    <button onClick={() => { if (confirm('Nonaktifkan staf ini?')) deactivateMut.mutate(s.id); }} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">Nonaktifkan</button>
                  )}
                </div>
              )}
              {scheduleFor === s.id && (
                <div className="mt-4 rounded-lg border border-gray-200 p-3">
                  <h4 className="text-sm font-semibold text-gray-900">Atur Jadwal Staf</h4>
                  <div className="mt-2 space-y-2">
                    {schedule.map((sc, idx) => (
                      <div key={sc.dayOfWeek} className="flex items-center gap-2 text-[13px]">
                        <span className="w-16 font-medium text-gray-700">{dayNames[sc.dayOfWeek]}</span>
                        <label className="flex items-center gap-1"><input type="checkbox" checked={!sc.isOff} onChange={(e) => setSchedule(prev => prev.map((p,i)=> i===idx ? {...p, isOff: !e.target.checked} : p))} className="rounded border-gray-300" /> Buka</label>
                        {!sc.isOff && (<><input type="time" value={sc.startTime} onChange={(e)=> setSchedule(prev=> prev.map((p,i)=> i===idx ? {...p, startTime: e.target.value} :p))} className="rounded border border-gray-300 px-3 py-2 text-sm h-9" /><span>-</span><input type="time" value={sc.endTime} onChange={(e)=> setSchedule(prev=> prev.map((p,i)=> i===idx ? {...p, endTime: e.target.value} :p))} className="rounded border border-gray-300 px-3 py-2 text-sm h-9" /></>)}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => scheduleMut.mutate()} disabled={scheduleMut.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{scheduleMut.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}</button>
                    <button onClick={() => setScheduleFor(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Tutup</button>
                  </div>
                  {scheduleMut.isSuccess && <p className="mt-2 text-sm text-green-600">Jadwal tersimpan</p>}
                  {scheduleMut.isError && <p className="mt-2 text-sm text-red-600">{(scheduleMut.error as Error).message}</p>}
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
