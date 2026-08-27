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
          <div><h1 className="text-2xl font-bold text-gray-900">Layanan</h1><p className="mt-1 text-sm text-gray-500">Kelola katalog layanan bisnis Anda</p></div>
          <button onClick={() => { setEdit(null); reset({ name: '', description: '', duration: 30, price: 0 }); setShow(true); }} className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">+ Tambah Layanan</button>
        </div>
        {isLoading ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse rounded-xl bg-white p-6 shadow-sm"><div className="h-5 w-1/3 rounded bg-gray-200" /></div>)}</div>
        : services.length === 0 ? <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100"><h3 className="text-lg font-semibold text-gray-900">Belum ada layanan</h3><p className="mt-2 text-gray-500">Tambahkan layanan pertama Anda</p></div>
        : <div className="space-y-3">{services.map((s) => (
          <div key={s.id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3"><h3 className="font-semibold text-gray-900">{s.name}</h3><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{s.active ? 'Aktif' : 'Nonaktif'}</span></div>
                <p className="mt-1 text-sm text-gray-500">{s.description}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500"><span>{s.duration} menit</span><span>{fmt(s.price)}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setEdit(s); reset({ name: s.name, description: s.description, duration: s.duration, price: s.price }); setShow(true); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Edit</button>
                <button onClick={() => { if (confirm('Hapus layanan ini?')) deleteMut.mutate(s.id); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Hapus</button>
              </div>
            </div>
          </div>
        ))}</div>}
      </div>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-gray-900">{edit ? 'Edit Layanan' : 'Tambah Layanan'}</h2><button onClick={() => { setShow(false); setEdit(null); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button></div>
            <form onSubmit={handleSubmit((d) => edit ? updateMut.mutate(d) : createMut.mutate(d))} className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Nama Layanan</label><input {...register('name')} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}</div>
              <div><label className="block text-sm font-medium text-gray-700">Deskripsi</label><textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}</div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Durasi (menit)</label><input type="number" {...register('duration', { valueAsNumber: true })} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Harga (Rp)</label><input type="number" {...register('price', { valueAsNumber: true })} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShow(false); setEdit(null); }} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={createMut.isPending || updateMut.isPending} className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{createMut.isPending || updateMut.isPending ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
