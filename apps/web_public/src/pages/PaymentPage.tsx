import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../lib/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const paymentId = searchParams.get('paymentId');

  const { data: paymentRes, isLoading, error } = useQuery({
    queryKey: ['payment', paymentId || bookingId],
    queryFn: async () => {
      if (paymentId) {
        const res = await publicApi.bookings.getById(paymentId);
        return res.data;
      }
      if (bookingId) {
        const res = await publicApi.bookings.getById(bookingId);
        return res.data;
      }
      throw new Error('No payment or booking ID provided');
    },
    enabled: !!(paymentId || bookingId),
  });

  const status = paymentRes?.status || 'UNKNOWN';
  const isCompleted = status === 'CAPTURED' || status === 'SETTLEMENT' || status === 'SUCCESS' || status === 'CONFIRMED';
  const isPending = status === 'PENDING' || status === 'PENDING_PAYMENT';
  const isFailed = status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 lg:px-8">
          <nav className="mb-6 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary-600">Beranda</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Pembayaran</span>
          </nav>

          {isLoading && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
              <p className="mt-4 text-sm text-gray-500">Memuat detail pembayaran...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">Gagal Memuat</h2>
              <p className="mt-2 text-sm text-gray-500">Data pembayaran tidak ditemukan.</p>
              <Link to="/" className="mt-4 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
                Kembali ke Beranda
              </Link>
            </div>
          )}

          {paymentRes && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="text-center">
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isCompleted ? 'bg-green-100' : isPending ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  {isCompleted ? (
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isPending ? (
                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {isCompleted ? 'Pembayaran Berhasil' : isPending ? 'Menunggu Pembayaran' : 'Pembayaran Gagal'}
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  {isCompleted ? 'Pembayaran Anda telah diterima.' : isPending ? 'Silakan selesaikan pembayaran.' : 'Pembayaran tidak dapat diproses.'}
                </p>
              </div>

              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kode Booking</span>
                    <span className="font-medium text-gray-900">{paymentRes.bookingCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-medium ${isCompleted ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-red-600'}`}>
                      {status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-gray-900">{formatPrice(paymentRes.totalAmount || paymentRes.depositAmount || 0)}</span>
                  </div>
                  {paymentRes.depositAmount && paymentRes.depositAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Deposit</span>
                      <span className="font-medium text-gray-900">{formatPrice(paymentRes.depositAmount)}</span>
                    </div>
                  )}
                  {paymentRes.confirmationPin && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">PIN Konfirmasi</span>
                      <span className="font-mono font-bold text-yellow-600">{paymentRes.confirmationPin}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Waktu</span>
                    <span className="text-gray-700">{paymentRes.createdAt ? new Date(paymentRes.createdAt).toLocaleString('id-ID') : '-'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                {isPending && paymentRes.confirmationPin && (
                  <Link
                    to={`/bookings/${paymentRes.id}`}
                    className="w-full rounded-lg bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Verifikasi PIN & Check-in
                  </Link>
                )}
                {isCompleted && (
                  <Link
                    to={`/bookings/${paymentRes.id}`}
                    className="w-full rounded-lg bg-primary-600 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Lihat Detail Booking
                  </Link>
                )}
                <Link
                  to="/"
                  className="w-full rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Kembali ke Beranda
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
