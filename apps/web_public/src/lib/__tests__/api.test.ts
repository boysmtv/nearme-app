import { publicApi, api, mediaApi, providerApi, chatApi, analyticsApi, adminApi } from '../api';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function mockResponse(data: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(data) };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('api (generic get/post/put/delete)', () => {
  it('get calls apiClient.get', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: 'ok' }));
    const result = await api.get('/test');
    expect(mockFetch).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: 'ok' });
  });

  it('post calls apiClient.post with body', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await api.post('/test', { a: 1 });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ a: 1 });
  });

  it('put calls apiClient.put', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await api.put('/test', { b: 2 });
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('PUT');
  });

  it('delete calls apiClient.delete', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await api.delete('/test');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('DELETE');
  });
});

describe('publicApi.auth', () => {
  it('login calls correct endpoint', async () => {
    const res = { success: true, data: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' } };
    mockFetch.mockResolvedValueOnce(mockResponse(res));
    const result = await publicApi.auth.login('user@test.com', 'password123');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/login');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'user@test.com', password: 'password123' });
    expect(result).toEqual(res);
  });

  it('register calls correct endpoint', async () => {
    const res = { success: true, data: { accessToken: 'at', refreshToken: 'rt', expiresIn: 900, tokenType: 'Bearer' } };
    mockFetch.mockResolvedValueOnce(mockResponse(res));
    const result = await publicApi.auth.register('Budi', 'budi@test.com', '081234567890', 'pass123');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/register');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ name: 'Budi', email: 'budi@test.com', phone: '081234567890', password: 'pass123' });
    expect(result).toEqual(res);
  });

  it('requestOtp calls correct endpoint with purpose', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.auth.requestOtp('test@test.com', 'LOGIN');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/otp/request');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'test@test.com', purpose: 'LOGIN' });
  });

  it('requestOtp defaults purpose to LOGIN', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.auth.requestOtp('test@test.com');
    const [, opts] = mockFetch.mock.calls[0];
    expect(JSON.parse(opts.body)).toEqual({ email: 'test@test.com', purpose: 'LOGIN' });
  });

  it('verifyOtp calls correct endpoint', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { accessToken: 'at', refreshToken: 'rt' } }));
    await publicApi.auth.verifyOtp('test@test.com', '123456', 'LOGIN');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/otp/verify');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'test@test.com', code: '123456', purpose: 'LOGIN' });
  });
});

describe('publicApi.categories', () => {
  it('list fetches all categories', async () => {
    const res = { success: true, data: [{ id: '1', name: 'Barbershop', slug: 'barbershop', icon: 'scissors', serviceCount: 10 }] };
    mockFetch.mockResolvedValueOnce(mockResponse(res));
    const result = await publicApi.categories.list();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/categories');
    expect(opts.method).toBe('GET');
    expect(result.data).toHaveLength(1);
  });
});

describe('publicApi.providers', () => {
  it('search builds query string from filters', async () => {
    const res = { success: true, data: { providers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } };
    mockFetch.mockResolvedValueOnce(mockResponse(res));
    await publicApi.providers.search({ query: 'barbershop', category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 1, limit: 10 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers?');
    expect(url).toContain('q=barbershop');
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });

  it('search omits empty/zero values', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { providers: [] } }));
    await publicApi.providers.search({ query: '', category: '', location: '', minPrice: 0, maxPrice: 0, minRating: 0, date: '', sort: '', page: 1, limit: 10 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain('category=');
    expect(url).not.toContain('minPrice=');
  });

  it('getBySlug fetches provider by slug', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: '1', slug: 'barbershop-central' } }));
    const result = await publicApi.providers.getBySlug('barbershop-central');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/barbershop-central');
    expect(result.data.slug).toBe('barbershop-central');
  });

  it('getFeatured fetches featured providers', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.providers.getFeatured();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/featured');
  });
});

describe('publicApi.services', () => {
  it('listByProvider fetches services by providerId', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.services.listByProvider('prov-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/services');
  });
});

describe('publicApi.staff', () => {
  it('listByProvider fetches staff by providerId', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.staff.listByProvider('prov-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/staff');
  });
});

