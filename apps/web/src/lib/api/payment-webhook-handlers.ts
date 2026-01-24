import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
// Use service role key for webhook handlers to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Check if Supabase is properly configured for webhook operations
 */
function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseUrl !== 'https://placeholder.supabase.co' &&
      supabaseServiceKey &&
      supabaseServiceKey !== 'placeholder-key'
  );
}

/**
 * Update payment and booking status when payment succeeds
 * @param paymentIntentId - The Stripe PaymentIntent ID
 * @param metadata - Metadata from the PaymentIntent (may contain bookingId)
 */
export async function updatePaymentOnSuccess(
  paymentIntentId: string,
  metadata: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - skipping payment update');
    return { success: true }; // Return success to not block webhook processing
  }

  try {
    // Update payment status to 'succeeded'
    // Note: payments table only has: id, booking_id, stripe_payment_intent_id, amount, status, paid_at, created_at
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'succeeded',
        paid_at: new Date().toISOString(),
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .select()
      .single();

    if (paymentError) {
      // Payment might not exist yet if created after webhook - this is OK
      console.log(
        `Payment record not found for ${paymentIntentId}, may be created later`
      );
    }

    // If bookingId is in metadata, update booking_requests status to 'confirmed'
    // Note: updated_at is auto-updated by trigger
    const bookingId = metadata?.bookingId;
    if (bookingId) {
      const { error: bookingError } = await supabaseAdmin
        .from('booking_requests')
        .update({
          status: 'confirmed',
        })
        .eq('id', bookingId);

      if (bookingError) {
        console.error('Error updating booking status:', bookingError);
        return { success: false, error: bookingError.message };
      }

      // Create notification for customer about payment success
      if (paymentData?.booking_id) {
        const { data: booking } = await supabaseAdmin
          .from('booking_requests')
          .select(
            'customer_id, customer_name, service_name, business_id, business_name'
          )
          .eq('id', bookingId)
          .single();

        if (booking) {
          // notifications table only has: id, user_id, type, title, message, read, created_at
          await supabaseAdmin.from('notifications').insert([
            {
              user_id: booking.customer_id,
              type: 'payment_succeeded',
              title: 'Payment Successful!',
              message: `Your payment for ${booking.service_name} with ${booking.business_name} has been confirmed.`,
            },
          ]);
        }
      }

      console.log(`✅ Updated booking ${bookingId} to confirmed`);
    }

    console.log(`✅ Payment ${paymentIntentId} marked as succeeded`);
    return { success: true };
  } catch (error) {
    console.error('Error in updatePaymentOnSuccess:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update payment status when payment fails
 * @param paymentIntentId - The Stripe PaymentIntent ID
 * @param reason - The reason for failure
 * @param metadata - Metadata from the PaymentIntent
 */
export async function updatePaymentOnFailure(
  paymentIntentId: string,
  reason: string,
  metadata?: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn(
      '⚠️ Supabase not configured - skipping payment failure update'
    );
    return { success: true };
  }

  try {
    // Update payment status to 'failed' with failure reason
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'failed',
        failure_reason: reason,
      })
      .eq('stripe_payment_intent_id', paymentIntentId);

    if (paymentError) {
      console.error('Error updating payment to failed:', paymentError);
    }

    // If bookingId is in metadata, update booking status
    const bookingId = metadata?.bookingId;
    if (bookingId) {
      const { error: bookingError } = await supabaseAdmin
        .from('booking_requests')
        .update({
          status: 'payment_failed',
        })
        .eq('id', bookingId);

      if (bookingError) {
        console.error(
          'Error updating booking status to payment_failed:',
          bookingError
        );
      }

      // Create notification for customer about payment failure
      const { data: booking } = await supabaseAdmin
        .from('booking_requests')
        .select('customer_id, service_name, business_name')
        .eq('id', bookingId)
        .single();

      if (booking) {
        // notifications table only has: id, user_id, type, title, message, read, created_at
        await supabaseAdmin.from('notifications').insert([
          {
            user_id: booking.customer_id,
            type: 'payment_failed',
            title: 'Payment Failed',
            message: `Your payment for ${booking.service_name} could not be processed. Please try again.`,
          },
        ]);
      }

      console.log(`⚠️ Updated booking ${bookingId} to payment_failed`);
    }

    console.log(`❌ Payment ${paymentIntentId} marked as failed: ${reason}`);
    return { success: true };
  } catch (error) {
    console.error('Error in updatePaymentOnFailure:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Handle refund events from Stripe
 * @param paymentIntentId - The Stripe PaymentIntent ID (from charge.payment_intent)
 * @param chargeId - The Stripe Charge ID
 * @param refundedAmount - The amount refunded in smallest currency unit (pence)
 */
export async function updatePaymentOnRefund(
  paymentIntentId: string,
  chargeId: string,
  refundedAmount: number
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - skipping refund update');
    return { success: true };
  }

  try {
    // Update payment status to 'refunded' with refund details
    const { data: paymentData, error: paymentError } = await supabaseAdmin
      .from('payments')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString(),
        refund_amount: refundedAmount / 100, // Convert from pence to pounds
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
      .select('booking_id')
      .single();

    if (paymentError) {
      console.error('Error updating payment to refunded:', paymentError);
      // Continue to try booking update if we have the ID
    }

    // Update associated booking status
    if (paymentData?.booking_id) {
      const { error: bookingError } = await supabaseAdmin
        .from('booking_requests')
        .update({
          status: 'refunded',
        })
        .eq('id', paymentData.booking_id);

      if (bookingError) {
        console.error(
          'Error updating booking status to refunded:',
          bookingError
        );
      }

      // Create notification for customer
      const { data: booking } = await supabaseAdmin
        .from('booking_requests')
        .select('customer_id, service_name, business_name')
        .eq('id', paymentData.booking_id)
        .single();

      if (booking) {
        // notifications table only has: id, user_id, type, title, message, read, created_at
        await supabaseAdmin.from('notifications').insert([
          {
            user_id: booking.customer_id,
            type: 'payment_refunded',
            title: 'Refund Processed',
            message: `Your refund of £${(refundedAmount / 100).toFixed(2)} for ${booking.service_name} has been processed.`,
          },
        ]);
      }

      console.log(`💸 Updated booking ${paymentData.booking_id} to refunded`);
    }

    console.log(
      `💸 Payment ${paymentIntentId} marked as refunded (£${(refundedAmount / 100).toFixed(2)})`
    );
    return { success: true };
  } catch (error) {
    console.error('Error in updatePaymentOnRefund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a payment record in the database
 * @param paymentData - Payment data to insert
 *
 * Note: payments table schema columns:
 * id, booking_id, stripe_payment_intent_id, amount, status, paid_at, created_at,
 * refunded_at, refund_amount, failure_reason
 */
export async function createPaymentRecord(paymentData: {
  stripe_payment_intent_id: string;
  booking_id?: string | null;
  amount: number;
  status: string;
}): Promise<{ success: boolean; payment?: any; error?: string }> {
  if (!isSupabaseConfigured()) {
    console.warn(
      '⚠️ Supabase not configured - skipping payment record creation'
    );
    return { success: true };
  }

  try {
    // Only insert columns that exist in the payments table
    const record: Record<string, any> = {
      stripe_payment_intent_id: paymentData.stripe_payment_intent_id,
      amount: paymentData.amount,
      status: paymentData.status,
      created_at: new Date().toISOString(),
    };

    // Only add booking_id if it's a valid UUID (not null/undefined)
    if (paymentData.booking_id) {
      record.booking_id = paymentData.booking_id;
    }

    const { data, error } = await supabaseAdmin
      .from('payments')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment record:', error);
      return { success: false, error: error.message };
    }

    console.log(
      `✅ Created payment record for ${paymentData.stripe_payment_intent_id}`
    );
    return { success: true, payment: data };
  } catch (error) {
    console.error('Error in createPaymentRecord:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
