import { publicApi } from '../api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(data),
  };
}

describe('publicApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('auth', () => {
    it('login memanggil endpoint yang benar', async () => {
      const res = {
        success: true,
        data: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
      };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      const result = await publicApi.auth.login('user@test.com', 'password123');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/login');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual({ email: 'user@test.com', password: 'password123' });
      expect(result).toEqual(res);
    });

    it('register memanggil endpoint yang benar', async () => {
      const res = {
        success: true,
        data: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' },
      };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      const result = await publicApi.auth.register('Budi', 'budi@test.com', '081234567890', 'pass123');

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/auth/register');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual({
        name: 'Budi',
        email: 'budi@test.com',
        phone: '081234567890',
        password: 'pass123',
      });
      expect(result).toEqual(res);
    });
  });

  describe('categories', () => {
    it('list mengambil semua kategori', async () => {
      const res = { success: true, data: [{ id: '1', name: 'Barbershop', slug: 'barbershop', icon: 'scissors', serviceCount: 10 }] };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      const result = await publicApi.categories.list();

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/categories');
      expect(opts.method).toBe('GET');
      expect(result.data).toHaveLength(1);
    });
  });

  describe('providers', () => {
    it('search membangun query string dari filters', async () => {
      const res = { success: true, data: { providers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      await publicApi.providers.search({
        query: 'barbershop',
        category: '',
        location: '',
        minPrice: 0,
        maxPrice: 0,
        minRating: 0,
        date: '',
        sort: '',
        page: 1,
        limit: 10,
      });

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/providers?');
      expect(url).toContain('q=barbershop');
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
    });

    it('getBySlug mengambil provider berdasarkan slug', async () => {
      const res = { success: true, data: { id: '1', slug: 'barbershop-central' } };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      const result = await publicApi.providers.getBySlug('barbershop-central');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/providers/barbershop-central');
      expect(result.data.slug).toBe('barbershop-central');
    });

    it('getFeatured mengambil provider unggulan', async () => {
      const res = { success: true, data: [] };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      await publicApi.providers.getFeatured();

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/providers/featured');
    });
  });

  describe('services', () => {
    it('listByProvider mengambil layanan berdasarkan providerId', async () => {
      const res = { success: true, data: [] };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      await publicApi.services.listByProvider('prov-1');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/providers/prov-1/services');
    });
  });

  describe('availability', () => {
    it('getSlots mengirim parameter yang benar', async () => {
      const res = { success: true, data: [] };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      await publicApi.availability.getSlots('prov-1', 'svc-1', 'staff-1', '2026-08-26');

      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/providers/prov-1/availability?');
      expect(url).toContain('serviceId=svc-1');
      expect(url).toContain('staffId=staff-1');
      expect(url).toContain('date=2026-08-26');
    });
  });

  describe('bookings', () => {
    it('create mengirim data booking', async () => {
      const res = { success: true, data: { id: 'bk-1', bookingCode: 'DKT-001' } };
      mockFetch.mockResolvedValueOnce(mockResponse(res));

      const bookingData = {
        providerId: 'prov-1',
        serviceId: 'svc-1',
        startsAt: '2026-08-27T10:00:00+07:00',
        endsAt: '2026-08-27T11:00:00+07:00',
        customerName: 'Budi',
        customerEmail: 'budi@test.com',
        customerPhone: '081234567890',
        notes: '',
        idempotencyKey: 'key-1',
      };
      const result = await publicApi.bookings.create(bookingData);

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/public/bookings');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual(bookingData);
      expect(result.data.bookingCode).toBe('DKT-001');
    });
  });

  it('melempar error jika response not ok', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Not Found' }, false, 404));

    await expect(publicApi.categories.list()).rejects.toThrow();
  });
});
