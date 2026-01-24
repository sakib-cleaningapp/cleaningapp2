'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApi } from '@/lib/api/notifications';
import { useAuth } from '@/contexts/auth-context';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const profileIdRef = useRef<string | null>(null);

  // Fetch notifications from database via API
  // The API maps auth user ID to profile ID
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await notificationsApi.getUserNotifications(user.id);

      if (result.success) {
        setNotifications(result.notifications || []);
        // Store the profile ID for real-time subscription
        if (result.profileId) {
          profileIdRef.current = result.profileId;
        }
      } else {
        setError(result.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Subscribe to real-time notifications using profile ID
  useEffect(() => {
    if (!user?.id) return;

    // Initial fetch
    fetchNotifications();

    // Set up polling as fallback for real-time updates
    // This ensures notifications appear even if Supabase real-time has issues
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    // Subscribe to real-time updates using profile ID once we have it
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = () => {
      if (profileIdRef.current) {
        unsubscribe = notificationsApi.subscribeToNotifications(
          profileIdRef.current, // Use profile ID, not auth user ID
          (payload) => {
            // Add new notification to the top of the list
            if (payload.new) {
              setNotifications((prev) => [
                payload.new as Notification,
                ...prev,
              ]);
            }
          }
        );
      }
    };

    // Delay subscription setup to allow fetchNotifications to set profileIdRef
    const subscriptionTimeout = setTimeout(setupSubscription, 1000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(subscriptionTimeout);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationsApi.markAsRead(notificationId);

      if (result.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const result = await notificationsApi.markAllAsRead(user.id);

      if (result.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [user?.id]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationsApi.deleteNotification(notificationId);

      if (result.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, []);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
