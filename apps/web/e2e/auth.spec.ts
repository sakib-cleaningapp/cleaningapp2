import { test, expect } from '@playwright/test';

const TEST_CUSTOMER = {
  email: 'customer@test.cleanly.com',
  password: 'TestPass123!',
};

const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
};

test.describe('Authentication', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Cleanly/i);
  });

  test('login selector page loads with options', async ({ page }) => {
    await page.goto('/login');

    // Should show customer and business login options
    await expect(page.getByText('For Customers')).toBeVisible();
    await expect(page.getByText('For Partners')).toBeVisible();
  });

  test('customer login page has form', async ({ page }) => {
    await page.goto('/login/customer');

    // Wait for loading to complete
    await page.waitForLoadState('networkidle');

    // Should show customer login heading and form elements
    await expect(page.getByText('Customer Login')).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('customer can login', async ({ page }) => {
    await page.goto('/login/customer');
    await page.waitForLoadState('networkidle');

    // Wait for form to be visible
    await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });

    // Fill login form
    await page.locator('#email').fill(TEST_CUSTOMER.email);
    await page.locator('#password').fill(TEST_CUSTOMER.password);

    // Submit
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for either redirect or error message
    await Promise.race([
      expect(page).toHaveURL(/dashboard/, { timeout: 20000 }),
      page
        .waitForSelector('[class*="error"], [class*="alert"]', {
          timeout: 20000,
        })
        .then(async (el) => {
          const text = await el.textContent();
          throw new Error(`Login failed with message: ${text}`);
        }),
    ]);
  });

  test('business owner can login', async ({ page }) => {
    await page.goto('/business/login');
    await page.waitForLoadState('networkidle');

    // Wait for form
    await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('#email').fill(TEST_BUSINESS.email);
    await page.locator('#password').fill(TEST_BUSINESS.password);

    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to business dashboard
    await expect(page).toHaveURL(/business|dashboard/, { timeout: 15000 });
  });
});
