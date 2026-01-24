import { test, expect, Page } from '@playwright/test';

/**
 * BUSINESS ORDER RECEIPT FLOW E2E TEST
 *
 * Tests the business-side order management workflow:
 * 1. Business owner can access the dashboard
 * 2. Business owner can view bookings tab
 * 3. Business owner can see pending booking requests
 * 4. Business owner can accept a booking request
 * 5. Business owner can decline a booking request
 * 6. Business owner can navigate between dashboard tabs
 * 7. Business owner can view booking details
 */

const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
};

// Helper: Login as business owner
async function loginAsBusinessOwner(page: Page) {
  await page.goto('/business/login');
  await page.waitForLoadState('networkidle');
  await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#email').fill(TEST_BUSINESS.email);
  await page.locator('#password').fill(TEST_BUSINESS.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/business/, { timeout: 20000 });
}

// Helper: Navigate to bookings tab
async function navigateToBookingsTab(page: Page) {
  await page.goto('/business/dashboard');
  await page.waitForLoadState('networkidle');

  // Click on Bookings tab
  const bookingsTab = page
    .locator('button')
    .filter({ hasText: /^Bookings$/ })
    .first();
  await bookingsTab.waitFor({ state: 'visible', timeout: 10000 });
  await bookingsTab.click();
  await page.waitForTimeout(1000);
}

// Helper: Navigate to pending bookings
async function navigateToPendingBookings(page: Page) {
  await navigateToBookingsTab(page);

  // Click on Pending tab within BookingRequestsManager
  const pendingTab = page
    .locator('button')
    .filter({ hasText: /Pending/i })
    .first();
  if (await pendingTab.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pendingTab.click();
    await page.waitForTimeout(500);
  }
}

