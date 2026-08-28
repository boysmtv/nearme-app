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
      className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
            {service.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{service.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px] text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[13px] text-amber-700">
                Deposit {formatPrice(service.depositAmount)}
              </span>
            )}
          </div>
        </div>
        <div className="ml-4 text-right">
          <p className="text-lg font-bold text-primary-600">
            {service.priceType === 'QUOTE_REQUIRED'
              ? 'Harga'
              : service.priceType === 'STARTING_FROM'
                ? `Mulai`
                : ''}
          </p>
          <p className="text-lg font-bold text-primary-600">
            {service.priceType !== 'QUOTE_REQUIRED' && formatPrice(service.price)}
          </p>
          {service.priceType === 'HOURLY' && (
            <p className="text-xs text-gray-500">/ jam</p>
          )}
        </div>
      </div>
    </Link>
  );
}
