import { describe, it, expect } from 'vitest';
import type {
  ApiResponse,
  PaginatedResponse,
  Pagination,
  AdminStats,
  User,
  Tenant,
  AdminBooking,
  Payment,
  SupportCase,
  FeatureFlag,
} from '../types';

describe('TypeScript interfaces', () => {
  it('ApiResponse conforms to expected shape', () => {
    const response: ApiResponse<string> = {
      success: true,
      data: 'ok',
      message: 'done',
    };

    expect(response.success).toBe(true);
    expect(response.data).toBe('ok');
    expect(response.message).toBe('done');
  });

  it('ApiResponse works without optional message', () => {
    const response: ApiResponse<number> = { success: true, data: 42 };

    expect(response.message).toBeUndefined();
  });

  it('PaginatedResponse conforms to expected shape', () => {
    const response: PaginatedResponse<User> = {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 50, totalPages: 5 },
    };

    expect(response.pagination.totalPages).toBe(5);
  });

  it('AdminStats has all required fields', () => {
    const stats: AdminStats = {
      totalUsers: 100,
      totalTenants: 25,
      totalBookings: 500,
      totalRevenue: 1000000,
      userGrowth: 10,
      tenantGrowth: 5,
      bookingGrowth: 15,
      revenueGrowth: 20,
    };

    expect(stats.totalUsers).toBe(100);
    expect(stats.revenueGrowth).toBe(20);
  });

  it('User has correct status union type', () => {
    const user: User = {
      id: 'u1',
      email: 'test@test.com',
      name: 'Test',
      role: 'ADMIN',
      status: 'ACTIVE',
      lastLoginAt: '2026-08-26T00:00:00Z',
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(user.status).toBe('ACTIVE');
  });

  it('Tenant has correct status union type', () => {
    const tenant: Tenant = {
      id: 't1',
      name: 'Barbershop',
      slug: 'barbershop',
      category: 'BARBERSHOP',
      ownerName: 'Budi',
      status: 'APPROVED',
      verificationStatus: 'VERIFIED',
      totalBookings: 100,
      totalRevenue: 500000,
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(tenant.status).toBe('APPROVED');
  });

  it('Payment has all required fields', () => {
    const payment: Payment = {
      id: 'p1',
      bookingCode: 'DKT-001',
      customerName: 'Siti',
      providerName: 'Barbershop Central',
      amount: 75000,
      status: 'PAID',
      method: 'QRIS',
      createdAt: '2026-08-26T00:00:00Z',
      paidAt: '2026-08-26T01:00:00Z',
    };

    expect(payment.status).toBe('PAID');
    expect(payment.paidAt).not.toBeNull();
  });

  it('Payment supports null paidAt', () => {
    const payment: Payment = {
      id: 'p2',
      bookingCode: 'DKT-002',
      customerName: 'Andi',
      providerName: 'Salon',
      amount: 50000,
      status: 'PENDING',
      method: 'QRIS',
      createdAt: '2026-08-26T00:00:00Z',
      paidAt: null,
    };

    expect(payment.paidAt).toBeNull();
  });

  it('SupportCase has correct severity and status types', () => {
    const supportCase: SupportCase = {
      id: 'c1',
      caseNumber: 'CS-001',
      subject: 'Payment issue',
      severity: 'P1',
      status: 'OPEN',
      assignee: 'Admin',
      customerName: 'User',
      createdAt: '2026-08-26T00:00:00Z',
      slaDeadline: '2026-08-27T00:00:00Z',
    };

    expect(supportCase.severity).toBe('P1');
    expect(supportCase.status).toBe('OPEN');
  });

  it('FeatureFlag has all required fields', () => {
    const flag: FeatureFlag = {
      id: 'f1',
      key: 'dark_mode',
      name: 'Dark Mode',
      description: 'Enable dark mode theme',
      enabled: true,
      environment: 'production',
      createdAt: '2026-08-26T00:00:00Z',
    };

    expect(flag.enabled).toBe(true);
    expect(flag.key).toBe('dark_mode');
  });

  it('Pagination has all required fields', () => {
    const pagination: Pagination = {
      page: 2,
      limit: 20,
      total: 100,
      totalPages: 5,
    };

    expect(pagination.page).toBe(2);
    expect(pagination.totalPages).toBe(5);
  });

  it('AdminBooking has all required fields', () => {
    const booking: AdminBooking = {
      id: 'b1',
      code: 'DKT-100',
      customerName: 'Siti',
      providerName: 'Barbershop Central',
      serviceName: 'Haircut',
      staffName: 'Andi',
      startTime: '2026-08-26T10:00:00Z',
      status: 'CONFIRMED',
      totalAmount: 75000,
      createdAt: '2026-08-25T00:00:00Z',
    };

    expect(booking.code).toBe('DKT-100');
    expect(booking.totalAmount).toBe(75000);
  });
});
