import { test, expect } from '@playwright/test';

test.describe('DEKAT Web Provider - Runtime Proof', () => {
  test('login page renders correctly', async ({ page }) => {
    await page.goto('http://localhost:4100/login');
    await expect(page.getByRole('link', { name: 'DEKAT' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]').or(page.locator('input[name="email"]'))).toBeVisible();
    await expect(page.locator('input[type="password"]').or(page.locator('input[name="password"]'))).toBeVisible();
  });

  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('http://localhost:4100/provider/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });

  test('login form has email and password fields', async ({ page }) => {
    await page.goto('http://localhost:4100/login');
    const emailInput = page.locator('input[type="email"]').or(page.locator('input[name="email"]'));
    const passwordInput = page.locator('input[type="password"]').or(page.locator('input[name="password"]'));
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('login form has submit button', async ({ page }) => {
    await page.goto('http://localhost:4100/login');
    await expect(page.locator('button[type="submit"]').or(page.locator('button:has-text("Masuk")'))).toBeVisible();
  });
});
