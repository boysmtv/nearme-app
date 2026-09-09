import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const StarIcon = ({ filled, className = '' }: { filled: boolean; className?: string }) => (
  <svg className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <StarIcon key={s} filled={s <= rating} className={sizeClass} />
      ))}
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 ring-1 ring-gray-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-gray-200" />
          <div className="h-3 w-28 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-gray-100 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <div className="h-8 w-16 rounded bg-gray-200" />
          <div className="h-4 w-32 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export default function CustomerReviewsPage() {
  const [activeTab, setActiveTab] = useState<'unreviewed' | 'reviewed'>('unreviewed');

  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['customer-bookings', 'COMPLETED'],
    queryFn: () => publicApi.bookings.list({ status: 'COMPLETED' }),
  });

  const bookings = bookingsRes?.data ?? [];
  const reviewedBookings = bookings.filter((b: any) => b.reviewId || b.hasReview);
  const unreviewedBookings = bookings.filter((b: any) => !b.reviewId && !b.hasReview);

  const totalReviews = reviewedBookings.length;
  const avgRating =
    totalReviews > 0
      ? reviewedBookings.reduce((sum: number, b: any) => sum + (b.reviewRating || 0), 0) / totalReviews
      : 0;

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ulasan Saya</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola ulasan untuk booking yang sudah selesai</p>
          </div>
        </div>

        {/* Stats Row */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Average Rating */}
            <div className="bg-white rounded-xl p-6 ring-1 ring-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-yellow-50 flex items-center justify-center">
                  <StarIcon filled className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {avgRating > 0 ? avgRating.toFixed(1) : '-'}
                  </p>
                  <p className="text-sm text-gray-500">Rata-rata rating</p>
                </div>
              </div>
              {totalReviews > 0 && (
                <div className="mt-3 flex items-center gap-1">
                  <StarRating rating={Math.round(avgRating)} size="md" />
                </div>
              )}
            </div>

            {/* Total Reviews */}
            <div className="bg-white rounded-xl p-6 ring-1 ring-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                  <p className="text-sm text-gray-500">Total ulasan</p>
                </div>
              </div>
            </div>

            {/* Unreviewed Count */}
            <div className="bg-white rounded-xl p-6 ring-1 ring-gray-100 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-orange-50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{unreviewedBookings.length}</p>
                  <p className="text-sm text-gray-500">Belum diulas</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-6 -mb-px">
            <button
              onClick={() => setActiveTab('unreviewed')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'unreviewed'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Belum Diulas
              {unreviewedBookings.length > 0 && (
                <span className="ml-2 bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreviewedBookings.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviewed')}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'reviewed'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sudah Diulas
              {reviewedBookings.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {reviewedBookings.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl ring-1 ring-gray-100 shadow-sm">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-gray-500 font-medium">Belum ada booking selesai</p>
            <p className="text-sm text-gray-400 mt-1">Selesaikan booking untuk memberikan ulasan</p>
            <Link
              to="/search"
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Cari Layanan
            </Link>
          </div>
        ) : activeTab === 'unreviewed' ? (
          unreviewedBookings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl ring-1 ring-gray-100 shadow-sm">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Semua booking sudah diulas</p>
              <p className="text-sm text-gray-400 mt-1">Tidak ada booking yang menunggu ulasan</p>
            </div>
          ) : (
            <div className="space-y-3">
              {unreviewedBookings.map((b: any) => (
                <div key={b.id} className="bg-white p-5 rounded-xl ring-1 ring-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{b.serviceName || 'Layanan'}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{b.providerName || 'Provider'}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {b.startsAt
                            ? new Date(b.startsAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })
                            : '-'}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {b.time || '-'}
                        </span>
                        {b.amount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Rp {(b.amount || 0).toLocaleString('id-ID')}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/bookings/${b.id}`}
                      className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Tulis Ulasan
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : reviewedBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl ring-1 ring-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-yellow-50 mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Belum ada ulasan</p>
            <p className="text-sm text-gray-400 mt-1">Ulasan yang Anda tulis akan muncul di sini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviewedBookings.map((b: any) => (
              <div key={b.id} className="bg-white p-5 rounded-xl ring-1 ring-gray-100 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{b.serviceName || 'Layanan'}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{b.providerName || 'Provider'}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Terulas
                      </span>
                    </div>
                    <div className="mt-2">
                      <StarRating rating={b.reviewRating || 0} />
                    </div>
                    {b.reviewText && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{b.reviewText}</p>
                    )}
                    {b.providerResponse && (
                      <div className="mt-3 bg-gray-50 rounded-lg p-3 border-l-3 border-primary-300">
                        <p className="text-xs font-medium text-gray-500 mb-1">Balasan Provider</p>
                        <p className="text-sm text-gray-700">{b.providerResponse}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-3">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {b.startsAt
                          ? new Date(b.startsAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
