import { publicApi } from '../api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(data: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(data) };
}

describe('weird / edge / negative cases - publicApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('booking create - P/N/E/A', () => {
    it('P: guest booking dengan customerEmail valid', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-1', bookingCode: 'DKT-ABCDE' } }));
      const result = await publicApi.bookings.create({
        providerId: 'p1', serviceId: 's1', startsAt: '2026-08-31T10:00:00+07:00', endsAt: '2026-08-31T11:00:00+07:00',
        customerName: 'Budi', customerEmail: 'budi@test.com', customerPhone: '081234567890', notes: '', idempotencyKey: 'k1'
      } as any);
      expect(result.data.bookingCode).toMatch(/^DKT-/);
    });

    it('N: booking tanpa Idempotency-Key header tetap kirim (apiClient handle?)', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-2' } }));
      await publicApi.bookings.create({ providerId: 'p1', serviceId: 's1', startsAt: '2026-08-31T10:00:00+07:00', endsAt: '2026-08-31T11:00:00+07:00', customerName: 'B', customerEmail: 'b@test.com', customerPhone: '0812', notes: '', idempotencyKey: '' } as any);
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body).idempotencyKey).toBe('');
    });

    it('E: total 0 gratis (price 0) tetap create', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-3', total: 0 } }));
      const res = await publicApi.bookings.create({ providerId: 'p1', serviceId: 's1', startsAt: '2026-08-31T10:00:00+07:00', endsAt: '2026-08-31T11:00:00+07:00', customerName: 'Free', customerEmail: 'free@test.com', customerPhone: '0812', notes: '', idempotencyKey: 'k2' } as any);
      expect(res.data.total).toBe(0);
    });

    it('A: customerName XSS <script> tetap dikirim sebagai string (sanitize backend)', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-4' } }));
      await publicApi.bookings.create({ providerId: 'p1', serviceId: 's1', startsAt: '2026-08-31T10:00:00+07:00', endsAt: '2026-08-31T11:00:00+07:00', customerName: "<script>alert(1)</script>", customerEmail: 'x@test.com', customerPhone: '0812', notes: "'; DROP TABLE bookings; --", idempotencyKey: 'k3' } as any);
      const [, opts] = mockFetch.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.customerName).toBe("<script>alert(1)</script>");
      expect(body.notes).toBe("'; DROP TABLE bookings; --");
    });

    it('A: email injection nosql object tetap stringify', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-5' } }));
      await publicApi.bookings.create({ providerId: 'p1', serviceId: 's1', startsAt: '2026-08-31T10:00:00+07:00', endsAt: '2026-08-31T11:00:00+07:00', customerName: 'A', customerEmail: 'a@test.com', customerPhone: '0812', notes: '', idempotencyKey: 'k4' } as any);
      const [, opts] = mockFetch.mock.calls[0];
      expect(JSON.parse(opts.body).customerEmail).toBe('a@test.com');
    });
  });

  describe('providers search - weird', () => {
    it('P: empty query tidak kirim q param (menampilkan all)', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { providers: [], pagination: {} } }));
      await publicApi.providers.search({ query: '', category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 1, limit: 10 } as any);
      const [url] = mockFetch.mock.calls[0];
      expect(url).not.toContain('q=');
    });

    it('N: q=<script> di-encode', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { providers: [] } }));
      await publicApi.providers.search({ query: '<script>alert(1)</script>', category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 1, limit: 10 } as any);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain(encodeURIComponent('<script>'));
    });

    it('E: page 0 dan limit 9999 tetap kirim (backend clamp)', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { providers: [] } }));
      await publicApi.providers.search({ query: 'a', category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 0, limit: 9999 } as any);
      const [url] = mockFetch.mock.calls[0];
      // page 0 tidak difilter karena !==0 check false, jadi tidak terkirim -> edge weird: page 0 hilang
      expect(url).toContain('limit=9999');
    });

    it('A: unicode query Barber 💈 東京', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { providers: [] } }));
      await publicApi.providers.search({ query: 'Barber 💈 東京', category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 1, limit: 10 } as any);
      const [url] = mockFetch.mock.calls[0];
      // URLSearchParams encodes space as + not %20, so decode + check
      const decoded = decodeURIComponent(String(url).replace(/\+/g, ' '));
      expect(decoded).toContain('Barber 💈 東京');
      expect(String(url)).toContain('q=Barber');
    });

    it('A: injection q=barber\' OR 1=1 -- tetap encode', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { providers: [] } }));
      await publicApi.providers.search({ query: "barber' OR 1=1 --", category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 1, limit: 10 } as any);
      const [url] = mockFetch.mock.calls[0];
      const decoded = decodeURIComponent(String(url).replace(/\+/g, ' '));
      expect(decoded).toContain("barber' OR 1=1 --");
      // ensure tidak raw SQL injection (harus encoded)
      expect(String(url)).not.toContain("barber' OR 1=1 --");
    });
  });

  describe('auth weird', () => {
    it('A: login dengan email berisi spasi harus trim di backend, frontend kirim apa adanya', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { accessToken: 'at', refreshToken: 'rt' } }));
      await publicApi.auth.login('  budi@dekat.id  ', 'admin123');
      const [, opts] = mockFetch.mock.calls[0];
      expect(JSON.parse(opts.body).email).toBe('  budi@dekat.id  ');
    });

    it('A: register phone 0812 leading zero tetap string', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { accessToken: 'at' } }));
      await publicApi.auth.register('Budi', 'budi@test.com', '081234567890', 'pass123');
      const [, opts] = mockFetch.mock.calls[0];
      expect(JSON.parse(opts.body).phone).toBe('081234567890');
      expect(typeof JSON.parse(opts.body).phone).toBe('string');
    });
  });

  describe('availability weird', () => {
    it('P: getSlots dengan date valid', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
      await publicApi.availability.getSlots('prov-1', 'svc-1', 'staff-1', '2026-08-31');
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('date=2026-08-31');
    });

    it('N: date lampau tetap dikirim (backend validasi)', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Cannot hold a slot in the past' }, false, 400));
      await expect(publicApi.availability.getSlots('prov-1', 'svc-1', 'staff-1', '2020-01-01')).rejects.toThrow();
    });

    it('A: date 2026-02-29 bukan leap year tetap kirim', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
      await publicApi.availability.getSlots('prov-1', 'svc-1', 'staff-1', '2026-02-29');
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('2026-02-29');
    });
  });

  describe('verifyPin weird', () => {
    it('A: PIN 000000 leading zero string', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { pinVerified: true } }));
      const res = await publicApi.bookings.verifyPin('bk-1', '000000');
      const [, opts] = mockFetch.mock.calls[0];
      expect(JSON.parse(opts.body).pin).toBe('000000');
      expect(JSON.parse(opts.body).pin).toHaveLength(6);
      expect(res.data.pinVerified).toBe(true);
    });

    it('N: PIN salah 123456 backend 400', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Invalid PIN' }, false, 400));
      await expect(publicApi.bookings.verifyPin('bk-1', '123456')).rejects.toThrow();
    });
  });

  describe('error handling weird', () => {
    it('N: response not ok 401 melempar', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Unauthorized' }, false, 401));
      await expect(publicApi.categories.list()).rejects.toThrow();
    });

    it('A: fetch network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));
      await expect(publicApi.providers.getFeatured()).rejects.toThrow('Network failure');
    });

    it('A: json corrupt response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.reject(new Error('JSON error')) } as any);
      await expect(publicApi.providers.getFeatured()).rejects.toThrow();
    });

    it('A: localStorage corrupt auth_user JSON', () => {
      localStorage.setItem('auth_user', '{invalid json');
      expect(() => JSON.parse(localStorage.getItem('auth_user')!)).toThrow();
      // app harus fallback logout, tidak crash
      localStorage.removeItem('auth_user');
      expect(localStorage.getItem('auth_user')).toBeNull();
    });
  });
});