describe('publicApi.availability', () => {
  it('getSlots sends correct parameters', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.availability.getSlots('prov-1', 'svc-1', 'staff-1', '2026-08-26');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/availability?');
    expect(url).toContain('serviceId=svc-1');
    expect(url).toContain('staffId=staff-1');
    expect(url).toContain('date=2026-08-26');
  });
});

describe('publicApi.reviews', () => {
  it('listByProvider fetches reviews with pagination', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [], total: 0 }));
    await publicApi.reviews.listByProvider('prov-1', 2, 20);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/reviews?');
    expect(url).toContain('page=2');
    expect(url).toContain('limit=20');
  });

  it('listByProvider uses default pagination', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.reviews.listByProvider('prov-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('page=1');
    expect(url).toContain('limit=10');
  });

  it('create posts review for booking', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.reviews.create('bk-1', { rating: 5, title: 'Great', body: 'Awesome', photoIds: ['p1'] });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/review');
    expect(opts.method).toBe('POST');
  });

  it('report posts report for review', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.reviews.report('rev-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/reviews/rev-1/report');
    expect(opts.method).toBe('POST');
  });

  it('getPhotos fetches photos for review', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.reviews.getPhotos('rev-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/reviews/rev-1/photos');
  });

  it('addPhoto adds photo to review', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.reviews.addPhoto('rev-1', 'media-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/reviews/rev-1/photos/media-1');
    expect(opts.method).toBe('POST');
  });
});

describe('publicApi.blockedDates', () => {
  it('listByProvider fetches blocked dates', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.blockedDates.listByProvider('prov-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/blocked-dates');
  });
});

describe('publicApi.media', () => {
  it('publicProviderGallery fetches provider gallery', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.media.publicProviderGallery('prov-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/media');
  });

  it('publicStaffPortfolio fetches staff portfolio', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.media.publicStaffPortfolio('staff-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/staff/staff-1/media');
  });

  it('publicReviewPhotos fetches review photos', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.media.publicReviewPhotos('rev-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/reviews/rev-1/media');
  });
});

describe('publicApi.customer', () => {
  it('getProfile fetches customer profile', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { name: 'Budi' } }));
    const result = await publicApi.customer.getProfile();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/customer/profile');
    expect(opts.method).toBe('GET');
    expect(result.data.name).toBe('Budi');
  });

  it('updateProfile updates customer profile', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.customer.updateProfile({ name: 'Budi', phone: '08123' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/customer/profile');
    expect(opts.method).toBe('PUT');
  });
});

describe('publicApi.favorites', () => {
  it('list fetches favorites', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.favorites.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/customer/favorites');
  });

  it('add adds favorite', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.favorites.add('staff-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/customer/favorites/staff-1');
    expect(opts.method).toBe('POST');
  });

  it('remove removes favorite', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.favorites.remove('staff-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/customer/favorites/staff-1');
    expect(opts.method).toBe('DELETE');
  });
});

