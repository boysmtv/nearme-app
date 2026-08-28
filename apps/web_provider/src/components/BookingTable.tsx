import type { Booking, BookingStatus } from '../lib/types';

interface BookingTableProps {
  bookings: Booking[];
  onStatusChange?: (id: string, status: BookingStatus) => void;
}

const statusConfig: Record<BookingStatus, { label: string; color: string; dot: string }> = {
  HELD: { label: 'Ditahan', color: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  PENDING_PAYMENT: { label: 'Menunggu Bayar', color: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500' },
  PENDING_APPROVAL: { label: 'Menunggu Approval', color: 'bg-sky-50 text-sky-700 ring-sky-200', dot: 'bg-sky-500' },
  CONFIRMED: { label: 'Dikonfirmasi', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  CHECKED_IN: { label: 'Check-in', color: 'bg-indigo-50 text-indigo-700 ring-indigo-200', dot: 'bg-indigo-500' },
  EN_ROUTE: { label: 'Dalam Perjalanan', color: 'bg-violet-50 text-violet-700 ring-violet-200', dot: 'bg-violet-500' },
  IN_SERVICE: { label: 'Sedang Dilayani', color: 'bg-primary-50 text-primary-700 ring-primary-200', dot: 'bg-primary-500' },
  COMPLETED: { label: 'Selesai', color: 'bg-teal-50 text-teal-700 ring-teal-200', dot: 'bg-teal-500' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-gray-50 text-gray-600 ring-gray-200', dot: 'bg-gray-400' },
  NO_SHOW: { label: 'Tidak Datang', color: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
  EXPIRED: { label: 'Kedaluwarsa', color: 'bg-gray-50 text-gray-500 ring-gray-200', dot: 'bg-gray-300' },
};

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BookingTable({ bookings, onStatusChange: _onStatusChange }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-violet">
          <svg className="h-7 w-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="mt-4 font-medium text-gray-700">Tidak ada booking</p>
        <p className="mt-1 text-sm text-gray-400">Booking akan tampil di sini</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-soft-violet/60 via-white to-soft-pink/40">
            <tr>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Kode</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Pelanggan</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Layanan</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Staf</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Waktu</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Status</th>
              <th className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-600">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.HELD;
              return (
                <tr key={booking.id} className="group hover:bg-gradient-to-r hover:from-soft-violet/30 hover:to-soft-pink/20 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-primary-600">
                    <span className="inline-flex items-center rounded-lg bg-soft-violet px-2 py-1 text-xs font-bold text-primary-700 ring-1 ring-primary-100">{booking.bookingCode}</span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-xs font-bold text-white">{booking.customerName[0]}</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{booking.customerName}</div>
                        <div className="text-xs text-gray-500">{booking.customerPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">{booking.serviceName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{booking.staffName}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                      <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {booking.time}
                    </div>
                    <div className="text-xs text-gray-500">{booking.time} - {booking.endTime}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.color}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {status.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">{formatPrice(booking.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
