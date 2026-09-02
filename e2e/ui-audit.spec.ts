import { test } from '@playwright/test';

const pages = [
  { name: 'home', url: '/' },
  { name: 'login', url: '/login' },
  { name: 'register', url: '/register' },
  { name: 'search', url: '/search' },
  { name: 'provider-register', url: '/provider/register' },
  { name: 'about', url: '/about' },
  { name: 'booking', url: '/booking/10000000-0000-0000-0000-000000000001' },
];

const providerPages = [
  { name: 'provider-dashboard', url: '/provider/dashboard' },
  { name: 'provider-services', url: '/provider/services' },
  { name: 'provider-staff', url: '/provider/staff' },
  { name: 'provider-reviews', url: '/provider/reviews' },
  { name: 'provider-promotions', url: '/provider/promotions' },
  { name: 'provider-notifications', url: '/provider/notifications' },
];

const customerPages = [
  { name: 'customer-bookings', url: '/customer/bookings' },
  { name: 'customer-notifications', url: '/customer/notifications' },
  { name: 'customer-favorites', url: '/customer/favorites' },
  { name: 'customer-account', url: '/customer/account' },
  { name: 'support', url: '/support' },
];

test.describe('UI Audit - Public Pages', () => {
  for (const p of pages) {
    test(`screenshot: ${p.name}`, async ({ page }) => {
      await page.goto(`http://localhost:4100${p.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: `test-results/ui-audit/${p.name}.png`, fullPage: true });
    });
  }
});

test.describe('UI Audit - Provider Pages (authed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4100/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'budi@barbershopcentral.id');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Masuk")');
    await page.waitForTimeout(2000);
  });

  for (const p of providerPages) {
    test(`screenshot: ${p.name}`, async ({ page }) => {
      await page.goto(`http://localhost:4100${p.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: `test-results/ui-audit/${p.name}.png`, fullPage: true });
    });
  }
});

test.describe('UI Audit - Customer Pages (authed)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4100/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"], input[name="email"]', 'siti@gmail.com');
    await page.fill('input[type="password"], input[name="password"]', 'admin123');
    await page.click('button[type="submit"], button:has-text("Masuk")');
    await page.waitForTimeout(2000);
  });

  for (const p of customerPages) {
    test(`screenshot: ${p.name}`, async ({ page }) => {
      await page.goto(`http://localhost:4100${p.url}`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: `test-results/ui-audit/${p.name}.png`, fullPage: true });
    });
  }
});
