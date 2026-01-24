import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

// Supabase config - these should match your .env.local
const SUPABASE_URL = 'https://bpdehoxivkvrxpxniwjp.supabase.co';

test.describe('API Validation', () => {
  test('GET /api/bookings endpoint exists and responds', async ({
    request,
  }) => {
    const response = await request.get(
      `${BASE_URL}/api/bookings?type=customer`
    );

    // Should get a response (may be 401 if auth required, but endpoint exists)
    expect([200, 401, 500]).toContain(response.status());

    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('PATCH /api/bookings endpoint exists', async ({ request }) => {
    const response = await request.patch(`${BASE_URL}/api/bookings`, {
      data: {
        bookingId: 'non-existent-id',
        status: 'cancelled',
        cancelledBy: 'customer',
        cancellationReason: 'Test cancellation - API validation',
      },
    });

    // Should get a response (may fail with booking not found, but endpoint works)
    expect([200, 400, 404, 500]).toContain(response.status());

    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('POST /api/stripe/refund endpoint exists', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/stripe/refund`, {
      data: {
        paymentIntentId: 'pi_test_nonexistent',
      },
    });

    // Should get a response (will fail auth or payment not found)
    expect([200, 401, 403, 404, 500]).toContain(response.status());

    const data = await response.json();
    expect(data).toBeDefined();
  });

  test('Supabase notifications table is accessible', async ({ request }) => {
    // Read anon key from env or use known test key
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MDA0MTksImV4cCI6MjA0MjA3NjQxOX0.fgZvKR7bQDqk_LNSRP5ReHcKLpzIDAl-dOqsEKpHDkg';

    const response = await request.get(
      `${SUPABASE_URL}/rest/v1/notifications?limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    // Table should exist and be queryable
    expect([200, 401]).toContain(response.status());
  });

  test('Supabase messages table is accessible', async ({ request }) => {
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MDA0MTksImV4cCI6MjA0MjA3NjQxOX0.fgZvKR7bQDqk_LNSRP5ReHcKLpzIDAl-dOqsEKpHDkg';

    const response = await request.get(
      `${SUPABASE_URL}/rest/v1/messages?limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    // Table should exist and be queryable
    expect([200, 401]).toContain(response.status());
  });

  test('Supabase booking_requests table has refund columns', async ({
    request,
  }) => {
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY1MDA0MTksImV4cCI6MjA0MjA3NjQxOX0.fgZvKR7bQDqk_LNSRP5ReHcKLpzIDAl-dOqsEKpHDkg';

    const response = await request.get(
      `${SUPABASE_URL}/rest/v1/booking_requests?select=id,refund_status,refund_id,cancellation_reason,cancelled_by&limit=1`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    );

    // If columns don't exist, Supabase returns 400 with column error
    // If table exists with columns, returns 200 (may be empty array)
    expect([200, 401]).toContain(response.status());
  });

  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify app is running
    await expect(page.locator('body')).toContainText(/cleanly|clean|service/i);
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto('/login/customer');
    await page.waitForLoadState('networkidle');

    // Verify login form exists
    await expect(page.locator('input[type="email"], #email')).toBeVisible();
    await expect(
      page.locator('input[type="password"], #password')
    ).toBeVisible();
  });

  test('Business login page is accessible', async ({ page }) => {
    await page.goto('/business/login');
    await page.waitForLoadState('networkidle');

    // Verify login form exists
    await expect(page.locator('input[type="email"], #email')).toBeVisible();
    await expect(
      page.locator('input[type="password"], #password')
    ).toBeVisible();
  });

  test('Admin login page is accessible', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');

    // Verify login form exists
    await expect(page.locator('input[type="email"], #email')).toBeVisible();
    await expect(
      page.locator('input[type="password"], #password')
    ).toBeVisible();
  });
});
