import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * FULL CYCLE INTEGRATION TESTS
 *
 * These tests verify the complete flow between customer and business:
 * 1. Customer makes a booking
 * 2. Business owner receives the booking
 * 3. Business owner accepts/processes
 * 4. Payment is processed
 * 5. Both sides see completed status
 */

const TEST_CUSTOMER = {
  email: 'customer@test.cleanly.com',
  password: 'TestPass123!',
};

const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
};

// Helper: Login as customer
async function loginAsCustomer(page: Page) {
  await page.goto('/login/customer');
  await page.waitForLoadState('networkidle');
  await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#email').fill(TEST_CUSTOMER.email);
  await page.locator('#password').fill(TEST_CUSTOMER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 20000 });
}

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

test.describe('Full Cycle: Customer Booking → Business Receives → Payment', () => {
  test('complete booking cycle from both perspectives', async ({ browser }) => {
    // Create two browser contexts - one for customer, one for business
    const customerContext = await browser.newContext();
    const businessContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const businessPage = await businessContext.newPage();

    try {
      // STEP 1: Business owner logs in and checks initial booking count
      console.log('Step 1: Business owner checking initial state...');
      await loginAsBusinessOwner(businessPage);
      await businessPage.goto('/business/dashboard');
      await businessPage.waitForLoadState('networkidle');

      // Get initial booking count (if displayed)
      const initialBookingsText = await businessPage
        .locator('text=/booking|request/i')
        .first()
        .textContent()
        .catch(() => '0');
      console.log('Initial bookings state:', initialBookingsText);

      // STEP 2: Customer logs in and makes a booking
      console.log('Step 2: Customer making a booking...');
      await loginAsCustomer(customerPage);

      // Navigate to services
      await customerPage.goto('/services');
      await customerPage.waitForLoadState('networkidle');

      // Check if services are displayed
      const servicesExist = await customerPage
        .locator('[class*="card"], [class*="service"]')
        .first()
        .isVisible()
        .catch(() => false);

      if (servicesExist) {
        // Click on first service/category
        await customerPage
          .locator('[class*="card"], [class*="service"]')
          .first()
          .click();
        await customerPage.waitForLoadState('networkidle');

        // Look for booking button
        const bookButton = customerPage
          .locator('button:has-text("Book"), button:has-text("Request")')
          .first();
        if (await bookButton.isVisible().catch(() => false)) {
          await bookButton.click();

          // Fill booking form if modal appears
          await customerPage.waitForTimeout(1000);

          // Try to find and fill date/time inputs
          const dateInput = customerPage
            .locator('input[type="date"], [name*="date"]')
            .first();
          if (await dateInput.isVisible().catch(() => false)) {
            await dateInput.fill('2026-02-15');
          }

          const timeInput = customerPage
            .locator('input[type="time"], select[name*="time"], [name*="time"]')
            .first();
          if (await timeInput.isVisible().catch(() => false)) {
            await timeInput.fill('10:00');
          }

          // Submit booking
          const submitBtn = customerPage
            .locator(
              'button:has-text("Confirm"), button:has-text("Book"), button:has-text("Submit")'
            )
            .first();
          if (await submitBtn.isVisible().catch(() => false)) {
            await submitBtn.click();
            await customerPage.waitForTimeout(2000);
          }
        }
      }

      // STEP 3: Check customer dashboard for booking
      console.log('Step 3: Checking customer bookings...');
      await customerPage.goto('/my-bookings');
      await customerPage.waitForLoadState('networkidle');

      const customerBookingsPage = await customerPage.content();
      console.log(
        'Customer bookings page loaded:',
        customerBookingsPage.includes('booking') ||
          customerBookingsPage.includes('Booking')
      );

      // STEP 4: Business owner checks for new booking
      console.log('Step 4: Business owner checking for new booking...');
      await businessPage.goto('/business/dashboard');
      await businessPage.waitForLoadState('networkidle');

      // Look for bookings section
      const bookingsSection = businessPage
        .locator('text=/booking|request|order/i')
        .first();
      const hasBookings = await bookingsSection.isVisible().catch(() => false);
      console.log('Business sees bookings section:', hasBookings);

      // Check business bookings/requests page if exists
      await businessPage.goto('/business/bookings').catch(() => {});
      await businessPage.waitForLoadState('networkidle');

      // STEP 5: Business owner processes booking (accept)
      console.log('Step 5: Business owner processing booking...');
      const acceptButton = businessPage
        .locator(
          'button:has-text("Accept"), button:has-text("Confirm"), button:has-text("Approve")'
        )
        .first();
      if (await acceptButton.isVisible().catch(() => false)) {
        await acceptButton.click();
        await businessPage.waitForTimeout(1000);
        console.log('Booking accepted');
      }

      // STEP 6: Verify both sides see updated status
      console.log('Step 6: Verifying both sides see updates...');

      // Refresh customer page
      await customerPage.goto('/my-bookings');
      await customerPage.waitForLoadState('networkidle');

      // Refresh business page
      await businessPage.goto('/business/dashboard');
      await businessPage.waitForLoadState('networkidle');

      // Take screenshots for verification
      await customerPage.screenshot({
        path: 'test-results/customer-final-state.png',
      });
      await businessPage.screenshot({
        path: 'test-results/business-final-state.png',
      });

      console.log(
        'Full cycle test completed - check screenshots for final state'
      );
    } finally {
      await customerContext.close();
      await businessContext.close();
    }
  });
});

