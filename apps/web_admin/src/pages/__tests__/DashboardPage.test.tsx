import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../DashboardPage';

vi.mock('../../lib/api', () => ({
  adminApi: {
    dashboard: { getStats: vi.fn() },
    bookings: { list: vi.fn() },
    cases: { list: vi.fn() },
  },
}));

vi.mock('../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

import { adminApi } from '../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderDashboard(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Dashboard heading', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [] } });
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  it('renders AdminLayout wrapper', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [] } });
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
    });
  });

  it('shows loading skeletons initially', () => {
    (adminApi.dashboard.getStats as any).mockReturnValue(new Promise(() => {}));
    (adminApi.bookings.list as any).mockReturnValue(new Promise(() => {}));
    (adminApi.cases.list as any).mockReturnValue(new Promise(() => {}));
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders stats cards after data loads', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({
      data: { totalUsers: 100, totalTenants: 10, totalBookings: 50, totalRevenue: 5000000 },
    });
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [] } });
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Total Tenants')).toBeInTheDocument();
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    });
  });

  it('shows empty state when no bookings', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [] } });
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/belum ada booking/i)).toBeInTheDocument();
    });
  });

  it('shows error state when bookings fetch fails', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockRejectedValue(new Error('fail'));
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/gagal memuat booking/i)).toBeInTheDocument();
    });
  });

  it('shows error state when cases fetch fails', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [] } });
    (adminApi.cases.list as any).mockRejectedValue(new Error('fail'));
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/gagal memuat kasus/i)).toBeInTheDocument();
    });
  });

  it('renders recent bookings when data available', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({
      data: {
        data: [
          { id: '1', code: 'DKT-001', customerName: 'Budi', providerName: 'Barber', serviceName: 'Haircut', totalAmount: 50000, status: 'CONFIRMED' },
        ],
      },
    });
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/DKT-001/)).toBeInTheDocument();
      expect(screen.getByText(/Budi/)).toBeInTheDocument();
    });
  });
});
