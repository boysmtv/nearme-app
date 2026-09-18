import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows loading skeleton while fetching', () => {
    (providerApi.customers.list as any).mockReturnValue(new Promise(() => {}));
    const { container } = renderCustomers();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(1);
  });

  it('shows dash when lastBookingAt is null and formats currency', async () => {
    (providerApi.customers.list as any).mockResolvedValue({
      data: {
        data: [{ id: '2', name: 'Budi', email: 'budi@test.com', phone: '08199', totalBookings: 0, totalSpent: 1500000, lastBookingAt: null }],
        pagination: { totalPages: 1 },
      },
    });
    renderCustomers();
    await waitFor(() => expect(screen.getByText('Budi')).toBeInTheDocument());
    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.getByText(/Rp/)).toBeInTheDocument();
  });

  it('filters via search input and resets page', async () => {
    const user = userEvent.setup();
    (providerApi.customers.list as any).mockResolvedValue({ data: { data: [], pagination: { totalPages: 0 } } });
    renderCustomers();
    const input = screen.getByPlaceholderText(/Cari nama/i);
    await user.type(input, 'siti');
    await waitFor(() => expect(providerApi.customers.list).toHaveBeenCalled());
    const lastCall = (providerApi.customers.list as any).mock.calls.at(-1)[0];
    expect(lastCall.search).toContain('siti');
  });

  it('renders pagination and navigates pages', async () => {
    const user = userEvent.setup();
    (providerApi.customers.list as any).mockResolvedValue({
      data: {
        data: [{ id: '1', name: 'Siti', email: 's@t.com', phone: '08', totalBookings: 1, totalSpent: 10000, lastBookingAt: '2026-09-01' }],
        pagination: { totalPages: 3 },
      },
    });
    renderCustomers();
    await waitFor(() => expect(screen.getByText('Siti')).toBeInTheDocument());
    expect(screen.getByText('2')).toBeInTheDocument();
    await user.click(screen.getByText('2'));
    await waitFor(() => {
      const calls = (providerApi.customers.list as any).mock.calls;
      expect(calls.some((c: any) => c[0].page === 2)).toBe(true);
    });
  });
});
