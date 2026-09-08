import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

export default function CustomerLoyaltyPage() {
  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const profile = profileRes?.data;
  const points = (profile as any)?.loyaltyPoints || 0;
  const tier = points >= 1000 ? 'Gold' : points >= 500 ? 'Silver' : 'Bronze';
  const nextTierPoints = points >= 1000 ? 0 : points >= 500 ? 1000 : 500;
  const progress = nextTierPoints > 0 ? (points / nextTierPoints) * 100 : 100;

  if (isLoading) return <div className="max-w-4xl mx-auto p-6"><div className="h-64 animate-pulse rounded-xl bg-gray-100" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Loyalty Points</h1>
      
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <p className="text-primary-100 text-sm">Total Poin Anda</p>
        <p className="text-5xl font-bold mt-1">{points.toLocaleString('id-ID')}</p>
        <p className="text-primary-200 mt-2">Tier: {tier}</p>
        {nextTierPoints > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-primary-200">
              <span>{points} poin</span>
              <span>{nextTierPoints} poin</span>
            </div>
            <div className="h-2 bg-primary-400 rounded-full mt-1">
              <div className="h-2 bg-white rounded-full" style={{ width: `${Math.min(progress, 100)}%` }} />
            </div>
            <p className="text-xs text-primary-200 mt-1">{nextTierPoints - points} poin lagi ke tier berikutnya</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Cara Mendapat Poin</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 text-lg">+</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Booking Layanan</p>
              <p className="text-sm text-gray-500">Dapat 10 poin per booking</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">★</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Beri Ulasan</p>
              <p className="text-sm text-gray-500">Dapat 5 poin per ulasan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">♥</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Ajak Teman</p>
              <p className="text-sm text-gray-500">Dapat 50 poin per referral</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
