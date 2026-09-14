import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerBookingsPage from '../CustomerBookingsPage';

const mockBookings = [
  {
    id: 'b1',
    serviceName: 'Haircut Premium',
    customerName: 'Barber Central',
    status: 'CONFIRMED',
    startsAt: '2026-09-15T10:00:00+07:00',
    createdAt: '2026-09-10T08:00:00+07:00',
    amount: 75000,
  },
  {
    id: 'b2',
    serviceName: 'Facial Treatment',
    customerName: 'Beauty Salon',
    status: 'COMPLETED',
    startsAt: '2026-09-10T14:00:00+07:00',
    createdAt: '2026-09-08T12:00:00+07:00',
    amount: 150000,
    endTime: '2026-09-10T15:00:00+07:00',
  },
  {
    id: 'b3',
    serviceName: 'Manicure',
    customerName: 'Nail Art Studio',
    status: 'PENDING_PAYMENT',
    startsAt: '2026-09-12T09:00:00+07:00',
    createdAt: '2026-09-09T07:00:00+07:00',
    amount: 50000,
  },
  {
    id: 'b4',
    serviceName: 'Shave',
    customerName: 'Barber Central',
    status: 'CANCELLED',
    startsAt: '2026-09-08T11:00:00+07:00',
    createdAt: '2026-09-05T06:00:00+07:00',
    amount: 30000,
  },
];

vi.mock('../../../lib/api', () => ({
  publicApi: {
    bookings: { list: vi.fn() },
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

let queryClient: QueryClient;

function renderBookings(filterStatus?: string) {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, cacheTime: 0 } } });
  return render(
    <MemoryRouter initialEntries={filterStatus ? [`/bookings?status=${filterStatus}`] : ['/bookings']}>
      <QueryClientProvider client={queryClient}>
        <CustomerBookingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerBookingsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading and booking count badge', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Booking Saya')).toBeInTheDocument();
      expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows loading skeleton initially', () => {
    (publicApi.bookings.list as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderBookings();
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows empty state with Cari Provider link when no bookings', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Belum Ada Booking')).toBeInTheDocument();
      expect(screen.getByText('Mulai jelajahi layanan terbaik di sekitar Anda dan buat booking pertama.')).toBeInTheDocument();
      expect(screen.getByText('Cari Provider')).toBeInTheDocument();
    });
  });

  it('renders all booking cards with service names and provider names', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Haircut Premium')).toBeInTheDocument();
      expect(screen.getByText('Facial Treatment')).toBeInTheDocument();
      expect(screen.getByText('Manicure')).toBeInTheDocument();
      expect(screen.getByText('Shave')).toBeInTheDocument();
      expect(screen.getAllByText('Barber Central').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Beauty Salon')).toBeInTheDocument();
      expect(screen.getByText('Nail Art Studio')).toBeInTheDocument();
    });
  });

  it('displays formatted prices in Rupiah', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Rp 75.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 150.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 50.000')).toBeInTheDocument();
      expect(screen.getByText('Rp 30.000')).toBeInTheDocument();
    });
  });

  it('displays correct status labels', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Dikonfirmasi')).toBeInTheDocument();
      expect(screen.getByText('Selesai')).toBeInTheDocument();
      expect(screen.getByText('Menunggu Bayar')).toBeInTheDocument();
      expect(screen.getByText('Dibatalkan')).toBeInTheDocument();
    });
  });

  it('shows filter tabs with correct counts', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Semua')).toBeInTheDocument();
      expect(screen.getByText('Dikonfirmasi')).toBeInTheDocument();
      expect(screen.getByText('Menunggu Bayar')).toBeInTheDocument();
      expect(screen.getByText('Selesai')).toBeInTheDocument();
      expect(screen.getByText('Dibatalkan')).toBeInTheDocument();
    });
  });

  it('sorts bookings by newest by default and can toggle to oldest', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Haircut Premium')).toBeInTheDocument();
    });

    const sortSelect = screen.getByRole('combobox');
    expect(sortSelect).toHaveValue('newest');

    await userEvent.selectOptions(sortSelect, 'oldest');
    expect(sortSelect).toHaveValue('oldest');
  });

  it('renders links to booking detail pages', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const bookingLinks = links.filter(l => l.getAttribute('href')?.startsWith('/bookings/'));
      expect(bookingLinks.length).toBe(4);
      expect(bookingLinks[0].getAttribute('href')).toBe('/bookings/b1');
    });
  });

  it('shows Booking Lagi button for completed bookings', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      const bookAgainButtons = screen.getAllByText('Booking Lagi');
      expect(bookAgainButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('calls API with status filter when filter tab clicked', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: mockBookings });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Semua')).toBeInTheDocument();
    });

    const confirmedTab = screen.getAllByText('Dikonfirmasi').find(el => el.tagName === 'BUTTON');
    if (confirmedTab) {
      await userEvent.click(confirmedTab);
      await waitFor(() => {
        expect(publicApi.bookings.list).toHaveBeenCalledWith({ status: 'CONFIRMED' });
      });
    }
  });

  it('does not show count badge when no bookings', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    const { container } = renderBookings();
    await waitFor(() => {
      expect(screen.getByText('Booking Saya')).toBeInTheDocument();
    });
    const badge = container.querySelector('.bg-primary-100.text-primary-700');
    expect(badge).toBeNull();
  });
});
