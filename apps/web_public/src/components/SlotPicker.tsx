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
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
        <svg
          className="mx-auto h-8 w-8 text-gray-400"
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
        <p className="mt-2 text-sm text-gray-500">Tidak ada slot tersedia untuk tanggal ini</p>
        <p className="text-xs text-gray-400">Coba pilih tanggal lain atau staf berbeda</p>
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

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([period, periodSlots]) => (
        <div key={period}>
          <h4 className="mb-2 text-sm font-medium text-gray-700">{period}</h4>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {periodSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => slot.available && onSelect(slot)}
                disabled={!slot.available}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  selectedSlotId === slot.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-200'
                    : slot.available
                      ? 'border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 line-through'
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
