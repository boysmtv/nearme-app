type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';
const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200',
  error: 'bg-rose-50 text-rose-700 ring-rose-200',
  info: 'bg-sky-50 text-sky-700 ring-sky-200',
  neutral: 'bg-gray-50 text-gray-600 ring-gray-200',
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

const dotColor: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-gray-400',
};

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const variant = statusMap[status] || 'neutral';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${variantStyles[variant]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor[variant]}`} />
      {customLabel || labelMap[status] || status}
    </span>
  );
}
