import { Link } from 'react-router-dom';
import type { Provider } from '../lib/types';

interface ProviderCardProps {
  provider: Provider;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <Link
      to={`/provider/${provider.slug}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-primary-200 hover:shadow-lg"
    >
      <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-50">
        {provider.coverUrl ? (
          <img
            src={provider.coverUrl}
            alt={provider.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl font-bold text-primary-300">
              {getInitials(provider.name)}
            </span>
          </div>
        )}
        <div className="absolute left-3 top-3">
          <span className="inline-block rounded-full bg-white/90 px-2.5 py-1 text-[13px] font-semibold text-primary-700 backdrop-blur-sm">
            {provider.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">
              {provider.name}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Respon Cepat
            </span>
          </div>
          {provider.rating > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1">
              <svg className="h-4 w-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[13px] font-semibold text-primary-700">
                {provider.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{provider.description}</p>

        <div className="mt-3 flex items-center gap-3 text-[13px] text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {provider.location || provider.address}
          </span>
          {provider.reviewCount > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {provider.reviewCount} ulasan
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
