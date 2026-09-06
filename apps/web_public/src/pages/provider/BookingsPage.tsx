import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { providerApi } from '../../lib/api';
import ProviderLayout from '../../components/ProviderLayout';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
  { value: 'IN_PROGRESS', label: 'Berlangsung' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
  { value: 'NO_SHOW', label: 'Tidak Hadir' },
];

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-orange-100 text-orange-700',
  PENDING_VERIFICATION: 'bg-purple-100 text-purple-700',
};

const STATUS_OPTIONS_UPDATE = [
  { value: 'IN_PROGRESS', label: 'Mulai' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'NO_SHOW', label: 'Tidak Hadir' },
  { value: 'CANCELLED', label: 'Batalkan' },
];

export default function ProviderBookingsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['provider-bookings', page, status, date],
    queryFn: () => providerApi.bookings.list({ page, limit: 20, status: status || undefined, date: date || undefined }),
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['provider-booking-detail', detailId],
    queryFn: () => providerApi.bookings.getById(detailId!),
    enabled: !!detailId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      providerApi.bookings.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['provider-booking-detail'] });
      setDetailId(null);
    },
  });

  const bookings = data?.data?.data ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const detail = detailData?.data;

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Booking</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl bg-white shadow ring-1 ring-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Kode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pelanggan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Layanan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Staf</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Memuat...</td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">Tidak ada booking</td></tr>
              ) : bookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setDetailId(b.id)}>
                  <td className="px-4 py-3 text-sm font-mono font-medium text-primary-600">{b.bookingCode || b.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{b.customerName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.serviceName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.staffName || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{b.slotTime ? new Date(b.slotTime).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">Rp{(b.totalAmount ?? 0).toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-sm text-primary-600 hover:underline" onClick={(e) => { e.stopPropagation(); setDetailId(b.id); }}>Detail</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40">Sebelumnya</button>
            <span className="text-sm text-gray-600">Halaman {page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40">Berikutnya</button>
          </div>
        )}

        {/* Detail Modal */}
        {detailId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetailId(null)}>
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              {detailLoading ? (
                <div className="py-8 text-center text-sm text-gray-500">Memuat detail...</div>
              ) : detail ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Detail Booking</h2>
                    <button onClick={() => setDetailId(null)} className="text-gray-400 hover:text-gray-600">&times;</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Kode:</span> <span className="font-mono font-medium">{detail.bookingCode}</span></div>
                    <div><span className="text-gray-500">Status:</span> <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[detail.status] || 'bg-gray-100 text-gray-600'}`}>{detail.status}</span></div>
                    <div><span className="text-gray-500">Pelanggan:</span> {detail.customerName || '-'}</div>
                    <div><span className="text-gray-500">Telepon:</span> {detail.customerPhone || '-'}</div>
                    <div><span className="text-gray-500">Layanan:</span> {detail.serviceName || '-'}</div>
                    <div><span className="text-gray-500">Staf:</span> {detail.staffName || '-'}</div>
                    <div><span className="text-gray-500">Waktu:</span> {detail.slotTime ? new Date(detail.slotTime).toLocaleString('id-ID') : '-'}</div>
                    <div><span className="text-gray-500">Total:</span> Rp{(detail.totalAmount ?? 0).toLocaleString('id-ID')}</div>
                    <div><span className="text-gray-500">Deposit:</span> Rp{(detail.depositAmount ?? 0).toLocaleString('id-ID')}</div>
                    <div><span className="text-gray-500">PIN:</span> <span className="font-mono">{detail.confirmationPin || '-'}</span></div>
                  </div>

                  {/* Status Update */}
                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Update Status:</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS_UPDATE.filter((o) => {
                        if (detail.status === 'CONFIRMED') return ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'].includes(o.value);
                        if (detail.status === 'IN_PROGRESS') return ['COMPLETED', 'CANCELLED'].includes(o.value);
                        if (detail.status === 'PENDING_PAYMENT') return ['CONFIRMED', 'CANCELLED'].includes(o.value);
                        return false;
                      }).map((o) => (
                        <button
                          key={o.value}
                          disabled={statusMutation.isPending}
                          onClick={() => statusMutation.mutate({ id: detail.id, status: o.value })}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">Data tidak ditemukan</div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProviderLayout>
  );
}
