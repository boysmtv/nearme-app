import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../DashboardPage';

vi.mock('../../../lib/api', () => ({
  providerApi: {
    dashboard: {
      getStats: vi.fn(),
      getRecentBookings: vi.fn(),
    },
  },
  analyticsApi: {
    getAnalytics: vi.fn(),
  },
}));

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { id: 'prov-1', name: 'Budi', email: 'budi@test.com', role: 'ROLE_PROVIDER_OWNER' }, logout: vi.fn() }),
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

vi.mock('../../../components/StatsCard', () => ({
  default: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stats-card">
      <span>{label}</span>: <span>{String(value)}</span>
    </div>
  ),
}));

vi.mock('recharts', () => ({
  AreaChart: ({ children }: { children?: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: (props: any) => {
    (globalThis as any).__dashboardTooltipFormatter = props?.formatter;
    return null;
  },
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { providerApi, analyticsApi } from '../../../lib/api';

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders heading', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });
  });

  it('renders ProviderLayout', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
    });
  });

  it('shows quick action links', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Lihat Kalender')).toBeInTheDocument();
      expect(screen.getByText('Kelola Layanan')).toBeInTheDocument();
    });
  });

  it('shows empty bookings state', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Belum ada booking terbaru')).toBeInTheDocument();
    });
  });

  it('renders revenue chart with date mapping and fallbacks', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: { todayBookings: 1, todayRevenue: 50000, weekBookings: 5, weekRevenue: 250000, totalCustomers: 10, avgRating: 4.5 } });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({
      data: {
        revenueByDay: [
          { date: '2026-09-01', revenue: 100000 },
          { date: 'abc', revenue: 0 },
          { revenue: undefined },
        ],
      },
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
    expect(screen.getByText('Pendapatan 30 Hari')).toBeInTheDocument();
  });

  it('invokes chart tooltip formatter', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [{ date: '2026-09-01', revenue: 75000 }] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
    const fmt = (globalThis as any).__dashboardTooltipFormatter;
    expect(typeof fmt).toBe('function');
    const out = fmt(75000);
    expect(String(out)).toContain('75');
  });

  it('renders recent bookings with fallbacks', async () => {
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({
      data: [
        { id: 'b1', customerName: 'Siti', serviceName: 'Haircut', staffName: 'Andi', amount: 50000, time: '10:00' },
        { id: 'b2', serviceName: 'Massage', staffName: 'Rudi' },
      ],
    });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Siti')).toBeInTheDocument();
    });
    expect(screen.getByText('Haircut - Andi')).toBeInTheDocument();
    expect(screen.getByText('?')).toBeInTheDocument();
    expect(screen.getByText('Massage - Rudi')).toBeInTheDocument();
  });

  it('copies booking link to clipboard', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Link Booking Anda')).toBeInTheDocument();
    });
    const copyBtn = screen.getByRole('button', { name: /salin/i });
    await user.click(copyBtn);
    expect(writeText).toHaveBeenCalled();
    expect(await screen.findByText('Tersalin!')).toBeInTheDocument();
  }, 15000);

  it('resets copy state after timeout', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    (providerApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (providerApi.dashboard.getRecentBookings as any).mockResolvedValue({ data: [] });
    (analyticsApi.getAnalytics as any).mockResolvedValue({ data: { revenueByDay: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Link Booking Anda')).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /salin/i }));
    await waitFor(() => {
      expect(screen.getByText('Tersalin!')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText('Tersalin!')).not.toBeInTheDocument();
    }, { timeout: 4000 });
  }, 15000);
});
