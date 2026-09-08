import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

export default function CustomerReferralPage() {
  const [copied, setCopied] = useState(false);

  const { data: profileRes } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const profile = profileRes?.data;
  const referralCode = (profile as any)?.referralCode || 'DEKAT-' + ((profile as any)?.id?.slice(0, 8) || 'XXXX').toUpperCase();
  const referralCount = (profile as any)?.referralCount || 0;
  const referralPoints = referralCount * 50;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const text = `Gabung DEKAT dan dapatkan diskon! Gunakan kode referral saya: ${referralCode}\n\nhttps://dekat.id/register?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Undang Teman ke DEKAT', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Undang Teman</h1>

      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
        <p className="text-yellow-100 text-sm">Kode Referral Anda</p>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-3xl font-bold tracking-wider">{referralCode}</p>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
          >
            {copied ? 'Tersalin!' : 'Salin'}
          </button>
        </div>
        <p className="text-yellow-100 mt-2">Bagikan kode ini kepada teman Anda</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6 text-center">
          <p className="text-4xl font-bold text-primary-600">{referralCount}</p>
          <p className="text-gray-500 mt-1">Teman Diundang</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6 text-center">
          <p className="text-4xl font-bold text-yellow-500">{referralPoints}</p>
          <p className="text-gray-500 mt-1">Poin Didapat</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Bagaimana Cara Kerjanya?</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Bagikan Kode Referral</p>
              <p className="text-sm text-gray-500">Kirim kode referral Anda kepada teman</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Teman Mendaftar</p>
              <p className="text-sm text-gray-500">Teman Anda mendaftar menggunakan kode Anda</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Dapat 50 Poin</p>
              <p className="text-sm text-gray-500">Anda dan teman masing-masing dapat 50 poin</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
      >
        Bagikan ke Teman
      </button>
    </div>
  );
}
