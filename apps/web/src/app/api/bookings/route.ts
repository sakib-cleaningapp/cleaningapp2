import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

// Use service role key to bypass RLS for booking operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/bookings - Get bookings
 * Query params:
 *   - type: 'customer' | 'business' (default: 'customer')
 *   - businessId: string (required if type is 'business')
 *
 * Note: Customer bookings require Supabase auth to look up profile ID.
 * Business bookings don't require auth since businessId is provided directly
 * (business portal uses localStorage auth, not Supabase).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'customer';
    const businessId = searchParams.get('businessId');

    let query = supabaseAdmin
      .from('booking_requests')
      .select(
        `
        *,
        payment:payments(*)
      `
      )
      .order('created_at', { ascending: false });

    if (type === 'customer') {
      // Customer bookings require auth to look up profile ID
      const { user, error: authError } = await requireAuth(request);
      if (authError) return authError;

      // Look up the profile ID from the auth user ID
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();

      if (profileError || !profile) {
        console.error('Error finding profile:', profileError);
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 400 }
        );
      }

      query = query.eq('customer_id', profile.id);
    } else if (type === 'business' && businessId) {
      // Business bookings - businessId is provided directly
      // Business portal uses localStorage auth, not Supabase
      query = query.eq('business_id', businessId);
    } else {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      );
    }

    const { data: bookings, error: bookingsError } = await query;

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json(
        { error: bookingsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookings - Update booking status
 * Body: { bookingId, status, responseMessage?, cancelledBy?, cancellationReason? }
 *
 * Note: Business portal uses localStorage auth, not Supabase auth,
 * so we don't require auth for this endpoint.
 *
 * When status is 'cancelled' and the booking has a payment:
 * - Automatically triggers a refund via Stripe
 * - Stores refund status on the booking
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      bookingId,
      status,
      responseMessage,
      cancelledBy,
      cancellationReason,
    } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'bookingId and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['accepted', 'declined', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Invalid status. Must be one of: ' + validStatuses.join(', '),
        },
        { status: 400 }
      );
    }

    // Build update object - only include core fields first
    const updateData: Record<string, any> = { status };

    // Add cancellation fields if cancelling
    if (status === 'cancelled') {
      if (cancelledBy) updateData.cancelled_by = cancelledBy;
      if (cancellationReason)
        updateData.cancellation_reason = cancellationReason;
    }

    // Update the booking status using service role key (bypasses RLS)
    const { data: booking, error: updateError } = await supabaseAdmin
      .from('booking_requests')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking status:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Try to store response_message on booking (column may not exist yet)
    if (responseMessage) {
      const { error: rmError } = await supabaseAdmin
        .from('booking_requests')
        .update({ response_message: responseMessage })
        .eq('id', bookingId);
      if (rmError) {
        console.log(
          'Note: response_message column may not exist yet:',
          rmError.message
        );
        // Don't fail - we'll still create the message in messages table
      }
    }

    // If cancelling, check for payment and trigger refund
    let refundResult = null;
    if (status === 'cancelled') {
      // Check if booking has a payment
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('stripe_payment_intent_id, status')
        .eq('booking_id', bookingId)
        .single();

      if (payment?.stripe_payment_intent_id && payment.status === 'succeeded') {
        console.log(`💰 Booking ${bookingId} has payment - triggering refund`);

        // Mark refund as pending
        await supabaseAdmin
          .from('booking_requests')
          .update({ refund_status: 'pending' })
          .eq('id', bookingId);

        try {
          // Get business Stripe account if this was a Connect payment
          const { data: stripeAccount } = await supabaseAdmin
            .from('business_stripe_accounts')
            .select('stripe_connect_account_id')
            .eq('business_id', booking.business_id)
            .single();

          // Call internal refund endpoint with service key for authorization
          const refundResponse = await fetch(
            new URL('/api/stripe/refund', request.url).toString(),
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                // Use internal service header for server-to-server call
                'x-internal-service':
                  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
              },
              body: JSON.stringify({
                paymentIntentId: payment.stripe_payment_intent_id,
                stripeConnectAccountId:
                  stripeAccount?.stripe_connect_account_id,
              }),
            }
          );

          refundResult = await refundResponse.json();

          if (refundResult.success) {
            // Update booking with refund info
            await supabaseAdmin
              .from('booking_requests')
              .update({
                refund_status: 'processed',
                refund_id: refundResult.refundId,
              })
              .eq('id', bookingId);
            console.log(`✅ Refund processed: ${refundResult.refundId}`);
          } else {
            // Mark refund as failed
            await supabaseAdmin
              .from('booking_requests')
              .update({ refund_status: 'failed' })
              .eq('id', bookingId);
            console.error('Refund failed:', refundResult.error);
          }
        } catch (refundError) {
          console.error('Error triggering refund:', refundError);
          await supabaseAdmin
            .from('booking_requests')
            .update({ refund_status: 'failed' })
            .eq('id', bookingId);
        }
      }
    }

    // Create notification for customer
    const notificationTitle =
      status === 'accepted'
        ? 'Booking Confirmed!'
        : status === 'completed'
          ? 'Service Completed'
          : status === 'declined'
            ? 'Booking Update'
            : 'Booking Cancelled';

    let notificationMessage =
      responseMessage ||
      `Your ${booking.service_name} booking has been ${status}.`;

    // Add refund info to cancellation notification
    if (status === 'cancelled' && refundResult?.success) {
      notificationMessage +=
        ' A refund has been initiated and should appear in your account within 5-10 business days.';
    }

    const { error: notifError } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: booking.customer_id,
          type: `booking_${status}`,
          title: notificationTitle,
          message: notificationMessage,
        },
      ]);

    if (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail - booking was updated
    }

    // If there's a response message, also create a message in the messages table
    // so customers can see it in their "My Messages" page
    if (responseMessage && (status === 'accepted' || status === 'declined')) {
      try {
        // Get business info including owner_id for the message
        const { data: business } = await supabaseAdmin
          .from('businesses')
          .select('business_name, owner_id')
          .eq('id', booking.business_id)
          .single();

        const businessName =
          business?.business_name || booking.business_name || 'Business';
        const subject =
          status === 'accepted'
            ? `Booking Confirmed: ${booking.service_name}`
            : `Booking Update: ${booking.service_name}`;

        // Insert message into messages table
        // sender_id must reference profiles table (FK constraint), so we use owner's profile ID
        // sender_type = 'business' to identify this is from a business
        const { error: msgError } = await supabaseAdmin
          .from('messages')
          .insert([
            {
              // sender_id must be a profile ID (FK constraint)
              // Use business owner's profile ID since businesses don't have profiles
              sender_id: business?.owner_id || null,
              recipient_business_id: booking.business_id,
              sender_name: businessName,
              sender_email: booking.customer_email,
              subject: subject,
              message: responseMessage,
              message_type: 'booking',
              is_urgent: false,
              is_read: false,
              sender_type: 'business',
              sender_business_id: booking.business_id,
              // Use booking_id as conversation_id so customer can find this message
              // This links the message to the booking for easy retrieval
              conversation_id: booking.id,
            },
          ]);

        if (msgError) {
          console.error('Error creating booking response message:', msgError);
          console.error('Message data:', {
            sender_id: business?.owner_id,
            booking_id: booking.id,
            business_id: booking.business_id,
          });
          // Don't fail - booking was updated and notification was sent
        } else {
          console.log(
            `📩 Created message for customer about booking ${status}`
          );
        }
      } catch (msgInsertError) {
        console.error(
          'Error inserting booking response message:',
          msgInsertError
        );
        // Don't fail - booking was updated and notification was sent
      }
    }

    // If business cancelled, also notify business owner
    if (status === 'cancelled' && cancelledBy === 'business') {
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('owner_id')
        .eq('id', booking.business_id)
        .single();

      if (business?.owner_id) {
        await supabaseAdmin.from('notifications').insert([
          {
            user_id: business.owner_id,
            type: 'booking_cancelled_by_business',
            title: 'Booking Cancelled',
            message: `You cancelled ${booking.customer_name}'s ${booking.service_name} booking.${refundResult?.success ? ' Refund has been processed.' : ''}`,
          },
        ]);
      }
    }

    return NextResponse.json({
      success: true,
      booking,
      refund: refundResult,
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { bookingData, paymentData } = body;

    // Look up the profile ID from the auth user ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (profileError || !profile) {
      console.error('Error finding profile:', profileError);
      return NextResponse.json(
        { error: 'Customer profile not found' },
        { status: 400 }
      );
    }

    // Build booking record
    const bookingRecord = {
      customer_id: profile.id,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email,
      business_id: bookingData.business_id,
      business_name: bookingData.business_name,
      service_id: bookingData.service_id,
      service_name: bookingData.service_name,
      requested_date: bookingData.requested_date,
      requested_time: bookingData.requested_time,
      total_cost: bookingData.total_cost,
      platform_fee: bookingData.platform_fee,
      status: 'pending',
    };

    // Create booking request
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('booking_requests')
      .insert([bookingRecord])
      .select()
      .single();

    if (bookingError) {
      console.error('Booking insert error:', bookingError);
      return NextResponse.json(
        { error: bookingError.message },
        { status: 500 }
      );
    }

    // Create payment record
    const paymentRecord = {
      booking_id: booking.id,
      stripe_payment_intent_id:
        paymentData.stripe_payment_intent_id || `pi_${Date.now()}`,
      amount: paymentData.amount,
      status: 'succeeded',
      paid_at: new Date().toISOString(),
    };

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert([paymentRecord])
      .select()
      .single();

    if (paymentError) {
      console.error('Payment insert error:', paymentError);
      // Don't fail - booking was created
    }

    // Create notification for business owner
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('owner_id')
      .eq('id', bookingData.business_id)
      .single();

    if (business?.owner_id) {
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: business.owner_id,
          type: 'new_booking_request',
          title: 'New Booking Request!',
          message: `${bookingData.customer_name} has requested ${bookingData.service_name} for ${new Date(bookingData.requested_date).toLocaleDateString()}`,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      booking,
      payment,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create booking' },
      { status: 500 }
    );
  }
}
