import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';
import type { Settings, OperatingHour } from '../lib/types';

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

  if (isLoading) return <Layout><div className="animate-pulse space-y-4"><div className="h-48 rounded-xl bg-gray-100" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
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

          <div className="flex justify-end gap-3">
            <button type="submit" disabled={updateMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
              {updateMut.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
