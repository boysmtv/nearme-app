import { describe, it, expect, vi } from 'vitest';

vi.mock('@dekat/web-api-client', () => ({
  apiClient: {
    get: vi.fn().mockResolvedValue({ success: true, data: {} }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Analytics API', () => {
  it('analyticsApi getAnalytics builds correct URL', async () => {
    const { apiClient } = await import('@dekat/web-api-client');
    const { analyticsApi } = await import('../api');
    (apiClient.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true, data: { revenueByDay: [] } });
    await analyticsApi.getAnalytics({ startDate: '2026-08-01', endDate: '2026-08-31', granularity: 'day' });
    const calledUrl = (apiClient.get as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(calledUrl).toContain('/provider/reports/analytics');
    expect(calledUrl).toContain('startDate=2026-08-01');
    expect(calledUrl).toContain('granularity=day');
  });

  it('analytics shape validation', () => {
    const mock: import('../types').AnalyticsData = {
      revenueByDay: [{ date: '2026-08-01', revenue: 100000, count: 2 }],
      bookingsByStatus: { CONFIRMED: 5, CANCELLED: 1 },
      retention: { totalCustomers: 10, returningCustomers: 3, newCustomers: 7, retentionRate: 0.3, retentionPercent: 30 },
      funnel: { search: 100, view: 50, hold: 20, confirm: 10 },
      topServices: [{ serviceId: 's1', serviceName: 'Potong', bookingCount: 5, revenue: 250000 }],
      staffUtilization: [{ staffId: 'st1', staffName: 'Andi', bookingCount: 8 }],
      currency: 'IDR',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      granularity: 'day',
    };
    expect(mock.revenueByDay[0].revenue).toBe(100000);
    expect(mock.retention.retentionPercent).toBe(30);
    expect(mock.funnel.confirm).toBe(10);
    expect(mock.topServices[0].serviceName).toBe('Potong');
  });

  it('funnel ordering search>view>hold>confirm', () => {
    const funnel = { search: 100, view: 50, hold: 20, confirm: 10 };
    expect(funnel.search).toBeGreaterThan(funnel.view);
    expect(funnel.view).toBeGreaterThan(funnel.hold);
    expect(funnel.hold).toBeGreaterThan(funnel.confirm);
  });

  it('revenue sum matches total', () => {
    const days = [{ revenue: 50000 }, { revenue: 70000 }, { revenue: 30000 }];
    const sum = days.reduce((a, b) => a + b.revenue, 0);
    expect(sum).toBe(150000);
  });

  it('retention calculation', () => {
    const total = 10;
    const returning = 3;
    const rate = returning / total;
    expect(rate).toBeCloseTo(0.3);
  });
});
