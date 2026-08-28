import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import type { ProviderService } from '../../lib/types';

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
  const [addonsFor, setAddonsFor] = useState<string | null>(null);
  const [addons, setAddons] = useState<{ name: string; price: number; duration: number }[]>([]);
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState<number>(0);
  const [addonDur, setAddonDur] = useState<number>(15);
  const qc = useQueryClient();
  const { data: res, isLoading } = useQuery({ queryKey: ['services'], queryFn: () => providerApi.services.list() });
  const services = res?.data ?? [];
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(serviceSchema) });
  const createMut = useMutation({ mutationFn: (d: FormData) => providerApi.services.create({ name: d.name, description: d.description, price: d.price, duration: d.duration }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setShow(false); } });
  const updateMut = useMutation({ mutationFn: (d: FormData) => providerApi.services.update(edit!.id, { name: d.name, description: d.description, price: d.price, duration: d.duration }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setShow(false); setEdit(null); } });
  const deleteMut = useMutation({ mutationFn: (id: string) => providerApi.services.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }) });
  const saveAddonsMut = useMutation({
    mutationFn: () => providerApi.services.update(addonsFor!, { addons } as unknown as Partial<ProviderService>),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setAddonsFor(null); setAddons([]); },
  });

  return (
    <ProviderLayout>
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
                <button onClick={() => { setAddonsFor(s.id); setAddons((s as unknown as { addons?: { name: string; price: number; duration: number }[] }).addons ?? []); }} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">Add-on</button>
                <button onClick={() => { if (confirm('Hapus layanan ini?')) deleteMut.mutate(s.id); }} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Hapus</button>
              </div>
              {addonsFor === s.id && (
                <div className="mt-4 rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900">Add-ons — PUT /provider/services/{'{id}'} dengan field addons</h4>
                  <div className="mt-2 space-y-2">
                    {addons.length === 0 ? <p className="text-xs text-gray-500">Belum ada add-on</p> : addons.map((a, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded border bg-white px-3 py-2 text-xs">
                        <span>{a.name} — {fmt(a.price)} · {a.duration} min</span>
                        <button onClick={() => setAddons(prev => prev.filter((_, i) => i !== idx))} className="text-red-600 hover:underline">Hapus</button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input value={addonName} onChange={(e)=> setAddonName(e.target.value)} placeholder="Nama add-on" className="flex-1 min-w-[120px] rounded border border-gray-300 px-2 py-1.5 text-xs" />
                    <input type="number" value={addonPrice} onChange={(e)=> setAddonPrice(parseInt(e.target.value)||0)} placeholder="Harga" className="w-24 rounded border border-gray-300 px-2 py-1.5 text-xs" />
                    <input type="number" value={addonDur} onChange={(e)=> setAddonDur(parseInt(e.target.value)||15)} placeholder="Dur (min)" className="w-20 rounded border border-gray-300 px-2 py-1.5 text-xs" />
                    <button onClick={() => { if (!addonName.trim()) return; setAddons(prev=> [...prev, { name: addonName.trim(), price: addonPrice, duration: addonDur }]); setAddonName(''); setAddonPrice(0); }} className="rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">+ Tambah</button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => saveAddonsMut.mutate()} disabled={saveAddonsMut.isPending} className="rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50">{saveAddonsMut.isPending ? 'Menyimpan...' : 'Simpan Add-ons'}</button>
                    <button onClick={() => { setAddonsFor(null); setAddons([]); }} className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-white">Batal</button>
                  </div>
                  {saveAddonsMut.isSuccess && <p className="mt-2 text-xs text-green-600">Add-ons tersimpan</p>}
                  {saveAddonsMut.isError && <p className="mt-2 text-xs text-red-600">{(saveAddonsMut.error as Error).message}</p>}
                </div>
              )}
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
    </ProviderLayout>
  );
}
