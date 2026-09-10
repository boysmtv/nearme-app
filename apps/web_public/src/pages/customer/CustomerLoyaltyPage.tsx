import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi, api } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const TIERS = [
  { name: 'Bronze', min: 0, color: 'from-amber-600 to-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', benefits: ['1 poin per Rp1.000 spent', 'Akses promo eksklusif', 'Birthday bonus 100 poin'] },
  { name: 'Silver', min: 500, color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', benefits: ['1.2x poin multiplier', 'Prioritas booking', 'Birthday bonus 200 poin', 'Gratis reschedule 1x/bulan'] },
  { name: 'Gold', min: 1500, color: 'from-yellow-500 to-amber-500', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', benefits: ['1.5x poin multiplier', 'Diskon 5% semua layanan', 'Birthday bonus 500 poin', 'Reschedule gratis', 'Akses early booking'] },
  { name: 'Platinum', min: 5000, color: 'from-indigo-500 to-purple-600', bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', benefits: ['2x poin multiplier', 'Diskon 10% semua layanan', 'Birthday bonus 1000 poin', 'Reschedule unlimited', 'Priority support', 'Exclusive event invites'] },
];

const EARN_METHODS = [
  { title: 'Booking Layanan', desc: 'Dapatkan 1 poin untuk setiap Rp1.000 yang dibelanjakan pada layanan', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  ), color: 'bg-primary-100 text-primary-600' },
  { title: 'Beri Ulasan', desc: 'Dapatkan 5 poin untuk setiap ulasan yang diverifikasi', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
  ), color: 'bg-green-100 text-green-600' },
  { title: 'Ajak Teman', desc: 'Dapatkan 50 poin untuk setiap referral yang berhasil mendaftar', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ), color: 'bg-purple-100 text-purple-600' },
];

const REDEEM_OPTIONS = [
  { name: 'Diskon Rp25.000', points: 250, desc: 'Potongan harga untuk booking berikutnya', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
  ) },
  { name: 'Diskon Rp50.000', points: 500, desc: 'Potongan harga untuk booking berikutnya', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
  ) },
  { name: 'Gratis Booking Layanan Dasar', points: 1000, desc: 'Nikmati layanan dasar secara gratis', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
  ) },
  { name: 'Gratis Booking Premium', points: 2500, desc: 'Nikmati layanan premium secara gratis', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
  ) },
];

