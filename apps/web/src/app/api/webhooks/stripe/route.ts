import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  updatePaymentOnSuccess,
  updatePaymentOnFailure,
  updatePaymentOnRefund,
} from '@/lib/api/payment-webhook-handlers';

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_for_build',
  {
    apiVersion: '2025-09-30.clover',
  }
);

// Webhook secret for verifying events
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.warn(
        '⚠️ STRIPE_WEBHOOK_SECRET not set. Webhook verification disabled.'
      );
      // In development, you might want to proceed without verification
      // In production, this should return an error
    }

    let event: Stripe.Event;

    try {
      // Verify the event came from Stripe
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    console.log('✅ Webhook received:', event.type);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('💰 Payment succeeded:', paymentIntent.id);

        // Update payment and booking status in database
        const successResult = await updatePaymentOnSuccess(
          paymentIntent.id,
          paymentIntent.metadata as Record<string, string>
        );

        if (!successResult.success) {
          console.error(
            'Failed to update payment on success:',
            successResult.error
          );
        }

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('❌ Payment failed:', paymentIntent.id);

        // Get failure reason from last payment error
        const failureReason =
          paymentIntent.last_payment_error?.message ||
          paymentIntent.last_payment_error?.code ||
          'Payment failed';

        // Update payment status to failed in database
        const failResult = await updatePaymentOnFailure(
          paymentIntent.id,
          failureReason,
          paymentIntent.metadata as Record<string, string>
        );

        if (!failResult.success) {
          console.error(
            'Failed to update payment on failure:',
            failResult.error
          );
        }

        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('🚫 Payment canceled:', paymentIntent.id);

        // Treat cancellation as a failure with specific reason
        const cancelResult = await updatePaymentOnFailure(
          paymentIntent.id,
          'Payment was canceled',
          paymentIntent.metadata as Record<string, string>
        );

        if (!cancelResult.success) {
          console.error(
            'Failed to update payment on cancel:',
            cancelResult.error
          );
        }

        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        console.log('💸 Charge refunded:', charge.id);

        // Handle refund - update payment and booking status
        if (charge.payment_intent) {
          const paymentIntentId =
            typeof charge.payment_intent === 'string'
              ? charge.payment_intent
              : charge.payment_intent.id;

          const refundResult = await updatePaymentOnRefund(
            paymentIntentId,
            charge.id,
            charge.amount_refunded
          );

          if (!refundResult.success) {
            console.error(
              'Failed to update payment on refund:',
              refundResult.error
            );
          }
        }

        break;
      }

      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        console.log('⚠️ Dispute created:', dispute.id);

        // Log dispute for manual handling - disputes typically require human review
        console.warn(
          '⚠️ DISPUTE ALERT: Manual intervention required for dispute',
          dispute.id
        );
        // In production, you would want to:
        // 1. Send alert to admin (email/Slack)
        // 2. Log to monitoring system
        // 3. Potentially freeze related bookings

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
