import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

const PLANS = [
  {
    id: 'FREE',
    name: 'Free',
    price: 0,
    period: 'selamanya',
    features: [
      '1 lokasi',
      '10 booking/bulan',
      'Layanan dasar',
      'Jadwal staf',
      'Dukungan email',
    ],
    limitations: [
      'Tidak ada analytics',
      'Tidak ada promosi',
      'Tidak ada prioritas',
    ],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: 199000,
    period: '/bulan',
    features: [
      '3 lokasi',
      'Unlimited booking',
      'Layanan + add-on',
      'Promosi & coupon',
      'Laporan analytics',
      'Gallery & portfolio',
      'Dukungan prioritas',
      'Booking berulang',
    ],
    limitations: [],
    popular: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 499000,
    period: '/bulan',
    features: [
      'Unlimited lokasi',
      'Unlimited booking',
      'Semua fitur Pro',
      'Multi-cabang',
      'API akses',
      'White-label',
      'Dedicated support',
      'Custom integrasi',
    ],
    limitations: [],
  },
];

export default function SubscriptionUpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: currentSub, isLoading } = useQuery({
    queryKey: ['provider-subscription'],
    queryFn: () => api.get('/provider/subscription'),
  });

  const upgradeMutation = useMutation({
    mutationFn: (planId: string) => api.post('/provider/subscription/upgrade', { planId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider-subscription'] });
      setSelectedPlan(null);
    },
  });

  const currentPlan = currentSub?.data?.planId || 'FREE';

  return (
    <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Upgrade Plan</h1>
        <p className="mt-2 text-gray-500">Pilih paket yang sesuai untuk bisnis Anda</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isDowngrade = PLANS.findIndex((p) => p.id === plan.id) < PLANS.findIndex((p) => p.id === currentPlan);

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 relative ${
                  plan.popular
                    ? 'bg-primary-600 text-white ring-4 ring-primary-400 shadow-xl scale-105'
                    : 'bg-white ring-1 ring-gray-200 shadow-sm'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-xs font-bold text-gray-900">
                    Paling Populer
                  </span>
                )}

                {isCurrent && (
                  <span className="absolute top-4 right-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Plan Aktif
                  </span>
                )}

                <h3 className={`text-xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>

                <div className="mt-4">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price === 0 ? 'Gratis' : `Rp ${plan.price.toLocaleString('id-ID')}`}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${plan.popular ? 'text-primary-100' : 'text-gray-500'}`}>
                      {' '}{plan.period}
                    </span>
                  )}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg className={`h-5 w-5 flex-shrink-0 ${plan.popular ? 'text-primary-100' : 'text-primary-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.popular ? 'text-primary-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-center gap-2">
                        <svg className={`h-4 w-4 flex-shrink-0 ${plan.popular ? 'text-primary-200' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className={`text-xs ${plan.popular ? 'text-primary-200' : 'text-gray-400'}`}>
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => !isCurrent && !isDowngrade && setSelectedPlan(plan.id)}
                  disabled={isCurrent || isDowngrade}
                  className={`mt-8 w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDowngrade
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {isCurrent ? 'Plan Aktif' : isDowngrade ? 'Tidak Tersedia' : 'Upgrade Sekarang'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPlan(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Konfirmasi Upgrade</h3>
            <p className="text-gray-600">
              Anda akan upgrade ke plan <strong>{PLANS.find((p) => p.id === selectedPlan)?.name}</strong> seharga{' '}
              <strong>Rp {PLANS.find((p) => p.id === selectedPlan)?.price.toLocaleString('id-ID')}/bulan</strong>.
            </p>
            <p className="text-sm text-gray-500">Pembayaran akan diproses melalui Midtrans.</p>
            <div className="flex gap-2">
              <button onClick={() => setSelectedPlan(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">
                Batal
              </button>
              <button onClick={() => upgradeMutation.mutate(selectedPlan)} disabled={upgradeMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {upgradeMutation.isPending ? 'Memproses...' : 'Konfirmasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
