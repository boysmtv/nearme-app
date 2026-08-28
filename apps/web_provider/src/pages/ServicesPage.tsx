import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { providerApi } from '../lib/api';
import Layout from '../components/Layout';
import type { ProviderService } from '../lib/types';

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  duration: z.number().min(15),
  price: z.number().min(0),
});
type FormData = z.infer<typeof serviceSchema>;
function fmt(n: number) { return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n); }

export default function ServicesPage() {
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<ProviderService | null>(null);
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ['services'], queryFn: () => providerApi.services.list() });
  const services = res?.data ?? [];
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(serviceSchema) });
  const createMut = useMutation({ mutationFn: (d: FormData) => providerApi.services.create({ name: d.name, description: d.description, price: d.price, duration: d.duration }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setShow(false); } });
  const updateMut = useMutation({ mutationFn: (d: FormData) => providerApi.services.update(edit!.id, { name: d.name, description: d.description, price: d.price, duration: d.duration }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setShow(false); setEdit(null); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => providerApi.services.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }) });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div><h1 className="text-2xl font-bold tracking-tight text-gray-900">Layanan</h1><p className="text-sm font-medium text-gray-500">Kelola katalog layanan bisnis Anda • {services.length} layanan</p></div>
          </div>
          <button onClick={() => { setEdit(null); reset({ name: '', description: '', duration: 30, price: 0 }); setShow(true); }} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-200 hover:shadow-lg hover:from-primary-600 hover:to-violet-600 transition-all">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Tambah Layanan
          </button>
        </div>
        {isLoading ? <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><div className="h-5 w-1/3 rounded bg-soft-violet" /></div>)}</div>
        : services.length === 0 ? <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 shadow-lg"><svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div><h3 className="mt-4 text-lg font-bold text-gray-900">Belum ada layanan</h3><p className="mt-1 text-sm text-gray-500">Tambahkan layanan pertama Anda untuk mulai menerima booking ✨</p></div>
        : <div className="grid gap-4 sm:grid-cols-2">
          {services.map((s, idx) => {
            const gradients = ['from-primary-500 to-violet-500', 'from-emerald-400 to-teal-400', 'from-amber-400 to-orange-400', 'from-fuchsia-400 to-pink-400', 'from-sky-400 to-primary-400'];
            const grad = gradients[idx % gradients.length];
            return (
          <div key={s.id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${grad}`} />
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-sm`}>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </span>
                  <h3 className="font-bold text-gray-900">{s.name}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${s.active ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-gray-50 text-gray-500 ring-gray-200'}`}>{s.active ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-2">{s.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-soft-violet px-2.5 py-1 text-xs font-bold text-primary-700"><svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{s.duration} menit</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-soft-peach px-2.5 py-1 text-xs font-bold text-amber-700">{fmt(s.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setEdit(s); reset({ name: s.name, description: s.description, duration: s.duration, price: s.price }); setShow(true); }} className="rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-soft-violet hover:text-primary-700 hover:ring-primary-200 transition-colors">Edit</button>
                <button onClick={() => { if (confirm('Hapus layanan ini?')) deleteMut.mutate(s.id); }} className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-100 transition-colors">Hapus</button>
              </div>
            </div>
          </div>
        )})}</div>}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-gray-100">
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 text-white"><svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg></div><h2 className="text-lg font-bold text-gray-900">{edit ? 'Edit Layanan' : 'Tambah Layanan'}</h2><button onClick={() => { setShow(false); setEdit(null); }} className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">&times;</button></div>
            <form onSubmit={handleSubmit((d) => edit ? updateMut.mutate(d) : createMut.mutate(d))} className="mt-6 space-y-4">
              <div><label className="block text-sm font-semibold text-gray-700">Nama Layanan</label><input {...register('name')} placeholder="Contoh: Haircut Premium" className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-violet/20 px-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100 transition-all" />{errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name.message}</p>}</div>
              <div><label className="block text-sm font-semibold text-gray-700">Deskripsi</label><textarea {...register('description')} rows={3} placeholder="Deskripsi layanan yang menarik..." className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-soft-violet/20 px-4 py-3 text-sm focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100" />{errors.description && <p className="mt-1 text-xs font-medium text-rose-600">{errors.description.message}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold text-gray-700">Durasi (menit)</label><input type="number" {...register('duration', { valueAsNumber: true })} className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
                <div><label className="block text-sm font-semibold text-gray-700">Harga (Rp)</label><input type="number" {...register('price', { valueAsNumber: true })} className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary-400 focus:outline-none focus:ring-4 focus:ring-primary-100" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShow(false); setEdit(null); }} className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="rounded-xl bg-gradient-to-r from-primary-500 to-violet-500 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:from-primary-600 hover:to-violet-600 disabled:opacity-50">{createMut.isPending || updateMut.isPending ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
