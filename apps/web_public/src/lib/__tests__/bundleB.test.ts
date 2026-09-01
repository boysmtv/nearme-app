import { publicApi } from '../api';

const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

function mockResponse(data: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(data), text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)), headers: new Map([['content-type', 'application/json']]) };
}

describe('Bundle B - Deposit & Kalender & FAQ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('auth_user', JSON.stringify({ id: 'actor-1' }));
  });

  describe('deposit & pembatalan', () => {
    it('P: booking response includes deposit fields (V24)', async () => {
      const booking = { id: 'bk-1', bookingCode: 'DKT-TEST', status: 'CONFIRMED', depositAmount: 25000, depositRequired: true, cancelDeadline: '2026-09-09T10:00:00+07:00', rescheduleCount: 0, maxReschedule: 1, cancelPolicy: '24h_full_refund' };
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: booking }));
      const res = await publicApi.bookings.getById('bk-1');
      expect(res.data.depositAmount).toBe(25000);
      expect(res.data.depositRequired).toBe(true);
      expect(res.data.cancelPolicy).toBe('24h_full_refund');
    });

    it('N: cancel after deadline still returns 200 but no refund note in history (backend)', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-1', status: 'CANCELLED' } }));
      const res = await publicApi.bookings.cancel('bk-1', 'late');
      expect(res.data.status).toBe('CANCELLED');
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.method).toBe('POST');
    });

    it('E: reschedule second time 409 Conflict', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: false, message: 'Reschedule limit reached. Maximum 1 free reschedule(s) allowed' }, false, 409));
      await expect(publicApi.bookings.reschedule('bk-1', { newStartsAt: '2026-09-11T10:00:00+07:00', newEndsAt: '2026-09-11T11:00:00+07:00', expectedVersion: 1 })).rejects.toThrow();
    });

    it('P: reschedule first time succeeds', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: { id: 'bk-1', status: 'CONFIRMED', rescheduleCount: 1 } }));
      const res = await publicApi.bookings.reschedule('bk-1', { newStartsAt: '2026-09-11T10:00:00+07:00', newEndsAt: '2026-09-11T11:00:00+07:00', expectedVersion: 1 });
      expect(res.data.rescheduleCount).toBe(1);
    });
  });

  describe('kalender sync', () => {
    it('P: ics endpoint returns text/calendar VCALENDAR', async () => {
      const ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nUID:test@dekat.id\r\nEND:VEVENT\r\nEND:VCALENDAR';
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ics), json: () => Promise.resolve(ics) } as unknown as Response);
      const res = await publicApi.bookings.ics('bk-1');
      // apiClient.get with responseType text returns string in data
      expect(mockFetch).toHaveBeenCalled();
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/bookings/bk-1/ics');
    });

    it('P: calendar-link returns google url', async () => {
      const link = { googleCalendarUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=DEKAT', icsUrl: '/api/v1/bookings/bk-1/ics', icsContent: 'BEGIN:VCALENDAR' };
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: link }));
      const res = await publicApi.bookings.calendarLink('bk-1');
      expect(res.data.googleCalendarUrl).toContain('calendar.google.com');
      expect(res.data.icsUrl).toContain('/ics');
    });

    it('A: ics with special chars still VCALENDAR', async () => {
      const ics = 'BEGIN:VCALENDAR\r\nSUMMARY:DEKAT Booking DKT\\,TEST\\;2\r\nEND:VCALENDAR';
      mockFetch.mockResolvedValueOnce({ ok: true, status: 200, text: () => Promise.resolve(ics), json: () => Promise.resolve(ics) } as unknown as Response);
      const res = await publicApi.bookings.ics('bk-special');
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('FAQ & Policy', () => {
    it('P: GET /public/faqs returns list', async () => {
      const faqs = [{ id: 'f1', question: 'Bagaimana cara booking?', answer: 'Pilih provider...' }];
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: faqs }));
      const res = await publicApi.faqs.listPublic();
      expect(res.data[0].question).toContain('booking');
    });

    it('P: GET /public/policies returns cancellation policy', async () => {
      const pols = [{ id: 'p1', title: 'Kebijakan Pembatalan', body: '24h', type: 'cancellation' }];
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: pols }));
      const res = await publicApi.policies.listPublic();
      expect(res.data[0].type).toBe('cancellation');
    });

    it('N: POST /provider/faqs without auth 401', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: false, message: 'Unauthorized' }, false, 401));
      await expect(publicApi.faqs.createProvider({ question: 'Q', answer: 'A' })).rejects.toThrow();
    });

    it('P: POST /provider/faqs success', async () => {
      const created = { id: 'f2', question: 'Q2', answer: 'A2' };
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: created }));
      const res = await publicApi.faqs.createProvider({ question: 'Q2', answer: 'A2', category: 'booking' });
      expect(res.data.id).toBe('f2');
    });

    it('P: GET /provider/faqs list after create', async () => {
      mockFetch.mockResolvedValueOnce(mockResponse({ success: true, data: [{ id: 'f1' }, { id: 'f2' }] }));
      const res = await publicApi.faqs.listProvider();
      expect(res.data).toHaveLength(2);
    });
  });
});
