'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Calendar,
  MessageCircle,
  Star,
  AlertCircle,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/use-notifications';
import { useAuth } from '@/contexts/auth-context';

interface UnifiedNotificationsPanelProps {
  className?: string;
}

// Get icon and color based on notification type
function getNotificationStyle(type: string) {
  switch (type) {
    case 'booking_request':
    case 'booking_accepted':
    case 'booking_declined':
    case 'booking_cancelled':
    case 'booking':
      return {
        icon: Calendar,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
      };
    case 'message':
    case 'new_message':
      return {
        icon: MessageCircle,
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
      };
    case 'review':
    case 'new_review':
      return {
        icon: Star,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-600',
      };
    case 'refund':
    case 'payment':
      return {
        icon: AlertCircle,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
      };
    default:
      return {
        icon: Bell,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
      };
  }
}

// Format time ago
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

// Get navigation link for notification
function getNotificationLink(notification: Notification): string | null {
  const type = notification.type.toLowerCase();

  if (type.includes('booking')) {
    // Check if this is a business notification
    if (type === 'booking_request') {
      return '/business/dashboard';
    }
    return '/my-bookings';
  }

  if (type.includes('message')) {
    return '/my-messages';
  }

  if (type.includes('review')) {
    return '/business/dashboard';
  }

  return null;
}

export function UnifiedNotificationsPanel({
  className = '',
}: UnifiedNotificationsPanelProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render if not logged in
  if (!user) {
    return null;
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    const link = getNotificationLink(notification);
    if (link) {
      setIsOpen(false);
      // Navigation will happen via Link component
    }
  };

  return (
    <div className={`relative ${className}`} ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.slice(0, 20).map((notification) => {
                  const style = getNotificationStyle(notification.type);
                  const Icon = style.icon;
                  const link = getNotificationLink(notification);

                  const content = (
                    <div
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-sky-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div
                        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${style.bgColor}`}
                      >
                        <Icon className={`w-4 h-4 ${style.textColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium ${
                              !notification.read
                                ? 'text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="flex-shrink-0 w-2 h-2 bg-sky-500 rounded-full mt-1.5" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );

                  return (
                    <li key={notification.id} className="group">
                      {link ? <Link href={link}>{content}</Link> : content}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Showing latest {Math.min(notifications.length, 20)} of{' '}
                {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
