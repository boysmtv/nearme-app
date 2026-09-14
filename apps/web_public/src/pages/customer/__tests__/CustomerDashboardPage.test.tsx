import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomerDashboardPage from '../CustomerDashboardPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({
    user: { name: 'Siti Customer', email: 'siti@test.com', role: 'ROLE_CUSTOMER', hasProfile: true },
  }),
}));

vi.mock('../../../lib/api', () => ({
  publicApi: {
    bookings: { list: vi.fn() },
    customer: { getProfile: vi.fn() },
    favorites: { list: vi.fn() },
  },
}));

vi.mock('../../../components/CustomerLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="customer-layout">{children}</div>,
}));

import { publicApi } from '../../../lib/api';

let queryClient: QueryClient;

function renderDashboard() {
  queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomerDashboardPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomerDashboardPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders welcome banner with user name', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { loyaltyPoints: 0 } });
    (publicApi.favorites.list as any).mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/halo, siti/i)).toBeInTheDocument();
    });
  });

  it('renders CustomerLayout wrapper', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { loyaltyPoints: 0 } });
    (publicApi.favorites.list as any).mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId('customer-layout')).toBeInTheDocument();
    });
  });

  it('renders quick action links', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { loyaltyPoints: 0 } });
    (publicApi.favorites.list as any).mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Cari Layanan')).toBeInTheDocument();
      expect(screen.getByText('Chat')).toBeInTheDocument();
      expect(screen.getByText('Notifikasi')).toBeInTheDocument();
    });
  });

  it('shows empty bookings state', async () => {
    (publicApi.bookings.list as any).mockResolvedValue({ data: [] });
    (publicApi.customer.getProfile as any).mockResolvedValue({ data: { loyaltyPoints: 0 } });
    (publicApi.favorites.list as any).mockResolvedValue({ data: [] });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Belum ada booking.')).toBeInTheDocument();
    });
  });
});
