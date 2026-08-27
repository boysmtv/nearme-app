import type {
  ApiResponse,
  PaginatedResponse,
  Pagination,
  Category,
  Provider,
  OperatingHour,
  Service,
  Addon,
  Staff,
  TimeSlot,
  Review,
  BookingRequest,
  BookingResponse,
  SearchFilters,
  SearchResult,
} from '../types';

describe('types', () => {
  it('ApiResponse memiliki struktur yang benar', () => {
    const res: ApiResponse<string> = { success: true, data: 'test', message: 'ok' };
    expect(res.success).toBe(true);
    expect(res.data).toBe('test');
    expect(res.message).toBe('ok');
  });

  it('ApiResponse bisa tanpa message', () => {
    const res: ApiResponse<number> = { success: false, data: 0 };
    expect(res.message).toBeUndefined();
  });

  it('PaginatedResponse memiliki pagination', () => {
    const res: PaginatedResponse<string> = {
      success: true,
      data: { data: ['a'], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
    };
    expect(res.data.pagination.totalPages).toBe(1);
  });

  it('Category memiliki field yang diperlukan', () => {
    const cat: Category = { id: '1', name: 'Barbershop', slug: 'barbershop', icon: 'scissors', serviceCount: 5 };
    expect(cat.serviceCount).toBe(5);
  });

  it('Provider memiliki semua field', () => {
    const prov: Provider = {
      id: '1',
      name: 'Test',
      slug: 'test',
      description: 'desc',
      logoUrl: '',
      coverUrl: '',
      category: 'Cat',
      categorySlug: 'cat',
      rating: 4.5,
      reviewCount: 10,
      location: 'Loc',
      address: 'Addr',
      latitude: 0,
      longitude: 0,
      phone: '081234',
      openingHours: [],
      verificationStatus: 'APPROVED',
    };
    expect(prov.verificationStatus).toBe('APPROVED');
  });

  it('OperatingHour memiliki field jam', () => {
    const oh: OperatingHour = { dayOfWeek: 1, open: '09:00', close: '17:00', isClosed: false };
    expect(oh.isClosed).toBe(false);
  });

  it('Service memiliki priceType yang valid', () => {
    const types: Service['priceType'][] = ['FIXED', 'STARTING_FROM', 'HOURLY', 'QUOTE_REQUIRED'];
    const svc: Service = {
      id: '1',
      providerId: '1',
      name: 'Test',
      description: '',
      duration: 30,
      price: 50000,
      priceType: types[0],
      depositAmount: 0,
      category: '',
      addons: [],
      imageUrl: '',
    };
    expect(types).toContain(svc.priceType);
  });

  it('Addon memiliki price dan duration', () => {
    const addon: Addon = { id: '1', name: 'Pijat', price: 20000, duration: 15 };
    expect(addon.price).toBeGreaterThan(0);
  });

  it('Staff memiliki specialties array', () => {
    const staff: Staff = {
      id: '1',
      providerId: '1',
      name: 'Andi',
      avatarUrl: '',
      bio: '',
      specialties: ['Fade', 'Pompadour'],
      rating: 4.5,
      reviewCount: 5,
    };
    expect(staff.specialties).toHaveLength(2);
  });

  it('TimeSlot memiliki available boolean', () => {
    const slot: TimeSlot = {
      id: '1',
      startTime: '2026-08-26T09:00:00Z',
      endTime: '2026-08-26T09:30:00Z',
      available: true,
    };
    expect(slot.available).toBe(true);
  });

  it('Review memiliki rating', () => {
    const review: Review = {
      id: '1',
      customerName: 'Budi',
      customerAvatar: '',
      rating: 5,
      comment: 'Bagus',
      serviceName: 'Potong',
      createdAt: '2026-08-26T00:00:00Z',
    };
    expect(review.rating).toBe(5);
  });

  it('BookingRequest memiliki semua field yang diperlukan', () => {
    const req: BookingRequest = {
      providerId: '1',
      serviceId: '1',
      startsAt: '2026-08-26T09:00:00+07:00',
      endsAt: '2026-08-26T10:00:00+07:00',
      customerName: 'Budi',
      customerEmail: 'budi@test.com',
      customerPhone: '081234',
      notes: '',
      idempotencyKey: 'key-1',
    };
    expect(req.idempotencyKey).toBe('key-1');
  });

  it('BookingResponse memiliki bookingCode', () => {
    const res: BookingResponse = {
      id: '1',
      bookingCode: 'DKT-001',
      status: 'CONFIRMED',
    };
    expect(res.bookingCode).toMatch(/^DKT-/);
  });

  it('SearchFilters memiliki semua filter', () => {
    const filters: SearchFilters = {
      query: '',
      category: '',
      location: '',
      minPrice: 0,
      maxPrice: 0,
      minRating: 0,
      date: '',
      sort: '',
      page: 1,
      limit: 10,
    };
    expect(filters.page).toBe(1);
  });

  it('SearchResult memiliki providers dan pagination', () => {
    const result: SearchResult = {
      providers: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
    expect(result.providers).toEqual([]);
  });

  it('Pagination memiliki field angka', () => {
    const p: Pagination = { page: 1, limit: 10, total: 100, totalPages: 10 };
    expect(p.total).toBeGreaterThan(0);
  });
});