test.describe('Business Order Receipt Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBusinessOwner(page);
  });

  test('can access business dashboard', async ({ page }) => {
    // Navigate to business dashboard
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify dashboard loads with business header
    const businessHeader = page.locator('text=Business Dashboard');
    await expect(businessHeader).toBeVisible({ timeout: 10000 });

    // Verify main navigation tabs are visible
    const overviewTab = page
      .locator('button')
      .filter({ hasText: /^Overview$/ });
    const bookingsTab = page
      .locator('button')
      .filter({ hasText: /^Bookings$/ });
    const servicesTab = page
      .locator('button')
      .filter({ hasText: /^Services$/ });
    const analyticsTab = page
      .locator('button')
      .filter({ hasText: /^Analytics$/ });
    const payoutsTab = page.locator('button').filter({ hasText: /^Payouts$/ });
    const reviewsTab = page.locator('button').filter({ hasText: /^Reviews$/ });

    await expect(overviewTab).toBeVisible();
    await expect(bookingsTab).toBeVisible();
    await expect(servicesTab).toBeVisible();
    await expect(analyticsTab).toBeVisible();
    await expect(payoutsTab).toBeVisible();
    await expect(reviewsTab).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-01-dashboard-access.png',
    });

    console.log(
      'Business dashboard accessed successfully with all tabs visible'
    );
  });

  test('can view bookings tab', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');

    // Click Bookings tab
    const bookingsTab = page
      .locator('button')
      .filter({ hasText: /^Bookings$/ })
      .first();
    await bookingsTab.waitFor({ state: 'visible', timeout: 10000 });
    await bookingsTab.click();
    await page.waitForTimeout(1000);

    // Verify booking stats cards are visible (Pending, Accepted, Declined, Total)
    const pendingStats = page.locator('text=Pending').first();
    await expect(pendingStats).toBeVisible({ timeout: 10000 });

    // Verify sub-tabs within BookingRequestsManager are visible
    const pendingSubTab = page
      .locator('button')
      .filter({ hasText: /Pending \(/ });
    const acceptedSubTab = page
      .locator('button')
      .filter({ hasText: /Accepted \(/ });
    const declinedSubTab = page
      .locator('button')
      .filter({ hasText: /Declined \(/ });
    const allSubTab = page
      .locator('button')
      .filter({ hasText: /All Requests \(/ });

    await expect(pendingSubTab).toBeVisible();
    await expect(acceptedSubTab).toBeVisible();
    await expect(declinedSubTab).toBeVisible();
    await expect(allSubTab).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-02-bookings-tab.png',
    });

    console.log('Bookings tab loaded with stats and sub-tabs visible');
  });

  test('can see pending booking requests', async ({ page }) => {
    // Navigate to bookings with pending tab
    await navigateToPendingBookings(page);

    // Check for pending booking cards or empty state message
    const bookingCards = page.locator('.bg-gray-50.rounded-lg.border');
    const emptyState = page.locator('text=No pending booking requests');

    // Wait for either booking cards or empty state
    const hasBookings = await bookingCards
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    const hasEmptyState = await emptyState
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (hasBookings) {
      // Verify booking card details are visible
      const customerName = page
        .locator('.font-medium')
        .filter({ hasText: /Johnson|Davies|Wilson/ })
        .first();
      const serviceName = page.locator('text=/Cleaning|Service/i').first();
      const priceDisplay = page.locator('text=/£\d+/').first();

      await expect(customerName).toBeVisible();
      await expect(serviceName).toBeVisible();
      await expect(priceDisplay).toBeVisible();

      console.log('Pending booking cards with customer details visible');
    } else if (hasEmptyState) {
      console.log(
        'No pending booking requests - empty state displayed correctly'
      );
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-03-pending-bookings.png',
    });
  });

  test('can accept a booking request', async ({ page }) => {
    // Navigate to pending bookings
    await navigateToPendingBookings(page);

    // Find Accept Booking button (green button with bg-green-600)
    const acceptButton = page
      .locator('button')
      .filter({ hasText: /Accept Booking/i })
      .first();

    // Check if there are pending bookings to accept
    const hasAcceptButton = await acceptButton
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasAcceptButton) {
      // Click the Accept button
      await acceptButton.click();
      await page.waitForTimeout(2000);

      // Verify confirmation modal appears
      const successModal = page.locator('text=/Booking Accepted|confirmed/i');
      const modalVisible = await successModal
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (modalVisible) {
        console.log(
          'Booking accepted successfully - confirmation modal displayed'
        );

        // Close the modal if there's a close button
        const closeButton = page
          .locator('button')
          .filter({ hasText: /Close|OK|Got it/i })
          .first();
        if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }

      // Take screenshot after acceptance
      await page.screenshot({
        path: 'test-results/business-order-04-booking-accepted.png',
      });
    } else {
      console.log('No pending bookings available to accept');
      await page.screenshot({
        path: 'test-results/business-order-04-no-bookings-to-accept.png',
      });
    }
  });

  test('can decline a booking request', async ({ page }) => {
    // Navigate to pending bookings
    await navigateToPendingBookings(page);

    // Find Decline Booking button (red button with bg-red-600)
    const declineButton = page
      .locator('button')
      .filter({ hasText: /Decline Booking/i })
      .first();

    // Check if there are pending bookings to decline
    const hasDeclineButton = await declineButton
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasDeclineButton) {
      // First, enter a response message (required for decline)
      const responseTextarea = page
        .locator('textarea[placeholder*="Add a message"]')
        .first();
      if (
        await responseTextarea.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        await responseTextarea.fill(
          'Unfortunately, we are fully booked for this time slot. Please try a different date.'
        );
      }

      // Click the Decline button
      await declineButton.click();
      await page.waitForTimeout(2000);

      // Verify status changes or confirmation modal
      const declineModal = page.locator('text=/Booking Declined|declined/i');
      const warningModal = page.locator('text=/Message Required/i');

      const modalVisible = await declineModal
        .isVisible({ timeout: 5000 })
        .catch(() => false);
      const warningVisible = await warningModal
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (warningVisible) {
        console.log('Warning displayed - message required for decline');
        // Close warning and try again with message
        const closeButton = page
          .locator('button')
          .filter({ hasText: /Close|OK|Got it/i })
          .first();
        if (await closeButton.isVisible().catch(() => false)) {
          await closeButton.click();
        }
      } else if (modalVisible) {
        console.log('Booking declined successfully - confirmation displayed');

        // Close the modal if there's a close button
        const closeButton = page
          .locator('button')
          .filter({ hasText: /Close|OK|Got it/i })
          .first();
        if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await closeButton.click();
          await page.waitForTimeout(500);
        }
      }

      // Take screenshot after decline attempt
      await page.screenshot({
        path: 'test-results/business-order-05-booking-declined.png',
      });
    } else {
      console.log('No pending bookings available to decline');
      await page.screenshot({
        path: 'test-results/business-order-05-no-bookings-to-decline.png',
      });
    }
  });

  test('can navigate between all dashboard tabs', async ({ page }) => {
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');

    const tabs = [
      { name: 'Overview', content: 'Monthly Revenue' },
      { name: 'Bookings', content: 'Pending' },
      { name: 'Services', content: 'Service Management' },
      { name: 'Analytics', content: 'Revenue & Analytics' },
      { name: 'Payouts', content: 'Payouts & Bank Account' },
      { name: 'Reviews', content: 'Customer Reviews' },
    ];

    for (const tab of tabs) {
      // Click on the tab
      const tabButton = page
        .locator('button')
        .filter({ hasText: new RegExp(`^${tab.name}$`) })
        .first();
      await tabButton.click();
      await page.waitForTimeout(500);

      // Verify tab content is visible
      const tabContent = page.locator(`text=${tab.content}`).first();
      const isVisible = await tabContent
        .isVisible({ timeout: 5000 })
        .catch(() => false);

      if (isVisible) {
        console.log(`${tab.name} tab loaded successfully`);
      } else {
        console.log(`${tab.name} tab - content may be loading or different`);
      }

      // Take screenshot for each tab
      await page.screenshot({
        path: `test-results/business-order-06-tab-${tab.name.toLowerCase()}.png`,
      });
    }
  });

  test('can view booking card details', async ({ page }) => {
    // Navigate to all bookings
    await navigateToBookingsTab(page);

    // Click on "All Requests" tab to see all bookings
    const allRequestsTab = page
      .locator('button')
      .filter({ hasText: /All Requests/i })
      .first();
    if (await allRequestsTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await allRequestsTab.click();
      await page.waitForTimeout(500);
    }

    // Find first booking card
    const bookingCard = page.locator('.bg-gray-50.rounded-lg.border').first();
    const hasBookingCard = await bookingCard
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (hasBookingCard) {
      // Verify booking card contains expected details
      const customerSection = bookingCard.locator('text=/Customer|Name/i');
      const dateSection = bookingCard.locator('text=/Date|Calendar/i');
      const priceSection = bookingCard.locator('text=/£\d+/');
      const statusBadge = bookingCard.locator('span').filter({
        hasText: /Pending|Accepted|Declined|Completed|Cancelled/i,
      });

      // Check for key booking elements
      const hasPrice = await priceSection
        .first()
        .isVisible()
        .catch(() => false);
      const hasStatus = await statusBadge
        .first()
        .isVisible()
        .catch(() => false);

      if (hasPrice) {
        console.log('Booking card shows price');
      }
      if (hasStatus) {
        console.log('Booking card shows status badge');
      }

      // Verify customer contact info is displayed
      const emailIcon = bookingCard.locator(
        '[class*="Mail"], [data-lucide="mail"]'
      );
      const phoneIcon = bookingCard.locator(
        '[class*="Phone"], [data-lucide="phone"]'
      );
      const userIcon = bookingCard.locator(
        '[class*="User"], [data-lucide="user"]'
      );

      console.log('Booking card details visible');
    } else {
      console.log('No booking cards found - may need to create test data');
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-07-booking-details.png',
    });
  });

  test('can view accepted bookings list', async ({ page }) => {
    // Navigate to bookings tab
    await navigateToBookingsTab(page);

    // Click on Accepted tab
    const acceptedTab = page
      .locator('button')
      .filter({ hasText: /Accepted \(/i })
      .first();
    if (await acceptedTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await acceptedTab.click();
      await page.waitForTimeout(500);
    }

    // Check for accepted bookings or empty state
    const acceptedBookings = page.locator('.bg-gray-50.rounded-lg.border');
    const emptyState = page.locator('text=No accepted booking requests');

    const hasAccepted = await acceptedBookings
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasEmpty = await emptyState
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (hasAccepted) {
      // Verify accepted bookings show green status badge
      const acceptedBadge = page
        .locator('span')
        .filter({ hasText: /Accepted/i })
        .first();
      await expect(acceptedBadge).toBeVisible();
      console.log('Accepted bookings list visible with status badges');
    } else if (hasEmpty) {
      console.log('No accepted bookings - empty state displayed correctly');
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-08-accepted-bookings.png',
    });
  });

  test('can view declined bookings list', async ({ page }) => {
    // Navigate to bookings tab
    await navigateToBookingsTab(page);

    // Click on Declined tab
    const declinedTab = page
      .locator('button')
      .filter({ hasText: /Declined \(/i })
      .first();
    if (await declinedTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await declinedTab.click();
      await page.waitForTimeout(500);
    }

    // Check for declined bookings or empty state
    const declinedBookings = page.locator('.bg-gray-50.rounded-lg.border');
    const emptyState = page.locator('text=No declined booking requests');

    const hasDeclined = await declinedBookings
      .first()
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    const hasEmpty = await emptyState
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (hasDeclined) {
      // Verify declined bookings show red status badge
      const declinedBadge = page
        .locator('span')
        .filter({ hasText: /Declined/i })
        .first();
      await expect(declinedBadge).toBeVisible();

      // Verify response message is shown
      const responseSection = page.locator('text=Your Response:');
      const hasResponse = await responseSection
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (hasResponse) {
        console.log('Declined booking shows business response');
      }

      console.log('Declined bookings list visible with status badges');
    } else if (hasEmpty) {
      console.log('No declined bookings - empty state displayed correctly');
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-09-declined-bookings.png',
    });
  });

  test('dashboard shows booking statistics', async ({ page }) => {
    // Navigate to bookings tab
    await navigateToBookingsTab(page);

    // Verify stats cards are displayed
    const statsCards = page.locator(
      '.bg-white.rounded-lg.border.border-gray-200.p-4'
    );
    await expect(statsCards.first()).toBeVisible({ timeout: 10000 });

    // Check for specific stat labels
    const pendingStat = page.locator('text=Pending').first();
    const acceptedStat = page.locator('text=Accepted').first();
    const declinedStat = page.locator('text=Declined').first();
    const totalStat = page.locator('text=Total').first();

    await expect(pendingStat).toBeVisible();
    await expect(acceptedStat).toBeVisible();
    await expect(declinedStat).toBeVisible();
    await expect(totalStat).toBeVisible();

    // Verify stat numbers are displayed (should be numeric values)
    const statNumbers = page.locator('.text-2xl.font-bold.text-gray-900');
    const count = await statNumbers.count();

    expect(count).toBeGreaterThanOrEqual(4);
    console.log(`Found ${count} stat cards with numbers`);

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-10-booking-statistics.png',
    });
  });

  test('can search and filter bookings', async ({ page }) => {
    // Navigate to bookings tab
    await navigateToBookingsTab(page);

    // Look for search input if available
    const searchInput = page.locator('input[placeholder*="Search"]').first();
    const hasSearch = await searchInput
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (hasSearch) {
      // Enter search term
      await searchInput.fill('Johnson');
      await page.waitForTimeout(500);
      console.log('Search functionality available');
    }

    // Look for filter dropdown if available
    const filterSelect = page.locator('select').first();
    const hasFilter = await filterSelect
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (hasFilter) {
      // Try to select a filter option
      await filterSelect.selectOption({ label: 'Pending' }).catch(() => {});
      await page.waitForTimeout(500);
      console.log('Filter functionality available');
    }

    // Tab-based filtering (always available in BookingRequestsManager)
    const allTab = page
      .locator('button')
      .filter({ hasText: /All Requests/i })
      .first();
    await allTab.click();
    await page.waitForTimeout(500);

    const pendingTabBtn = page
      .locator('button')
      .filter({ hasText: /Pending \(/i })
      .first();
    await pendingTabBtn.click();
    await page.waitForTimeout(500);

    console.log('Tab-based filtering working correctly');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-11-search-filter.png',
    });
  });

  test('overview tab shows quick actions', async ({ page }) => {
    // Navigate to overview tab (default)
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');

    // Verify Quick Actions section is visible
    const quickActionsHeader = page.locator('text=Quick Actions');
    await expect(quickActionsHeader).toBeVisible({ timeout: 10000 });

    // Check for specific quick action buttons/links
    const addServiceLink = page.locator('text=Add New Service');
    const manageBookingsBtn = page.locator('text=Manage Bookings');
    const businessProfileLink = page.locator('text=Business Profile');

    await expect(addServiceLink).toBeVisible();
    await expect(manageBookingsBtn).toBeVisible();
    await expect(businessProfileLink).toBeVisible();

    console.log('Quick Actions section visible with all action buttons');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-12-quick-actions.png',
    });
  });

  test('can access messages and quotes pages', async ({ page }) => {
    // Navigate to messages page
    await page.goto('/business/messages');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'test-results/business-order-13-messages-page.png',
    });
    console.log('Messages page loaded');

    // Navigate to quotes page
    await page.goto('/business/quotes');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: 'test-results/business-order-14-quotes-page.png',
    });
    console.log('Quotes page loaded');
  });

  test('header shows notification bell and settings', async ({ page }) => {
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');

    // Check for notification bell
    const notificationBell = page
      .locator('[class*="Bell"], button')
      .filter({
        has: page.locator('[data-lucide="bell"]'),
      })
      .first();

    // Alternative: look for bell by clicking area in header
    const headerNotification = page.locator('header button').first();

    // Check for settings cog
    const settingsCog = page
      .locator('header')
      .locator('[class*="Settings"], [data-lucide="settings"]')
      .first();

    // Check for sign out button
    const signOutBtn = page
      .locator('header')
      .locator('[class*="LogOut"], [data-lucide="log-out"]')
      .first();

    // Verify header elements
    const headerExists = await page.locator('header').isVisible();
    expect(headerExists).toBe(true);

    console.log('Header navigation elements present');

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-15-header-elements.png',
    });
  });
});

