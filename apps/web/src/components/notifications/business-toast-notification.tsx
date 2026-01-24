'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Bell, X, Mail } from 'lucide-react';
import { BusinessNotification } from '@/stores/business-notifications-store';

interface BusinessToastNotificationProps {
  notification: BusinessNotification;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  index?: number;
}

export function BusinessToastNotification({
  notification,
  onClose,
  autoClose = true,
  duration = 5000,
  index = 0,
}: BusinessToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Slide in animation
    setTimeout(() => setIsVisible(true), 100);

    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'new_booking_request':
        return <Bell className="w-6 h-6 text-blue-600" />;
      case 'booking_cancelled':
        return <X className="w-6 h-6 text-red-600" />;
      case 'customer_message':
        return <Mail className="w-6 h-6 text-green-600" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-600" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'new_booking_request':
        return 'border-l-blue-500';
      case 'booking_cancelled':
        return 'border-l-red-500';
      case 'customer_message':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  return (
    <div
      className={`fixed right-4 z-50 transition-all duration-300 transform ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      }`}
      style={{ top: `${20 + index * 80}px` }}
    >
      <div
        className={`bg-white rounded-lg shadow-lg border-l-4 ${getBorderColor()} p-4 pr-8 max-w-sm relative`}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          <div className="flex-1">
            <h4 className="font-medium text-gray-900 text-sm mb-1">
              {notification.title}
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {notification.message}
            </p>
            {notification.serviceName && (
              <p className="text-gray-500 text-xs mt-2">
                Service: {notification.serviceName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Business Toast container
interface BusinessToastContainerProps {
  notifications: BusinessNotification[];
  onRemoveNotification: (id: string) => void;
}

export function BusinessToastContainer({
  notifications,
  onRemoveNotification,
}: BusinessToastContainerProps) {
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(
    new Set()
  );

  // Filter to show only unread notifications that haven't been dismissed
  const toastsToShow = notifications.filter(
    (notification) =>
      !notification.isRead && !dismissedToasts.has(notification.id)
  );

  const handleCloseToast = (notificationId: string) => {
    setDismissedToasts((prev) => new Set([...prev, notificationId]));
    onRemoveNotification(notificationId);
  };

  return (
    <>
      {toastsToShow.map((notification, index) => (
        <BusinessToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => handleCloseToast(notification.id)}
          index={index}
        />
      ))}
    </>
  );
}
