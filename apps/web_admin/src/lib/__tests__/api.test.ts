import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@dekat/web-api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@dekat/web-api-client';
import { adminApi } from '../api';

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);
const mockedPut = vi.mocked(apiClient.put);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('adminApi', () => {
  describe('auth', () => {
    it('calls login endpoint with credentials', async () => {
      mockedPost.mockResolvedValue({ data: { accessToken: 'abc123' } });

      const result = await adminApi.auth.login('admin@test.com', 'password123', '123456');

      expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@test.com',
        password: 'password123',
        mfaCode: '123456',
      });
      expect(result.data.accessToken).toBe('abc123');
    });

    it('calls login without mfaCode when not provided', async () => {
      mockedPost.mockResolvedValue({ data: { accessToken: 'abc123' } });

      await adminApi.auth.login('admin@test.com', 'password123');

      expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
        email: 'admin@test.com',
        password: 'password123',
        mfaCode: undefined,
      });
    });

    it('calls logout endpoint with refresh token', async () => {
      mockedPost.mockResolvedValue({});

      await adminApi.auth.logout('refresh_token_abc');

      expect(mockedPost).toHaveBeenCalledWith(
        '/auth/logout?refreshToken=refresh_token_abc',
        {},
      );
    });

    it('calls logout endpoint without refresh token', async () => {
      mockedPost.mockResolvedValue({});

      await adminApi.auth.logout();

      expect(mockedPost).toHaveBeenCalledWith('/auth/logout', {});
    });
  });

  describe('dashboard', () => {
    it('fetches dashboard stats', async () => {
      const stats = {
        totalUsers: 100,
        totalTenants: 25,
        totalBookings: 500,
        totalRevenue: 5000000,
      };
      mockedGet.mockResolvedValue({ success: true, data: stats });

      const result = await adminApi.dashboard.getStats();

      expect(mockedGet).toHaveBeenCalledWith('/admin/dashboard/stats');
      expect(result.data.totalUsers).toBe(100);
    });
  });

  describe('users', () => {
    it('lists users with query params', async () => {
      mockedGet.mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await adminApi.users.list({ page: 1, limit: 10, search: 'alice', role: 'ADMIN' });

      const calledUrl = mockedGet.mock.calls[0]![0] as string;
      expect(calledUrl).toContain('/admin/users?');
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('limit=10');
      expect(calledUrl).toContain('search=alice');
      expect(calledUrl).toContain('role=ADMIN');
    });

    it('omits empty params from query string', async () => {
      mockedGet.mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await adminApi.users.list({ page: 1, limit: 10, search: '', role: '' });

      const calledUrl = mockedGet.mock.calls[0]![0] as string;
      expect(calledUrl).not.toContain('search=');
      expect(calledUrl).not.toContain('role=');
    });

    it('updates user status', async () => {
      mockedPut.mockResolvedValue({});

      await adminApi.users.updateStatus('user-123', 'SUSPENDED');

      expect(mockedPut).toHaveBeenCalledWith('/admin/users/user-123/status', { status: 'SUSPENDED' });
    });
  });

  describe('tenants', () => {
    it('lists tenants', async () => {
      mockedGet.mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await adminApi.tenants.list({ page: 1, limit: 10 });

      const calledUrl = mockedGet.mock.calls[0]![0] as string;
      expect(calledUrl).toContain('/admin/tenants?');
    });

    it('approves a tenant', async () => {
      mockedPut.mockResolvedValue({});

      await adminApi.tenants.approve('tenant-456');

      expect(mockedPut).toHaveBeenCalledWith('/admin/tenants/tenant-456/approve', {});
    });

    it('rejects a tenant with reason', async () => {
      mockedPut.mockResolvedValue({});

      await adminApi.tenants.reject('tenant-456', 'Incomplete docs');

      expect(mockedPut).toHaveBeenCalledWith('/admin/tenants/tenant-456/reject', { reason: 'Incomplete docs' });
    });
  });

  describe('bookings', () => {
    it('lists bookings with filters', async () => {
      mockedGet.mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await adminApi.bookings.list({ page: 1, limit: 20, status: 'PAID', date: '2026-08-26' });

      const calledUrl = mockedGet.mock.calls[0]![0] as string;
      expect(calledUrl).toContain('status=PAID');
      expect(calledUrl).toContain('date=2026-08-26');
    });
  });

  describe('payments', () => {
    it('lists payments', async () => {
      mockedGet.mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await adminApi.payments.list({ page: 1, limit: 10, status: 'PAID' });

      const calledUrl = mockedGet.mock.calls[0]![0] as string;
      expect(calledUrl).toContain('/admin/payments?');
      expect(calledUrl).toContain('status=PAID');
    });
  });

  describe('cases', () => {
    it('lists cases with severity filter', async () => {
      mockedGet.mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });

      await adminApi.cases.list({ page: 1, limit: 10, severity: 'P0', status: 'OPEN' });

      const calledUrl = mockedGet.mock.calls[0]![0] as string;
      expect(calledUrl).toContain('severity=P0');
      expect(calledUrl).toContain('status=OPEN');
    });

    it('updates case status', async () => {
      mockedPut.mockResolvedValue({});

      await adminApi.cases.updateStatus('case-789', 'RESOLVED');

      expect(mockedPut).toHaveBeenCalledWith('/admin/cases/case-789/status', { status: 'RESOLVED' });
    });
  });

  describe('config', () => {
    it('fetches feature flags', async () => {
      const flags = [{ id: 'f1', key: 'dark_mode', enabled: true }];
      mockedGet.mockResolvedValue({ success: true, data: flags });

      const result = await adminApi.config.getFlags();

      expect(mockedGet).toHaveBeenCalledWith('/admin/config/flags');
      expect(result.data).toHaveLength(1);
    });

    it('toggles a feature flag', async () => {
      mockedPut.mockResolvedValue({});

      await adminApi.config.toggleFlag('f1', false);

      expect(mockedPut).toHaveBeenCalledWith('/admin/config/flags/f1', { enabled: false });
    });
  });
});
