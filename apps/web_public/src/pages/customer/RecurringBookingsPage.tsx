import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';

const FREQUENCIES = [
  { value: 'WEEKLY', label: 'Mingguan', icon: '📅' },
  { value: 'BIWEEKLY', label: '2 Mingguan', icon: '📆' },
  { value: 'MONTHLY', label: 'Bulanan', icon: '🗓️' },
];

export default function RecurringBookingsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [frequency, setFrequency] = useState('WEEKLY');
  const [selectedBooking, setSelectedBooking] = useState('');
  const qc = useQueryClient();

  const { data: bookingsRes, isLoading } = useQuery({
    queryKey: ['customer-bookings', 'COMPLETED'],
    queryFn: () => publicApi.bookings.list({ status: 'COMPLETED' }),
  });

  const { data: recurringRes } = useQuery({
    queryKey: ['recurring-bookings'],
    queryFn: () => publicApi.get('/customer/recurring-bookings'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => publicApi.post('/customer/recurring-bookings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-bookings'] });
      setShowCreate(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => publicApi.delete(`/customer/recurring-bookings/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring-bookings'] }),
  });

  const bookings = bookingsRes?.data ?? [];
  const recurring = (recurringRes as any)?.data ?? [];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Booking Berulang</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          + Buat Berulang
        </button>
      </div>

      <p className="text-gray-500">Atur booking otomatis berulang untuk layanan favorit Anda.</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : recurring.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500">Belum ada booking berulang</p>
          <p className="text-sm text-gray-400 mt-1">Buat booking berulang untuk layanan yang Anda butuhkan secara rutin</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((r: any) => (
            <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{r.serviceName || 'Layanan'}</h3>
                  <p className="text-sm text-gray-500">{r.providerName || 'Provider'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      {FREQUENCIES.find((f) => f.value === r.frequency)?.icon} {FREQUENCIES.find((f) => f.value === r.frequency)?.label}
                    </span>
                    <span className={`text-xs ${r.active ? 'text-green-600' : 'text-gray-400'}`}>
                      {r.active ? '● Aktif' : '○ Nonaktif'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => cancelMutation.mutate(r.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Berhenti
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Booking Berulang</h3>
            
            <div>
              <label className="text-sm text-gray-600 font-medium">Pilih Booking Sebelumnya</label>
              <select value={selectedBooking} onChange={(e) => setSelectedBooking(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none">
                <option value="">Pilih booking...</option>
                {bookings.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.serviceName || b.bookingCode} - {b.providerName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-medium">Frekuensi</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {FREQUENCIES.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFrequency(f.value)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      frequency === f.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{f.icon}</span>
                    <p className="text-xs font-medium mt-1">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Batal</button>
              <button onClick={() => createMutation.mutate({ bookingId: selectedBooking, frequency })} disabled={!selectedBooking || createMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {createMutation.isPending ? 'Membuat...' : 'Buat Berulang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
