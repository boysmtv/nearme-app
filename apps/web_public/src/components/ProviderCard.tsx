import { Link } from 'react-router-dom';
import type { Provider } from '../lib/types';

interface ProviderCardProps {
  provider: Provider;
}

const coverGradients = [
  'from-[#e8e8ff] to-[#e8f2ff]',
  'from-[#ffe8ec] to-[#fff4d6]',
  'from-[#e6f7ee] to-[#e8f2ff]',
  'from-[#f0e8ff] to-[#e8e8ff]',
  'from-[#fff4d6] to-[#e6f7ee]',
  'from-[#e8f2ff] to-[#ffe8ec]',
];

export default function ProviderCard({ provider }: ProviderCardProps) {
  const getInitials = (name: string) =>
    name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  const gradientIdx = Math.abs(provider.name.charCodeAt(0) + provider.name.length) % coverGradients.length;

  return (
    <Link
      to={`/provider/${provider.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#E8E8FF] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d0d0ff] hover:shadow-xl hover:shadow-[#8B8CFF]/10"
    >
      <div className={`relative h-40 bg-gradient-to-br ${coverGradients[gradientIdx]} overflow-hidden`}>
        {provider.coverUrl ? (
          <img
            src={provider.coverUrl}
            alt={provider.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/70 text-xl font-black text-[#8B8CFF] shadow-sm backdrop-blur">
              {getInitials(provider.name)}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#6a6acc] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#8B8CFF] animate-pulse" />
            {provider.category}
          </span>
        </div>
        {provider.rating > 0 && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-amber-600 shadow-md">
            <svg className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {provider.rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 group-hover:text-[#6a6acc] transition-colors line-clamp-1">
            {provider.name}
          </h3>
        </div>

        <p className="mt-1 text-sm text-gray-500 line-clamp-1">{provider.description}</p>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FAF9FF] px-2.5 py-1 text-xs font-medium text-gray-600 ring-1 ring-[#E8E8FF]">
            <svg className="h-3.5 w-3.5 text-[#8B8CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {provider.location || provider.address || 'Indonesia'}
          </span>
          {provider.reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f7ee] px-2.5 py-1 text-xs font-medium text-emerald-700">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
