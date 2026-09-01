import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../lib/api', () => ({
  providerApi: {
    reports: { getReport: vi.fn().mockResolvedValue({ success: true, data: { totalBookings: 10, completedBookings: 5, cancelledBookings: 1, totalRevenue: 500000, avgRating: 4.5, currency: 'IDR' } }) },
  },
  analyticsApi: {
    getAnalytics: vi.fn().mockResolvedValue({
      success: true,
      data: {
        revenueByDay: [{ date: '2026-08-01', revenue: 100000, count: 2 }, { date: '2026-08-02', revenue: 150000, count: 3 }],
        bookingsByStatus: { CONFIRMED: 5, CANCELLED: 1 },
        retention: { totalCustomers: 8, returningCustomers: 2, newCustomers: 6, retentionRate: 0.25, retentionPercent: 25 },
        funnel: { search: 100, view: 50, hold: 20, confirm: 10 },
        topServices: [{ serviceId: 's1', serviceName: 'Potong Rapi', bookingCount: 5, revenue: 250000 }],
        staffUtilization: [{ staffId: 'st1', staffName: 'Andi', bookingCount: 8 }],
        currency: 'IDR', startDate: '2026-08-01', endDate: '2026-08-31', granularity: 'day',
      },
    }),
    exportCsv: vi.fn().mockResolvedValue('csv'),
  },
}));

vi.mock('../../components/ProviderLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => ({ user: { role: 'ROLE_PROVIDER_OWNER' }, isAuthenticated: true }),
}));

import ReportsPage from '../../pages/provider/ReportsPage';

describe('ReportsPage Analytics', () => {
  it('renders analytics sections', async () => {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<MemoryRouter><QueryClientProvider client={qc}><ReportsPage /></QueryClientProvider></MemoryRouter>);
    // header
    expect(await screen.findByText('Laporan')).toBeInTheDocument();
    // wait for analytics data
    expect(await screen.findByText(/Revenue by Day/)).toBeInTheDocument();
    expect(await screen.findByText(/Bookings by Status/)).toBeInTheDocument();
    expect(await screen.findByText(/Funnel/)).toBeInTheDocument();
  });
});
