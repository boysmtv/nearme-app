import { Link } from 'react-router-dom';
import type { Service } from '../lib/types';

interface ServiceCardProps {
  service: Service;
  providerSlug: string;
  providerId?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}j ${mins}m` : `${hours} jam`;
}

export default function ServiceCard({ service, providerId }: ServiceCardProps) {
  return (
    <Link
      to={providerId ? `/booking/${providerId}?service=${service.id}` : '/search'}
      className="group block rounded-2xl border border-[#E8E8FF] bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d0d0ff] hover:shadow-lg hover:shadow-[#8B8CFF]/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#e8e8ff] to-[#f0e8ff] text-[#6a6acc]">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </span>
            <h3 className="font-bold text-gray-900 group-hover:text-[#6a6acc] transition-colors line-clamp-1">
              {service.name}
            </h3>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 leading-relaxed">{service.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f2ff] px-2.5 py-1 text-xs font-semibold text-[#5a7ab3]">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatDuration(service.duration)}
            </span>
            {service.depositAmount > 0 && (
              <span className="rounded-full bg-[#fff4d6] px-2.5 py-1 text-xs font-bold text-amber-700">
                Deposit {formatPrice(service.depositAmount)}
              </span>
            )}
            <span className="rounded-full bg-[#e6f7ee] px-2.5 py-1 text-xs font-medium text-emerald-700 hidden sm:inline-flex">✦ Booking instan</span>
          </div>
        </div>
        <div className="ml-2 text-right flex-shrink-0">
          <p className="text-xs font-bold uppercase tracking-widest text-[#8B8CFF]">
            {service.priceType === 'QUOTE_REQUIRED'
              ? 'Konsultasi'
              : service.priceType === 'STARTING_FROM'
                ? `Mulai dari`
                : 'Harga'}
          </p>
          <p className="mt-1 text-lg font-black text-[#6a6acc]">
            {service.priceType !== 'QUOTE_REQUIRED' && formatPrice(service.price)}
          </p>
          {service.priceType === 'HOURLY' && (
            <p className="text-xs text-gray-400">/ jam</p>
          )}
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-3 py-1 text-xs font-bold text-white shadow-sm group-hover:shadow-md transition">
            Booking
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