describe('publicApi.bookings', () => {
  it('list fetches bookings with status filter', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.bookings.list({ status: 'CONFIRMED', page: 2, limit: 5 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings?');
    expect(url).toContain('status=CONFIRMED');
    expect(url).toContain('page=2');
    expect(url).toContain('limit=5');
  });

  it('list omits ALL status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.bookings.list({ status: 'ALL' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).not.toContain('status=');
  });

  it('list without params', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.bookings.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings');
    expect(url).not.toContain('status=');
  });

  it('create posts booking data', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-1', bookingCode: 'DKT-001' } }));
    const bookingData = { providerId: 'prov-1', serviceId: 'svc-1', startsAt: '2026-08-27T10:00:00+07:00', endsAt: '2026-08-27T11:00:00+07:00', customerName: 'Budi', customerEmail: 'budi@test.com', customerPhone: '081234567890', notes: '', idempotencyKey: 'key-1' };
    const result = await publicApi.bookings.create(bookingData as any);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/bookings');
    expect(opts.method).toBe('POST');
    expect(result.data.bookingCode).toBe('DKT-001');
  });

  it('verifyPin posts pin verification', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { pinVerified: true, status: 'CONFIRMED' } }));
    await publicApi.bookings.verifyPin('bk-1', '123456');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/verify-pin');
    expect(opts.method).toBe('POST');
  });

  it('getById fetches booking by id', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-1' } }));
    await publicApi.bookings.getById('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1');
  });

  it('reschedule posts reschedule data', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.bookings.reschedule('bk-1', { newStartsAt: '2026-09-01T10:00:00Z', newEndsAt: '2026-09-01T11:00:00Z', expectedVersion: 1 });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/reschedule');
    expect(opts.method).toBe('POST');
  });

  it('cancel posts cancellation with actor header', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'user-1' }));
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.bookings.cancel('bk-1', 'Changed mind');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/cancel');
    expect(url).toContain('reason=Changed%20mind');
    expect(opts.method).toBe('POST');
  });

  it('cancel without reason', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.bookings.cancel('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/cancel');
    expect(url).not.toContain('reason=');
  });

  it('ics fetches ics data', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve('VCALENDAR'), json: () => Promise.resolve('VCALENDAR') });
    const result = await publicApi.bookings.ics('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/ics');
  });

  it('calendarLink fetches calendar link', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { googleCalendarUrl: 'https://calendar.google.com', icsUrl: '', icsContent: '' } }));
    await publicApi.bookings.calendarLink('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/calendar-link');
  });

  it('hold creates slot hold', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { holdId: 'h1', expiresAt: '2026-08-27T10:15:00Z' } }));
    await publicApi.bookings.hold('prov-1', 'slot-1', 'svc-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/slots/slot-1/hold');
    expect(opts.method).toBe('POST');
  });

  it('validateCoupon validates coupon code', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { valid: true, discountType: 'PERCENTAGE', discountValue: 10, discountAmount: 5000, finalPrice: 45000 } }));
    await publicApi.bookings.validateCoupon('DISKON10', 'prov-1', 'svc-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/bookings/validate-coupon?');
    expect(url).toContain('code=DISKON10');
    expect(url).toContain('providerId=prov-1');
    expect(url).toContain('serviceId=svc-1');
  });

  it('createPaymentIntent creates payment intent', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { paymentUrl: 'https://pay.midtrans.com', redirectUrl: '', orderId: 'ORD-1' } }));
    await publicApi.bookings.createPaymentIntent('bk-1', 'midtrans', { tenantId: 't-1', amount: 50000, currency: 'IDR' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/payment-intents');
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body.method).toBe('midtrans');
    expect(body.amount).toBe(50000);
    expect(body.tenantId).toBe('t-1');
  });

  it('createPaymentIntent uses defaults', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.bookings.createPaymentIntent('bk-1', 'midtrans');
    const [, opts] = mockFetch.mock.calls[0];
    const body = JSON.parse(opts.body);
    expect(body.amount).toBe(0);
    expect(body.currency).toBe('IDR');
  });

  it('getPaymentStatus fetches payment status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { status: 'paid' } }));
    await publicApi.bookings.getPaymentStatus('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/payment-intents');
  });
});

describe('publicApi.faqs', () => {
  it('listPublic fetches public FAQs', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.faqs.listPublic();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/faqs');
  });

  it('listPublic with tenantId and category', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.faqs.listPublic('t-1', 'general');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('tenantId=t-1');
    expect(url).toContain('category=general');
  });

  it('listProvider fetches provider FAQs', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.faqs.listProvider();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/faqs');
  });

  it('createProvider creates FAQ', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.faqs.createProvider({ question: 'Q', answer: 'A' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/faqs');
    expect(opts.method).toBe('POST');
  });

  it('updateProvider updates FAQ', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.faqs.updateProvider('faq-1', { question: 'Updated' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/faqs/faq-1');
    expect(opts.method).toBe('PUT');
  });

  it('deleteProvider deletes FAQ', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.faqs.deleteProvider('faq-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/faqs/faq-1');
    expect(opts.method).toBe('DELETE');
  });

  it('listAdmin fetches admin FAQs', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.faqs.listAdmin();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/faqs');
  });

  it('listAdmin with tenantId', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.faqs.listAdmin('t-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('tenantId=t-1');
  });

  it('createAdmin creates FAQ', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.faqs.createAdmin({ question: 'Q', answer: 'A' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/faqs');
    expect(opts.method).toBe('POST');
  });

  it('updateAdmin updates FAQ', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.faqs.updateAdmin('faq-1', { question: 'Updated' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/faqs/faq-1');
    expect(opts.method).toBe('PUT');
  });

  it('deleteAdmin deletes FAQ', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.faqs.deleteAdmin('faq-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/faqs/faq-1');
    expect(opts.method).toBe('DELETE');
  });
});

