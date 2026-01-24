import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createPaymentRecord } from '@/lib/api/payment-webhook-handlers';
import { requireAuth } from '@/lib/api-auth';

// Initialize Stripe with secret key (use placeholder for build time)
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build',
  {
    apiVersion: '2025-09-30.clover',
  }
);

// Use service role key to bypass RLS for stripe account lookups
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Look up a business's Stripe Connect account from the database
 * Returns the account info if found and charges are enabled, null otherwise
 */
async function getBusinessStripeAccount(businessId: string): Promise<{
  stripeConnectAccountId: string;
  chargesEnabled: boolean;
} | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('business_stripe_accounts')
      .select('stripe_connect_account_id, charges_enabled')
      .eq('business_id', businessId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - business doesn't have a Stripe account
        console.log(`📋 No Stripe account found for business: ${businessId}`);
        return null;
      }
      console.error('❌ Error looking up business Stripe account:', error);
      return null;
    }

    return {
      stripeConnectAccountId: data.stripe_connect_account_id,
      chargesEnabled: data.charges_enabled,
    };
  } catch (err) {
    console.error('❌ Exception looking up business Stripe account:', err);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication - only logged-in users can create payment intents
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    // Parse request body
    const body = await request.json();
    const {
      amount,
      currency = 'gbp',
      metadata = {},
      // Note: stripeConnectAccountId from client is intentionally IGNORED for security
      // The server looks up the correct account from the database based on business_id
      platformFeeAmount = null, // Platform fee in same currency
    } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Check if Stripe is configured - if not, return demo mode response
    if (
      !process.env.STRIPE_SECRET_KEY ||
      process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder_for_build'
    ) {
      console.log(
        '⚠️ Stripe not configured - returning demo mode client secret'
      );
      return NextResponse.json({
        clientSecret: 'demo_secret_' + Math.random().toString(36).substring(7),
        paymentIntentId: 'demo_pi_' + Math.random().toString(36).substring(7),
        usingConnect: false,
        demoMode: true,
      });
    }

    // Convert amount to smallest currency unit (pence for GBP)
    const amountInPence = Math.round(amount * 100);

    // Prepare payment intent options
    const paymentIntentOptions: any = {
      amount: amountInPence,
      currency: currency,
      // Automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
      // Metadata for tracking
      metadata: {
        ...metadata,
        platform: 'tap2clean',
        timestamp: new Date().toISOString(),
      },
      // Description for Stripe Dashboard
      description: metadata.serviceName
        ? `Booking: ${metadata.serviceName}`
        : 'Tap2Clean Service Booking',
    };

    // Look up business's Stripe Connect account from database (server-side verification)
    // This prevents clients from tampering with the destination account
    const businessId = metadata.businessId || metadata.business_id;
    let usingConnect = false;
    let resolvedStripeAccountId: string | null = null;

    if (businessId) {
      console.log(
        `🔍 Looking up Stripe Connect account for business: ${businessId}`
      );

      const businessStripeAccount = await getBusinessStripeAccount(businessId);

      if (businessStripeAccount) {
        if (businessStripeAccount.chargesEnabled) {
          resolvedStripeAccountId =
            businessStripeAccount.stripeConnectAccountId;
          usingConnect = true;

          // Calculate platform fee (default 15% if not specified)
          const platformFeeInPence = platformFeeAmount
            ? Math.round(platformFeeAmount * 100)
            : Math.round(amountInPence * 0.15);

          console.log('💰 Using Stripe Connect destination charge:', {
            totalAmount: amountInPence,
            platformFee: platformFeeInPence,
            businessReceives: amountInPence - platformFeeInPence,
            destination: resolvedStripeAccountId,
            businessId,
          });

          paymentIntentOptions.application_fee_amount = platformFeeInPence;
          paymentIntentOptions.transfer_data = {
            destination: resolvedStripeAccountId,
          };
        } else {
          console.warn(
            `⚠️ Business ${businessId} has Stripe account ${businessStripeAccount.stripeConnectAccountId} but charges are not enabled - processing as platform payment`
          );
        }
      } else {
        console.log(
          `⚠️ No Stripe Connect account found for business ${businessId} - processing as platform payment`
        );
      }
    } else {
      console.log(
        '⚠️ No business_id in metadata - payment goes to platform account'
      );
    }

    // Create a PaymentIntent
    const paymentIntent =
      await stripe.paymentIntents.create(paymentIntentOptions);

    // Insert payment record into database
    // Note: payments table only has: id, booking_id, stripe_payment_intent_id, amount, status, paid_at, created_at
    const paymentRecord = await createPaymentRecord({
      stripe_payment_intent_id: paymentIntent.id,
      booking_id: metadata.bookingId || null,
      amount: amount,
      status: 'pending',
    });

    if (!paymentRecord.success) {
      console.warn(
        'Failed to create payment record in database:',
        paymentRecord.error
      );
      // Don't fail the request - payment intent was created successfully
      // The webhook will handle the payment status updates
    }

    // Return the client secret
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      usingConnect,
      // Include resolved account ID for debugging (only in non-production)
      ...(process.env.NODE_ENV !== 'production' && resolvedStripeAccountId
        ? { stripeConnectAccountId: resolvedStripeAccountId }
        : {}),
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);

    return NextResponse.json(
      {
        error:
          error.message ||
          'An error occurred while creating the payment intent',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
