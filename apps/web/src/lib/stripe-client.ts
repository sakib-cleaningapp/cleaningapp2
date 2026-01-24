/**
 * Stripe Client Utilities
 *
 * This file contains helper functions for interacting with Stripe on the client side
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Singleton instance of Stripe
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get or initialize the Stripe instance
 * @returns Promise resolving to Stripe instance or null
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.warn(
        '⚠️ Stripe publishable key not set. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local'
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Check if Stripe is properly configured (not placeholder/demo keys)
 */
export const isStripeConfigured = (): boolean => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Check if key exists and is not a placeholder
  if (!key) return false;
  if (key.includes('placeholder')) return false;
  if (key.includes('your_')) return false;
  if (key.length < 20) return false; // Real Stripe keys are much longer

  return true;
};

/**
 * Create a payment intent on the server
 * @param amount - Amount in GBP (e.g., 75.00)
 * @param metadata - Optional metadata to attach to the payment
 * @param stripeConnectAccountId - Optional Stripe Connect account for automatic payment splitting
 * @param platformFeeAmount - Platform fee amount if using Connect
 */
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>,
  stripeConnectAccountId?: string,
  platformFeeAmount?: number
): Promise<{
  clientSecret: string;
  paymentIntentId: string;
  usingConnect: boolean;
} | null> {
  try {
    // Get the current session token for authentication
    // Note: We use getSession() only - refreshSession() can trigger onAuthStateChange
    // which may cause unexpected logouts if the refresh fails
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      console.error(
        'No auth session - user must be logged in to make payments'
      );
      throw new Error('Authentication required');
    }

    const token = session.access_token;

    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'gbp',
        metadata,
        stripeConnectAccountId,
        platformFeeAmount,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    return {
      clientSecret: data.clientSecret,
      paymentIntentId: data.paymentIntentId,
      usingConnect: data.usingConnect || false,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return null;
  }
}
