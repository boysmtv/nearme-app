import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CustomersPage from '../CustomersPage';

vi.mock('../../../lib/api', () => ({
  providerApi: {
    customers: { list: vi.fn() },
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

import { providerApi } from '../../../lib/api';

function renderCustomers() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <CustomersPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('CustomersPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading', async () => {
    (providerApi.customers.list as any).mockResolvedValue({ data: { data: [], pagination: { totalPages: 0 } } });
    renderCustomers();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /pelanggan/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', async () => {
    (providerApi.customers.list as any).mockResolvedValue({ data: { data: [], pagination: { totalPages: 0 } } });
    renderCustomers();
    await waitFor(() => {
      expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    });
  });

  it('shows empty state when no customers', async () => {
    (providerApi.customers.list as any).mockResolvedValue({ data: { data: [], pagination: { totalPages: 0 } } });
    renderCustomers();
    await waitFor(() => {
      expect(screen.getByText('Belum ada pelanggan')).toBeInTheDocument();
    });
  });

  it('renders customer table when data is available', async () => {
    (providerApi.customers.list as any).mockResolvedValue({
      data: {
        data: [{ id: '1', name: 'Siti', email: 'siti@gmail.com', phone: '08123', totalBookings: 5, totalSpent: 500000, lastBookingAt: '2026-09-01' }],
        pagination: { totalPages: 1 },
      },
    });
    renderCustomers();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
      expect(screen.getByText('siti@gmail.com')).toBeInTheDocument();
    });
  });
});
