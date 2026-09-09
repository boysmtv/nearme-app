import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const COLORS = [
  'bg-violet-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-indigo-500',
  'bg-cyan-500',
  'bg-fuchsia-500',
];

function hashColor(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return COLORS[Math.abs(h) % COLORS.length];
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? 'text-amber-400' : 'text-gray-200'}`}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} filled={i <= Math.round(rating)} />
      ))}
      <span className="ml-1 text-xs font-medium text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
}

function FavoriteCard({ fav }: { fav: any }) {
  const name = fav.staffName || fav.name || 'Staf';
  const specialties = fav.specialties || 'Provider staff';
  const rating = fav.rating || 4.5;

  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all hover:shadow-md hover:ring-primary-200">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${hashColor(name)}`}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-gray-900">{name}</h3>
          <p className="mt-0.5 truncate text-xs text-gray-500">{specialties}</p>
          <div className="mt-2">
            <RatingStars rating={rating} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Link
          to="/search"
          className="flex-1 rounded-lg bg-primary-600 px-3 py-2 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-primary-700"
        >
          Pesan Sekarang
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-28 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-100" />
          <div className="flex gap-1 pt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-4 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 h-8 w-full rounded-lg bg-gray-100" />
    </div>
  );
}

export default function CustomerFavoritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer-favorites'],
    queryFn: () => publicApi.favorites.list(),
  });

  const favorites = data?.data ?? [];

  return (
    <CustomerLayout>
      <div className="mx-auto max-w-screen-2xl p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
            <svg className="h-5 w-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Favorit</h1>
            <p className="text-sm text-gray-500">Staf dan provider favorit Anda</p>
          </div>
          {favorites.length > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
              {favorites.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm ring-1 ring-gray-100">
            <svg className="mb-4 h-16 w-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <p className="text-sm font-medium text-gray-500">Belum ada staf favorit</p>
            <p className="mt-1 text-xs text-gray-400">Simpan staf favorit Anda untuk pemesanan cepat</p>
            <Link
              to="/search"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari Provider
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((fav: any) => (
              <FavoriteCard key={fav.id || fav.staffId} fav={fav} />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
