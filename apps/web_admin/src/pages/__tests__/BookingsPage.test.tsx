import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingsPage from '../BookingsPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    bookings: { list: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderBookings() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <BookingsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('BookingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Bookings heading', () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderBookings();
    expect(screen.getByText(/bookings/i)).toBeInTheDocument();
  });

  it('renders booking list when data loads', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({
      data: {
        data: [
          { id: '1', code: 'DKT-001', customerName: 'Budi', providerName: 'Barber', serviceName: 'Haircut', totalAmount: 50000, status: 'CONFIRMED', createdAt: '2024-01-01' },
        ],
        total: 1,
      },
    });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText(/DKT-001/)).toBeInTheDocument();
      expect(screen.getByText('Budi')).toBeInTheDocument();
    });
  });

  it('shows empty state when no bookings', async () => {
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [], total: 0 } });
    renderBookings();
    await waitFor(() => {
      expect(screen.getByText(/tidak ada/i)).toBeInTheDocument();
    });
  });
});
