import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for message operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/messages - Send a message to a business
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      senderId,
      recipientBusinessId,
      senderName,
      senderEmail,
      senderPhone,
      subject,
      message,
      messageType = 'general',
      isUrgent = false,
    } = body;

    // Validate required fields
    if (!recipientBusinessId) {
      return NextResponse.json(
        { error: 'recipientBusinessId is required' },
        { status: 400 }
      );
    }

    if (!senderName || !senderEmail) {
      return NextResponse.json(
        { error: 'senderName and senderEmail are required' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'subject and message are required' },
        { status: 400 }
      );
    }

    // Insert the message
    const { data: messageData, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert([
        {
          sender_id: senderId || null,
          recipient_business_id: recipientBusinessId,
          sender_name: senderName,
          sender_email: senderEmail,
          sender_phone: senderPhone || null,
          subject: subject,
          message: message,
          message_type: messageType,
          is_urgent: isUrgent,
          is_read: false,
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

    // Create notification for the business owner
    // First, get the business owner's profile ID
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('owner_id')
      .eq('id', recipientBusinessId)
      .single();

    if (business?.owner_id) {
      await supabaseAdmin.from('notifications').insert([
        {
          user_id: business.owner_id,
          type: isUrgent ? 'urgent_message' : 'new_message',
          title: isUrgent
            ? `Urgent: New message from ${senderName}`
            : `New message from ${senderName}`,
          message: subject,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: messageData,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages - Get messages for a business
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      );
    }

    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('recipient_business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
