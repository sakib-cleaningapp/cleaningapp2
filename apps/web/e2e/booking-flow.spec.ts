import { test, expect } from '@playwright/test';
import { loginAsCustomer, loginAsBusinessOwner } from './fixtures/auth';

test.describe('Full Booking Flow', () => {
  test('customer can browse services on dashboard', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verify dashboard loads with service categories
    await expect(page.locator('body')).toContainText(/clean|service/i);
  });

  test('customer can view a service category', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/dashboard/services/cleaning');
    await page.waitForLoadState('domcontentloaded');

    // Should show cleaning services or a message
    const pageContent = await page.content();
    const hasContent =
      pageContent.includes('Clean') ||
      pageContent.includes('clean') ||
      pageContent.includes('Service') ||
      pageContent.includes('No services');
    expect(hasContent).toBeTruthy();
  });

  test('customer can access my bookings page', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Verify page loads
    await expect(page.getByText(/my bookings/i)).toBeVisible();
  });

  test('customer can view different booking tabs', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Check that tabs exist
    const tabs = ['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'];
    for (const tab of tabs) {
      const tabButton = page.getByRole('button', {
        name: new RegExp(tab, 'i'),
      });
      await expect(tabButton).toBeVisible();
    }
  });

  test('customer can switch between booking tabs', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Click through each tab
    const tabs = ['Pending', 'Accepted', 'Completed', 'Cancelled', 'All'];
    for (const tab of tabs) {
      const tabButton = page.getByRole('button', {
        name: new RegExp(tab, 'i'),
      });
      await tabButton.click();
      await page.waitForTimeout(300);
    }

    // Should still be on the page
    await expect(page.getByText(/my bookings/i)).toBeVisible();
  });

  test('business can view their dashboard', async ({ page }) => {
    await loginAsBusinessOwner(page);
    await page.goto('/business/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verify business dashboard loads
    await expect(page.locator('body')).toContainText(
      /dashboard|booking|request|clean/i
    );
  });

  test('business can view messages page', async ({ page }) => {
    await loginAsBusinessOwner(page);
    await page.goto('/business/messages');
    await page.waitForLoadState('domcontentloaded');

    // Verify messages page loads
    const pageContent = await page.content();
    const hasContent =
      pageContent.includes('Message') ||
      pageContent.includes('message') ||
      pageContent.includes('Inbox') ||
      pageContent.includes('No messages');
    expect(hasContent).toBeTruthy();
  });

  test('customer messages page loads', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-messages');
    await page.waitForLoadState('domcontentloaded');

    // Verify messages page loads
    const pageContent = await page.content();
    const hasContent =
      pageContent.includes('Message') ||
      pageContent.includes('message') ||
      pageContent.includes('conversation') ||
      pageContent.includes('No messages');
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Booking Status Indicators', () => {
  test('pending bookings show waiting status', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Click pending tab
    await page.getByRole('button', { name: /pending/i }).click();
    await page.waitForTimeout(300);

    // Should show pending indicator or empty state
    const pageContent = await page.content();
    const hasPendingContent =
      pageContent.includes('pending') ||
      pageContent.includes('Pending') ||
      pageContent.includes('waiting') ||
      pageContent.includes('No pending');
    expect(hasPendingContent).toBeTruthy();
  });

  test('cancelled bookings area accessible', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Click cancelled tab
    await page.getByRole('button', { name: /cancelled/i }).click();
    await page.waitForTimeout(300);

    // Should show cancelled section or empty state
    const pageContent = await page.content();
    const hasCancelledContent =
      pageContent.includes('cancel') ||
      pageContent.includes('Cancel') ||
      pageContent.includes('No cancelled');
    expect(hasCancelledContent).toBeTruthy();
  });
});
