import { test, expect } from '@playwright/test';

const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
};

test.describe('Quotes', () => {
  test.beforeEach(async ({ page }) => {
    // Login as business owner
    await page.goto('/business/login');
    await page.waitForLoadState('networkidle');
    await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('#email').fill(TEST_BUSINESS.email);
    await page.locator('#password').fill(TEST_BUSINESS.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/business|dashboard/, { timeout: 15000 });
  });

  test('business quotes page loads', async ({ page }) => {
    await page.goto('/business/quotes');
    await page.waitForLoadState('networkidle');

    // Should show quotes page or empty state
    const pageContent = await page.content();
    const hasQuotesUI =
      pageContent.includes('quote') ||
      pageContent.includes('Quote') ||
      pageContent.includes('request') ||
      pageContent.includes('Request') ||
      pageContent.includes('No quotes');

    expect(hasQuotesUI).toBeTruthy();
  });

  test('business dashboard loads', async ({ page }) => {
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');

    // Should show dashboard
    const pageContent = await page.content();
    const hasDashboard =
      pageContent.includes('Dashboard') ||
      pageContent.includes('dashboard') ||
      pageContent.includes('Welcome') ||
      pageContent.includes('Business');

    expect(hasDashboard).toBeTruthy();
  });
});
