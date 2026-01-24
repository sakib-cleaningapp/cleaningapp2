import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

// Use service role key to bypass RLS for message operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Helper to get profile ID for authenticated user
 */
async function getProfileId(authUserId: string) {
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .single();

  if (error || !profile) {
    return null;
  }
  return profile.id;
}

/**
 * GET /api/messages/customer - Get messages for the authenticated customer
 *
 * The messages system stores sender_id and recipient_customer_id as PROFILE IDs (not auth user IDs).
 * This endpoint maps the auth user ID to the profile ID before querying.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    // Map auth user ID to profile ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (profileError || !profile) {
      // User might not have a profile yet - return empty messages
      console.log('No profile found for user:', user!.id);
      return NextResponse.json({
        success: true,
        messages: [],
        profileId: null,
      });
    }

    // Step 1: Get all messages where customer is the sender
    const { data: customerMessages } = await supabaseAdmin
      .from('messages')
      .select('id, conversation_id')
      .eq('sender_id', profile.id);

    const customerMessageIds = customerMessages?.map((m) => m.id) || [];
    const conversationIds =
      customerMessages?.map((m) => m.conversation_id).filter(Boolean) || [];

    // Step 1b: Get all booking IDs for this customer
    // Messages related to bookings use booking_id as conversation_id
    const { data: customerBookings } = await supabaseAdmin
      .from('booking_requests')
      .select('id')
      .eq('customer_id', profile.id);

    const bookingIds = customerBookings?.map((b) => b.id) || [];

    // Step 2: Query for all related messages
    // - Messages the customer sent (sender_id = profile.id)
    // - Replies to customer messages (parent_message_id in customerMessageIds)
    // - Messages in same conversations (conversation_id in conversationIds)
    // - Messages related to customer's bookings (conversation_id in bookingIds)
    let filters: string[] = [`sender_id.eq.${profile.id}`];

    if (customerMessageIds.length > 0) {
      filters.push(`parent_message_id.in.(${customerMessageIds.join(',')})`);
    }
    if (conversationIds.length > 0) {
      filters.push(`conversation_id.in.(${conversationIds.join(',')})`);
    }
    // Include messages from booking responses (where conversation_id = booking_id)
    if (bookingIds.length > 0) {
      filters.push(`conversation_id.in.(${bookingIds.join(',')})`);
    }

    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(filters.join(','))
      .order('created_at', { ascending: false });

    if (msgError) {
      console.error('Error fetching customer messages:', msgError);
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    // Calculate unread count - count business replies that haven't been read
    const unreadCount =
      messages?.filter((m: any) => m.sender_type === 'business' && !m.is_read)
        .length || 0;

    return NextResponse.json({
      success: true,
      messages: messages || [],
      profileId: profile.id,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Error fetching customer messages:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/messages/customer - Mark messages as read
 *
 * Request body can contain:
 * - messageId: string - mark a single message as read
 * - messageIds: string[] - mark multiple messages as read
 * - conversationId: string - mark all messages in a conversation as read
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const profileId = await getProfileId(user!.id);
    if (!profileId) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { messageId, messageIds, conversationId } = body;

    if (conversationId) {
      // Mark all business messages in this conversation as read
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'business')
        .eq('is_read', false);

      if (error) {
        console.error('Error marking conversation messages as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (messageId) {
      // Mark a single message as read
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .eq('sender_type', 'business');

      if (error) {
        console.error('Error marking message as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
      // Mark multiple messages as read
      const { error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('sender_type', 'business');

      if (error) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'messageId, messageIds, or conversationId is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
