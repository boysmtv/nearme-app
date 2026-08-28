import type { Service, Staff, TimeSlot, Addon } from '../lib/types';

interface BookingSummaryProps {
  service: Service;
  staff: Staff | null;
  slot: TimeSlot | null;
  selectedAddons: Addon[];
  depositRequired: boolean;
  onConfirm: () => void;
  isPending: boolean;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export default function BookingSummary({
  service,
  staff,
  slot,
  selectedAddons,
  depositRequired,
  onConfirm,
  isPending,
}: BookingSummaryProps) {
  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const subtotal = service.price + addonTotal;
  const deposit = depositRequired ? service.depositAmount : 0;
  const total = subtotal;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Ringkasan Booking</h3>

      <div className="mt-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Layanan</span>
          <span className="font-medium text-gray-900">{service.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Durasi</span>
          <span className="text-gray-700">{service.duration} menit</span>
        </div>
        {staff && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Staf</span>
            <span className="text-gray-700">{staff.name}</span>
          </div>
        )}
        {slot && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Waktu</span>
            <span className="text-gray-700">{formatDateTime(slot.startTime)}</span>
          </div>
        )}

        {selectedAddons.length > 0 && (
          <>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm font-medium text-gray-700">Add-on</p>
            </div>
            {selectedAddons.map((addon) => (
              <div key={addon.id} className="flex justify-between text-sm">
                <span className="text-gray-500">{addon.name}</span>
                <span className="text-gray-700">+{formatPrice(addon.price)}</span>
              </div>
            ))}
          </>
        )}

        <div className="border-t border-gray-100 pt-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Harga layanan</span>
            <span className="text-gray-700">{formatPrice(service.price)}</span>
          </div>
          {addonTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Add-on</span>
              <span className="text-gray-700">{formatPrice(addonTotal)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between">
            <span className="text-base font-semibold text-gray-900">Total</span>
            <span className="text-base font-bold text-primary-600">{formatPrice(total)}</span>
          </div>
        </div>

        {depositRequired && (
          <div className="rounded-lg bg-amber-50 p-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-amber-800">Deposit yang perlu dibayar sekarang</span>
              <span className="font-bold text-amber-800">{formatPrice(deposit)}</span>
            </div>
            <p className="mt-1 text-xs text-amber-600">
              Sisa pembayaran {formatPrice(total - deposit)} dapat dibayar di lokasi
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={isPending || !slot}
        className="mt-6 w-full rounded-lg bg-primary-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Memproses...' : depositRequired ? `Bayar Deposit ${formatPrice(deposit)}` : 'Konfirmasi Booking'}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        Dengan melanjutkan, Anda menyetujui syarat & ketentuan pemesanan
      </p>
    </div>
  );
}