describe('publicApi.policies', () => {
  it('listPublic fetches public policies', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.policies.listPublic();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/policies');
  });

  it('listPublic with tenantId and type', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.policies.listPublic('t-1', 'cancellation');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('tenantId=t-1');
    expect(url).toContain('type=cancellation');
  });

  it('listProvider fetches provider policies', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.policies.listProvider();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/policies');
  });

  it('createProvider creates policy', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.policies.createProvider({ title: 'T', body: 'B', type: 'cancellation' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/policies');
    expect(opts.method).toBe('POST');
  });

  it('updateProvider updates policy', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.policies.updateProvider('pol-1', { title: 'Updated' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/policies/pol-1');
    expect(opts.method).toBe('PUT');
  });

  it('deleteProvider deletes policy', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.policies.deleteProvider('pol-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/policies/pol-1');
    expect(opts.method).toBe('DELETE');
  });

  it('listAdmin fetches admin policies', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.policies.listAdmin();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/policies');
  });

  it('listAdmin with tenantId', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.policies.listAdmin('t-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('tenantId=t-1');
  });

  it('createAdmin creates policy', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.policies.createAdmin({ title: 'T', body: 'B', type: 'cancellation' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/policies');
    expect(opts.method).toBe('POST');
  });

  it('updateAdmin updates policy', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await publicApi.policies.updateAdmin('pol-1', { title: 'Updated' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/policies/pol-1');
    expect(opts.method).toBe('PUT');
  });

  it('deleteAdmin deletes policy', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.policies.deleteAdmin('pol-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/policies/pol-1');
    expect(opts.method).toBe('DELETE');
  });
});

describe('publicApi.notifications', () => {
  it('list fetches notifications', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.notifications.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/notifications');
  });

  it('list with params', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await publicApi.notifications.list({ page: 2, limit: 20 });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('page=2');
    expect(url).toContain('limit=20');
  });

  it('markRead marks notification as read', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.notifications.markRead('n-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/notifications/n-1/read');
    expect(opts.method).toBe('PUT');
  });

  it('markAllRead marks all as read', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await publicApi.notifications.markAllRead();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/notifications/read-all');
    expect(opts.method).toBe('PUT');
  });
});

describe('mediaApi', () => {
  it('upload creates FormData with file', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'm1', url: '/img.jpg', fileName: 'img.jpg', sortOrder: 0 } }));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await mediaApi.upload(file, 'provider', 'prov-1', 1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/media/upload');
    expect(opts.method).toBe('POST');
  });

  it('upload without optional params', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await mediaApi.upload(file, 'staff');
    const [, opts] = mockFetch.mock.calls[0];
    expect(opts.method).toBe('POST');
  });

  it('list fetches media list', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await mediaApi.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/media');
  });

  it('list with params', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await mediaApi.list({ ownerType: 'provider', ownerId: 'prov-1' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('ownerType=provider');
    expect(url).toContain('ownerId=prov-1');
  });

  it('delete deletes media', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await mediaApi.delete('m-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/media/m-1');
    expect(opts.method).toBe('DELETE');
  });

  it('reorder reorders media', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await mediaApi.reorder(['m-2', 'm-1']);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/media/reorder');
    expect(opts.method).toBe('PUT');
  });

  it('getProviderGallery fetches provider gallery', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await mediaApi.getProviderGallery('prov-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/public/providers/prov-1/media');
  });
});

