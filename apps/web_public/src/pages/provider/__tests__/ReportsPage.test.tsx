import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReportsPage from '../ReportsPage';

vi.mock('../../../lib/auth', () => ({
  useAuth: () => ({ user: { name: 'Budi', role: 'ROLE_PROVIDER_OWNER' } }),
}));

vi.mock('../../../lib/api', () => ({
  providerApi: {
    reports: { getReport: vi.fn() },
  },
  analyticsApi: {
    getAnalytics: vi.fn(),
    exportCsv: vi.fn(),
  },
}));

vi.mock('../../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="provider-layout">{children}</div>,
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts">{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: (props: any) => {
    if (typeof props?.label === 'function') props.label({ name: 'Lihat', value: 10 });
    return <div>{props?.children}</div>;
  },
  Cell: () => null,
  XAxis: (props: any) => {
    if (typeof props?.tickFormatter === 'function') props.tickFormatter('2026-09-15');
    return null;
  },
  YAxis: (props: any) => {
    if (typeof props?.tickFormatter === 'function') props.tickFormatter(5000);
    return null;
  },
  CartesianGrid: () => null,
  Tooltip: (props: any) => {
    if (typeof props?.formatter === 'function') props.formatter(75000);
    return null;
  },
  Legend: () => null,
}));

import { providerApi, analyticsApi } from '../../../lib/api';

const mockGetReport = providerApi.reports.getReport as ReturnType<typeof vi.fn>;
const mockGetAnalytics = analyticsApi.getAnalytics as ReturnType<typeof vi.fn>;
const mockExportCsv = analyticsApi.exportCsv as ReturnType<typeof vi.fn>;

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } } });
}

function renderPage(qc?: QueryClient) {
  const client = qc ?? createQueryClient();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <ReportsPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe('ReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReport.mockResolvedValue({ data: { totalBookings: 0, completedBookings: 0, cancelledBookings: 0, totalRevenue: 0, avgRating: 0, currency: 'IDR' } });
    mockGetAnalytics.mockResolvedValue({ data: {} });
  });

  it('renders heading', async () => {
    renderPage();
    expect(screen.getByRole('heading', { name: /laporan/i })).toBeInTheDocument();
  });

  it('renders ProviderLayout', () => {
    renderPage();
    expect(screen.getByTestId('provider-layout')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockGetReport.mockReturnValue(new Promise(() => {}));
    mockGetAnalytics.mockReturnValue(new Promise(() => {}));
    renderPage();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it('renders report cards when data loads', async () => {
    mockGetReport.mockResolvedValue({ data: { totalBookings: 10, completedBookings: 8, cancelledBookings: 2, totalRevenue: 500000, avgRating: 4.5, currency: 'IDR' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Total Booking')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders rating when data includes avgRating', async () => {
    mockGetReport.mockResolvedValue({ data: { totalBookings: 10, completedBookings: 8, cancelledBookings: 2, totalRevenue: 500000, avgRating: 4.5, currency: 'IDR' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });

  it('renders revenue when data includes totalRevenue', async () => {
    mockGetReport.mockResolvedValue({ data: { totalBookings: 10, completedBookings: 8, cancelledBookings: 2, totalRevenue: 500000, avgRating: 4.5, currency: 'IDR' } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Total Pendapatan')).toBeInTheDocument();
    });
  });

  it('shows analytics section', async () => {
    mockGetAnalytics.mockResolvedValue({
      data: {
        revenueByDay: [{ date: '2026-09-01', revenue: 100000 }],
        bookingsByStatus: { COMPLETED: 5, CANCELLED: 1 },
        funnel: { search: 100, view: 50, hold: 20, confirm: 10 },
        topServices: [{ serviceId: 's1', serviceName: 'Haircut', bookingCount: 10, revenue: 500000 }],
        staffUtilization: [{ staffId: 'st1', staffName: 'Andi', bookingCount: 15 }],
        retention: { retentionPercent: 65, returningCustomers: 30, totalCustomers: 46 },
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Revenue by Day (AreaChart)')).toBeInTheDocument();
    });
  });

  it('shows staff utilization chart', async () => {
    mockGetAnalytics.mockResolvedValue({
      data: {
        staffUtilization: [{ staffId: 'st1', staffName: 'Andi', bookingCount: 15 }],
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/staff utilization/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Andi')).toBeInTheDocument();
  });

  it('shows retention card', async () => {
    mockGetReport.mockResolvedValue({ data: { totalBookings: 10, completedBookings: 8, cancelledBookings: 2, totalRevenue: 500000, avgRating: 4.5, currency: 'IDR' } });
    mockGetAnalytics.mockResolvedValue({
      data: {
        retention: { retentionPercent: 65, returningCustomers: 30, totalCustomers: 46 },
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Retention')).toBeInTheDocument();
    });
  });

  it('exports CSV', async () => {
    const user = userEvent.setup();
    mockExportCsv.mockResolvedValue('col1,col2\nval1,val2');
    renderPage();
    await waitFor(() => { expect(screen.getByText('Total Booking')).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /export csv/i }));
    expect(mockExportCsv).toHaveBeenCalled();
  });

  it('handles CSV export error', async () => {
    const user = userEvent.setup();
    mockExportCsv.mockRejectedValue(new Error('Export failed'));
    renderPage();
    await waitFor(() => { expect(screen.getByText('Total Booking')).toBeInTheDocument(); });
    await user.click(screen.getByRole('button', { name: /export csv/i }));
    expect(mockExportCsv).toHaveBeenCalled();
  });

  it('changes granularity', async () => {
    const user = userEvent.setup();
    renderPage();
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'week');
    expect(mockGetAnalytics).toHaveBeenCalled();
  });

  it('shows empty top services', async () => {
    mockGetAnalytics.mockResolvedValue({ data: { topServices: [] } });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Tidak ada data')).toBeInTheDocument();
    });
  });

  it('handles empty analytics data', async () => {
    mockGetAnalytics.mockResolvedValue({ data: {} });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Total Booking')).toBeInTheDocument();
    });
  });

  it('shows bookings by status chart', async () => {
    mockGetAnalytics.mockResolvedValue({
      data: {
        bookingsByStatus: { COMPLETED: 5, CANCELLED: 1 },
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Bookings by Status (BarChart)')).toBeInTheDocument();
    });
  });

  it('shows funnel chart', async () => {
    mockGetAnalytics.mockResolvedValue({
      data: {
        funnel: { search: 100, view: 50 },
      },
    });
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/funnel/i)).toBeInTheDocument();
    });
  });
});
