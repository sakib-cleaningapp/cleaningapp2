'use client';

import { supabase, isSupabaseReady } from '@/lib/supabase';

// Type for creating a notification
// Note: notifications table ONLY has: id, user_id, type, title, message, read, created_at
export interface CreateNotificationInput {
  user_id: string;
  type: string;
  title: string;
  message: string;
}

/**
 * Notifications API - All notification-related database operations
 *
 * IMPORTANT: notifications table schema:
 * id, user_id, type, title, message, read, created_at
 *
 * Columns that DO NOT exist: user_type, booking_id, business_id, metadata, read_at
 *
 * NOTE: The notifications table uses PROFILE IDs, not auth user IDs.
 * The API endpoint handles the mapping from auth user ID to profile ID.
 */
export const notificationsApi = {
  /**
   * Get all notifications for the current user
   * Uses API endpoint to properly map auth user ID to profile ID
   */
  async getUserNotifications(userId: string) {
    // If Supabase is not configured, return empty array
    if (!isSupabaseReady()) {
      return { success: true, notifications: [] };
    }

    try {
      // Get auth token for API call
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.warn('No auth session for fetching notifications');
        return { success: true, notifications: [] };
      }

      // Use API endpoint which maps auth user ID to profile ID
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch notifications');
      }

      return {
        success: true,
        notifications: result.notifications || [],
        profileId: result.profileId, // For real-time subscription
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: 'Failed to fetch notifications',
        notifications: [],
      };
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadCount(userId: string) {
    // If Supabase is not configured, return 0
    if (!isSupabaseReady()) {
      return { success: true, count: 0 };
    }

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: 'Failed to fetch unread count',
        count: 0,
      };
    }
  },

  /**
   * Mark notification as read
   * Uses API endpoint to properly handle auth
   */
  async markAsRead(notificationId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ notificationId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark notification as read');
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  },

  /**
   * Mark all notifications as read for a user
   * Uses API endpoint to properly handle auth
   */
  async markAllAsRead(userId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || 'Failed to mark all notifications as read'
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: 'Failed to mark all notifications as read',
      };
    }
  },

  /**
   * Delete a notification
   * Uses API endpoint to properly handle auth
   */
  async deleteNotification(notificationId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete notification');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { success: false, error: 'Failed to delete notification' };
    }
  },

  /**
   * Subscribe to real-time notifications
   */
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    // If Supabase is not configured, return no-op unsubscribe function
    if (!isSupabaseReady()) {
      return () => {};
    }

    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Create a notification (typically used internally by other APIs)
   */
  async createNotification(notificationData: CreateNotificationInput) {
    // If Supabase is not configured, return mock data
    if (!isSupabaseReady()) {
      return {
        success: true,
        notification: {
          id: `mock-notification-${Date.now()}`,
          ...notificationData,
          read: false,
          created_at: new Date().toISOString(),
        },
      };
    }

    try {
      // Only insert valid columns: user_id, type, title, message
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: notificationData.user_id,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return { success: true, notification: data };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create notification',
      };
    }
  },
};
