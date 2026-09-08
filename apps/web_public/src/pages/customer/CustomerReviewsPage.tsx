import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

export default function CustomerReviewsPage() {
  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['customer-bookings', 'COMPLETED'],
    queryFn: () => publicApi.bookings.list({ status: 'COMPLETED' }),
  });

  const bookings = bookingsRes?.data ?? [];
  const reviewedBookings = bookings.filter((b: any) => b.reviewId || b.hasReview);
  const unreviewedBookings = bookings.filter((b: any) => !b.reviewId && !b.hasReview);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Ulasan Saya</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-500">Belum ada booking selesai</p>
          <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block font-medium">
            Mulai booking
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {unreviewedBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Belum Diulas ({unreviewedBookings.length})</h2>
              <div className="space-y-3">
                {unreviewedBookings.map((b: any) => (
                  <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{b.serviceName || 'Layanan'}</p>
                        <p className="text-sm text-gray-500">{b.providerName || 'Provider'}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {b.startsAt ? new Date(b.startsAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                      <Link
                        to={`/bookings/${b.id}`}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors"
                      >
                        Tulis Ulasan
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewedBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Sudah Diulas ({reviewedBookings.length})</h2>
              <div className="space-y-3">
                {reviewedBookings.map((b: any) => (
                  <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100 opacity-75">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{b.serviceName || 'Layanan'}</p>
                        <p className="text-sm text-gray-500">{b.providerName || 'Provider'}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${star <= (b.reviewRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-xs text-gray-400 ml-1">• Terulas</span>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">✓ Selesai</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
