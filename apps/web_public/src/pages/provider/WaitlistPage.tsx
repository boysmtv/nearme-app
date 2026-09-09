import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProviderLayout from '../../components/ProviderLayout';

export default function WaitlistPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', serviceId: '', preferredDate: '', preferredTime: '' });

  const { data: waitlistRes, isLoading } = useQuery({
    queryKey: ['provider', 'waitlist'],
    queryFn: () => fetch('/api/v1/provider/waitlist', { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` } }).then(r => r.json()),
  });

  const joinMutation = useMutation({
    mutationFn: (data: any) => fetch('/api/v1/provider/waitlist', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['provider', 'waitlist'] }); setShowForm(false); setForm({ customerName: '', customerPhone: '', serviceId: '', preferredDate: '', preferredTime: '' }); },
  });

  const notifyMutation = useMutation({
    mutationFn: (entryId: string) => fetch(`/api/v1/provider/waitlist/${entryId}/notify`, {
      method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('auth_token')}` },
    }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['provider', 'waitlist'] }),
  });

  const entries = waitlistRes?.data ?? [];

  return (
    <ProviderLayout>
      <div className="mx-auto max-w-screen-2xl space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Daftar Tunggu</h1>
            <p className="text-sm text-gray-500">Kelola daftar tunggu pelanggan</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
            + Tambah ke Daftar Tunggu
          </button>
        </div>

        {showForm && (
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-semibold text-gray-900">Tambah ke Daftar Tunggu</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input placeholder="Nama Pelanggan" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <input placeholder="Telepon" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <input type="date" value={form.preferredDate} onChange={e => setForm({ ...form, preferredDate: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
              <input type="time" value={form.preferredTime} onChange={e => setForm({ ...form, preferredTime: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => joinMutation.mutate(form)} disabled={joinMutation.isPending} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                {joinMutation.isPending ? 'Menambahkan...' : 'Tambahkan'}
              </button>
              <button onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Nama</th>
                  <th className="px-4 py-3">Telepon</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Waktu</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Memuat...</td></tr>
                ) : entries.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada daftar tunggu</td></tr>
                ) : entries.map((e: any, i: number) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.position || i + 1}</td>
                    <td className="px-4 py-3">{e.customerName || '-'}</td>
                    <td className="px-4 py-3">{e.customerPhone || '-'}</td>
                    <td className="px-4 py-3">{e.preferredDate || '-'}</td>
                    <td className="px-4 py-3">{e.preferredTime || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${e.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' : e.status === 'NOTIFIED' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {e.status === 'WAITING' ? 'Menunggu' : e.status === 'NOTIFIED' ? 'Diberitahu' : 'Selesai'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.status === 'WAITING' && (
                        <button onClick={() => notifyMutation.mutate(e.id)} className="text-xs font-medium text-blue-600 hover:text-blue-800">
                          Beritahu
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProviderLayout>
  );
}
