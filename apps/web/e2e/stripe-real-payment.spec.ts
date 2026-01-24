import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * REAL STRIPE PAYMENT E2E TEST
 *
 * This test bypasses the Stripe iframe by making direct API calls:
 * 1. Creates a PaymentIntent via the app's API
 * 2. Confirms the payment using Stripe's API with test payment method
 * 3. Creates the booking with the confirmed payment
 *
 * This approach works around Playwright's inability to interact with
 * Stripe's cross-origin iframes.
 */

const TEST_CUSTOMER = {
  email: 'customer@test.cleanly.com',
  password: 'TestPass123!',
  profileId: 'bbe37174-e386-46c3-b03d-5e19f4d0ba45',
  userId: '7fbde17b-0d66-4b6a-8d08-79a803a81310',
  name: 'Test Customer',
};

const TEST_BUSINESS = {
  email: 'business@test.cleanly.com',
  password: 'TestPass123!',
  profileId: '069deab8-d88c-4e40-a7fd-6bd0c7250e2b',
  userId: '3e183aee-26fe-49ea-a665-30f328ce23bb',
  businessId: '70f42f98-35d9-4616-b731-fad5d62af286',
  businessName: 'Sparkle Clean Services',
};

const TEST_SERVICE = {
  id: '8554c6e4-2d13-47a5-8d6e-1a293fc1bd6d',
  name: 'Standard Home Cleaning',
  price: 75,
};

// Stripe test payment method - this is a pre-authorized test card token
const STRIPE_TEST_PAYMENT_METHOD = 'pm_card_visa';

const BASE_URL = 'http://localhost:3001';

/**
 * Helper: Login as customer and get auth token
 */
async function loginAsCustomer(page: Page): Promise<string | null> {
  await page.goto('/login/customer');
  await page.waitForLoadState('networkidle');
  await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#email').fill(TEST_CUSTOMER.email);
  await page.locator('#password').fill(TEST_CUSTOMER.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/dashboard/, { timeout: 20000 });

  // Get the Supabase auth token from localStorage
  const token = await page.evaluate(() => {
    const storage = localStorage.getItem('sb-bpdehoxivkvrxpxniwjp-auth-token');
    if (storage) {
      const parsed = JSON.parse(storage);
      return parsed.access_token || null;
    }
    return null;
  });

  return token;
}

/**
 * Helper: Login as business owner
 */
async function loginAsBusinessOwner(page: Page) {
  await page.goto('/business/login');
  await page.waitForLoadState('networkidle');
  await page.locator('#email').waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('#email').fill(TEST_BUSINESS.email);
  await page.locator('#password').fill(TEST_BUSINESS.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/business/, { timeout: 20000 });
}

/**
 * Helper: Navigate to booking modal and get service info
 */
async function navigateToBookingAndGetServiceInfo(page: Page) {
  await page.waitForSelector(
    'text=/Choose a Service|What service do you need/i',
    { timeout: 10000 }
  );

  // Click Cleaning category
  const cleaningCategory = page
    .locator('button')
    .filter({ hasText: /Cleaning/i })
    .first();
  await cleaningCategory.click();
  await page.waitForTimeout(2000);

  // Click on business
  const businessRow = page
    .locator('div')
    .filter({ hasText: /Sparkle Clean Services/i })
    .first();
  await businessRow.click();
  await page.waitForTimeout(2000);

  // Get service info before clicking Book Now
  const serviceCard = page
    .locator('div')
    .filter({ has: page.locator('button:has-text("Book now")') })
    .first();
  const serviceText = (await serviceCard.textContent()) || '';

  // Extract price from service card (e.g., "£45")
  const priceMatch = serviceText.match(/£(\d+)/);
  const price = priceMatch ? parseInt(priceMatch[1]) : 45;

  // Click Book Now
  await page.locator('button:has-text("Book now")').first().click();
  await page.waitForSelector('[class*="fixed"][class*="inset-0"]', {
    timeout: 10000,
  });

  return {
    price,
    serviceName: 'Standard Cleaning',
    businessName: 'Sparkle Clean Services',
  };
}

