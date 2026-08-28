import { render, screen, fireEvent } from '@testing-library/react';
import SlotPicker from '../SlotPicker';
import type { TimeSlot } from '../../lib/types';

const morningSlot: TimeSlot = {
  id: 'slot-1',
  startTime: '2026-08-26T09:00:00+07:00',
  endTime: '2026-08-26T09:30:00+07:00',
  available: true,
};

const afternoonSlot: TimeSlot = {
  id: 'slot-2',
  startTime: '2026-08-26T13:00:00+07:00',
  endTime: '2026-08-26T13:30:00+07:00',
  available: true,
};

const eveningSlot: TimeSlot = {
  id: 'slot-3',
  startTime: '2026-08-26T18:00:00+07:00',
  endTime: '2026-08-26T18:30:00+07:00',
  available: true,
};

const unavailableSlot: TimeSlot = {
  id: 'slot-4',
  startTime: '2026-08-26T10:00:00+07:00',
  endTime: '2026-08-26T10:30:00+07:00',
  available: false,
};

const onSelect = vi.fn();

function renderPicker(slots: TimeSlot[] = [], isLoading = false, selectedSlotId: string | null = null) {
  return render(
    <SlotPicker
      slots={slots}
      selectedSlotId={selectedSlotId}
      onSelect={onSelect}
      isLoading={isLoading}
    />
  );
}

describe('SlotPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan loading skeleton saat isLoading true', () => {
    renderPicker([], true);
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('menampilkan pesan kosong jika tidak ada slot', () => {
    renderPicker([]);
    expect(screen.getByText('Tidak ada slot tersedia untuk tanggal ini')).toBeInTheDocument();
    expect(screen.getByText('Coba pilih tanggal lain atau staf berbeda')).toBeInTheDocument();
  });

  it('mengelompokkan slot berdasarkan periode waktu', () => {
    renderPicker([morningSlot, afternoonSlot, eveningSlot]);
    expect(screen.getByText('Pagi')).toBeInTheDocument();
    expect(screen.getByText('Siang')).toBeInTheDocument();
    expect(screen.getByText('Sore')).toBeInTheDocument();
  });

  it('menampilkan waktu slot yang benar', () => {
    renderPicker([morningSlot, afternoonSlot]);
    expect(screen.getByText('09.00')).toBeInTheDocument();
    expect(screen.getByText('13.00')).toBeInTheDocument();
  });

  it('memanggil onSelect saat slot diklik', () => {
    renderPicker([morningSlot]);
    fireEvent.click(screen.getByText('09.00'));
    expect(onSelect).toHaveBeenCalledWith(morningSlot);
  });

  it('tidak memanggil onSelect jika slot tidak tersedia', () => {
    renderPicker([unavailableSlot]);
    const btn = screen.getByText('10.00');
    fireEvent.click(btn);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('slot yang tersedia memiliki class disabled jika available false', () => {
    renderPicker([unavailableSlot]);
    const btn = screen.getByText('10.00');
    expect(btn).toBeDisabled();
    expect(btn).toHaveClass('line-through');
  });

  it('slot yang dipilih memiliki styling berbeda', () => {
    renderPicker([morningSlot], false, 'slot-1');
    const btn = screen.getByText('09.00');
    expect(btn).toHaveClass('border-[#8B8CFF]');
  });
});
