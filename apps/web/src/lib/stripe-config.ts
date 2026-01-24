/**
 * Stripe Configuration and Helper Functions
 *
 * This file contains configuration for Stripe payments and helper functions
 * for calculating platform fees and business earnings.
 */

// Platform fee percentage (e.g., 15% = 0.15)
export const PLATFORM_FEE_PERCENTAGE = 0.15;

// Minimum platform fee in GBP
export const MINIMUM_PLATFORM_FEE = 1.0;

/**
 * Calculate the platform fee for a given amount
 * @param amount - The total booking amount in GBP
 * @returns The platform fee in GBP
 */
export function calculatePlatformFee(amount: number): number {
  const fee = amount * PLATFORM_FEE_PERCENTAGE;
  return Math.max(fee, MINIMUM_PLATFORM_FEE);
}

/**
 * Calculate the business earnings after platform fee
 * @param amount - The total booking amount in GBP
 * @returns The amount the business receives in GBP
 */
export function calculateBusinessEarnings(amount: number): number {
  const platformFee = calculatePlatformFee(amount);
  return amount - platformFee;
}

/**
 * Format amount for Stripe (convert to smallest currency unit - pence)
 * @param amount - Amount in GBP
 * @returns Amount in pence (smallest currency unit)
 */
export function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Format amount from Stripe (convert from pence to GBP)
 * @param amount - Amount in pence
 * @returns Amount in GBP
 */
export function formatAmountFromStripe(amount: number): number {
  return amount / 100;
}

/**
 * Stripe publishable key (from environment variables)
 * Note: This should be set in .env.local
 */
export const STRIPE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return Boolean(STRIPE_PUBLISHABLE_KEY);
}

/**
 * Payment status types
 */
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Payment method types supported
 */
export type PaymentMethodType = 'card' | 'bank_transfer' | 'digital_wallet';

/**
 * Card brand types
 */
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';
