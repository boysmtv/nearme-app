type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

const statusMap: Record<string, BadgeVariant> = {
  ACTIVE: 'success', APPROVED: 'success', PAID: 'success', COMPLETED: 'success', RESOLVED: 'success', CLOSED: 'success',
  PENDING: 'warning', PENDING_PAYMENT: 'warning', PENDING_APPROVAL: 'warning', UNDER_REVIEW: 'warning', OPEN: 'warning', IN_PROGRESS: 'warning', WAITING_CUSTOMER: 'warning',
  FAILED: 'error', REJECTED: 'error', CANCELLED: 'error', SUSPENDED: 'error', NO_SHOW: 'error', REFUNDED: 'error', EXPIRED: 'error',
  DRAFT: 'neutral', INACTIVE: 'neutral', SUBMITTED: 'info',
};

const labelMap: Record<string, string> = {
  ACTIVE: 'Aktif', APPROVED: 'Disetujui', PAID: 'Dibayar', COMPLETED: 'Selesai',
  PENDING: 'Menunggu', PENDING_PAYMENT: 'Menunggu Bayar', PENDING_APPROVAL: 'Menunggu Approval',
  UNDER_REVIEW: 'Sedang Ditinjau', SUBMITTED: 'Diajukan', DRAFT: 'Draf',
  FAILED: 'Gagal', REJECTED: 'Ditolak', CANCELLED: 'Dibatalkan', SUSPENDED: 'Ditangguhkan',
  OPEN: 'Terbuka', IN_PROGRESS: 'Dalam Proses', WAITING_CUSTOMER: 'Menunggu Pelanggan',
  RESOLVED: 'Selesai', CLOSED: 'Ditutup', NO_SHOW: 'Tidak Datang', EXPIRED: 'Kedaluwarsa',
  REFUNDED: 'Dikembalikan', INACTIVE: 'Nonaktif',
};

interface StatusBadgeProps { status: string; customLabel?: string; }

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const variant = statusMap[status] || 'neutral';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantStyles[variant]}`}>
      {customLabel || labelMap[status] || status}
    </span>
  );
}