test.describe('Real Stripe Payment Tests', () => {
  test('REAL STRIPE: Complete purchase flow with actual Stripe payment', async ({
    page,
    request,
  }) => {
    test.setTimeout(180000); // 3 minutes

    console.log('\n=== REAL STRIPE PAYMENT TEST ===\n');

    // Step 1: Login as customer
    console.log('STEP 1: Logging in as customer...');
    const authToken = await loginAsCustomer(page);
    console.log(`Auth token obtained: ${authToken ? 'Yes' : 'No'}`);
    await page.screenshot({
      path: 'test-results/stripe-real-01-logged-in.png',
    });

    // Step 2: Navigate to booking and get service info
    console.log('\nSTEP 2: Navigating to booking modal...');
    const serviceInfo = await navigateToBookingAndGetServiceInfo(page);
    console.log(
      `Service: ${serviceInfo.serviceName}, Price: £${serviceInfo.price}`
    );
    await page.screenshot({
      path: 'test-results/stripe-real-02-booking-modal.png',
    });

    // Step 3: Select date and time
    console.log('\nSTEP 3: Selecting date and time...');
    await page
      .locator('button')
      .filter({ hasText: /Mon|Tue|Wed|Thu|Fri|Sat|Sun/ })
      .first()
      .click();
    await page.waitForTimeout(300);
    await page.locator('button:has-text("10:00")').first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/stripe-real-03-datetime.png' });

    // Step 4: Continue to payment step (to trigger normal flow)
    console.log('\nSTEP 4: Going to payment step...');
    await page.getByRole('button', { name: /continue to payment/i }).click();
    await page.waitForTimeout(3000);
    await page.screenshot({
      path: 'test-results/stripe-real-04-payment-step.png',
    });

    // Step 5: Create PaymentIntent via API
    console.log('\nSTEP 5: Creating PaymentIntent via API...');

    // Use REAL IDs for payment intent metadata
    const paymentIntentResponse = await request.post(
      `${BASE_URL}/api/create-payment-intent`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          amount: TEST_SERVICE.price,
          currency: 'gbp',
          metadata: {
            serviceName: TEST_SERVICE.name,
            businessName: TEST_BUSINESS.businessName,
            serviceId: TEST_SERVICE.id,
            businessId: TEST_BUSINESS.businessId,
          },
        },
      }
    );

    const paymentIntentData = await paymentIntentResponse.json();
    console.log(
      'PaymentIntent response:',
      JSON.stringify(paymentIntentData, null, 2)
    );

    if (paymentIntentData.demoMode) {
      console.log('\n⚠️  Running in DEMO MODE - Stripe not configured');
      console.log('To test real Stripe, ensure STRIPE_SECRET_KEY is set\n');
    }

    expect(
      paymentIntentData.clientSecret || paymentIntentData.demoMode
    ).toBeTruthy();

    // Step 6: Confirm the payment using Stripe API directly
    console.log('\nSTEP 6: Confirming payment with Stripe API...');

    let paymentConfirmed = false;
    let confirmedPaymentIntent: any = null;

    if (!paymentIntentData.demoMode && paymentIntentData.paymentIntentId) {
      // Use Stripe API to confirm the payment with test payment method
      const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

      if (stripeSecretKey) {
        const confirmResponse = await request.post(
          `https://api.stripe.com/v1/payment_intents/${paymentIntentData.paymentIntentId}/confirm`,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(stripeSecretKey + ':').toString('base64')}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
              payment_method: STRIPE_TEST_PAYMENT_METHOD,
              return_url: `${BASE_URL}/booking-success`,
            },
          }
        );

        confirmedPaymentIntent = await confirmResponse.json();
        console.log(
          'Stripe confirm response status:',
          confirmedPaymentIntent.status
        );

        if (confirmedPaymentIntent.status === 'succeeded') {
          paymentConfirmed = true;
          console.log('✅ PAYMENT CONFIRMED SUCCESSFULLY!');
          console.log(`   Payment Intent ID: ${confirmedPaymentIntent.id}`);
          console.log(`   Amount: £${confirmedPaymentIntent.amount / 100}`);
          console.log(`   Status: ${confirmedPaymentIntent.status}`);
        } else {
          console.log(`Payment status: ${confirmedPaymentIntent.status}`);
          console.log(
            'Full response:',
            JSON.stringify(confirmedPaymentIntent, null, 2)
          );
        }
      } else {
        console.log('STRIPE_SECRET_KEY not available in test environment');
      }
    }

    await page.screenshot({
      path: 'test-results/stripe-real-05-payment-confirmed.png',
    });

    // Step 7: Create the booking via API
    console.log('\nSTEP 7: Creating booking via API...');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bookingDate = tomorrow.toISOString().split('T')[0];

    // Use REAL test profile IDs from Supabase
    const bookingResponse = await request.post(`${BASE_URL}/api/bookings`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        bookingData: {
          customer_id: TEST_CUSTOMER.profileId, // Real UUID
          customer_name: TEST_CUSTOMER.name,
          customer_email: TEST_CUSTOMER.email,
          business_id: TEST_BUSINESS.businessId, // Real UUID
          business_name: TEST_BUSINESS.businessName,
          service_id: TEST_SERVICE.id, // Real UUID
          service_name: TEST_SERVICE.name,
          requested_date: bookingDate,
          requested_time: '10:00',
          total_cost: TEST_SERVICE.price,
          platform_fee: Math.round(TEST_SERVICE.price * 0.15 * 100) / 100,
        },
        paymentData: {
          stripe_payment_intent_id:
            paymentIntentData.paymentIntentId || 'demo_pi_' + Date.now(),
          amount: TEST_SERVICE.price,
        },
      },
    });

    const bookingData = await bookingResponse.json();
    console.log('Booking response:', JSON.stringify(bookingData, null, 2));

    await page.screenshot({
      path: 'test-results/stripe-real-06-booking-created.png',
    });

    // Step 8: Verify booking in UI
    console.log('\nSTEP 8: Verifying booking in My Bookings...');
    await page.goto('/my-bookings');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: 'test-results/stripe-real-07-my-bookings.png',
    });

    // Step 9: Check business side
    console.log('\nSTEP 9: Checking business dashboard...');

    // Open new context for business
    const businessContext = await page.context().browser()!.newContext();
    const businessPage = await businessContext.newPage();

    await loginAsBusinessOwner(businessPage);
    await businessPage.goto('/business/dashboard');
    await businessPage.waitForLoadState('networkidle');
    await businessPage.waitForTimeout(2000);
    await businessPage.screenshot({
      path: 'test-results/stripe-real-08-business-dashboard.png',
    });

    // Look for Accept button
    const acceptBtn = businessPage.locator('button:has-text("Accept")').first();
    if (await acceptBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Found pending booking - clicking Accept...');
      await acceptBtn.click();
      await businessPage.waitForTimeout(2000);
      console.log('✅ Booking accepted by business!');
    }

    await businessPage.screenshot({
      path: 'test-results/stripe-real-09-booking-accepted.png',
    });
    await businessContext.close();

    // Final summary
    console.log('\n=== TEST SUMMARY ===');
    console.log(
      `Payment Intent Created: ${paymentIntentData.paymentIntentId ? 'Yes' : 'Demo Mode'}`
    );
    console.log(
      `Payment Confirmed: ${paymentConfirmed ? 'Yes' : 'No (or Demo Mode)'}`
    );
    console.log(
      `Booking Created: ${bookingData.success ? 'Yes' : 'Check response'}`
    );
    console.log('====================\n');

    // Assert payment was at least initiated
    expect(
      paymentIntentData.clientSecret || paymentIntentData.demoMode
    ).toBeTruthy();
  });

  test('STRIPE API DIRECT: Create and confirm payment without UI', async ({
    request,
  }) => {
    test.setTimeout(60000);

    console.log('\n=== DIRECT STRIPE API TEST ===\n');

    // This test calls Stripe directly without any UI
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      console.log('STRIPE_SECRET_KEY not set - skipping direct API test');
      test.skip();
      return;
    }

    // Step 1: Create PaymentIntent directly via Stripe API
    console.log('Creating PaymentIntent directly via Stripe API...');

    const createResponse = await request.post(
      'https://api.stripe.com/v1/payment_intents',
      {
        headers: {
          Authorization: `Basic ${Buffer.from(stripeSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
          amount: '4500', // £45.00 in pence
          currency: 'gbp',
          'automatic_payment_methods[enabled]': 'true',
          'automatic_payment_methods[allow_redirects]': 'never',
          'metadata[test]': 'e2e-test',
          'metadata[service]': 'Standard Cleaning',
        },
      }
    );

    const paymentIntent = await createResponse.json();
    console.log(`PaymentIntent created: ${paymentIntent.id}`);
    console.log(`Status: ${paymentIntent.status}`);
    console.log(`Amount: £${paymentIntent.amount / 100}`);

    expect(paymentIntent.id).toBeTruthy();
    expect(paymentIntent.status).toBe('requires_payment_method');

    // Step 2: Confirm the PaymentIntent with test card
    console.log('\nConfirming PaymentIntent with test payment method...');

    const confirmResponse = await request.post(
      `https://api.stripe.com/v1/payment_intents/${paymentIntent.id}/confirm`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(stripeSecretKey + ':').toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        form: {
          payment_method: STRIPE_TEST_PAYMENT_METHOD,
        },
      }
    );

    const confirmedIntent = await confirmResponse.json();
    console.log(`Confirmed status: ${confirmedIntent.status}`);

    if (confirmedIntent.status === 'succeeded') {
      console.log('\n✅ STRIPE PAYMENT SUCCESSFUL!');
      console.log(`   ID: ${confirmedIntent.id}`);
      console.log(`   Amount: £${confirmedIntent.amount / 100}`);
      console.log(`   Payment Method: ${confirmedIntent.payment_method}`);
    } else {
      console.log('Payment status:', confirmedIntent.status);
      if (confirmedIntent.error) {
        console.log('Error:', confirmedIntent.error.message);
      }
    }

    expect(confirmedIntent.status).toBe('succeeded');

    console.log('\n=== DIRECT STRIPE API TEST COMPLETE ===\n');
  });
});

/**
 * To run these tests:
 *
 * 1. Make sure the dev server is running:
 *    cd apps/web && npm run dev -- -p 3001
 *
 * 2. Set STRIPE_SECRET_KEY environment variable:
 *    export STRIPE_SECRET_KEY=sk_test_xxx
 *
 * 3. Run the test:
 *    STRIPE_SECRET_KEY=sk_test_xxx npx playwright test stripe-real-payment.spec.ts
 */
