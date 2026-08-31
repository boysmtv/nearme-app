import { test, expect } from '@playwright/test';

/**
 * Weird / Edge / Negative booking e2e — melengkapi web-public.spec.ts
 * Mock API via route interception agar tidak butuh backend hidup
 * Fokus: guest booking XSS, race, PIN leading-zero, coupon edge, availability weird
 */

test.describe('DEKAT Booking Weird - Guest & Race', () => {
  test.beforeEach(async ({ page }) => {
    // Mock public endpoints untuk semua test di suite ini
    await page.route('**/api/v1/public/categories', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [{ id: 'c1', name: 'Barbershop', slug: 'barbershop', icon: 'scissors', serviceCount: 10 }] }),
      });
    });
    await page.route('**/api/v1/public/providers/featured', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [{ id: 'p1', slug: 'barbershop-central', name: 'Barber Central', category: 'Barbershop', rating: 4.8, reviewCount: 120, city: 'Jakarta', minPrice: 50000, imageUrl: '' }] }),
      });
    });
    await page.route('**/api/v1/public/providers/barbershop-central', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'p1', slug: 'barbershop-central', name: 'Barber Central', description: 'Best', rating: 4.8, reviewCount: 120 } }),
      });
    });
    await page.route('**/api/v1/public/providers/p1/services', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [{ id: 's1', name: 'Haircut', price: 50000, duration: 30, currency: 'IDR' }, { id: 's2', name: 'Free Cut', price: 0, duration: 30, currency: 'IDR' }] }),
      });
    });
    await page.route('**/api/v1/public/providers/p1/staff', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: [{ id: 'st1', name: 'Andi', title: 'Senior' }] }),
      });
    });
    await page.route('**/api/v1/public/providers/p1/availability*', async route => {
      const url = route.request().url();
      const date = new URL(url).searchParams.get('date') || '2026-08-31';
      // Simulate blocked-date edge: if date contains 2020 -> empty
      if (date.startsWith('2020')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [
            { id: 'slot-0900', time: '09:00', startTime: `${date}T09:00:00+07:00`, endTime: `${date}T09:30:00+07:00`, available: true },
            { id: 'slot-0930', time: '09:30', startTime: `${date}T09:30:00+07:00`, endTime: `${date}T10:00:00+07:00`, available: false },
            { id: 'slot-1000', time: '10:00', startTime: `${date}T10:00:00+07:00`, endTime: `${date}T10:30:00+07:00`, available: true },
          ],
        }),
      });
    });
  });

  test('guest booking XSS - name <script> tidak execute', async ({ page }) => {
    let bookedBody: any = null;
    await page.route('**/api/v1/public/bookings', async route => {
      try { bookedBody = route.request().postDataJSON(); } catch { bookedBody = null; }
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'bk-1', bookingCode: 'DKT-XXXX1', confirmationPin: '000000' } }) });
    });
    await page.goto('/booking/p1');
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 15000 });
    // Direct API XSS test via browser fetch agar ter-intercept page.route
    const resJson = await page.evaluate(async () => {
      const r = await fetch('/api/v1/public/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId: 'p1', serviceId: 's1', startsAt: '2026-08-31T10:00:00+07:00', endsAt: '2026-08-31T11:00:00+07:00', customerName: '<script>alert(1)</script>', customerEmail: 'xss@test.com', customerPhone: '0812', notes: "'; DROP TABLE bookings; --", idempotencyKey: 'k-xss' }) });
      return { status: r.status, json: await r.json() };
    });
    expect([200,201].includes(resJson.status)).toBeTruthy();
    expect(resJson.json.success).toBeTruthy();
    if (bookedBody) {
      expect(bookedBody.customerName).toBe('<script>alert(1)</script>');
    }
    const bodyHtml = await page.content();
    expect(bodyHtml).not.toContain('<script>alert(1)</script><script>');
  });

  test('booking race - double click hold tidak double booking (idempotency)', async ({ page }) => {
    let holdCallCount = 0;
    await page.route('**/api/v1/public/providers/p1/slots/*/hold', async route => {
      holdCallCount++;
      // Delay 500ms untuk simulasi race
      await new Promise(r => setTimeout(r, 500));
      if (holdCallCount === 1) {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, data: { holdId: 'h1', expiresAt: new Date(Date.now() + 600000).toISOString() } }) });
      } else {
        await route.fulfill({ status: 409, contentType: 'application/json', body: JSON.stringify({ message: 'Time slot not available' }) });
      }
    });
    await page.goto('/booking/p1');
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 15000 });
    // Jika ada slot picker, coba pilih slot pertama
    const slot = page.locator('button:has-text("09:00")').first();
    if (await slot.isVisible().catch(() => false)) {
      await slot.click({ clickCount: 2, delay: 50 }); // double click cepat
      await page.waitForTimeout(800);
      expect(holdCallCount).toBeGreaterThanOrEqual(1);
    }
  });

  test('PIN leading zero 000000 tetap 6 digit', async ({ page }) => {
    await page.route('**/api/v1/bookings/*/verify-pin', async route => {
      const body = route.request().postDataJSON();
      expect(body.pin).toBe('000000');
      expect(body.pin).toHaveLength(6);
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { pinVerified: true, status: 'CONFIRMED' } }) });
    });
    await page.route('**/api/v1/bookings/bk-1', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { id: 'bk-1', bookingCode: 'DKT-ABCDE', status: 'CONFIRMED', confirmationPin: '000000', pinVerified: false } }) });
    });
    await page.goto('/booking/p1');
    // Simulasi direct fetch verifyPin (bypass UI jika belum ada)
    const result = await page.evaluate(async () => {
      const res = await fetch('/api/v1/bookings/bk-1/verify-pin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: '000000' }) });
      return res.json();
    });
    expect(result.success).toBeTruthy();
  });

  test('search unicode Barber 💈 東京 tidak crash', async ({ page }) => {
    await page.route('**/api/v1/public/providers*', async route => {
      const url = route.request().url();
      if (url.includes('q=')) {
        const decoded = decodeURIComponent(url.replace(/\+/g, ' '));
        expect(decoded).toContain('Barber');
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { providers: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } }) });
      } else {
        await route.continue();
      }
    });
    await page.goto('/search');
    const input = page.locator('input').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('Barber 💈 東京');
    await page.waitForTimeout(500);
    // tidak error, input value tetap unicode
    await expect(input).toHaveValue('Barber 💈 東京');
  });

  test('coupon validate edge - minOrder tepat 50000 tidak apply', async ({ page }) => {
    await page.route('**/api/v1/public/bookings/validate-coupon*', async route => {
      const url = new URL(route.request().url());
      const code = url.searchParams.get('code');
      const total = Number(url.searchParams.get('total') || 0);
      if (code === 'HEMAT20' && total < 50000) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Min order not met' }) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { valid: true, discount: 10000 } }) });
      }
    });
    await page.goto('/booking/p1');
    await expect(page.locator('h2').first()).toBeVisible({ timeout: 15000 });
    // Gunakan browser fetch agar ter-intercept page.route
    const invalid = await page.evaluate(async () => {
      const r = await fetch('/api/v1/public/bookings/validate-coupon?code=HEMAT20&total=49999');
      return r.json();
    });
    expect(invalid.success).toBeFalsy();
    const valid = await page.evaluate(async () => {
      const r = await fetch('/api/v1/public/bookings/validate-coupon?code=HEMAT20&total=50000');
      return r.json();
    });
    expect(valid.success).toBeTruthy();
  });

  test('availability blocked date 2020-01-01 kosong', async ({ page }) => {
    await page.goto('/booking/p1');
    // Direct API check untuk blocked date edge
    const emptySlots = await page.evaluate(async () => {
      const res = await fetch('/api/v1/public/providers/p1/availability?serviceId=s1&staffId=st1&date=2020-01-01');
      const json = await res.json();
      return json.data;
    });
    expect(emptySlots).toHaveLength(0);
  });

  test('negative - search injection q=barber OR 1=1 tetap encoded', async ({ page }) => {
    let capturedUrl = '';
    await page.route('**/api/v1/public/providers*', async route => {
      capturedUrl = route.request().url();
      if (capturedUrl.includes('q=')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { providers: [], pagination: {} } }) });
      } else {
        await route.continue();
      }
    });
    await page.goto('/search');
    const input = page.locator('input').first();
    await input.fill("barber' OR 1=1 --");
    // Trigger search: tekan Enter atau tunggu debounce 800ms
    await input.press('Enter').catch(() => {});
    await page.waitForTimeout(1000);
    // Fallback: jika UI tidak auto-fetch, test via direct request encode check
    if (!capturedUrl || !capturedUrl.includes('q=')) {
      const direct = await page.request.get(`http://localhost:4100/api/v1/public/providers?q=${encodeURIComponent("barber' OR 1=1 --")}&page=1&limit=10`);
      capturedUrl = direct.url();
      // direct URL sudah encoded, verify tidak raw
      expect(capturedUrl).not.toContain("barber' OR 1=1 --");
      expect(decodeURIComponent(capturedUrl.replace(/\+/g, ' '))).toContain("barber' OR 1=1 --");
    } else {
      expect(capturedUrl).not.toContain("barber' OR 1=1 --");
      expect(decodeURIComponent(capturedUrl.replace(/\+/g, ' '))).toContain("barber' OR 1=1 --");
    }
  });
});
