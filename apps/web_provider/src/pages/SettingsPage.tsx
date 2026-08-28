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

  if (isLoading) return <Layout><div className="animate-pulse space-y-4"><div className="h-48 rounded-2xl bg-white ring-1 ring-gray-100" /></div></Layout>;

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Pengaturan</h1><p className="text-sm font-medium text-gray-500">Kelola profil bisnis dan preferensi</p></div>
        </div>

        <form onSubmit={handleSubmit((d) => updateMut.mutate({ ...d, operatingHours: hours }))} className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-violet text-primary-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg></span>Profil Bisnis</h2>
            <div className="mt-5 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700">Nama Bisnis</label><input {...register('businessName')} placeholder="Nama bisnis Anda" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-violet/20 px-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all" /></div>
              <div><label className="block text-sm font-semibold text-gray-700">Deskripsi</label><textarea {...register('description')} rows={3} placeholder="Ceritakan tentang bisnis Anda..." className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-violet/20 px-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700">Telepon</label><input {...register('phone')} placeholder="08xx" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
                <div><label className="block text-sm font-semibold text-gray-700">Email</label><input {...register('email')} type="email" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-gray-700">Alamat</label><input {...register('address')} placeholder="Alamat lengkap" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-mint text-emerald-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span>Jam Operasional</h2>
            <div className="mt-5 space-y-2">
              {hours.map((hour, idx) => (
                <div key={hour.dayOfWeek} className={`flex flex-wrap items-center gap-3 rounded-xl p-3 transition-colors ${hour.isClosed ? 'bg-gray-50' : 'bg-soft-violet/30 ring-1 ring-primary-100'}`}>
                  <span className={`w-24 text-sm font-bold ${hour.isClosed ? 'text-gray-400' : 'text-gray-800'}`}>{dayNames[hour.dayOfWeek]}</span>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={!hour.isClosed} onChange={(e) => updateHour(idx, { isClosed: !e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className={`text-sm font-semibold px-2.5 py-1 rounded-full ${hour.isClosed ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>{hour.isClosed ? 'Tutup' : 'Buka'}</span></label>
                  {!hour.isClosed && (<><input type="time" value={hour.open} onChange={(e) => updateHour(idx, { open: e.target.value })} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-primary-300 focus:outline-none" /><span className="text-gray-400 font-bold">—</span><input type="time" value={hour.close} onChange={(e) => updateHour(idx, { close: e.target.value })} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-primary-300 focus:outline-none" /></>)}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-peach text-amber-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></span>Kebijakan Booking</h2>
            <div className="mt-5 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700">Kebijakan Pembatalan</label><textarea {...register('cancellationPolicy')} rows={3} placeholder="Jelaskan kebijakan pembatalan..." className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-peach/20 px-4 py-3 text-sm focus:border-amber-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-100" /></div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2.5 rounded-xl bg-soft-violet px-4 py-2.5 cursor-pointer hover:bg-primary-50 transition-colors"><input type="checkbox" {...register('autoConfirm')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm font-semibold text-gray-700">Konfirmasi otomatis</span></label>
                <label className="flex items-center gap-2.5 rounded-xl bg-soft-pink px-4 py-2.5 cursor-pointer hover:bg-pink-50 transition-colors"><input type="checkbox" {...register('depositRequired')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm font-semibold text-gray-700">Wajib deposit</span></label>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-soft-sky text-sky-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></span>Notifikasi</h2>
            <div className="mt-5 space-y-3">
              <label className="flex items-center gap-3 rounded-xl bg-soft-sky/50 px-4 py-3 cursor-pointer hover:bg-sky-50 transition-colors"><input type="checkbox" {...register('notifications.emailBookingConfirmation')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm font-medium text-gray-700">Email konfirmasi booking</span></label>
              <label className="flex items-center gap-3 rounded-xl bg-soft-sky/50 px-4 py-3 cursor-pointer hover:bg-sky-50 transition-colors"><input type="checkbox" {...register('notifications.emailBookingReminder')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm font-medium text-gray-700">Email pengingat booking</span></label>
              <label className="flex items-center gap-3 rounded-xl bg-soft-mint/50 px-4 py-3 cursor-pointer hover:bg-emerald-50 transition-colors"><input type="checkbox" {...register('notifications.smsBookingReminder')} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" /><span className="text-sm font-medium text-gray-700">SMS pengingat booking</span></label>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={updateMut.isPending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-8 py-3 text-sm font-bold text-white shadow-md shadow-primary-200 hover:from-primary-600 hover:to-violet-600 disabled:opacity-50 hover:shadow-lg transition-all">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {updateMut.isPending ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
