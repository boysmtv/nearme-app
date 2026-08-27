import type {
  ApiResponse,
  PaginatedResponse,
  Pagination,
  DashboardStats,
  Booking,
  BookingStatus,
  ProviderService,
  StaffMember,
  StaffSchedule,
  Customer,
  ReportData,
  Settings,
  OperatingHour,
  NotificationSettings,
} from '../types';

describe('TypeScript type interfaces', () => {
  it('ApiResponse compiles with valid data', () => {
    const response: ApiResponse<string> = { success: true, data: 'ok' };
    expect(response.success).toBe(true);
    expect(response.data).toBe('ok');
  });

  it('ApiResponse compiles with optional message', () => {
    const response: ApiResponse<number> = { success: false, data: 0, message: 'error' };
    expect(response.message).toBe('error');
  });

  it('PaginatedResponse compiles with array data', () => {
    const response: PaginatedResponse<string> = {
      success: true,
      data: { data: ['a', 'b'], pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
    };
    expect(response.data.data).toHaveLength(2);
    expect(response.data.pagination.totalPages).toBe(1);
  });

  it('Pagination compiles with all fields', () => {
    const p: Pagination = { page: 2, limit: 20, total: 100, totalPages: 5 };
    expect(p.page).toBe(2);
  });

  it('DashboardStats compiles with all fields', () => {
    const stats: DashboardStats = {
      todayBookings: 10,
      weekRevenue: 500000,
      totalCustomers: 120,
      avgRating: 4.8,
      occupancyRate: 75.5,
      pendingBookings: 3,
    };
    expect(stats.todayBookings).toBe(10);
    expect(stats.avgRating).toBe(4.8);
  });

  it('Booking compiles with all required fields', () => {
    const booking: Booking = {
      id: 'b1',
      bookingCode: 'DKT-001',
      customerName: 'Siti',
      customerEmail: 'siti@test.com',
      customerPhone: '081234567890',
      serviceName: 'Haircut',
      staffName: 'Andi',
      time: '10:00',
      endTime: '10:30',
      status: 'CONFIRMED',
      amount: 50000,
      depositPaid: 10000,
      notes: '',
      createdAt: '2026-08-24T08:00:00Z',
    };
    expect(booking.status).toBe('CONFIRMED');
  });

  it('BookingStatus includes all expected statuses', () => {
    const statuses: BookingStatus[] = [
      'HELD', 'PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED',
      'CHECKED_IN', 'EN_ROUTE', 'IN_SERVICE', 'COMPLETED',
      'CANCELLED', 'NO_SHOW', 'EXPIRED',
    ];
    expect(statuses).toHaveLength(11);
    statuses.forEach((s) => expect(typeof s).toBe('string'));
  });

  it('ProviderService compiles with addons', () => {
    const svc: ProviderService = {
      id: 's1',
      name: 'Haircut',
      description: 'Basic haircut',
      duration: 30,
      price: 50000,
      priceType: 'FIXED',
      depositAmount: 10000,
      category: 'Hair',
      active: true,
      addons: [{ id: 'a1', name: 'Shampoo', price: 10000, duration: 10 }],
    };
    expect(svc.addons).toHaveLength(1);
  });

  it('StaffMember compiles with optional fields', () => {
    const staff: StaffMember = { id: 'st1', displayName: 'Andi', isActive: true };
    expect(staff.title).toBeUndefined();
    const staffWithTitle: StaffMember = { ...staff, title: 'Senior Barber' };
    expect(staffWithTitle.title).toBe('Senior Barber');
  });

  it('StaffSchedule compiles with all fields', () => {
    const sched: StaffSchedule = { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isOff: false };
    expect(sched.dayOfWeek).toBe(1);
  });

  it('Customer compiles with all fields', () => {
    const cust: Customer = {
      id: 'c1',
      name: 'Siti',
      email: 'siti@test.com',
      phone: '081234567890',
      totalBookings: 5,
      lastBookingAt: '2026-08-20T10:00:00Z',
      totalSpent: 250000,
    };
    expect(cust.totalBookings).toBe(5);
  });

  it('ReportData compiles with nested arrays', () => {
    const report: ReportData = {
      totalBookings: 50,
      completedBookings: 40,
      cancelledBookings: 5,
      totalRevenue: 5000000,
      avgRating: 4.7,
      currency: 'IDR',
    };
    expect(report.totalBookings).toBe(50);
  });

  it('Settings compiles with all nested types', () => {
    const settings: Settings = {
      businessName: 'Barber Central',
      description: 'Best barbershop',
      phone: '021-123456',
      email: 'info@barber.com',
      address: 'Jl. Sudirman',
      logoUrl: '',
      operatingHours: [{ dayOfWeek: 1, open: '09:00', close: '17:00', isClosed: false }],
      bookingPolicy: 'Free cancellation',
      cancellationPolicy: '24h notice',
      autoConfirm: true,
      depositRequired: false,
      depositPercentage: 0,
      notifications: {
        emailBookingConfirmation: true,
        emailBookingReminder: true,
        smsBookingReminder: false,
        reminderHoursBefore: 24,
      },
    };
    expect(settings.operatingHours).toHaveLength(1);
    expect(settings.notifications.reminderHoursBefore).toBe(24);
  });

  it('OperatingHour compiles with isClosed true', () => {
    const hour: OperatingHour = { dayOfWeek: 0, open: '00:00', close: '00:00', isClosed: true };
    expect(hour.isClosed).toBe(true);
  });

  it('NotificationSettings compiles with boolean flags', () => {
    const n: NotificationSettings = {
      emailBookingConfirmation: false,
      emailBookingReminder: false,
      smsBookingReminder: true,
      reminderHoursBefore: 48,
    };
    expect(n.smsBookingReminder).toBe(true);
  });
});
