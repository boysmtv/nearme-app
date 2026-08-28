import type { TimeSlot } from '../lib/types';

interface SlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId: string | null;
  onSelect: (slot: TimeSlot) => void;
  isLoading: boolean;
}

export default function SlotPicker({ slots, selectedSlotId, onSelect, isLoading }: SlotPickerProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-5 w-32 animate-pulse rounded bg-[#e8e8ff]" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-[#FAF9FF] ring-1 ring-[#E8E8FF]" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#d0d0ff] bg-[#FAF9FF] p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8e8ff] text-[#8B8CFF]">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="mt-3 text-sm font-semibold text-gray-700">Tidak ada slot tersedia untuk tanggal ini</p>
        <p className="text-xs text-gray-400">Coba pilih tanggal lain atau staf berbeda</p>
        <span className="mt-3 inline-flex rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 ring-1 ring-[#E8E8FF]">✦ Tip: Pilih pagi atau sore hari</span>
      </div>
    );
  }

  const grouped = slots.reduce<Record<string, TimeSlot[]>>((acc, slot) => {
    const hour = new Date(slot.startTime).getHours();
    const period = hour < 12 ? 'Pagi' : hour < 17 ? 'Siang' : 'Sore';
    if (!acc[period]) acc[period] = [];
    acc[period].push(slot);
    return acc;
  }, {});

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const periodMeta: Record<string, { icon: string; color: string; bg: string }> = {
    Pagi: { icon: '🌅', color: 'text-amber-600', bg: 'bg-[#fff4d6]' },
    Siang: { icon: '☀️', color: 'text-sky-600', bg: 'bg-[#e8f2ff]' },
    Sore: { icon: '🌙', color: 'text-[#6a6acc]', bg: 'bg-[#e8e8ff]' },
  };

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([period, periodSlots]) => (
        <div key={period}>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs ${periodMeta[period]?.bg ?? 'bg-[#FAF9FF]'}`}>{periodMeta[period]?.icon ?? '⏰'}</span>
            {period}
            <span className="rounded-full bg-[#FAF9FF] px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-[#E8E8FF]">{periodSlots.length} slot</span>
          </h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {periodSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && onSelect(slot)}
                disabled={!slot.available}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  selectedSlotId === slot.id
                    ? 'border-[#8B8CFF] bg-gradient-to-br from-[#8B8CFF] to-[#A5A6FF] text-white shadow-md shadow-[#8B8CFF]/25 scale-[1.02]'
                    : slot.available
                      ? 'border-[#E8E8FF] bg-white text-gray-700 hover:border-[#b8b5ff] hover:bg-[#FAF9FF] hover:shadow-sm hover:-translate-y-0.5'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through'
                }`}
              >
                {formatTime(slot.startTime)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