describe('providerApi', () => {
  it('auth.logout with refreshToken', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.auth.logout('rt-123');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/logout?refreshToken=rt-123');
    expect(opts.method).toBe('POST');
  });

  it('auth.logout without refreshToken', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.auth.logout();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/logout');
    expect(url).not.toContain('refreshToken');
  });

  it('dashboard.getStats fetches stats', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.dashboard.getStats();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/dashboard/stats');
  });

  it('dashboard.getRecentBookings fetches recent', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.dashboard.getRecentBookings();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/dashboard/recent-bookings');
  });

  it('bookings.list fetches with params', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.bookings.list({ page: 1, limit: 10, status: 'CONFIRMED', date: '2026-09-01' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/bookings?');
    expect(url).toContain('page=1');
    expect(url).toContain('status=CONFIRMED');
  });

  it('bookings.list omits empty params', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.bookings.list({ page: undefined, limit: undefined, status: undefined, date: undefined });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/bookings');
    expect(url).not.toContain('status=');
  });

  it('bookings.getById fetches booking', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.bookings.getById('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/bookings/bk-1');
  });

  it('bookings.updateStatus updates status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.bookings.updateStatus('bk-1', 'COMPLETED', 'Done');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/bookings/bk-1/status');
    expect(opts.method).toBe('PUT');
    expect(JSON.parse(opts.body)).toEqual({ status: 'COMPLETED', reason: 'Done' });
  });

  it('bookings.reschedule reschedules booking', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.bookings.reschedule('bk-1', 'slot-2');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/bookings/bk-1/reschedule');
    expect(opts.method).toBe('PUT');
  });

  it('calendar.getBookings fetches calendar bookings', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.calendar.getBookings('2026-09-01', '2026-09-30');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/calendar?');
    expect(url).toContain('startDate=2026-09-01');
    expect(url).toContain('endDate=2026-09-30');
  });

  it('services.list fetches services', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.services.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/services');
  });

  it('services.create creates service', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.services.create({ name: 'Haircut', description: 'Cut', price: 50000, duration: 30 });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/services');
    expect(opts.method).toBe('POST');
  });

  it('services.update updates service', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.services.update('svc-1', { name: 'Updated' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/services/svc-1');
    expect(opts.method).toBe('PUT');
  });

  it('services.delete deletes service', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.services.delete('svc-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/services/svc-1');
    expect(opts.method).toBe('DELETE');
  });

  it('staff.list fetches staff', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.staff.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/staff');
  });

  it('staff.invite invites staff', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.staff.invite({ displayName: 'Andi', email: 'andi@test.com' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/staff');
    expect(opts.method).toBe('POST');
  });

  it('staff.update updates staff', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.staff.update('staff-1', { displayName: 'Updated' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/staff/staff-1');
    expect(opts.method).toBe('PUT');
  });

  it('staff.updateSchedule updates schedule', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.staff.updateSchedule('staff-1', []);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/staff/staff-1/schedule');
    expect(opts.method).toBe('POST');
  });

  it('staff.deactivate deactivates staff', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.staff.deactivate('staff-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/staff/staff-1');
    expect(opts.method).toBe('DELETE');
  });

  it('customers.list fetches customers', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.customers.list({ page: 1, limit: 10, search: 'budi' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/customers?');
    expect(url).toContain('search=budi');
  });

  it('reports.getReport fetches report', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.reports.getReport({ startDate: '2026-09-01', endDate: '2026-09-30' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/reports?');
    expect(url).toContain('startDate=2026-09-01');
  });

  it('reports.getReport with staffId', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.reports.getReport({ startDate: '2026-09-01', endDate: '2026-09-30', staffId: 's-1' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('staffId=s-1');
  });

  it('reports.exportCsv exports CSV', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { downloadUrl: '/export.csv' } }));
    await providerApi.reports.exportCsv({ startDate: '2026-09-01', endDate: '2026-09-30' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/reports/export?');
  });

  it('settings.get fetches settings', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.settings.get();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/settings');
  });

  it('settings.update updates settings', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.settings.update({ autoConfirm: true });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/settings');
    expect(opts.method).toBe('PUT');
  });

  it('blockedDates.list fetches blocked dates', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.blockedDates.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/blocked-dates');
  });

  it('blockedDates.add adds blocked date', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.blockedDates.add({ date: '2026-12-25', reason: 'Christmas' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/blocked-dates');
    expect(opts.method).toBe('POST');
  });

  it('blockedDates.remove removes blocked date', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.blockedDates.remove('2026-12-25');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/blocked-dates/2026-12-25');
    expect(opts.method).toBe('DELETE');
  });

  it('tenant.create creates tenant', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.tenant.create({ name: 'Barbershop', slug: 'barbershop' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/tenant');
    expect(opts.method).toBe('POST');
  });

  it('reviews.list fetches reviews', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.reviews.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/reviews');
  });

  it('reviews.respond responds to review', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.reviews.respond('rev-1', 'Thanks!');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/reviews/rev-1/respond');
    expect(opts.method).toBe('POST');
  });

  it('coupons.list fetches coupons', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.coupons.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/coupons');
  });

  it('coupons.create creates coupon', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.coupons.create({ code: 'DISKON10', discountType: 'PERCENTAGE' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/coupons');
    expect(opts.method).toBe('POST');
  });

  it('coupons.update updates coupon', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.coupons.update('c-1', { code: 'DISKON20' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/coupons/c-1');
    expect(opts.method).toBe('PUT');
  });

  it('coupons.delete deletes coupon', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.coupons.delete('c-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/coupons/c-1');
    expect(opts.method).toBe('DELETE');
  });

  it('loyalty.getCustomerHistory fetches history', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.loyalty.getCustomerHistory('cust-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/loyalty/cust-1');
  });

  it('loyalty.earn earns points', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.loyalty.earn({ customerId: 'cust-1', points: 100, description: 'Good' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/loyalty/earn');
    expect(opts.method).toBe('POST');
  });

  it('campaigns.list fetches campaigns', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.campaigns.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/campaigns');
  });

  it('campaigns.create creates campaign', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.campaigns.create({ name: 'Ramadan' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/campaigns');
    expect(opts.method).toBe('POST');
  });

  it('campaigns.activate activates campaign', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.campaigns.activate('camp-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/campaigns/camp-1/activate');
    expect(opts.method).toBe('PUT');
  });

  it('campaigns.pause pauses campaign', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await providerApi.campaigns.pause('camp-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/campaigns/camp-1/pause');
    expect(opts.method).toBe('PUT');
  });

  it('notifications.list fetches notifications', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await providerApi.notifications.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/notifications');
  });

  it('notifications.markRead marks read', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.notifications.markRead('n-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/notifications/n-1/read');
    expect(opts.method).toBe('PUT');
  });

  it('notifications.markAllRead marks all', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await providerApi.notifications.markAllRead();
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/notifications/read-all');
    expect(opts.method).toBe('PUT');
  });

  it('bookingsProvider.verifyPin verifies pin', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { pinVerified: true } }));
    await providerApi.bookingsProvider.verifyPin('bk-1', '123456');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/verify-pin');
    expect(opts.method).toBe('POST');
  });
});

