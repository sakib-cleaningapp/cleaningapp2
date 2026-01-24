import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for message operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/messages/business-to-customer - Send a message from a business to a customer
 *
 * This endpoint creates a message that the customer can see in their messages,
 * and also creates a notification for the customer.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      businessName,
      customerId,
      customerEmail,
      subject,
      message,
      // bookingId is passed but not used yet - could be used in future for linking messages to bookings
      messageType = 'booking',
    } = body;

    // Validate required fields
    if (!businessId || !businessName) {
      return NextResponse.json(
        { error: 'businessId and businessName are required' },
        { status: 400 }
      );
    }

    if (!customerId || !customerEmail) {
      return NextResponse.json(
        { error: 'customerId and customerEmail are required' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'subject and message are required' },
        { status: 400 }
      );
    }

    // Get the business owner's profile ID for sender_id (FK constraint requires profile ID)
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('owner_id')
      .eq('id', businessId)
      .single();

    if (!business?.owner_id) {
      console.error(
        'Could not find business owner for businessId:',
        businessId
      );
      return NextResponse.json(
        { error: 'Business owner not found' },
        { status: 400 }
      );
    }

    // Generate a unique conversation ID for this message thread
    const conversationId = `biz-${businessId}-cust-${customerId}-${Date.now()}`;

    // Insert the message
    // For business-to-customer messages, we store with:
    // - sender_id = owner_id (the business owner's profile ID, required by FK constraint)
    // - recipient_business_id = businessId (needed for the schema, business can see replies)
    // - sender_type = 'business' to indicate it's from the business
    // - sender_business_id = businessId for proper identification
    const { data: messageData, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          sender_id: business.owner_id, // Use owner's profile ID (FK to profiles)
          recipient_business_id: businessId, // Business can see the thread
          sender_name: businessName,
          sender_email: customerEmail, // Store customer email for reference
          subject: subject,
          message: message,
          message_type: messageType,
          is_urgent: false,
          is_read: false,
          sender_type: 'business',
          sender_business_id: businessId,
          conversation_id: conversationId,
        },
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Error inserting message:', messageError);
      return NextResponse.json(
        { error: messageError.message },
        { status: 500 }
      );
    }

    // Create notification for the customer
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          user_id: customerId,
          type: 'business_message',
          title: `Message from ${businessName}`,
          message:
            subject +
            (message.length > 100
              ? ': ' + message.substring(0, 100) + '...'
              : ': ' + message),
          read: false,
        },
      ]);

    if (notificationError) {
      console.error(
        'Error creating notification (continuing anyway):',
        notificationError
      );
      // Don't fail the request if notification creation fails
    }

    return NextResponse.json({
      success: true,
      message: messageData,
    });
  } catch (error: unknown) {
    console.error('Error sending business message to customer:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to send message';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
