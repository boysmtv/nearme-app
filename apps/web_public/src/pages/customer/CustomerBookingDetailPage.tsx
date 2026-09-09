import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicApi } from '../../lib/api';
import CustomerLayout from '../../components/CustomerLayout';

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Dikonfirmasi',
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  IN_PROGRESS: 'Berlangsung',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  NO_SHOW: 'Tidak Hadir',
  PENDING_VERIFICATION: 'Menunggu Verifikasi',
  HELD: 'Ditahan',
  PENDING_APPROVAL: 'Menunggu Persetujuan',
  CHECKED_IN: 'Check-in',
  EN_ROUTE: 'Dalam Perjalanan',
  IN_SERVICE: 'Sedang Dilayani',
  EXPIRED: 'Kedaluwarsa',
};

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  PENDING_PAYMENT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  COMPLETED: 'bg-gray-50 text-gray-600 ring-gray-500/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/20',
  NO_SHOW: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  PENDING_VERIFICATION: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  HELD: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  PENDING_APPROVAL: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
  CHECKED_IN: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  EN_ROUTE: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  IN_SERVICE: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  EXPIRED: 'bg-gray-50 text-gray-500 ring-gray-400/20',
};

const LIFECYCLE_STEPS = [
  { key: 'CREATED', label: 'Dibuat', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { key: 'CONFIRMED', label: 'Dikonfirmasi', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'PAID', label: 'Dibayar', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { key: 'IN_PROGRESS', label: 'Berlangsung', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'COMPLETED', label: 'Selesai', icon: 'M5 13l4 4L19 7' },
];

function getLifecycleIndex(status: string): number {
  switch (status) {
    case 'HELD':
    case 'PENDING_PAYMENT':
    case 'PENDING_APPROVAL':
    case 'PENDING_VERIFICATION':
      return 0;
    case 'CONFIRMED':
    case 'CHECKED_IN':
      return 1;
    case 'PAID':
    case 'EN_ROUTE':
      return 2;
    case 'IN_SERVICE':
    case 'IN_PROGRESS':
      return 3;
    case 'COMPLETED':
      return 4;
    case 'CANCELLED':
    case 'NO_SHOW':
    case 'EXPIRED':
      return -1;
    default:
      return 0;
  }
}

function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(startsAt: string | undefined, endsAt: string | undefined): string {
  if (!startsAt || !endsAt) return '-';
  const ms = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} menit`;
  const hours = Math.floor(mins / 60);
  const remain = mins % 60;
  return remain > 0 ? `${hours} jam ${remain} menit` : `${hours} jam`;
}

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
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const [pinMsg, setPinMsg] = useState('');
  const [pinSuccess, setPinSuccess] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['customer-booking', id],
    queryFn: () => publicApi.bookings.getById(id!),
    enabled: !!id,
  });

  const rescheduleMutation = useMutation({
    mutationFn: (vars: { newStartsAt: string; newEndsAt: string; expectedVersion: number }) =>
      publicApi.bookings.reschedule(id!, vars),
    onSuccess: (res) => {
      queryClient.setQueryData(['customer-booking', id], res);
      setShowReschedule(false);
      setRescheduleDate('');
      setRescheduleTime('');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => publicApi.bookings.cancel(id!, reason),
    onSuccess: (res) => {
      queryClient.setQueryData(['customer-booking', id], res);
      setShowCancel(false);
      setCancelReason('');
    },
  });

  const pinMutation = useMutation({
    mutationFn: (pin: string) => publicApi.bookings.verifyPin(id!, pin),
    onSuccess: (res) => {
      queryClient.setQueryData(['customer-booking', id], res);
      setPinMsg('PIN terverifikasi!');
      setPinSuccess(true);
      setTimeout(() => {
        setShowPin(false);
        setPinDigits(['', '', '', '', '', '']);
        setPinMsg('');
        setPinSuccess(false);
      }, 1500);
    },
    onError: (e: any) => {
      setPinMsg(e.response?.data?.message || 'PIN salah, coba lagi');
      setPinSuccess(false);
    },
  });

  const booking = data?.data;

  const canCancel = ['CONFIRMED', 'PENDING_PAYMENT'].includes(booking?.status || '');
  const canReschedule = ['CONFIRMED', 'PENDING_PAYMENT'].includes(booking?.status || '');
  const canCheckIn = booking?.status === 'CONFIRMED';
  const lifecycleIndex = booking ? getLifecycleIndex(booking.status) : -1;

  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime || !booking) return;
    const startsAt = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();
    const endsAt = new Date(new Date(startsAt).getTime() + 60 * 60 * 1000).toISOString();
    rescheduleMutation.mutate({ newStartsAt: startsAt, newEndsAt: endsAt, expectedVersion: booking.rescheduleCount ?? 0 });
  };

  const handlePinDigit = (idx: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    if (!/^\d*$/.test(val)) return;
    const next = [...pinDigits];
    next[idx] = val;
    setPinDigits(next);
    if (val && idx < 5) {
      const nextInput = document.getElementById(`pin-${idx + 1}`);
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinDigits[idx] && idx > 0) {
      const prevInput = document.getElementById(`pin-${idx - 1}`);
      prevInput?.focus();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...pinDigits];
    for (let i = 0; i < 6; i++) next[i] = pasted[i] || '';
    setPinDigits(next);
    const focusIdx = pasted.length < 6 ? pasted.length : 5;
    document.getElementById(`pin-${focusIdx}`)?.focus();
  };

  const pinValue = pinDigits.join('');

  return (
    <CustomerLayout>
      <div className="max-w-screen-2xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Skeleton Loading */}
        {isLoading && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-6 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="h-6 w-28 rounded-full bg-gray-200 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
              <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            </div>
            <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Gagal Memuat Booking</h3>
            <p className="text-sm text-gray-500 mb-4">Terjadi kesalahan saat mengambil data booking.</p>
            <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Kembali
            </button>
          </div>
        )}

        {/* Not Found State */}
        {!isLoading && !error && !booking && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Booking Tidak Ditemukan</h3>
            <p className="text-sm text-gray-500 mb-4">Booking yang dicari tidak ada atau telah dihapus.</p>
            <Link to="/bookings" className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Lihat Semua Booking
            </Link>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && booking && (
          <>
            {/* Page Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => navigate(-1)}
                className="h-9 w-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-mono font-semibold text-gray-900">{booking.bookingCode}</span>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[booking.status] || 'bg-gray-50 text-gray-600 ring-gray-500/20'}`}>
                {STATUS_LABEL[booking.status] || booking.status?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Lifecycle Stepper */}
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
              <div className="flex items-center justify-between">
                {LIFECYCLE_STEPS.map((step, i) => {
                  const isCompleted = lifecycleIndex > i;
                  const isCurrent = lifecycleIndex === i;
                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                            ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                            : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                          </svg>
                        )}
                      </div>
                      <span className={`mt-2 text-xs font-medium text-center ${
                        isCompleted ? 'text-emerald-600' : isCurrent ? 'text-primary-700 font-semibold' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                      {i < LIFECYCLE_STEPS.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                          isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
                        }`} style={{ zIndex: -1 }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {lifecycleIndex === -1 && (
                <div className="mt-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${STATUS_COLORS[booking.status]}`}>
                    {STATUS_LABEL[booking.status] || booking.status}
                  </span>
                </div>
              )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service Details */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Detail Layanan</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Kode Booking</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{booking.bookingCode || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Tanggal & Waktu</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{formatDate(booking.startsAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Durasi</p>
                    <p className="font-semibold text-gray-900 mt-0.5">{formatDuration(booking.startsAt, booking.endsAt)}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Detail Pembayaran</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Total</p>
                    <p className="text-lg font-bold text-primary-600">{formatRupiah(booking.totalAmount || 0)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Deposit</p>
                    <p className="font-semibold text-gray-900">
                      {(booking.depositAmount ?? 0) > 0 ? formatRupiah(booking.depositAmount!) : 'Tanpa deposit'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STATUS_COLORS[booking.status] || 'bg-gray-50 text-gray-600 ring-gray-500/20'}`}>
                      {STATUS_LABEL[booking.status] || booking.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Metode</p>
                    <p className="font-semibold text-gray-900">Online</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation PIN Card */}
            {booking.confirmationPin && (
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl shadow-sm ring-1 ring-amber-200/50 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-amber-800">PIN Konfirmasi</h3>
                </div>
                <div className="flex items-center justify-center py-3">
                  <p className="text-4xl font-mono font-bold tracking-[0.5em] text-amber-900">{booking.confirmationPin}</p>
                </div>
                <p className="text-xs text-amber-600 text-center mt-1">Tunjukkan PIN ini saat check-in di lokasi</p>
              </div>
            )}

            {/* Policy Card */}
            {(booking.cancelPolicy || booking.rescheduleCount != null || booking.cancelDeadline) && (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Kebijakan Booking</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {booking.cancelPolicy && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Kebijakan Pembatalan</p>
                      <p className="font-semibold text-gray-900 mt-1 text-sm">{booking.cancelPolicy}</p>
                    </div>
                  )}
                  {booking.rescheduleCount != null && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">Reschedule</p>
                      <p className="font-semibold text-gray-900 mt-1 text-sm">
                        {booking.rescheduleCount} / {booking.maxReschedule ?? 1} kali
                      </p>
                    </div>
                  )}
                  {booking.cancelDeadline && (
                    <div className="bg-orange-50 rounded-xl p-3">
                      <p className="text-xs text-orange-500 uppercase tracking-wide">Batas Pembatalan</p>
                      <p className="font-semibold text-orange-700 mt-1 text-sm">
                        {new Date(booking.cancelDeadline).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {canCheckIn && (
                <button
                  onClick={() => { setShowPin(true); setPinMsg(''); setPinDigits(['', '', '', '', '', '']); setPinSuccess(false); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Cek PIN
                </button>
              )}
              {canReschedule && (
                <button
                  onClick={() => setShowReschedule(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Reschedule
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Batalkan
                </button>
              )}
              <Link
                to={`/bookings`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat Provider
              </Link>
              {booking.status === 'COMPLETED' && (
                <Link
                  to={`/search`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Booking Lagi
                </Link>
              )}
            </div>

            {/* Reschedule Modal */}
            {showReschedule && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowReschedule(false)}>
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Reschedule Booking</h3>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Tanggal baru</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mt-1.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Jam baru</label>
                    <input
                      type="time"
                      value={rescheduleTime}
                      onChange={(e) => setRescheduleTime(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mt-1.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none text-sm"
                    />
                  </div>
                  {rescheduleMutation.isError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Gagal melakukan reschedule
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowReschedule(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                      Batal
                    </button>
                    <button
                      onClick={handleReschedule}
                      disabled={!rescheduleDate || !rescheduleTime || rescheduleMutation.isPending}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-primary-700 transition-colors"
                    >
                      {rescheduleMutation.isPending ? 'Memproses...' : 'Reschedule'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel Modal */}
            {showCancel && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowCancel(false)}>
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-600">Batalkan Booking</h3>
                  </div>
                  <p className="text-sm text-gray-500">Yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.</p>
                  <div>
                    <label className="text-sm text-gray-600 font-medium">Alasan pembatalan (opsional)</label>
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Tuliskan alasan pembatalan..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 mt-1.5 h-20 resize-none focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none text-sm"
                    />
                  </div>
                  {cancelMutation.isError && (
                    <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-3 py-2">
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Gagal membatalkan booking
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowCancel(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                      Kembali
                    </button>
                    <button
                      onClick={() => cancelMutation.mutate(cancelReason || 'Dibatalkan oleh customer')}
                      disabled={cancelMutation.isPending}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-red-700 transition-colors"
                    >
                      {cancelMutation.isPending ? 'Memproses...' : 'Ya, Batalkan'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PIN Modal */}
            {showPin && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowPin(false)}>
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center">
                      <svg className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Masukkan PIN</h3>
                  </div>
                  <p className="text-sm text-gray-500">Masukkan 6 digit PIN konfirmasi dari booking Anda.</p>
                  <div className="flex justify-center gap-2" onPaste={handlePinPaste}>
                    {pinDigits.map((digit, i) => (
                      <input
                        key={i}
                        id={`pin-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinDigit(i, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(i, e)}
                        className="h-12 w-11 text-center text-xl font-mono font-bold border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                      />
                    ))}
                  </div>
                  {pinMsg && (
                    <div className={`flex items-center justify-center gap-2 text-sm rounded-xl px-3 py-2 ${
                      pinSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {pinSuccess ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                      {pinMsg}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => setShowPin(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors">
                      Batal
                    </button>
                    <button
                      onClick={() => pinMutation.mutate(pinValue)}
                      disabled={pinValue.length < 6 || pinMutation.isPending}
                      className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-primary-700 transition-colors"
                    >
                      {pinMutation.isPending ? 'Memverifikasi...' : 'Verifikasi'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}
