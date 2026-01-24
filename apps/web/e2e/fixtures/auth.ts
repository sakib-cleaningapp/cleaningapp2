/**
 * Authentication helpers for E2E tests
 * Uses Supabase session injection for testing (bypasses OAuth UI flow)
 */

import { Page } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { TEST_CUSTOMER, TEST_BUSINESS, TEST_ADMIN } from './test-data';

// Supabase client for test session creation
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://bpdehoxivkvrxpxniwjp.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGVob3hpdmt2cnhweG5pd2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NTE1OTAsImV4cCI6MjA4NDMyNzU5MH0.eyxoaeDRMjYqh_E_nGXmM9sJE-6wvTCuf-HYIQOhCLE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Inject Supabase session into the browser
 * This allows us to test authenticated pages without going through OAuth
 */
async function injectSession(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  try {
    // Sign in via Supabase API to get session tokens
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      console.error('Failed to get test session:', error?.message);
      return false;
    }

    const session = data.session;

    // Navigate to the app first to set the correct origin
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Inject the session into localStorage (Supabase uses localStorage for session)
    await page.evaluate(
      ({ supabaseUrl, session }) => {
        const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
        localStorage.setItem(storageKey, JSON.stringify(session));
      },
      { supabaseUrl, session }
    );

    // Refresh to pick up the session
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    return true;
  } catch (err) {
    console.error('Session injection error:', err);
    return false;
  }
}

/**
 * Login as a customer user
 * Uses direct session injection for reliable E2E testing
 */
export async function loginAsCustomer(page: Page): Promise<void> {
  const success = await injectSession(
    page,
    TEST_CUSTOMER.email,
    TEST_CUSTOMER.password
  );

  if (!success) {
    throw new Error(
      'Failed to login as customer. Ensure test user exists in Supabase.'
    );
  }

  // Session is now injected, tests will navigate to the desired page
}

/**
 * Login as a business owner
 * Uses direct session injection for reliable E2E testing
 */
export async function loginAsBusinessOwner(page: Page): Promise<void> {
  const success = await injectSession(
    page,
    TEST_BUSINESS.email,
    TEST_BUSINESS.password
  );

  if (!success) {
    throw new Error(
      'Failed to login as business owner. Ensure test user exists in Supabase.'
    );
  }

  // Set business session in localStorage (for business pages)
  await page.evaluate(() => {
    // Mock business session for business pages
    localStorage.setItem(
      'business_session',
      JSON.stringify({
        email: 'business@test.cleanly.com',
        businessId: '70f42f98-35d9-4616-b731-fad5d62af286',
        businessName: 'Test Cleaning Business',
        loggedInAt: new Date().toISOString(),
      })
    );
  });

  // Session is now injected, tests will navigate to the desired page
}

/**
 * Login as an admin user
 * Uses direct session injection for reliable E2E testing
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  const success = await injectSession(
    page,
    TEST_ADMIN.email,
    TEST_ADMIN.password
  );

  if (!success) {
    throw new Error(
      'Failed to login as admin. Ensure test user exists in Supabase.'
    );
  }

  // Session is now injected, tests will navigate to the desired page
}
