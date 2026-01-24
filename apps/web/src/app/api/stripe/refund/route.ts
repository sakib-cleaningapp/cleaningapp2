import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAdmin } from '@/lib/api-auth';

/**
 * Process a refund for a payment
 *
 * Access control:
 * 1. Admin users (via requireAdmin) - for manual refunds from admin dashboard
 * 2. Internal server calls (via x-internal-service header) - for auto-refunds on cancellation
 *
 * The internal header must match the SUPABASE_SERVICE_ROLE_KEY to prevent unauthorized access.
 */
export async function POST(request: NextRequest) {
  try {
    // Check for internal service call (server-to-server, e.g., from bookings API)
    const internalServiceKey = request.headers.get('x-internal-service');
    const isInternalCall =
      internalServiceKey === process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If not an internal call, require admin access
    if (!isInternalCall) {
      const { user, isAdmin, error: authError } = await requireAdmin(request);
      if (authError) return authError;
    }

    const { paymentIntentId, stripeConnectAccountId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'paymentIntentId is required' },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;

    // If Stripe is not configured, succeed with a warning so the UI can continue gracefully
    if (!secretKey) {
      console.warn('Stripe secret key missing. Skipping real refund.');
      return NextResponse.json({
        success: false,
        error: 'Stripe not configured; refund not triggered.',
      });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-11-20.acacia',
    });

    // First, retrieve the payment intent to check if it was a Connect payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check if this was a Stripe Connect destination charge
    const isConnectPayment = !!(
      paymentIntent.transfer_data?.destination || stripeConnectAccountId
    );
    const connectedAccountId =
      paymentIntent.transfer_data?.destination || stripeConnectAccountId;

    // Prepare refund options
    const refundOptions: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    // For Stripe Connect destination charges, we need to:
    // 1. Reverse the transfer (pull money back from business account)
    // 2. Refund the application fee (platform fee) back to customer
    if (isConnectPayment && connectedAccountId) {
      console.log(
        `💰 Refunding Stripe Connect payment. Connected account: ${connectedAccountId}`
      );

      // reverse_transfer: Pulls the transferred amount back from the connected account
      // This deducts the refund from the business's Stripe account
      refundOptions.reverse_transfer = true;

      // refund_application_fee: Refunds the platform fee portion to the customer
      // This deducts the platform fee from your platform account
      refundOptions.refund_application_fee = true;

      console.log(
        '✅ Refund will:',
        '- Reverse transfer from business account',
        '- Refund platform fee from platform account',
        '- Customer receives full refund'
      );
    }

    const refund = await stripe.refunds.create(refundOptions);

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      status: refund.status,
      isConnectPayment: !!paymentIntent.transfer_data?.destination,
    });
  } catch (error: any) {
    console.error('Stripe refund error', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Refund failed. See logs for details.',
      },
      { status: 500 }
    );
  }
}
