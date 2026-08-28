import { render, screen, fireEvent } from '@testing-library/react';
import BookingSummary from '../BookingSummary';
import type { Service, Staff, TimeSlot, Addon } from '../../lib/types';

const baseService: Service = {
  id: 'svc-1',
  providerId: 'prov-1',
  name: 'Potong Rambut',
  description: 'Potong rambut pria',
  duration: 30,
  price: 50000,
  priceType: 'FIXED',
  depositAmount: 20000,
  category: 'Barbershop',
  addons: [],
  imageUrl: '',
};

const staff: Staff = {
  id: 'staff-1',
  providerId: 'prov-1',
  name: 'Andi',
  avatarUrl: '',
  bio: '',
  specialties: [],
  rating: 4.5,
  reviewCount: 10,
};

const slot: TimeSlot = {
  id: 'slot-1',
  startTime: '2026-08-26T10:00:00+07:00',
  endTime: '2026-08-26T10:30:00+07:00',
  available: true,
};

const addon: Addon = {
  id: 'addon-1',
  name: 'Pijat Kepala',
  price: 20000,
  duration: 15,
};

const onConfirm = vi.fn();

function renderSummary(overrides = {}) {
  const defaults = {
    service: baseService,
    staff: null as Staff | null,
    slot: null as TimeSlot | null,
    selectedAddons: [] as Addon[],
    depositRequired: false,
    onConfirm,
    isPending: false,
  };
  return render(<BookingSummary {...defaults} {...overrides} />);
}

describe('BookingSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('menampilkan judul Ringkasan Booking', () => {
    renderSummary({ slot });
    expect(screen.getByText('Ringkasan Booking')).toBeInTheDocument();
  });

  it('menampilkan nama layanan dan durasi', () => {
    renderSummary({ slot });
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    expect(screen.getByText('30 menit')).toBeInTheDocument();
  });

  it('menampilkan nama staf jika dipilih', () => {
    renderSummary({ staff, slot });
    expect(screen.getByText('Andi')).toBeInTheDocument();
  });

  it('tidak menampilkan staf jika null', () => {
    renderSummary({ slot });
    expect(screen.queryByText('Staf')).not.toBeInTheDocument();
  });

  it('menampilkan waktu booking jika slot dipilih', () => {
    renderSummary({ slot });
    expect(screen.getByText('Waktu')).toBeInTheDocument();
  });

  it('menghitung total dengan add-on', () => {
    renderSummary({ selectedAddons: [addon], slot });
    expect(screen.getAllByText(/Rp\s*20\.000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Rp\s*70\.000/)).toBeInTheDocument();
  });

  it('menampilkan deposit jika depositRequired true', () => {
    renderSummary({ depositRequired: true, slot });
    expect(screen.getByText('Deposit yang perlu dibayar sekarang')).toBeInTheDocument();
    expect(screen.getAllByText(/Rp\s*20\.000/).length).toBeGreaterThanOrEqual(1);
  });

  it('tidak menampilkan deposit jika depositRequired false', () => {
    renderSummary({ slot });
    expect(screen.queryByText('Deposit yang perlu dibayar sekarang')).not.toBeInTheDocument();
  });

  it('tombol konfirmasi disabled jika isPending', () => {
    renderSummary({ isPending: true, slot });
    const btn = screen.getByRole('button', { name: /Memproses/ });
    expect(btn).toBeDisabled();
  });

  it('tombol konfirmasi disabled jika slot tidak dipilih', () => {
    renderSummary({ slot: null });
    const btn = screen.getByRole('button', { name: /Konfirmasi Booking/ });
    expect(btn).toBeDisabled();
  });

  it('menampilkan teks Bayar Deposit jika depositRequired', () => {
    renderSummary({ depositRequired: true, slot });
    expect(screen.getByRole('button', { name: /Bayar Deposit/ })).toBeInTheDocument();
  });

  it('memanggil onConfirm saat tombol diklik', () => {
    renderSummary({ slot });
    fireEvent.click(screen.getByRole('button', { name: /Konfirmasi Booking/ }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
