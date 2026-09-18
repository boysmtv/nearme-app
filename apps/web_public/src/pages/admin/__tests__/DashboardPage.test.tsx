import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from '../DashboardPage';

vi.mock('../../../lib/api', () => ({
  adminApi: {
    dashboard: { getStats: vi.fn() },
    bookings: { list: vi.fn() },
    cases: { list: vi.fn() },
  },
}));

vi.mock('../../../components/AdminLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="admin-layout">{children}</div>,
}));

vi.mock('../../../components/StatsCard', () => ({
  default: ({ label, value }: { label: string; value: string | number }) => (
    <div data-testid="stats-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

vi.mock('../../../components/admin/StatusBadge', () => ({
  default: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

import { adminApi } from '../../../lib/api';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function renderDashboard() {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('web_public admin DashboardPage', () => {
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

  it('renders recent bookings rows', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({
      data: { data: [{ id: 'b1', code: 'DKT-001', customerName: 'Siti' }] },
    });
    (adminApi.cases.list as any).mockResolvedValue({ data: { data: [] } });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/DKT-001/)).toBeInTheDocument();
    });
    expect(screen.queryByText('Belum ada booking di platform.')).not.toBeInTheDocument();
  });

  it('renders open cases rows', async () => {
    (adminApi.dashboard.getStats as any).mockResolvedValue({ data: {} });
    (adminApi.bookings.list as any).mockResolvedValue({ data: { data: [] } });
    (adminApi.cases.list as any).mockResolvedValue({
      data: { data: [{ id: 'c1', caseNumber: 'CASE-1', subject: 'Refund saya', status: 'OPEN' }] },
    });
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/CASE-1/)).toBeInTheDocument();
    });
    expect(screen.queryByText('Tidak ada kasus yang perlu ditangani.')).not.toBeInTheDocument();
  });
});
