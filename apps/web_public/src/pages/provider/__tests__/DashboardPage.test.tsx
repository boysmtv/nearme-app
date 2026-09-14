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
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
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
});
