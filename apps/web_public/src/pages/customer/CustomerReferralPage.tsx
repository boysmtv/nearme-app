import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

function UserGroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.5 10.23" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0112.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EmptyReferralIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

export default function CustomerReferralPage() {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const { data: profileRes, isLoading } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: () => publicApi.customer.getProfile(),
  });

  const profile = profileRes?.data;
  const referralCode =
    (profile as any)?.referralCode ||
    'DEKAT-' + ((profile as any)?.id?.slice(0, 8) || 'XXXX').toUpperCase();
  const referralCount = (profile as any)?.referralCount || 0;
  const referralPoints = referralCount * 50;

  const referralLink = `https://dekat.id/register?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareText = `Gabung DEKAT dan dapatkan diskon! Gunakan kode referral saya: ${referralCode}`;

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + '\n\n' + referralLink)}`;
    window.open(url, '_blank');
  };

  const handleInstagram = () => {
    navigator.clipboard.writeText(shareText + '\n\n' + referralLink);
    alert('Tautan tersalin! Buka Instagram dan tempel di Story atau DM.');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}`;
    window.open(url, '_blank');
  };

  const steps = [
    {
      num: 1,
      title: 'Bagikan Kode Referral',
      desc: 'Kirim kode referral Anda kepada teman melalui media sosial atau chat.',
    },
    {
      num: 2,
      title: 'Teman Mendaftar',
      desc: 'Teman Anda mendaftar di DEKAT menggunakan kode referral Anda.',
    },
    {
      num: 3,
      title: 'Dapat 50 Poin',
      desc: 'Anda dan teman masing-masing mendapatkan 50 poin loyalitas.',
    },
  ];

  const sampleHistory: { name: string; date: string; status: 'rewarded' | 'pending' }[] = [];

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto p-6 space-y-8">
        {isLoading ? (
          <div className="space-y-6">
            <div className="h-48 rounded-2xl bg-gray-200 animate-pulse" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-28 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        ) : (
          <>
            {/* Hero Referral Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 p-8 text-white shadow-lg">
              <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/10" />
              <div className="relative">
                <p className="text-sm font-medium text-yellow-100">Kode Referral Anda</p>
                <div className="mt-3 flex items-center gap-4">
                  <p className="text-4xl font-bold tracking-[0.15em]">{referralCode}</p>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                  >
                    {copied ? (
                      <>
                        <CheckCircleIcon className="h-4 w-4" />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Salin
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-3 text-sm text-yellow-100">
                  Bagikan kode ini kepada teman untuk mendapatkan poin loyalitas
                </p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
                  <UserGroupIcon className="h-7 w-7 text-primary-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{referralCount}</p>
                  <p className="text-sm text-gray-500">Teman Diundang</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-50">
                  <StarIcon className="h-7 w-7 text-yellow-500" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{referralPoints}</p>
                  <p className="text-sm text-gray-500">Poin Didapat</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Bagaimana Cara Kerjanya?</h2>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
                {steps.map((step) => (
                  <div key={step.num} className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
                      {step.num}
                    </div>
                    <h3 className="mt-3 font-semibold text-gray-900">{step.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Bagikan ke Teman</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp
                </button>
                <button
                  onClick={handleInstagram}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:from-purple-600 hover:to-pink-600"
                >
                  <InstagramIcon className="h-5 w-5" />
                  Instagram
                </button>
                <button
                  onClick={handleTwitter}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  <TwitterIcon className="h-5 w-5" />
                  Twitter / X
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {linkCopied ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      Tersalin!
                    </>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5" />
                      Salin Tautan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral History */}
            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Riwayat Referral</h2>
              {sampleHistory.length === 0 ? (
                <div className="mt-6 flex flex-col items-center py-12 text-center">
                  <EmptyReferralIcon className="h-16 w-16 text-gray-300" />
                  <p className="mt-4 text-base font-medium text-gray-900">Belum Ada Referral</p>
                  <p className="mt-1 max-w-sm text-sm text-gray-500">
                    Bagikan kode referral Anda kepada teman untuk mulai mendapatkan poin loyalitas.
                  </p>
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs font-medium uppercase text-gray-500">
                        <th className="pb-3 pr-4">Nama</th>
                        <th className="pb-3 pr-4">Tanggal</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleHistory.map((item, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium text-gray-900">{item.name}</td>
                          <td className="py-3 pr-4 text-gray-500">{item.date}</td>
                          <td className="py-3">
                            {item.status === 'rewarded' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Berhasil
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700">
                                <ClockIcon className="h-3.5 w-3.5" />
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
