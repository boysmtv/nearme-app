import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'Semua' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
};

export default function CustomerBookingsPage() {
  const [filter, setFilter] = useState('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['customer-bookings', filter],
    queryFn: () => api.get(`/bookings${filter !== 'ALL' ? `?status=${filter}` : ''}`),
  });

  const bookings = data?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === s.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada booking</p>
          <Link to="/search" className="text-primary-600 hover:underline mt-2 inline-block font-medium">
            Cari provider
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b: any) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow ring-1 ring-gray-100"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{b.bookingCode}</p>
                  <p className="text-sm text-gray-600">{b.serviceName || 'Layanan'}</p>
                  <p className="text-sm text-gray-500">{b.providerName || 'Provider'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {b.startTime ? new Date(b.startTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                    {b.status?.replace('_', ' ')}
                  </span>
                  <p className="text-sm font-semibold mt-1 text-gray-900">Rp {(b.totalAmount || 0).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
