import { render, screen } from '@testing-library/react';
import BookingTable from '../BookingTable';
import type { Booking } from '../../lib/types';

const mockBooking: Booking = {
  id: '1',
  code: 'DKT-001',
  customerName: 'Siti Aminah',
  customerEmail: 'siti@example.com',
  customerPhone: '081234567890',
  serviceName: 'Potong Rambut',
  staffName: 'Andi',
  startTime: '2026-08-25T10:00:00Z',
  endTime: '2026-08-25T10:30:00Z',
  status: 'CONFIRMED',
  totalAmount: 50000,
  depositPaid: 10000,
  notes: '',
  createdAt: '2026-08-24T08:00:00Z',
};

describe('BookingTable', () => {
  it('renders empty state when no bookings', () => {
    render(<BookingTable bookings={[]} />);
    expect(screen.getByText('Tidak ada booking')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<BookingTable bookings={[mockBooking]} />);
    expect(screen.getByText('Kode')).toBeInTheDocument();
    expect(screen.getByText('Pelanggan')).toBeInTheDocument();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
    expect(screen.getByText('Staf')).toBeInTheDocument();
    expect(screen.getByText('Waktu')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('renders booking data row', () => {
    render(<BookingTable bookings={[mockBooking]} />);
    expect(screen.getByText('DKT-001')).toBeInTheDocument();
    expect(screen.getByText('Siti Aminah')).toBeInTheDocument();
    expect(screen.getByText('081234567890')).toBeInTheDocument();
    expect(screen.getByText('Potong Rambut')).toBeInTheDocument();
    expect(screen.getByText('Andi')).toBeInTheDocument();
  });

  it('renders correct status badge for CONFIRMED', () => {
    render(<BookingTable bookings={[mockBooking]} />);
    const badge = screen.getByText('Dikonfirmasi');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-800');
  });

  it('renders correct status badge for CANCELLED', () => {
    const cancelled = { ...mockBooking, status: 'CANCELLED' as const };
    render(<BookingTable bookings={[cancelled]} />);
    const badge = screen.getByText('Dibatalkan');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
  });

  it('renders correct status badge for HELD', () => {
    const held = { ...mockBooking, status: 'HELD' as const };
    render(<BookingTable bookings={[held]} />);
    expect(screen.getByText('Ditahan')).toBeInTheDocument();
  });

  it('renders formatted price in IDR', () => {
    render(<BookingTable bookings={[mockBooking]} />);
    expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
  });

  it('renders multiple bookings', () => {
    const second: Booking = {
      ...mockBooking,
      id: '2',
      code: 'DKT-002',
      customerName: 'Budi',
      status: 'PENDING_PAYMENT',
    };
    render(<BookingTable bookings={[mockBooking, second]} />);
    expect(screen.getByText('DKT-001')).toBeInTheDocument();
    expect(screen.getByText('DKT-002')).toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();
  });
});
