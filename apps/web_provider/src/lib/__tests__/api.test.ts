import { providerApi } from '../api';

vi.mock('@dekat/web-api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@dekat/web-api-client';

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('providerApi.auth', () => {
  it('login calls post with email and password', async () => {
    mockPost.mockResolvedValue({ data: { accessToken: 'at', refreshToken: 'rt' } });
    await providerApi.auth.login('a@b.com', 'pass');
    expect(mockPost).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pass' });
  });

  it('logout calls post with refreshToken query param', async () => {
    mockPost.mockResolvedValue({});
    await providerApi.auth.logout('my-refresh-token');
    expect(mockPost).toHaveBeenCalledWith('/auth/logout?refreshToken=my-refresh-token', {});
  });

  it('logout calls post without query param when no token', async () => {
    mockPost.mockResolvedValue({});
    await providerApi.auth.logout();
    expect(mockPost).toHaveBeenCalledWith('/auth/logout', {});
  });
});

describe('providerApi.dashboard', () => {
  it('getStats calls get on correct endpoint', async () => {
    mockGet.mockResolvedValue({ data: { todayBookings: 5 } });
    await providerApi.dashboard.getStats();
    expect(mockGet).toHaveBeenCalledWith('/provider/dashboard/stats');
  });

  it('getRecentBookings calls get on correct endpoint', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await providerApi.dashboard.getRecentBookings();
    expect(mockGet).toHaveBeenCalledWith('/provider/dashboard/recent-bookings');
  });
});

describe('providerApi.bookings', () => {
  it('list builds query string from params', async () => {
    mockGet.mockResolvedValue({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    await providerApi.bookings.list({ page: 1, status: 'CONFIRMED' });
    expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/provider/bookings?'));
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('page=1');
    expect(calledUrl).toContain('status=CONFIRMED');
  });

  it('list omits empty params', async () => {
    mockGet.mockResolvedValue({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    await providerApi.bookings.list({});
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toBe('/provider/bookings?');
  });

  it('getById calls get with id', async () => {
    mockGet.mockResolvedValue({ data: { id: '123' } });
    await providerApi.bookings.getById('123');
    expect(mockGet).toHaveBeenCalledWith('/provider/bookings/123');
  });

  it('updateStatus calls put with status and reason', async () => {
    mockPut.mockResolvedValue({ data: {} });
    await providerApi.bookings.updateStatus('123', 'CANCELLED', 'late');
    expect(mockPut).toHaveBeenCalledWith('/provider/bookings/123/status', {
      status: 'CANCELLED',
      reason: 'late',
    });
  });

  it('reschedule calls put with newSlotId', async () => {
    mockPut.mockResolvedValue({ data: {} });
    await providerApi.bookings.reschedule('123', 'slot-99');
    expect(mockPut).toHaveBeenCalledWith('/provider/bookings/123/reschedule', { newSlotId: 'slot-99' });
  });
});

describe('providerApi.calendar', () => {
  it('getBookings passes startDate and endDate as query', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await providerApi.calendar.getBookings('2026-08-01', '2026-08-31');
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('startDate=2026-08-01');
    expect(calledUrl).toContain('endDate=2026-08-31');
  });
});

describe('providerApi.services', () => {
  it('list calls get', async () => {
    mockGet.mockResolvedValue({ data: [] });
    await providerApi.services.list();
    expect(mockGet).toHaveBeenCalledWith('/provider/services');
  });

  it('create calls post with data', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await providerApi.services.create({ name: 'Haircut', price: 50000, duration: 30 });
    expect(mockPost).toHaveBeenCalledWith('/provider/services', {
      name: 'Haircut',
      price: 50000,
      duration: 30,
    });
  });

  it('delete calls delete with id', async () => {
    mockDelete.mockResolvedValue({});
    await providerApi.services.delete('svc-1');
    expect(mockDelete).toHaveBeenCalledWith('/provider/services/svc-1');
  });
});

describe('providerApi.staff', () => {
  it('invite calls post with data', async () => {
    mockPost.mockResolvedValue({ data: {} });
    await providerApi.staff.invite({ displayName: 'Andi', email: 'andi@test.com' });
    expect(mockPost).toHaveBeenCalledWith('/provider/staff', {
      displayName: 'Andi',
      email: 'andi@test.com',
    });
  });

  it('deactivate calls delete', async () => {
    mockDelete.mockResolvedValue({});
    await providerApi.staff.deactivate('staff-1');
    expect(mockDelete).toHaveBeenCalledWith('/provider/staff/staff-1');
  });
});

describe('providerApi.customers', () => {
  it('list builds search query', async () => {
    mockGet.mockResolvedValue({ data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
    await providerApi.customers.list({ search: 'Siti' });
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('search=Siti');
  });
});

describe('providerApi.reports', () => {
  it('getReport builds query from params', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await providerApi.reports.getReport({ startDate: '2026-08-01', endDate: '2026-08-31' });
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('startDate=2026-08-01');
    expect(calledUrl).toContain('endDate=2026-08-31');
  });

  it('exportCsv builds query', async () => {
    mockGet.mockResolvedValue({ data: { downloadUrl: 'http://example.com/file.csv' } });
    await providerApi.reports.exportCsv({ startDate: '2026-08-01', endDate: '2026-08-31' });
    const calledUrl = mockGet.mock.calls[0][0] as string;
    expect(calledUrl).toContain('/provider/reports/export?');
  });
});

describe('providerApi.settings', () => {
  it('get calls get on settings endpoint', async () => {
    mockGet.mockResolvedValue({ data: {} });
    await providerApi.settings.get();
    expect(mockGet).toHaveBeenCalledWith('/provider/settings');
  });

  it('update calls put with partial data', async () => {
    mockPut.mockResolvedValue({ data: {} });
    await providerApi.settings.update({ businessName: 'New Name' });
    expect(mockPut).toHaveBeenCalledWith('/provider/settings', { businessName: 'New Name' });
  });
});
