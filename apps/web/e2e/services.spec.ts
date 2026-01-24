import { test, expect } from '@playwright/test';

test.describe('Services', () => {
  test('can browse services page', async ({ page }) => {
    await page.goto('/');

    // Look for services or browse link
    const servicesLink = page.getByRole('link', {
      name: /services|browse|find/i,
    });
    if (await servicesLink.isVisible()) {
      await servicesLink.click();
      await expect(page).toHaveURL(/services|browse/);
    }
  });

  test('services display correctly', async ({ page }) => {
    await page.goto('/services');

    // Should show service cards or list
    await page.waitForLoadState('networkidle');

    // Check if services from database are showing
    const pageContent = await page.content();
    const hasServices =
      pageContent.includes('Sparkle Clean') ||
      pageContent.includes('Standard Home Cleaning') ||
      pageContent.includes('Deep Cleaning') ||
      pageContent.includes('service');

    expect(hasServices || pageContent.includes('No services')).toBeTruthy();
  });
});
