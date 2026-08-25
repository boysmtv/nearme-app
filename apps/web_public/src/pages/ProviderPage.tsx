import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { publicApi } from '../lib/api';
import type { Review } from '../lib/types';

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function ProviderPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'reviews'>('services');

  const { data: providerRes, isLoading } = useQuery({
    queryKey: ['provider', slug],
    queryFn: () => publicApi.providers.getBySlug(slug!),
    enabled: !!slug,
  });

  const provider = providerRes?.data;

  const { data: servicesRes } = useQuery({
    queryKey: ['services', provider?.id],
    queryFn: () => publicApi.services.listByProvider(provider!.id),
    enabled: !!provider?.id,
  });

  const { data: staffRes } = useQuery({
    queryKey: ['staff', provider?.id],
    queryFn: () => publicApi.staff.listByProvider(provider!.id),
    enabled: !!provider?.id,
  });

  const { data: reviewsRes } = useQuery({
    queryKey: ['reviews', provider?.id],
    queryFn: () => publicApi.reviews.listByProvider(provider!.id),
    enabled: !!provider?.id && activeTab === 'reviews',
  });

  const services = servicesRes?.data ?? [];
  const staffList = staffRes?.data ?? [];
  const reviews = reviewsRes?.data ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-6">
              <div className="h-64 rounded-xl bg-gray-200" />
              <div className="h-8 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-900">Provider tidak ditemukan</h2>
            <Link to="/search" className="mt-4 inline-block text-primary-600 hover:underline">
              Kembali ke pencarian
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Cover */}
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-800 sm:h-64">
          {provider.coverUrl && (
            <img
              src={provider.coverUrl}
              alt={provider.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Profile Header */}
          <div className="relative -mt-16 flex flex-col gap-6 sm:flex-row sm:items-end">
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-32 sm:w-32">
              {provider.logoUrl ? (
                <img src={provider.logoUrl} alt={provider.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary-100 text-2xl font-bold text-primary-600 sm:text-3xl">
                  {provider.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{provider.name}</h1>
                <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                  {provider.category}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {provider.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <StarRating rating={provider.rating} />
                    <span className="font-medium text-gray-700">{provider.rating.toFixed(1)}</span>
                    <span>({provider.reviewCount} ulasan)</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {provider.location || provider.address}
                </span>
              </div>
            </div>
            <Link
              to={`/booking/${provider.id}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Booking Sekarang
            </Link>
          </div>

          {/* Description */}
          <div className="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <p className="text-gray-600 leading-relaxed">{provider.description}</p>
          </div>

          {/* Operating Hours */}
          {provider.openingHours && provider.openingHours.length > 0 && (
            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-semibold text-gray-900">Jam Operasional</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {provider.openingHours.map((hour) => (
                  <div key={hour.dayOfWeek} className="flex justify-between text-sm">
                    <span className={hour.isClosed ? 'text-gray-400' : 'text-gray-700'}>
                      {dayNames[hour.dayOfWeek]}
                    </span>
                    <span className={hour.isClosed ? 'text-red-500' : 'text-gray-600'}>
                      {hour.isClosed ? 'Tutup' : `${hour.open} - ${hour.close}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-8 border-b border-gray-200">
            <nav className="flex gap-8">
              {([
                { key: 'services', label: `Layanan (${services.length})` },
                { key: 'staff', label: `Staf (${staffList.length})` },
                { key: 'reviews', label: `Ulasan (${reviews.length})` },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`border-b-2 pb-3 text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'services' && (
              <div className="space-y-4">
                {services.length > 0 ? (
                  services.map((service) => (
                    <ServiceCard key={service.id} service={service} providerSlug={slug!} providerId={provider?.id} />
                  ))
                ) : (
                  <p className="text-center text-gray-500">Belum ada layanan tersedia</p>
                )}
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {staffList.length > 0 ? (
                  staffList.map((s) => (
                    <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-primary-100">
                          {s.avatarUrl ? (
                            <img src={s.avatarUrl} alt={s.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-bold text-primary-600">
                              {s.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{s.name}</h4>
                          {s.rating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <StarRating rating={s.rating} />
                              <span>{s.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {s.specialties.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {s.specialties.map((spec) => (
                            <span
                              key={spec}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2">{s.bio}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">Belum ada staf terdaftar</p>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review: Review) => (
                    <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-100">
                          {review.customerAvatar ? (
                            <img
                              src={review.customerAvatar}
                              alt={review.customerName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-gray-500">
                              {review.customerName[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">{review.customerName}</h4>
                              <p className="text-xs text-gray-500">{review.serviceName}</p>
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <div className="mt-1">
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">Belum ada ulasan</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
