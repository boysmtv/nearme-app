import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AnalyticsPage from '../AnalyticsPage';

vi.mock('../../../lib/api', () => ({
  adminApi: {
    dashboard: { getStats: vi.fn(), getAnalytics: vi.fn() },
  },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Area: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

import { adminApi } from '../../../lib/api';

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
}

function renderAnalytics(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <AnalyticsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

const mockStats = {
  totalUsers: 150,
  totalTenants: 25,
  totalBookings: 800,
  totalRevenue: 50000000,
  userGrowth: { value: 12, isPositive: true },
  tenantGrowth: { value: 5, isPositive: true },
  bookingGrowth: { value: -3, isPositive: false },
  revenueGrowth: { value: 18, isPositive: true },
};

const mockAnalytics = {
  revenueByDay: [
    { date: '2026-09-01', revenue: 1500000, count: 10 },
    { date: '2026-09-02', revenue: 2000000, count: 15 },
  ],
  bookingsByStatus: { CONFIRMED: 45, COMPLETED: 120, CANCELLED: 15 },
  topServices: [
    { serviceId: 's1', serviceName: 'Haircut', bookingCount: 50, revenue: 5000000 },
    { serviceId: 's2', serviceName: 'Shave', bookingCount: 30, revenue: 1500000 },
  ],
};

describe('web_public admin AnalyticsPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders loading skeleton initially', () => {
    (adminApi.dashboard.getStats as any).mockReturnValue(new Promise(() => {}));
    (adminApi.dashboard.getAnalytics as any).mockReturnValue(new Promise(() => {}));
    renderAnalytics();
    expect(screen.getAllByTestId('admin-layout')).toHaveLength(1);
    // Loading skeleton: 4 animate-pulse divs
    const skeleton = document.querySelectorAll('.animate-pulse');
    expect(skeleton.length).toBeGreaterThanOrEqual(1);
  });

  it('renders full analytics when data loads', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: mockStats });
    (adminApi.dashboard.getAnalytics as any).mockResolvedValue({ data: mockAnalytics });
    renderAnalytics();

    await waitFor(() => {
      expect(screen.queryByText('Platform Analytics')).toBeInTheDocument();
    });
    // Wait for both queries to resolve and loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Total Users')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText('Statistik dan tren platform DEKAT')).toBeInTheDocument();
    // Stats cards rendered
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Total Providers')).toBeInTheDocument();
    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    // Charts sections
    expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
    expect(screen.getByText('Bookings by Status')).toBeInTheDocument();
    expect(screen.getByText('Status Distribution')).toBeInTheDocument();
    expect(screen.getByText('Top Services')).toBeInTheDocument();
    // Top services data
    expect(screen.getByText('Haircut')).toBeInTheDocument();
    expect(screen.getByText('Shave')).toBeInTheDocument();
    expect(screen.getByText('50 booking')).toBeInTheDocument();
  });

  it('shows empty state when topServices is empty', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: mockStats });
    (adminApi.dashboard.getAnalytics as any).mockResolvedValue({
      data: { ...mockAnalytics, topServices: [] },
    });
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Belum ada data')).toBeInTheDocument();
    });
  });

  it('calls getAnalytics with 7 days when selector changed', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: mockStats });
    (adminApi.dashboard.getAnalytics as any).mockResolvedValue({ data: mockAnalytics });
    const user = userEvent.setup();
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Platform Analytics')).toBeInTheDocument();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '7');
    await waitFor(() => {
      expect(adminApi.dashboard.getAnalytics).toHaveBeenCalledWith(7);
    });
  });

  it('renders revenue chart with data', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: mockStats });
    (adminApi.dashboard.getAnalytics as any).mockResolvedValue({ data: mockAnalytics });
    renderAnalytics();

    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });
});
