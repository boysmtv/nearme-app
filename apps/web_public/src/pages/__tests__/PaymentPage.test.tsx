import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PaymentPage from '../PaymentPage';

vi.mock('../../lib/api', () => ({
  publicApi: {
    bookings: { getById: vi.fn() },
  },
}));

vi.mock('../../components/Header', () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock('../../components/Footer', () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

import { publicApi } from '../../lib/api';

const mockGetById = publicApi.bookings.getById as ReturnType<typeof vi.fn>;

function renderPage(searchParams = '') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const path = `/payment${searchParams ? `?${searchParams}` : ''}`;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={queryClient}>
        <PaymentPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('PaymentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders breadcrumb', async () => {
    renderPage('bookingId=b1');
    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Pembayaran')).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockGetById.mockReturnValue(new Promise(() => {}));
    renderPage('bookingId=b1');
    expect(screen.getByText('Memuat detail pembayaran...')).toBeInTheDocument();
  });

  it('renders without crashing when no ID provided', async () => {
    renderPage();
    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('shows completed payment status', async () => {
    mockGetById.mockResolvedValue({
      data: {
        id: 'b1',
        bookingCode: 'DKT-001',
        status: 'CONFIRMED',
        totalAmount: 100000,
        createdAt: '2026-09-14T10:00:00',
      },
    });
    renderPage('bookingId=b1');
    await waitFor(() => {
      expect(screen.getByText('Pembayaran Berhasil')).toBeInTheDocument();
    });
    expect(screen.getByText('DKT-001')).toBeInTheDocument();
  });

  it('shows pending payment status', async () => {
    mockGetById.mockResolvedValue({
      data: {
        id: 'b2',
        bookingCode: 'DKT-002',
        status: 'PENDING',
        totalAmount: 50000,
        createdAt: '2026-09-14T10:00:00',
      },
    });
    renderPage('bookingId=b2');
    await waitFor(() => {
      expect(screen.getByText('Menunggu Pembayaran')).toBeInTheDocument();
    });
  });

  it('fetches by paymentId when provided', async () => {
    mockGetById.mockResolvedValue({
      data: {
        id: 'p1',
        bookingCode: 'DKT-003',
        status: 'SETTLEMENT',
        totalAmount: 75000,
        depositAmount: 25000,
        confirmationPin: '654321',
        createdAt: '2026-09-14T10:00:00',
      },
    });
    renderPage('paymentId=p1');
    await waitFor(() => {
      expect(screen.getByText('Pembayaran Berhasil')).toBeInTheDocument();
    });
    expect(mockGetById).toHaveBeenCalledWith('p1');
    expect(screen.getByText('654321')).toBeInTheDocument();
  });

  it('shows failed payment status with error details', async () => {
    mockGetById.mockResolvedValue({
      data: {
        id: 'b3',
        bookingCode: 'DKT-004',
        status: 'FAILED',
        totalAmount: 30000,
        createdAt: null,
      },
    });
    renderPage('bookingId=b3');
    await waitFor(() => {
      expect(screen.getByText('Pembayaran Gagal')).toBeInTheDocument();
    });
  });

  it('shows query error state when fetch fails', async () => {
    mockGetById.mockRejectedValue(new Error('not found'));
    renderPage('bookingId=bad');
    await waitFor(() => {
      expect(screen.getByText('Gagal Memuat')).toBeInTheDocument();
    });
  });
});