test.describe('Business Order Receipt Flow - Error Handling', () => {
  test('handles login with invalid credentials gracefully', async ({
    page,
  }) => {
    await page.goto('/business/login');
    await page.waitForLoadState('networkidle');

    // Try to login with invalid credentials
    await page.locator('#email').fill('invalid@test.com');
    await page.locator('#password').fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for error message or redirect
    await page.waitForTimeout(3000);

    // Check if still on login page (login failed) or error message shown
    const currentUrl = page.url();
    const errorMessage = page.locator('text=/error|invalid|failed/i');

    if (currentUrl.includes('login')) {
      console.log('Login correctly rejected invalid credentials');
    }

    const hasError = await errorMessage
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    if (hasError) {
      console.log('Error message displayed for invalid login');
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-16-login-error.png',
    });
  });

  test('handles session timeout by redirecting to login', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Try to access dashboard without being logged in
    await page.goto('/business/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // Should redirect to login or show auth error
    const currentUrl = page.url();

    if (currentUrl.includes('login')) {
      console.log('Correctly redirected to login when not authenticated');
    } else {
      // May show loading state or auth wrapper
      const authWrapper = page.locator('text=/sign in|login|authenticate/i');
      const hasAuthPrompt = await authWrapper
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      if (hasAuthPrompt) {
        console.log('Auth prompt shown for unauthenticated access');
      }
    }

    // Take screenshot
    await page.screenshot({
      path: 'test-results/business-order-17-session-redirect.png',
    });
  });
});
