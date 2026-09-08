import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface BundleItem {
  serviceId: string;
  serviceName: string;
  originalPrice: number;
}

interface Bundle {
  id: string;
  name: string;
  description: string;
  discount: number;
  discountType: 'PERCENTAGE' | 'FIXED';
  services: BundleItem[];
  finalPrice: number;
}

export default function ServiceBundlesPage() {
  const [showForm, setShowForm] = useState(false);
  const [bundleName, setBundleName] = useState('');
  const [bundleDesc, setBundleDesc] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const qc = useQueryClient();

  const { data: servicesRes, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get('/provider/services'),
  });

  const { data: bundlesRes, isLoading: bundlesLoading } = useQuery({
    queryKey: ['bundles'],
    queryFn: () => api.get('/provider/bundles'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/provider/bundles', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bundles'] });
      setShowForm(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/provider/bundles/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bundles'] }),
  });

  const services = servicesRes?.data ?? [];
  const bundles = bundlesRes?.data ?? [];

  const resetForm = () => {
    setBundleName('');
    setBundleDesc('');
    setDiscount('');
    setSelectedServices([]);
  };

  const getBundleTotal = () => {
    return services
      .filter((s: any) => selectedServices.includes(s.id))
      .reduce((sum: number, s: any) => sum + (s.price || 0), 0);
  };

  const getBundleFinalPrice = () => {
    const total = getBundleTotal();
    const disc = parseInt(discount || '0', 10);
    if (discountType === 'PERCENTAGE') {
      return Math.round(total * (1 - disc / 100));
    }
    return Math.max(0, total - disc);
  };

  const handleCreate = () => {
    createMutation.mutate({
      name: bundleName,
      description: bundleDesc,
      discount: parseInt(discount || '0', 10),
      discountType,
      serviceIds: selectedServices,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Paket Layanan</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          + Buat Paket
        </button>
      </div>

      {bundlesLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada paket layanan</p>
          <p className="text-sm text-gray-400 mt-1">Buat paket untuk menawarkan diskon bundle kepada pelanggan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map((bundle: Bundle) => (
            <div key={bundle.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                  <p className="text-sm text-gray-500">{bundle.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Diskon {bundle.discount}{bundle.discountType === 'PERCENTAGE' ? '%' : ''}
                    </span>
                    <span className="text-sm text-gray-400 line-through">Rp {getBundleTotal().toLocaleString('id-ID')}</span>
                    <span className="text-sm font-semibold text-primary-600">Rp {bundle.finalPrice.toLocaleString('id-ID')}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{bundle.services.length} layanan dalam paket</p>
                </div>
                <button
                  onClick={() => deleteMutation.mutate(bundle.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Buat Paket Layanan</h3>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Nama Paket</label>
              <input value={bundleName} onChange={(e) => setBundleName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none"
                placeholder="Contoh: Paket Hemat Rambut" />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Deskripsi</label>
              <textarea value={bundleDesc} onChange={(e) => setBundleDesc(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 h-20 resize-none focus:border-primary-500 focus:outline-none"
                placeholder="Deskripsi singkat paket" />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-medium">Diskon</label>
                <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none"
                  placeholder="10" />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600 font-medium">Tipe Diskon</label>
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none">
                  <option value="PERCENTAGE">Persen (%)</option>
                  <option value="FIXED">Nominal (Rp)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Pilih Layanan</label>
              {servicesLoading ? (
                <div className="mt-2 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
                  ))}
                </div>
              ) : (
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {services.map((s: any) => (
                    <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(s.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, s.id]);
                          } else {
                            setSelectedServices(selectedServices.filter((id) => id !== s.id));
                          }
                        }}
                        className="rounded text-primary-600"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">Rp {(s.price || 0).toLocaleString('id-ID')} • {s.duration || 0}m</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {selectedServices.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Harga Normal</span>
                  <span className="text-gray-900">Rp {getBundleTotal().toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Harga Paket</span>
                  <span className="font-bold text-primary-600">Rp {getBundleFinalPrice().toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Batal</button>
              <button onClick={handleCreate} disabled={!bundleName || selectedServices.length < 2 || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {createMutation.isPending ? 'Membuat...' : 'Buat Paket'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