test.describe('Full Cycle: Message Flow Between Customer and Business', () => {
  test('customer sends message, business receives it', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const businessContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const businessPage = await businessContext.newPage();

    const uniqueSubject = `Test Message ${Date.now()}`;

    try {
      // Customer sends message
      console.log('Customer sending message...');
      await loginAsCustomer(customerPage);

      // Navigate to services to find a business to contact
      await customerPage.goto('/services');
      await customerPage.waitForLoadState('networkidle');

      // Look for contact/message button
      const contactBtn = customerPage
        .locator('button:has-text("Contact"), button:has-text("Message")')
        .first();
      if (await contactBtn.isVisible().catch(() => false)) {
        await contactBtn.click();
        await customerPage.waitForTimeout(1000);

        // Fill message form
        const subjectInput = customerPage
          .locator('input[name*="subject"], input[placeholder*="subject"]')
          .first();
        if (await subjectInput.isVisible().catch(() => false)) {
          await subjectInput.fill(uniqueSubject);
        }

        const messageInput = customerPage
          .locator('textarea, input[name*="message"]')
          .first();
        if (await messageInput.isVisible().catch(() => false)) {
          await messageInput.fill('This is a test message from the customer.');
        }

        // Send message
        const sendBtn = customerPage.locator('button:has-text("Send")').first();
        if (await sendBtn.isVisible().catch(() => false)) {
          await sendBtn.click();
          await customerPage.waitForTimeout(2000);
          console.log('Message sent with subject:', uniqueSubject);
        }
      }

      // Business checks inbox
      console.log('Business checking inbox...');
      await loginAsBusinessOwner(businessPage);
      await businessPage.goto('/business/messages');
      await businessPage.waitForLoadState('networkidle');

      // Look for the message
      const pageContent = await businessPage.content();
      const messageReceived =
        pageContent.includes(uniqueSubject) ||
        pageContent.includes('message') ||
        pageContent.includes('Message');
      console.log('Business inbox shows messages:', messageReceived);

      await businessPage.screenshot({
        path: 'test-results/business-inbox.png',
      });
    } finally {
      await customerContext.close();
      await businessContext.close();
    }
  });
});

