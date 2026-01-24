import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAuth } from '@/lib/api-auth';

// Use service role key to bypass RLS for notification operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/notifications - Get notifications for the authenticated user
 *
 * The notification system stores user_id as the PROFILE ID (not auth user ID).
 * This endpoint maps the auth user ID to the profile ID before querying.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    // Look up the profile ID from the auth user ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (profileError || !profile) {
      // User might not have a profile yet - return empty notifications
      console.log('No profile found for user:', user!.id);
      return NextResponse.json({ success: true, notifications: [] });
    }

    // Fetch notifications using the profile ID
    const { data: notifications, error: notifError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (notifError) {
      console.error('Error fetching notifications:', notifError);
      return NextResponse.json({ error: notifError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      profileId: profile.id, // Return profile ID for real-time subscription
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications - Mark notification(s) as read
 * Body: { notificationId: string } or { markAllRead: true }
 */
export async function PATCH(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    // Look up the profile ID from the auth user ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
    }

    if (markAllRead) {
      // Mark all notifications as read for this user
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else if (notificationId) {
      // Mark single notification as read (verify it belongs to this user)
      const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', profile.id);

      if (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'notificationId or markAllRead is required' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications - Delete a notification
 * Query params: id (notification ID to delete)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const { user, error: authError } = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Look up the profile ID from the auth user ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', user!.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 400 });
    }

    // Delete the notification (verify it belongs to this user)
    const { error } = await supabaseAdmin
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', profile.id);

    if (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete notification' },
      { status: 500 }
    );
  }
}
