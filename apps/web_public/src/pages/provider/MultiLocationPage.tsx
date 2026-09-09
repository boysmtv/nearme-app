import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  isMain: boolean;
  staffCount: number;
  bookingCount: number;
}

export default function MultiLocationPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', latitude: '', longitude: '' });
  const qc = useQueryClient();

  const { data: locationsRes, isLoading } = useQuery({
    queryKey: ['provider-locations'],
    queryFn: () => api.get('/provider/locations'),
  });

  const locations = locationsRes?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/provider/locations', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-locations'] });
      setShowForm(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/provider/locations/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-locations'] });
      setShowForm(false);
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/provider/locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider-locations'] }),
  });

  const resetForm = () => setForm({ name: '', address: '', phone: '', latitude: '', longitude: '' });

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      address: loc.address,
      phone: loc.phone,
      latitude: String(loc.latitude),
      longitude: String(loc.longitude),
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Lokasi</h1>
          <p className="text-gray-500">Kelola beberapa cabang bisnis Anda</p>
        </div>
        <button
          onClick={() => { setEditingId(null); resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          + Tambah Lokasi
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada lokasi tambahan</p>
          <p className="text-sm text-gray-400 mt-1">Tambahkan lokasi untuk mengelola beberapa cabang</p>
        </div>
      ) : (
        <div className="space-y-3">
          {locations.map((loc: Location) => (
            <div key={loc.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{loc.name}</h3>
                    {loc.isMain && (
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{loc.address}</p>
                  <p className="text-sm text-gray-500">{loc.phone}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-400">{loc.staffCount} staf</span>
                    <span className="text-xs text-gray-400">{loc.bookingCount} booking</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(loc)} className="text-sm text-primary-600 hover:underline">
                    Edit
                  </button>
                  {!loc.isMain && (
                    <button onClick={() => deleteMutation.mutate(loc.id)} className="text-sm text-red-500 hover:underline">
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Lokasi' : 'Tambah Lokasi'}</h3>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Nama Lokasi</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none"
                placeholder="Contoh: Cabang Utama" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Alamat</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 h-20 resize-none focus:border-primary-500 focus:outline-none"
                placeholder="Alamat lengkap" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Telepon</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none"
                placeholder="0812xxxx" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600 font-medium">Latitude</label>
                <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none"
                  placeholder="-6.2088" />
              </div>
              <div>
                <label className="text-sm text-gray-600 font-medium">Longitude</label>
                <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none"
                  placeholder="106.8456" />
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSubmit} disabled={!form.name || !form.address || createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {createMutation.isPending || updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