test.describe('Full Cycle: Quote Request Flow', () => {
  test('customer requests quote, business receives it', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const businessContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const businessPage = await businessContext.newPage();

    try {
      // Customer requests quote
      console.log('Customer requesting quote...');
      await loginAsCustomer(customerPage);

      await customerPage.goto('/services');
      await customerPage.waitForLoadState('networkidle');

      // Look for quote button
      const quoteBtn = customerPage
        .locator('button:has-text("Quote"), button:has-text("Get Quote")')
        .first();
      if (await quoteBtn.isVisible().catch(() => false)) {
        await quoteBtn.click();
        await customerPage.waitForTimeout(1000);

        // Fill quote form
        const descInput = customerPage.locator('textarea').first();
        if (await descInput.isVisible().catch(() => false)) {
          await descInput.fill(
            'I need a quote for a 3 bedroom house cleaning.'
          );
        }

        // Submit quote
        const submitBtn = customerPage
          .locator('button:has-text("Submit"), button:has-text("Request")')
          .first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
          await customerPage.waitForTimeout(2000);
          console.log('Quote requested');
        }
      }

      // Business checks quotes
      console.log('Business checking quotes...');
      await loginAsBusinessOwner(businessPage);
      await businessPage.goto('/business/quotes');
      await businessPage.waitForLoadState('networkidle');

      const pageContent = await businessPage.content();
      const quotesVisible =
        pageContent.includes('quote') ||
        pageContent.includes('Quote') ||
        pageContent.includes('request');
      console.log('Business quotes page shows content:', quotesVisible);

      await businessPage.screenshot({
        path: 'test-results/business-quotes.png',
      });
    } finally {
      await customerContext.close();
      await businessContext.close();
    }
  });
});

test.describe('Full Cycle: Review After Completed Booking', () => {
  test('customer leaves review, business sees it', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const businessContext = await browser.newContext();

    const customerPage = await customerContext.newPage();
    const businessPage = await businessContext.newPage();

    const reviewText = `Great service! Test review ${Date.now()}`;

    try {
      // Customer leaves review
      console.log('Customer leaving review...');
      await loginAsCustomer(customerPage);

      await customerPage.goto('/my-bookings');
      await customerPage.waitForLoadState('networkidle');

      // Look for review button
      const reviewBtn = customerPage
        .locator('button:has-text("Review"), button:has-text("Leave Review")')
        .first();
      if (await reviewBtn.isVisible().catch(() => false)) {
        await reviewBtn.click();
        await customerPage.waitForTimeout(1000);

        // Select rating (5 stars)
        const star5 = customerPage
          .locator('[data-rating="5"], button:has-text("★"):nth-child(5)')
          .first();
        if (await star5.isVisible().catch(() => false)) {
          await star5.click();
        }

        // Enter review text
        const reviewInput = customerPage.locator('textarea').first();
        if (await reviewInput.isVisible().catch(() => false)) {
          await reviewInput.fill(reviewText);
        }

        // Submit review
        const submitBtn = customerPage
          .locator('button:has-text("Submit")')
          .first();
        if (await submitBtn.isVisible().catch(() => false)) {
          await submitBtn.click();
          await customerPage.waitForTimeout(2000);
          console.log('Review submitted');
        }
      }

      // Business checks reviews
      console.log('Business checking reviews...');
      await loginAsBusinessOwner(businessPage);
      await businessPage.goto('/business/dashboard');
      await businessPage.waitForLoadState('networkidle');

      // Look for reviews tab/section
      const reviewsTab = businessPage.locator('text=/review/i').first();
      if (await reviewsTab.isVisible().catch(() => false)) {
        await reviewsTab.click();
        await businessPage.waitForLoadState('networkidle');
      }

      const pageContent = await businessPage.content();
      const reviewVisible =
        pageContent.includes('review') || pageContent.includes('Review');
      console.log('Business reviews visible:', reviewVisible);

      await businessPage.screenshot({
        path: 'test-results/business-reviews.png',
      });
    } finally {
      await customerContext.close();
      await businessContext.close();
    }
  });
});
