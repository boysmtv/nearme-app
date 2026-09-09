import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import type { Settings, OperatingHour } from '../../lib/types';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SettingsPage() {
  const qc = useQueryClient();
  const [hours, setHours] = useState<OperatingHour[]>([]);
  const { data: res, isLoading } = useQuery({ queryKey: ['settings'], queryFn: () => providerApi.settings.get() });
  const settings = res?.data;
  const { register, handleSubmit, reset } = useForm<Settings>();

  useEffect(() => {
    if (settings) {
      reset(settings);
      setHours(settings.operatingHours ?? []);
    }
  }, [settings, reset]);

  const updateHour = (idx: number, patch: Partial<OperatingHour>) =>
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, ...patch } : h)));

  const updateMut = useMutation({
    mutationFn: (data: Partial<Settings>) => providerApi.settings.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });

  if (isLoading) return <ProviderLayout><div className="animate-pulse space-y-4"><div className="h-48 rounded-xl bg-gray-100" /></div></ProviderLayout>;

  return (
    <ProviderLayout>
      <div className="space-y-6 max-w-screen-2xl mx-auto">
        <div><h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1><p className="mt-1 text-sm text-gray-500">Kelola profil bisnis dan preferensi</p></div>

        <form onSubmit={handleSubmit((d) => updateMut.mutate({ ...d, operatingHours: hours }))} className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Profil Bisnis</h2>
            <div className="mt-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Nama Bisnis</label><input {...register('businessName')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Deskripsi</label><textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Telepon</label><input {...register('phone')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Email</label><input {...register('email')} type="email" className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700">Alamat</label><input {...register('address')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Jam Operasional</h2>
            <div className="mt-4 space-y-3">
              {hours.map((hour, idx) => (
                <div key={hour.dayOfWeek} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium text-gray-700">{dayNames[hour.dayOfWeek]}</span>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={!hour.isClosed} onChange={(e) => updateHour(idx, { isClosed: !e.target.checked })} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-500">{hour.isClosed ? 'Tutup' : 'Buka'}</span></label>
                  {!hour.isClosed && (<><input type="time" value={hour.open} onChange={(e) => updateHour(idx, { open: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /><span className="text-gray-400">-</span><input type="time" value={hour.close} onChange={(e) => updateHour(idx, { close: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" /></>)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Kebijakan Booking</h2>
            <div className="mt-4 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Kebijakan Pembatalan</label><textarea {...register('cancellationPolicy')} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2"><input type="checkbox" {...register('autoConfirm')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-700">Konfirmasi otomatis</span></label>
                <label className="flex items-center gap-2"><input type="checkbox" {...register('depositRequired')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-700">Wajib deposit</span></label>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Notifikasi</h2>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3"><input type="checkbox" {...register('notifications.emailBookingConfirmation')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-700">Email konfirmasi booking</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" {...register('notifications.emailBookingReminder')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-700">Email pengingat booking</span></label>
              <label className="flex items-center gap-3"><input type="checkbox" {...register('notifications.smsBookingReminder')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm text-gray-700">SMS pengingat booking</span></label>
            </div>
          </div>

          <BlockedDatesSection />

          <div className="flex justify-end gap-3">
            <button type="submit" disabled={updateMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
              {updateMut.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </ProviderLayout>
  );
}

function BlockedDatesSection() {
  const qc = useQueryClient();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const { data: res, isLoading } = useQuery({ queryKey: ['blockedDates'], queryFn: () => providerApi.blockedDates.list() });
  const blocked = (res as unknown as { data?: { date: string; reason?: string }[] })?.data ?? [];
  const addMut = useMutation({
    mutationFn: () => providerApi.blockedDates.add({ date, reason: reason || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['blockedDates'] }); setDate(''); setReason(''); },
  });
  const delMut = useMutation({
    mutationFn: (d: string) => providerApi.blockedDates.remove(d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['blockedDates'] }),
  });
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <h2 className="text-lg font-semibold text-gray-900">Tanggal Blokir</h2>
      <p className="mt-1 text-sm text-gray-500">Tutup booking pada tanggal tertentu (libur, cuti, maintenance)</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Alasan (opsional)" className="flex-1 min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none" />
        <button type="button" onClick={() => date && addMut.mutate()} disabled={!date || addMut.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{addMut.isPending ? 'Menambah...' : '+ Blokir'}</button>
      </div>
      {(addMut.isError || delMut.isError) && <p className="mt-2 text-sm text-red-600">Gagal memperbarui tanggal blokir</p>}
      {addMut.isSuccess && <p className="mt-2 text-sm text-green-600">Berhasil menambah tanggal blokir</p>}
      <div className="mt-4">
        {isLoading ? <p className="text-sm text-gray-400">Memuat...</p> : blocked.length === 0 ? <p className="text-sm text-gray-500">Belum ada tanggal diblokir</p> : (
          <ul className="space-y-2">
            {blocked.map((b) => (
              <li key={b.date} className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2">
                <div><span className="text-sm font-medium text-gray-900">{b.date}</span>{b.reason && <span className="ml-2 text-xs text-gray-500">— {b.reason}</span>}</div>
                <button type="button" onClick={() => delMut.mutate(b.date)} disabled={delMut.isPending} className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50">Hapus</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
