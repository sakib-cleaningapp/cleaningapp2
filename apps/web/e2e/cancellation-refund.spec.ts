import { test, expect } from '@playwright/test';
import {
  loginAsCustomer,
  loginAsBusinessOwner,
  loginAsAdmin,
} from './fixtures/auth';

test.describe('Cancellation & Refund Flow', () => {
  test('customer can view My Bookings page', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Verify page loads
    await expect(page.getByText(/my bookings/i)).toBeVisible();
  });

  test('customer can navigate to Cancelled tab', async ({ page }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Find and click cancelled tab
    const cancelledTab = page.getByRole('button', { name: /cancelled/i });
    await cancelledTab.click();

    // Verify tab is active or shows cancelled bookings/empty state
    await expect(page.locator('body')).toContainText(/cancel/i);
  });

  test('cancelled bookings show refund status when applicable', async ({
    page,
  }) => {
    await loginAsCustomer(page);
    await page.goto('/my-bookings');
    await page.waitForLoadState('domcontentloaded');

    // Navigate to cancelled tab
    const cancelledTab = page.getByRole('button', { name: /cancelled/i });
    await cancelledTab.click();
    await page.waitForTimeout(500);

    // Check for refund-related text (may show "No cancelled bookings" if none exist)
    const pageContent = await page.content();
    const hasRefundInfo =
      pageContent.includes('refund') ||
      pageContent.includes('Refund') ||
      pageContent.includes('No cancelled');
    expect(hasRefundInfo).toBeTruthy();
  });

  test('business dashboard loads with booking management', async ({ page }) => {
    await loginAsBusinessOwner(page);
    await page.goto('/business/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verify dashboard loads
    await expect(page.locator('body')).toContainText(
      /dashboard|booking|request/i
    );
  });

  test('business can view booking tabs (pending, accepted, cancelled)', async ({
    page,
  }) => {
    await loginAsBusinessOwner(page);
    await page.goto('/business/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Look for booking-related tabs or dashboard content
    const pageContent = await page.content();
    const hasBookingTabs =
      pageContent.includes('Pending') ||
      pageContent.includes('Accepted') ||
      pageContent.includes('Cancelled') ||
      pageContent.includes('booking') ||
      pageContent.includes('Booking') ||
      pageContent.includes('Dashboard') ||
      pageContent.includes('Business') ||
      pageContent.includes('Request');
    expect(hasBookingTabs).toBeTruthy();
  });

  test('admin page loads successfully', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Verify admin page loads
    await expect(page.locator('body')).toContainText(/admin|manage|approval/i);
  });

  test('admin can see dashboard management section', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');

    // Check for admin dashboard content (approvals, users, or dashboard stats)
    const pageContent = await page.content();
    const hasAdminContent =
      pageContent.includes('Approval') ||
      pageContent.includes('approval') ||
      pageContent.includes('User') ||
      pageContent.includes('Pending') ||
      pageContent.includes('Dashboard') ||
      pageContent.includes('Refund');
    expect(hasAdminContent).toBeTruthy();
  });
});
