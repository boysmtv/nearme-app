import { test, expect } from '@playwright/test';

test.describe('DEKAT Web Public - Runtime Proof', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('homepage loads with DEKAT branding', async ({ page }) => {
    await expect(page.locator('text=DEKAT').first()).toBeVisible();
    await expect(page.locator('text=Booking Platform')).toBeVisible();
  });

  test('homepage shows categories section', async ({ page }) => {
    // Categories section should be present
    await expect(page.locator('text=Kategori').or(page.locator('text=category'))).toBeVisible();
  });

  test('homepage shows featured providers section', async ({ page }) => {
    // Featured providers section should be present
    await expect(page.locator('text=Featured').or(page.locator('text=Unggulan'))).toBeVisible();
  });

  test('navigation to search page works', async ({ page }) => {
    await page.click('text=Cari Layanan');
    await expect(page).toHaveURL(/.*search/);
  });

  test('navigation to login page works', async ({ page }) => {
    await page.click('text=Masuk');
    await expect(page).toHaveURL(/.*login/);
  });

  test('navigation to register page works', async ({ page }) => {
    await page.click('text=Daftar');
    await expect(page).toHaveURL(/.*register/);
  });

  test('search page renders with filters', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]').or(page.locator('input[name="email"]'))).toBeVisible();
    await expect(page.locator('input[type="password"]').or(page.locator('input[name="password"]'))).toBeVisible();
  });

  test('register page renders form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input').first()).toBeVisible();
  });

  test('provider page shows not found for invalid slug', async ({ page }) => {
    await page.goto('/provider/invalid-slug-12345');
    await expect(page.locator('text=tidak ditemukan').or(page.locator('text=not found'))).toBeVisible();
  });

  test('booking page shows for valid provider ID format', async ({ page }) => {
    await page.goto('/booking/00000000-0000-0000-0000-000000000001');
    // Should render the booking wizard (step 1)
    await expect(page.locator('text=Layanan').or(page.locator('text=Service'))).toBeVisible();
  });

  test('footer renders with copyright', async ({ page }) => {
    const year = new Date().getFullYear().toString();
    await expect(page.locator(`text=${year}`)).toBeVisible();
  });

  test('header has search input on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const searchInputs = page.locator('input[placeholder*="Cari"]');
    await expect(searchInputs.first()).toBeVisible();
  });
});
