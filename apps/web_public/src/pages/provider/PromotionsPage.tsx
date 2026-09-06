import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';

function LoyaltyTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showEarn, setShowEarn] = useState(false);
  const [earnForm, setEarnForm] = useState({ customerId: '', points: 10, description: '' });

  const { data: customersRes, isLoading } = useQuery({
    queryKey: ['provider-customers', search],
    queryFn: () => providerApi.customers.list({ page: 1, limit: 50, search: search || undefined }),
  });

  const earnMutation = useMutation({
    mutationFn: (data: { customerId: string; points: number; description: string }) =>
      providerApi.loyalty.earn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-customers'] });
      setShowEarn(false);
      setEarnForm({ customerId: '', points: 10, description: '' });
    },
  });

  const customers = customersRes?.data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Poin loyalitas pelanggan</p>
        <button
          onClick={() => setShowEarn(true)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          + Beri Poin
        </button>
      </div>

      {showEarn && (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h3 className="font-semibold text-gray-900">Beri Poin Loyalitas</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Pelanggan</label>
              <select
                value={earnForm.customerId}
                onChange={(e) => setEarnForm({ ...earnForm, customerId: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              >
                <option value="">Pilih pelanggan</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name || c.email}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Poin</label>
              <input
                type="number"
                value={earnForm.points}
                onChange={(e) => setEarnForm({ ...earnForm, points: +e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
              <input
                value={earnForm.description}
                onChange={(e) => setEarnForm({ ...earnForm, description: e.target.value })}
                placeholder="Booking selesai"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => earnMutation.mutate(earnForm)}
              disabled={!earnForm.customerId || earnMutation.isPending}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {earnMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button
              onClick={() => setShowEarn(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-gray-500">Belum ada pelanggan</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Total Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Total Belanja</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Poin Loyalitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{c.name || '-'}</p>
                      <p className="text-xs text-gray-500">{c.email || c.phone || '-'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.totalBookings || 0}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Rp {(c.totalSpent || 0).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700">
                      ⭐ {c.loyaltyPoints || 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function PromotionsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'coupons' | 'campaigns' | 'loyalty'>('coupons');
  const [showCreateCoupon, setShowCreateCoupon] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'PERCENTAGE', discountValue: 0, maxUses: 100, minOrder: 0 });
  const [campaignForm, setCampaignForm] = useState({ name: '', type: 'DISCOUNT', config: '{}', startDate: '', endDate: '' });

  const { data: couponsRes, isLoading: couponsLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => providerApi.coupons.list(),
  });

  const { data: campaignsRes, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => providerApi.campaigns.list(),
  });

  const coupons = couponsRes?.data ?? [];
  const campaigns = campaignsRes?.data ?? [];

  const createCouponMutation = useMutation({
    mutationFn: (data: any) => providerApi.coupons.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['coupons'] }); setShowCreateCoupon(false); },
  });

  const deleteCouponMutation = useMutation({
    mutationFn: (id: string) => providerApi.coupons.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (data: any) => providerApi.campaigns.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['campaigns'] }); setShowCreateCampaign(false); },
  });

  const toggleCampaign = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'activate' | 'pause' }) =>
      action === 'activate' ? providerApi.campaigns.activate(id) : providerApi.campaigns.pause(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promosi</h1>
          <p className="mt-1 text-sm text-gray-500">Kelola kupon, kampana, dan loyalitas pelanggan</p>
        </div>

        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {(['coupons', 'campaigns', 'loyalty'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition-colors ${
                tab === t ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t === 'coupons' ? 'Kupon' : t === 'campaigns' ? 'Kampanye' : 'Loyalitas'}
            </button>
          ))}
        </div>

        {tab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Daftar kupon diskon untuk pelanggan</p>
              <button
                onClick={() => setShowCreateCoupon(true)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                + Buat Kupon
              </button>
            </div>

            {showCreateCoupon && (
              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <h3 className="font-semibold text-gray-900">Kupon Baru</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Kode</label>
                    <input
                      placeholder="DISKON20"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="PERCENTAGE">Persentase</option>
                      <option value="FIXED">Nominal Tetap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nilai</label>
                    <input
                      type="number"
                      placeholder="20"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: +e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maks. Penggunaan</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={couponForm.maxUses}
                      onChange={(e) => setCouponForm({ ...couponForm, maxUses: +e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => createCouponMutation.mutate(couponForm)}
                    disabled={createCouponMutation.isPending}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createCouponMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setShowCreateCoupon(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {couponsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : coupons.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
                <p className="text-gray-500">Belum ada kupon</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Kode</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tipe</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Nilai</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Penggunaan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                        <th className="px-6 py-3" />
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {coupons.map((c: any) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">{c.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{c.discountType === 'PERCENTAGE' ? 'Persentase' : 'Tetap'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `Rp ${c.discountValue?.toLocaleString('id-ID')}`}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{c.currentUses || 0}/{c.maxUses}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${c.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {c.active !== false ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus kupon "${c.code}"?`)) {
                                deleteCouponMutation.mutate(c.id);
                              }
                            }}
                            className="text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'campaigns' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Kelola kampanye promosi aktif</p>
              <button
                onClick={() => setShowCreateCampaign(true)}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
              >
                + Buat Kampanye
              </button>
            </div>

            {showCreateCampaign && (
              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <h3 className="font-semibold text-gray-900">Kampanye Baru</h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama</label>
                    <input
                      placeholder="Promo Lebaran"
                      value={campaignForm.name}
                      onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipe</label>
                    <select
                      value={campaignForm.type}
                      onChange={(e) => setCampaignForm({ ...campaignForm, type: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="DISCOUNT">Diskon</option>
                      <option value="REFERRAL">Referral</option>
                      <option value="LOYALTY">Loyalitas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Mulai</label>
                    <input
                      type="date"
                      value={campaignForm.startDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Selesai</label>
                    <input
                      type="date"
                      value={campaignForm.endDate}
                      onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => createCampaignMutation.mutate(campaignForm)}
                    disabled={createCampaignMutation.isPending}
                    className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {createCampaignMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    onClick={() => setShowCreateCampaign(false)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}

            {campaignsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
                <p className="text-gray-500">Belum ada kampanye</p>
              </div>
            ) : (
              <div className="space-y-3">
                {campaigns.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-sm text-gray-500">
                        {c.type} • {c.startDate} - {c.endDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                      </span>
                      {c.status === 'ACTIVE' ? (
                        <button
                          onClick={() => toggleCampaign.mutate({ id: c.id, action: 'pause' })}
                          className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
                        >
                          Jeda
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleCampaign.mutate({ id: c.id, action: 'activate' })}
                          className="text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          Aktifkan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'loyalty' && (
          <LoyaltyTab />
        )}
      </div>
    </ProviderLayout>
  );
}
