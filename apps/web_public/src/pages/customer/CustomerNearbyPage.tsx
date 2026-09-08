import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

export default function CustomerNearbyPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: -6.2088, lng: 106.8456 }) // Default Jakarta
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

  const providers = data?.data?.providers ?? data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Provider Terdekat</h1>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value={1}>1 km</option>
          <option value={3}>3 km</option>
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
        </select>
      </div>

      {/* Map placeholder */}
      <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-primary-50" />
        <div className="relative text-center">
          <svg className="w-12 h-12 text-primary-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-primary-600 font-medium">Peta OpenStreetMap</p>
          <p className="text-primary-400 text-sm">Integrasi peta akan segera hadir</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-gray-500">Tidak ada provider di sekitar Anda</p>
          <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block font-medium">
            Cari manual
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {providers.map((p: any) => (
            <Link
              key={p.id}
              to={`/provider/${p.slug}`}
              className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ring-1 ring-gray-100"
            >
              <img
                src={p.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=6C63FF&color=fff`}
                alt={p.name}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-sm text-gray-500 truncate">{p.location || p.address || 'Indonesia'}</p>
                <div className="flex items-center gap-2 mt-1">
                  {p.rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-primary-600">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      {p.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">{p.category || 'Kecantikan'}</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
