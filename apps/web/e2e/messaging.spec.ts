import { test, expect } from '@playwright/test';

const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
};

test.describe('Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Login as business owner (they have access to messages)
    await page.goto('/business/login');
    await page.waitForLoadState('networkidle');
    await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('#email').fill(TEST_BUSINESS.email);
    await page.locator('#password').fill(TEST_BUSINESS.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL(/business|dashboard/, { timeout: 15000 });
  });

  test('business dashboard messages page loads', async ({ page }) => {
    await page.goto('/business/messages');
    await page.waitForLoadState('networkidle');

    // Should show messages inbox or empty state
    const pageContent = await page.content();
    const hasMessagesUI =
      pageContent.includes('message') ||
      pageContent.includes('Message') ||
      pageContent.includes('inbox') ||
      pageContent.includes('Inbox') ||
      pageContent.includes('No messages');

    expect(hasMessagesUI).toBeTruthy();
  });
});