describe('chatApi', () => {
  it('list fetches conversations', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await chatApi.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/chats');
  });

  it('get fetches conversation by id', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await chatApi.get('chat-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/chats/chat-1');
  });

  it('create creates conversation', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await chatApi.create({ subject: 'Help', providerId: 'prov-1' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/chats');
    expect(opts.method).toBe('POST');
  });

  it('getMessages fetches messages', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await chatApi.getMessages('chat-1', 2, 100);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/chats/chat-1/messages?page=2&limit=100');
  });

  it('getMessages with defaults', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await chatApi.getMessages('chat-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('page=1&limit=50');
  });

  it('sendMessage sends message', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await chatApi.sendMessage('chat-1', { body: 'Hello', messageType: 'TEXT' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/chats/chat-1/messages');
    expect(opts.method).toBe('POST');
  });

  it('getBookingChat fetches booking chat', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await chatApi.getBookingChat('bk-1');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/bookings/bk-1/chat');
  });

  it('streamUrl returns SSE URL', () => {
    const url = chatApi.streamUrl('chat-1');
    expect(url).toContain('/chats/chat-1/events');
  });
});

describe('analyticsApi', () => {
  it('getAnalytics fetches analytics', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await analyticsApi.getAnalytics({ startDate: '2026-09-01', endDate: '2026-09-30', granularity: 'day' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/reports/analytics?');
    expect(url).toContain('startDate=2026-09-01');
    expect(url).toContain('granularity=day');
  });

  it('exportCsv exports CSV', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse('csv,data'));
    await analyticsApi.exportCsv({ startDate: '2026-09-01', endDate: '2026-09-30' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/provider/reports/export?');
    expect(url).toContain('format=csv');
  });
});

describe('adminApi', () => {
  it('auth.login with MFA', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { accessToken: 'at' } }));
    await adminApi.auth.login('admin@test.com', 'pass', '123456');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/auth/login');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ email: 'admin@test.com', password: 'pass', mfaCode: '123456' });
  });

  it('dashboard.getStats fetches stats', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await adminApi.dashboard.getStats();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/dashboard/stats');
  });

  it('dashboard.getAnalytics fetches analytics', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await adminApi.dashboard.getAnalytics(7);
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/analytics?days=7');
  });

  it('dashboard.getAnalytics defaults to 30 days', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: {} }));
    await adminApi.dashboard.getAnalytics();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('days=30');
  });

  it('users.list fetches users', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.users.list({ page: 1, limit: 10, search: 'budi', role: 'ROLE_CUSTOMER', status: 'ACTIVE' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/users?');
    expect(url).toContain('search=budi');
    expect(url).toContain('role=ROLE_CUSTOMER');
  });

  it('users.updateStatus updates status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.users.updateStatus('u-1', 'SUSPENDED');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/users/u-1/status');
    expect(opts.method).toBe('PUT');
  });

  it('tenants.list fetches tenants', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.tenants.list({ page: 1, limit: 10, search: 'barber', status: 'ACTIVE' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/tenants?');
    expect(url).toContain('search=barber');
  });

  it('tenants.approve approves tenant', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.tenants.approve('t-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/tenants/t-1/approve');
    expect(opts.method).toBe('PUT');
  });

  it('tenants.reject rejects tenant', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.tenants.reject('t-1', 'Incomplete docs');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/tenants/t-1/reject');
    expect(opts.method).toBe('PUT');
  });

  it('bookings.list fetches bookings', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.bookings.list({ page: 1, limit: 10, status: 'CONFIRMED', date: '2026-09-01' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/bookings?');
  });

  it('payments.list fetches payments', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.payments.list({ page: 1, limit: 10, status: 'paid' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/payments?');
  });

  it('cases.list fetches cases', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.cases.list({ page: 1, limit: 10, severity: 'HIGH', status: 'OPEN' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/cases?');
  });

  it('cases.updateStatus updates status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.cases.updateStatus('case-1', 'RESOLVED');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/cases/case-1/status');
    expect(opts.method).toBe('PUT');
  });

  it('auditLogs.list fetches audit logs', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.auditLogs.list({ action: 'LOGIN', resourceType: 'USER', since: '2026-09-01' });
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/audit-logs?');
    expect(url).toContain('action=LOGIN');
  });

  it('subscriptions.listPlans fetches plans', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.subscriptions.listPlans();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/subscriptions/plans');
  });

  it('subscriptions.list fetches subscriptions', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.subscriptions.list();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/subscriptions');
  });

  it('subscriptions.updatePlan updates plan', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.subscriptions.updatePlan('plan-1', { status: 'ACTIVE' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/subscriptions/plans/plan-1');
    expect(opts.method).toBe('PUT');
  });

  it('subscriptions.cancel cancels subscription', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.subscriptions.cancel('sub-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/subscriptions/sub-1/cancel');
    expect(opts.method).toBe('PUT');
  });

  it('subscriptions.reactivate reactivates subscription', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.subscriptions.reactivate('sub-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/subscriptions/sub-1/reactivate');
    expect(opts.method).toBe('PUT');
  });

  it('config.getFlags fetches feature flags', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [] }));
    await adminApi.config.getFlags();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/feature-flags');
  });

  it('config.toggleFlag toggles flag', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.config.toggleFlag('ff-1', true);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/feature-flags/ff-1/toggle');
    expect(opts.method).toBe('PUT');
  });

  it('config.createFlag creates flag', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.config.createFlag({ name: 'Dark Mode', key: 'dark_mode', description: 'Enable dark mode', enabled: false, environment: 'dev' });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/feature-flags');
    expect(opts.method).toBe('POST');
  });

  it('config.deleteFlag deletes flag', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ success: true }));
    await adminApi.config.deleteFlag('ff-1');
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/feature-flags/ff-1');
    expect(opts.method).toBe('DELETE');
  });

  it('export.users exports users', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve('csv,data'), blob: () => Promise.resolve(new Blob(['csv,data'])) });
    await adminApi.export.users('csv');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/export/users?format=csv');
  });

  it('export.bookings exports bookings', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve('csv,data'), blob: () => Promise.resolve(new Blob(['csv,data'])) });
    await adminApi.export.bookings('json');
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/admin/export/bookings?format=json');
  });
});

it('throws error on failed response', async () => {
  mockFetch.mockResolvedValueOnce(mockResponse({ message: 'Not Found' }, false, 404));
  await expect(publicApi.categories.list()).rejects.toThrow();
});
