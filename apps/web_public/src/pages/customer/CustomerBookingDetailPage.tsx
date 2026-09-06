import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  PENDING_VERIFICATION: 'bg-purple-100 text-purple-700',
};

export default function CustomerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-booking', id],
    queryFn: () => api.get(`/bookings/${id}`),
    enabled: !!id,
  });

  const rescheduleMutation = useMutation({
    mutationFn: (vars: { newStartsAt: string; newEndsAt: string; expectedVersion: number }) =>
      api.post(`/bookings/${id}/reschedule`, vars),
    onSuccess: (res) => {
      queryClient.setQueryData(['customer-booking', id], res);
      setShowReschedule(false);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => api.post(`/bookings/${id}/cancel`, { reason }),
    onSuccess: (res) => {
      queryClient.setQueryData(['customer-booking', id], res);
      setShowCancel(false);
    },
  });

  const pinMutation = useMutation({
    mutationFn: (pin: string) => api.post(`/bookings/${id}/verify-pin`, { pin }),
    onSuccess: (res) => {
      queryClient.setQueryData(['customer-booking', id], res);
      setPinMsg('PIN terverifikasi!');
      setShowPin(false);
    },
    onError: (e: any) => {
      setPinMsg(e.response?.data?.message || 'PIN salah');
    },
  });

  const booking = data?.data;

  if (isLoading) return <div className="max-w-2xl mx-auto p-6"><div className="h-64 animate-pulse rounded-xl bg-gray-100" /></div>;
  if (error) return <div className="max-w-2xl mx-auto p-6"><p className="text-red-500">Gagal memuat booking</p></div>;
  if (!booking) return <div className="max-w-2xl mx-auto p-6"><p>Booking tidak ditemukan</p></div>;

  const canCancel = ['CONFIRMED', 'PENDING_PAYMENT'].includes(booking.status);
  const canReschedule = ['CONFIRMED', 'PENDING_PAYMENT'].includes(booking.status);
  const canCheckIn = booking.status === 'CONFIRMED';

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) return;
    const startsAt = `${rescheduleDate}T${rescheduleTime}:00+07:00`;
    const endDate = new Date(new Date(startsAt).getTime() + 60 * 60 * 1000);
    const endsAt = endDate.toISOString().replace('Z', '+07:00');
    rescheduleMutation.mutate({ newStartsAt: startsAt, newEndsAt: endsAt, expectedVersion: booking.version ?? 1 });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detail Booking</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-600'}`}>
          {booking.status?.replace('_', ' ')}
        </span>
        <span className="text-sm text-gray-500 font-mono">{booking.bookingCode}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase">Layanan</p>
            <p className="font-semibold text-gray-900">{booking.serviceName || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Provider</p>
            <p className="font-semibold text-gray-900">{booking.providerName || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Tanggal & Waktu</p>
            <p className="font-semibold text-gray-900">
              {booking.startsAt ? new Date(booking.startsAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }) : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Staf</p>
            <p className="font-semibold text-gray-900">{booking.staffName || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Total</p>
            <p className="text-lg font-bold text-primary-600">Rp {(booking.total || booking.totalAmount || 0).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Deposit</p>
            <p className="font-semibold text-gray-900">
              {booking.depositAmount > 0 ? `Rp ${booking.depositAmount.toLocaleString('id-ID')}` : 'Tanpa deposit'}
            </p>
          </div>
        </div>

        {booking.confirmationPin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-xs text-yellow-600 uppercase font-medium">PIN Konfirmasi</p>
            <p className="text-3xl font-bold tracking-widest text-yellow-800 mt-1">{booking.confirmationPin}</p>
            <p className="text-xs text-yellow-500 mt-1">Tunjukkan PIN ini saat check-in</p>
          </div>
        )}

        {booking.cancelPolicy && (
          <p className="text-xs text-gray-400">Kebijakan: {booking.cancelPolicy} | Reschedule: {booking.rescheduleCount ?? 0}/{booking.maxReschedule ?? 1}</p>
        )}
        {booking.cancelDeadline && (
          <p className="text-xs text-orange-500">Batas pembatalan: {new Date(booking.cancelDeadline).toLocaleString('id-ID')}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {canCheckIn && (
          <button onClick={() => { setShowPin(true); setPinMsg(''); setPin(''); }}
            className="px-4 py-2 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Check-in (PIN)
          </button>
        )}
        {canReschedule && (
          <button onClick={() => setShowReschedule(true)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Reschedule
          </button>
        )}
        {canCancel && (
          <button onClick={() => setShowCancel(true)}
            className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors">
            Batalkan
          </button>
        )}
        <Link to={`/booking/${booking.tenantId || booking.providerId}/chat`}
          className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Chat Provider
        </Link>
      </div>

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowReschedule(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Reschedule Booking</h3>
            <div>
              <label className="text-sm text-gray-600 font-medium">Tanggal baru</label>
              <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-medium">Jam baru</label>
              <input type="time" value={rescheduleTime} onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:border-primary-500 focus:outline-none" />
            </div>
            {rescheduleMutation.isError && <p className="text-sm text-red-500">Gagal melakukan reschedule</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowReschedule(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Batal</button>
              <button onClick={handleReschedule} disabled={!rescheduleDate || !rescheduleTime || rescheduleMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {rescheduleMutation.isPending ? 'Memproses...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCancel(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-600">Batalkan Booking</h3>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Alasan pembatalan (opsional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 resize-none focus:border-primary-500 focus:outline-none" />
            {cancelMutation.isError && <p className="text-sm text-red-500">Gagal membatalkan booking</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowCancel(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Kembali</button>
              <button onClick={() => cancelMutation.mutate(cancelReason || 'Dibatalkan oleh customer')} disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {cancelMutation.isPending ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN Modal */}
      {showPin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowPin(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900">Masukkan PIN</h3>
            <input type="text" value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6}
              placeholder="6 digit PIN"
              className="w-full border border-gray-300 rounded-lg px-3 py-3 text-center text-2xl tracking-widest focus:border-primary-500 focus:outline-none" />
            {pinMsg && <p className="text-sm text-center text-red-500">{pinMsg}</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowPin(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Batal</button>
              <button onClick={() => pinMutation.mutate(pin)} disabled={pin.length < 6 || pinMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold disabled:opacity-50">
                {pinMutation.isPending ? 'Memverifikasi...' : 'Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
