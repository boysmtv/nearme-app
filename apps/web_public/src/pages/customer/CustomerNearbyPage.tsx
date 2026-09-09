import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Jarak Terdekat' },
  { value: 'rating', label: 'Rating Tertinggi' },
] as const;

const RADIUS_OPTIONS = [1, 3, 5, 10, 20];

const CATEGORY_COLORS: Record<string, string> = {
  'Barbershop': 'bg-blue-100 text-blue-700',
  'Salon': 'bg-pink-100 text-pink-700',
  'Kecantikan': 'bg-purple-100 text-purple-700',
  'Spa': 'bg-teal-100 text-teal-700',
  'default': 'bg-gray-100 text-gray-600',
};

function getAvatarColor(name: string): string {
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
    'bg-indigo-100 text-indigo-700',
    'bg-lime-100 text-lime-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length] || colors[0]!;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {rating > 0 && (
        <span className="text-xs font-medium text-gray-600 ml-1">{rating.toFixed(1)}</span>
      )}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 ring-1 ring-gray-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-5 bg-gray-100 rounded-full w-16" />
            <div className="h-5 bg-gray-100 rounded-full w-12" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="h-3 bg-gray-100 rounded w-20" />
        <div className="h-8 bg-gray-100 rounded-lg w-24" />
      </div>
    </div>
  );
}

export default function CustomerNearbyPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: -6.2088, lng: 106.8456 })
      );
    } else {
      setUserLocation({ lat: -6.2088, lng: 106.8456 });
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['nearby-providers', userLocation, radius],
    queryFn: () => {
      if (!userLocation) return null;
      return publicApi.providers.search({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius,
      });
    },
    enabled: !!userLocation,
  });

  const providers = useMemo(() => {
    const list = data?.data?.providers ?? [];
    if (sortBy === 'rating') {
      return [...list].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    }
    return list;
  }, [data, sortBy]);

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Provider Terdekat</h1>
              <p className="text-sm text-gray-500">Temukan layanan terbaik di sekitar Anda</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Radius:</label>
            <div className="flex gap-1.5">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    radius === r
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 h-52 sm:h-64">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary-400" />
                </pattern>
              </defs>
              <rect width="800" height="300" fill="url(#grid)" />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-sm ring-1 ring-white/50">
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-primary-700 font-semibold text-lg">Peta Terdekat</p>
              <p className="text-primary-500 text-sm mt-1">Integrasi peta akan segera hadir</p>
            </div>
          </div>
          {userLocation && (
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs text-gray-600 ring-1 ring-gray-200/50">
              <span className="font-medium">Lokasi:</span> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {isLoading ? 'Memuat...' : `${providers.length} provider ditemukan`}
          </p>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  sortBy === opt.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-gray-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl ring-1 ring-gray-100">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tidak ada provider ditemukan</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
              Tidak ada provider dalam radius {radius} km dari lokasi Anda. Coba perbesar radius atau cari secara manual.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRadius(20)}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white rounded-xl ring-1 ring-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Perbesar Radius
              </button>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Cari Manual
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p: any) => {
              const categoryClass = CATEGORY_COLORS[p.category] || CATEGORY_COLORS['default'];
              return (
                <Link
                  key={p.id}
                  to={`/provider/${p.slug}`}
                  className="group bg-white rounded-2xl p-5 ring-1 ring-gray-100 hover:ring-primary-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getAvatarColor(p.name)}`}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate mt-0.5 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {p.location || p.address || 'Indonesia'}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {p.rating > 0 && <StarRating rating={p.rating} />}
                        {p.category && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryClass}`}>
                            {p.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-50">
                    {p.distance != null ? (
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {typeof p.distance === 'number' ? `${p.distance.toFixed(1)} km` : p.distance}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-colors">
                      Lihat Detail
                      <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
