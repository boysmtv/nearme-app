import { test, expect } from '@playwright/test';

test.describe('DEKAT Web Public - Runtime Proof', () => {
  test('homepage loads with DEKAT branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=DEKAT').first()).toBeVisible({ timeout: 10000 });
  });

  test('homepage shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('navigation to search page works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Cari Layanan');
    await expect(page).toHaveURL(/.*search/);
  });

  test('navigation to login page works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Masuk');
    await expect(page).toHaveURL(/.*login/);
  });

  test('navigation to register page works', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Daftar');
    await expect(page).toHaveURL(/.*register/);
  });

  test('search page renders with input', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });

  test('login page renders form fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10000 });
  });

  test('register page renders form fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 10000 });
  });

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    await expect(page.locator('text=404')).toBeVisible({ timeout: 10000 });
  });

  test('booking page renders for valid provider ID', async ({ page }) => {
    await page.goto('/booking/00000000-0000-0000-0000-000000000001');
    await expect(page.locator('h2')).toBeVisible({ timeout: 15000 });
  });

  test('footer renders with copyright', async ({ page }) => {
    await page.goto('/');
    const year = new Date().getFullYear().toString();
    await expect(page.locator(`text=${year}`)).toBeVisible({ timeout: 10000 });
  });

  test('header has logo link', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a:has-text("DEKAT")').first()).toBeVisible({ timeout: 10000 });
  });
});
