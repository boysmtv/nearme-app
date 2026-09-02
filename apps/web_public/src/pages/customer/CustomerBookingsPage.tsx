import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { ApiResponse } from '../../lib/types';

const statusColors: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-800',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  NO_SHOW: 'bg-gray-100 text-gray-800',
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadBookings(); }, [filter]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = filter !== 'ALL' ? `?status=${filter}` : '';
      const res = await api.get<ApiResponse<any[]>>(`/bookings${params}`);
      setBookings(res.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">My Bookings</h1>

      <div className="flex gap-2">
        {['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'COMPLETED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1 rounded-full text-sm ${filter === s ? 'bg-[#6C63FF] text-white' : 'bg-gray-100'}`}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No bookings found</p>
          <Link to="/search" className="text-[#6C63FF] hover:underline mt-2 inline-block">Find a provider</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <Link key={b.id} to={`/bookings/${b.id}`}
              className="block bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{b.bookingCode}</p>
                  <p className="text-sm text-gray-500">{b.serviceName || 'Service'}</p>
                  <p className="text-sm text-gray-500">{b.providerName || 'Provider'}</p>
                  <p className="text-sm text-gray-400">{b.startTime ? new Date(b.startTime).toLocaleString() : '-'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[b.status] || 'bg-gray-100'}`}>
                    {b.status?.replace('_', ' ')}
                  </span>
                  <p className="text-sm font-semibold mt-1">Rp {(b.totalAmount || 0).toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
