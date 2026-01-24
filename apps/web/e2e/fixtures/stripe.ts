/**
 * Stripe payment helpers for E2E tests
 * Provides utilities for interacting with Stripe payment elements
 */

import { Page } from '@playwright/test';
import { STRIPE_TEST_CARD } from './test-data';

/**
 * Wait for Stripe iframe to load on the page
 * Returns true if Stripe iframe is found, false otherwise
 */
export async function waitForStripeLoad(page: Page): Promise<boolean> {
  try {
    // Wait for Stripe iframe to appear
    await page.waitForSelector(
      'iframe[src*="stripe"], iframe[name*="stripe"], iframe[title*="Stripe"]',
      {
        timeout: 15000,
      }
    );

    // Additional wait for Stripe to fully initialize
    await page.waitForTimeout(2000);

    const iframeCount = await page.locator('iframe').count();
    return iframeCount > 0;
  } catch {
    return false;
  }
}

/**
 * Fill Stripe Payment Element with test card details
 * Uses keyboard navigation to move between fields within the iframe
 */
export async function fillStripePaymentElement(page: Page): Promise<boolean> {
  try {
    // Wait for Stripe to be ready
    const stripeLoaded = await waitForStripeLoad(page);
    if (!stripeLoaded) {
      console.log('Stripe iframe not found');
      return false;
    }

    // Get the first iframe (Stripe card element)
    const cardFrame = page.frameLocator('iframe').first();
    const cardInput = cardFrame.locator('input').first();

    // Check if input is visible
    const isVisible = await cardInput
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (!isVisible) {
      console.log('Stripe card input not visible');
      return false;
    }

    // Click to focus the card number field
    await cardInput.click();

    // Type card number
    await cardInput.type(STRIPE_TEST_CARD.number, { delay: 50 });

    // Tab to expiry field
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    // Type expiry
    await page.keyboard.type(STRIPE_TEST_CARD.expiry, { delay: 50 });

    // Tab to CVC field
    await page.keyboard.press('Tab');
    await page.waitForTimeout(300);

    // Type CVC
    await page.keyboard.type(STRIPE_TEST_CARD.cvc, { delay: 50 });

    console.log('Stripe card details entered successfully');
    return true;
  } catch (error) {
    console.log('Error filling Stripe payment element:', error);
    return false;
  }
}

/**
 * Fill demo/mock payment form (non-Stripe)
 * For testing payment flows without real Stripe integration
 */
export async function fillDemoPaymentForm(page: Page): Promise<boolean> {
  try {
    // Look for card number input with various possible selectors
    const cardNumberInput = page
      .locator(
        'input[placeholder*="card number" i], input[name*="cardNumber" i], input[data-testid="card-number"]'
      )
      .first();

    if (await cardNumberInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await cardNumberInput.fill(STRIPE_TEST_CARD.number);
    }

    // Look for expiry input
    const expiryInput = page
      .locator(
        'input[placeholder*="expir" i], input[placeholder*="MM/YY" i], input[name*="expiry" i], input[data-testid="card-expiry"]'
      )
      .first();

    if (await expiryInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expiryInput.fill(STRIPE_TEST_CARD.expiry);
    }

    // Look for CVC input
    const cvcInput = page
      .locator(
        'input[placeholder*="cvc" i], input[placeholder*="cvv" i], input[name*="cvc" i], input[data-testid="card-cvc"]'
      )
      .first();

    if (await cvcInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cvcInput.fill(STRIPE_TEST_CARD.cvc);
    }

    console.log('Demo payment form filled successfully');
    return true;
  } catch (error) {
    console.log('Error filling demo payment form:', error);
    return false;
  }
}
