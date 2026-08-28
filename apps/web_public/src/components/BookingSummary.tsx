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
    <div className="rounded-2xl border border-[#E8E8FF] bg-white p-6 shadow-lg shadow-[#8B8CFF]/10">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-white">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        </span>
        <h3 className="text-base font-black text-gray-900">Ringkasan Booking</h3>
        <span className="ml-auto rounded-full bg-[#e6f7ee] px-2.5 py-1 text-xs font-bold text-emerald-700">✦ Aman</span>
      </div>

      <div className="mt-5 space-y-3">
        <div className="rounded-xl bg-[#FAF9FF] p-3 ring-1 ring-[#E8E8FF]/60">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[#8B8CFF]" /> Layanan</span>
            <span className="font-bold text-gray-900">{service.name}</span>
          </div>
          <div className="mt-2 flex justify-between text-xs">
            <span className="text-gray-400">Durasi</span>
            <span className="rounded-full bg-white px-2 py-0.5 font-medium text-gray-700 ring-1 ring-[#E8E8FF]">{service.duration} menit</span>
          </div>
        </div>
        {staff && (
          <div className="flex justify-between text-sm rounded-xl bg-[#e8f2ff]/40 px-3 py-2">
            <span className="text-gray-500">Staf</span>
            <span className="font-semibold text-gray-700">{staff.name}</span>
          </div>
        )}
        {slot ? (
          <div className="flex justify-between text-sm gap-3">
            <span className="text-gray-500 shrink-0">Waktu</span>
            <span className="text-right font-medium text-gray-700">{formatDateTime(slot.startTime)}</span>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#d0d0ff] bg-[#FAF9FF] px-3 py-2 text-center text-xs text-[#8B8CFF]">Pilih jadwal untuk melanjutkan</div>
        )}

        {selectedAddons.length > 0 && (
          <>
            <div className="border-t border-[#E8E8FF] pt-3">
              <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><span className="h-6 w-6 rounded-full bg-[#fff4d6] flex items-center justify-center text-[10px]">＋</span> Add-on</p>
            </div>
            {selectedAddons.map((addon) => (
              <div key={addon.id} className="flex justify-between text-sm bg-[#FAF9FF] rounded-lg px-3 py-1.5">
                <span className="text-gray-600">{addon.name}</span>
                <span className="font-semibold text-gray-700">+{formatPrice(addon.price)}</span>
              </div>
            ))}
          </>
        )}

        <div className="border-t border-[#E8E8FF] pt-3 space-y-1.5">
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

        <div className="rounded-xl bg-gradient-to-r from-[#e8e8ff] to-[#ffe8ec] p-3 ring-1 ring-[#E8E8FF]">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-lg font-black text-[#6a6acc]">{formatPrice(total)}</span>
          </div>
        </div>

        {depositRequired && (
          <div className="rounded-xl bg-gradient-to-br from-[#fff4d6] to-[#fff8e1] p-3 ring-1 ring-amber-200">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-amber-800 flex items-center gap-1"><span>💳</span> Deposit sekarang</span>
              <span className="font-black text-amber-800">{formatPrice(deposit)}</span>
            </div>
            <p className="mt-1 text-xs text-amber-700">
              Sisa {formatPrice(total - deposit)} dibayar di lokasi
            </p>
          </div>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={isPending || !slot}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-[#8B8CFF] to-[#A5A6FF] px-4 py-3.5 font-bold text-white shadow-md shadow-[#8B8CFF]/25 transition-all hover:shadow-lg hover:opacity-[0.95] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {isPending ? '⏳ Memproses...' : depositRequired ? `✦ Bayar Deposit ${formatPrice(deposit)}` : '✦ Konfirmasi Booking'}
      </button>

      <p className="mt-3 text-center text-xs text-gray-400">
        🔒 Aman & terenkripsi • Dengan melanjutkan, Anda menyetujui S&K
      </p>
    </div>
  );
}
