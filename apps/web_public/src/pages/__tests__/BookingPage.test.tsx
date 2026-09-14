import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingPage from '../BookingPage';

vi.mock('../../lib/api', () => ({
  publicApi: {
    services: { listByProvider: vi.fn() },
    staff: { listByProvider: vi.fn() },
    availability: { getSlots: vi.fn() },
    bookings: {
      create: vi.fn(),
      createPaymentIntent: vi.fn(),
      verifyPin: vi.fn(),
      reschedule: vi.fn(),
      calendarLink: vi.fn(),
      ics: vi.fn(),
      validateCoupon: vi.fn(),
    },
    customer: { getProfile: vi.fn() },
    policies: { listPublic: vi.fn() },
  },
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: null, isAuthenticated: false }),
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../../components/SlotPicker', () => ({
  default: ({ slots, onSelect }: any) => (
    <div data-testid="slot-picker">
      {slots?.map((s: any) => (
        <button key={s.id} onClick={() => onSelect(s)}>{s.startTime}</button>
      ))}
    </div>
  ),
}));

vi.mock('../../components/BookingSummary', () => ({
  default: ({ service }: any) => (
    <div data-testid="booking-summary">{service?.name}</div>
  ),
}));

import { publicApi } from '../../lib/api';

function renderBooking() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <MemoryRouter initialEntries={['/booking/p1']}>
      <QueryClientProvider client={qc}>
        <BookingPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (publicApi.services.listByProvider as any).mockResolvedValue({ data: [] });
    (publicApi.staff.listByProvider as any).mockResolvedValue({ data: [] });
    (publicApi.policies.listPublic as any).mockResolvedValue({ data: [] });
  });

  it('renders breadcrumb and heading', async () => {
    renderBooking();
    expect(screen.getByText('Cari Layanan')).toBeInTheDocument();
    expect(screen.getByText('Booking')).toBeInTheDocument();
    await waitFor(() => { expect(screen.getByText('Pilih Layanan')).toBeInTheDocument(); });
  });

  it('renders header and footer', async () => {
    renderBooking();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('shows step indicators', async () => {
    renderBooking();
    expect(screen.getByText('Layanan')).toBeInTheDocument();
    expect(screen.getByText('Staf')).toBeInTheDocument();
    expect(screen.getByText('Jadwal')).toBeInTheDocument();
    expect(screen.getByText('Kontak')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
  });

  it('shows empty state when no services', async () => {
    renderBooking();
    await waitFor(() => { expect(screen.getByText('Pilih Layanan')).toBeInTheDocument(); });
  });
});
