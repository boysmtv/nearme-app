import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const FREQUENCIES = [
  { value: 'WEEKLY', label: 'Mingguan', desc: 'Setiap minggu', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
  { value: 'BIWEEKLY', label: '2 Mingguan', desc: 'Setiap 2 minggu', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'MONTHLY', label: 'Bulanan', desc: 'Setiap bulan', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="h-5 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 w-24 bg-gray-100 rounded-full" />
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
        <div className="h-10 w-20 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
      <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6">
        <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Belum Ada Booking Berulang</h3>
      <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
        Buat booking berulang agar layanan favorit Anda tidak terlewat. Atur jadwalnya sekali, kami yang ingatkan.
      </p>
      <div className="w-full max-w-xs space-y-2">
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Jadwal otomatis tanpa perlu booking ulang</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Pengingat sebelum jadwal tiba</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Ubah atau batalkan kapan saja</span>
        </div>
      </div>
    </div>
  );
}

function FrequencyIcon({ path, className = 'w-5 h-5' }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={path} />
    </svg>
  );
}

export default function RecurringBookingsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [frequency, setFrequency] = useState('WEEKLY');
  const [selectedBooking, setSelectedBooking] = useState('');
  const qc = useQueryClient();

  const { data: bookingsRes, isLoading: bookingsLoading } = useQuery({
    queryKey: ['customer-bookings', 'COMPLETED'],
    queryFn: () => publicApi.bookings.list({ status: 'COMPLETED' }),
  });

  const { data: recurringRes, isLoading: recurringLoading } = useQuery({
    queryKey: ['recurring-bookings'],
    queryFn: () => api.get('/customer/recurring-bookings'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/customer/recurring-bookings', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring-bookings'] });
      setShowCreate(false);
      setSelectedBooking('');
      setFrequency('WEEKLY');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.put(`/customer/recurring-bookings/${id}`, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring-bookings'] }),
  });

  const bookings = bookingsRes?.data ?? [];
  const recurring = (recurringRes as any)?.data ?? [];
  const isLoading = bookingsLoading || recurringLoading;

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Berulang</h1>
            <p className="text-sm text-gray-500 mt-1">
              Atur jadwal booking otomatis untuk layanan favorit Anda. Tidak perlu booking ulang setiap kali.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Buat Baru
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : recurring.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {recurring.map((r: any) => {
              const freq = FREQUENCIES.find((f) => f.value === r.frequency);
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {r.serviceName || 'Layanan'}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          r.active
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                            : 'bg-gray-100 text-gray-500 ring-1 ring-gray-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {r.active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{r.providerName || 'Provider'}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium">
                          <FrequencyIcon path={freq?.icon ?? FREQUENCIES[0]!.icon} className="w-3.5 h-3.5" />
                          {freq?.label || r.frequency}
                        </span>
                        {r.nextOccurrence && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Berikutnya: {new Date(r.nextOccurrence).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMutation.mutate({ id: r.id, active: !r.active })}
                        disabled={toggleMutation.isPending}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                          r.active ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={r.active}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          r.active ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                       <button
                        onClick={() => {
                          // TODO: navigate to manage page - for now toggle active state
                          toggleMutation.mutate({ id: r.id, active: r.active });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        Kelola
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Buat Booking Berulang</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Booking Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pilih Booking Sebelumnya</label>
                <div className="relative">
                  <select
                    value={selectedBooking}
                    onChange={(e) => setSelectedBooking(e.target.value)}
                    className="w-full appearance-none border border-gray-300 rounded-xl px-4 py-3 pr-10 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-colors bg-white"
                  >
                    <option value="">Pilih booking yang pernah selesai...</option>
                    {bookings.map((b: any) => (
                      <option key={b.id} value={b.id}>
                        {b.serviceName || b.bookingCode} — {b.providerName}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">Hanya menampilkan booking yang sudah selesai</p>
              </div>

              {/* Frequency Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frekuensi Pengulangan</label>
                <div className="grid grid-cols-3 gap-3">
                  {FREQUENCIES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFrequency(f.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        frequency === f.value
                          ? 'border-primary-500 bg-primary-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        frequency === f.value ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <FrequencyIcon path={f.icon} className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${frequency === f.value ? 'text-primary-700' : 'text-gray-700'}`}>
                          {f.label}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{f.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => createMutation.mutate({ bookingId: selectedBooking, frequency })}
                  disabled={!selectedBooking || createMutation.isPending}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Membuat...
                    </span>
                  ) : (
                    'Buat Berulang'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
