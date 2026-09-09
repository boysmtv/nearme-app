import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const PLANS = [
  {
    name: 'Free',
    price: 'Gratis',
    period: 'selamanya',
    description: 'Cocok untuk baru mulai',
    features: [
      '1 lokasi',
      '10 booking/bulan',
      'Layanan dasar',
      'Jadwal staf',
      'Dukungan email',
    ],
    cta: 'Mulai Gratis',
    ctaLink: '/provider/register',
    highlight: false,
  },
  {
    name: 'Pro',
    price: 'Rp 199.000',
    period: '/bulan',
    description: 'Untuk provider yang berkembang',
    features: [
      '3 lokasi',
      'Unlimited booking',
      'Layanan + add-on',
      'Promosi & coupon',
      'Laporan analytics',
      'Gallery & portfolio',
      'Dukungan prioritas',
    ],
    cta: 'Pilih Pro',
    ctaLink: '/provider/register',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Rp 499.000',
    period: '/bulan',
    description: 'Untuk jaringan besar',
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
    cta: 'Hubungi Kami',
    ctaLink: '/support',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-primary-50 to-white py-16">
          <div className="mx-auto max-w-screen-2xl px-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900">Paket Harga</h1>
            <p className="mt-4 text-lg text-gray-500">Pilih paket yang sesuai untuk bisnis Anda</p>
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-primary-600 text-white ring-4 ring-primary-400 shadow-xl scale-105'
                    : 'bg-white ring-1 ring-gray-200 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white mb-4">
                    Paling Populer
                  </span>
                )}
                <h3 className={`text-xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <div className="mt-4">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? 'text-primary-100' : 'text-gray-500'}`}>
                    {' '}{plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlight ? 'text-primary-100' : 'text-gray-500'}`}>
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <svg
                        className={`h-5 w-5 flex-shrink-0 ${plan.highlight ? 'text-primary-100' : 'text-primary-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`text-sm ${plan.highlight ? 'text-primary-50' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-colors ${
                    plan.highlight
                      ? 'bg-white text-primary-600 hover:bg-primary-50'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