function ProgressRing({ progress, size = 160, strokeWidth = 10 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
}

function getTier(points: number): typeof TIERS[number] {
  if (points >= 5000) return TIERS[3]!;
  if (points >= 1500) return TIERS[2]!;
  if (points >= 500) return TIERS[1]!;
  return TIERS[0]!;
}

function getNextTier(points: number): typeof TIERS[number] | null {
  if (points >= 5000) return null;
  if (points >= 1500) return TIERS[3]!;
  if (points >= 500) return TIERS[2]!;
  return TIERS[1]!;
}

export default function CustomerLoyaltyPage() {
  const qc = useQueryClient();
  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const { data: loyaltyRes } = useQuery({
    queryKey: ['customer-loyalty'],
    queryFn: () => api.get('/customer/loyalty'),
  });

  const profile = profileRes?.data;
  const points = profile?.loyaltyPoints || 0;
  const currentTier = getTier(points) ?? TIERS[0];
  const nextTier = getNextTier(points);

  const pointsToNext = nextTier ? nextTier.min - points : 0;
  const progress = nextTier ? (points / nextTier.min) * 100 : 100;

  const loyaltyData = (loyaltyRes as any)?.data;
  const history = loyaltyData?.transactions ?? [];

  const redeemMutation = useMutation({
    mutationFn: (data: { points: number; description: string }) =>
      api.post('/customer/loyalty/redeem', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer-loyalty'] });
      qc.invalidateQueries({ queryKey: ['customer-profile'] });
    },
  });

  let runningBalance = points;
  const historyWithBalance = history.map((h: any) => {
    const pts = h.points || 0;
    runningBalance = h.type === 'EARN' ? runningBalance + pts : runningBalance - pts;
    return { ...h, pts, balance: runningBalance };
  }).reverse();

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program Loyalitas</h1>
          <p className="text-sm text-gray-500 mt-1">Kumpulkan poin, naikkan tier, nikmati benefit eksklusif</p>
        </div>

        {/* Hero Loyalty Card */}
        <div className={`bg-gradient-to-r ${currentTier.color} rounded-2xl p-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <div className="relative">
                <ProgressRing progress={progress} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{points.toLocaleString('id-ID')}</span>
                  <span className="text-xs text-white/80">poin</span>
                </div>
              </div>
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                Tier {currentTier.name}
              </div>
              <p className="text-white/80 text-sm mb-1">Total poin Anda</p>
              <p className="text-5xl font-bold tracking-tight mb-4">{points.toLocaleString('id-ID')}</p>

              {nextTier ? (
                <div>
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                    <span>{currentTier.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="font-medium text-white">{nextTier.name}</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Kumpulkan <span className="font-semibold text-white">{pointsToNext.toLocaleString('id-ID')} poin lagi</span> ke tier berikutnya
                  </p>
                </div>
              ) : (
                <p className="text-white/70 text-sm">Selamat! Anda sudah mencapai tier tertinggi</p>
              )}
            </div>

            <div className="hidden lg:flex flex-col items-end gap-1 text-white/60 text-xs">
              <span>{profile?.totalBookings || 0} booking</span>
              <span>Total belanja Rp{(profile?.totalSpent || 0).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* Tier Comparison */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Perbandingan Tier</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier) => {
              const isActive = tier.name === currentTier.name;
              return (
                <div
                  key={tier.name}
                  className={`rounded-xl border-2 p-5 transition-all ${
                    isActive
                      ? `${tier.bg} ${tier.border} shadow-md ring-2 ring-offset-2 ring-${tier.name === 'Bronze' ? 'amber' : tier.name === 'Silver' ? 'gray' : tier.name === 'Gold' ? 'yellow' : 'indigo'}-400`
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`font-semibold ${isActive ? tier.text : 'text-gray-700'}`}>{tier.name}</h3>
                    {isActive && (
                      <span className={`text-xs font-medium ${tier.text} ${tier.bg} px-2 py-0.5 rounded-full`}>Aktif</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    {tier.min === 0 ? 'Mulai dari 0 poin' : `${tier.min.toLocaleString('id-ID')} poin`}
                  </p>
                  <ul className="space-y-1.5">
                    {tier.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                        <svg className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isActive ? tier.text : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Points History */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Riwayat Poin</h2>
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Tanggal</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Deskripsi</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Poin</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historyWithBalance.map((h: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                        <td className="px-4 py-3 text-gray-700">{h.description || h.desc || '-'}</td>
                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                          <span className={h.type === 'EARN' || h.type === 'earn' ? 'text-green-600' : 'text-red-500'}>
                            {h.type === 'EARN' || h.type === 'earn' ? '+' : '-'}{h.pts.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 font-medium">{h.balance.toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {historyWithBalance.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  <p>Belum ada riwayat poin</p>
                </div>
              )}
            </div>
          </div>

          {/* Cara Mendapat Poin */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cara Mendapat Poin</h2>
            <div className="space-y-3">
              {EARN_METHODS.map((m) => (
                <div key={m.title} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${m.color}`}>
                    {m.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tukar Poin */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tukar Poin</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REDEEM_OPTIONS.map((opt) => {
              const canRedeem = points >= opt.points;
              return (
                <div
                  key={opt.name}
                  className={`bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5 flex flex-col items-center text-center transition-all ${
                    canRedeem ? 'hover:shadow-md hover:ring-primary-200' : 'opacity-60'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${canRedeem ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-400'}`}>
                    {opt.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">{opt.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{opt.desc}</p>
                  <div className="mt-auto">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${canRedeem ? 'text-primary-600' : 'text-gray-400'}`}>
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      {opt.points.toLocaleString('id-ID')} poin
                    </span>
                  </div>
                   <button
                    disabled={!canRedeem || redeemMutation.isPending}
                    onClick={() => redeemMutation.mutate({ points: opt.points, description: `Tukar ${opt.name}` })}
                    className={`mt-3 w-full text-xs font-medium py-2 rounded-lg transition-colors ${
                      canRedeem
                        ? 'bg-primary-600 text-white hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {redeemMutation.isPending ? 'Menukar...' : canRedeem ? 'Tukarkan' : 'Poin Tidak Cukup'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
