'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X, Calendar } from 'lucide-react';
import { CustomerNotification } from '@/stores/notifications-store';

interface ToastNotificationProps {
  notification: CustomerNotification;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
  index?: number;
}

export function ToastNotification({
  notification,
  onClose,
  autoClose = true,
  duration = 5000,
  index = 0,
}: ToastNotificationProps) {
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
      case 'booking_accepted':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'booking_declined':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'booking_completed':
        return <CheckCircle className="w-6 h-6 text-blue-600" />;
      case 'booking_cancelled':
        return <XCircle className="w-6 h-6 text-orange-600" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-600" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'booking_accepted':
        return 'border-l-green-500';
      case 'booking_declined':
        return 'border-l-red-500';
      case 'booking_completed':
        return 'border-l-blue-500';
      case 'booking_cancelled':
        return 'border-l-orange-500';
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
            {notification.businessName && (
              <p className="text-gray-500 text-xs mt-2">
                From {notification.businessName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Toast container to manage multiple toasts
interface ToastContainerProps {
  notifications: CustomerNotification[];
  onRemoveNotification: (id: string) => void;
}

export function ToastContainer({
  notifications,
  onRemoveNotification,
}: ToastContainerProps) {
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
        <ToastNotification
          key={notification.id}
          notification={notification}
          onClose={() => handleCloseToast(notification.id)}
          index={index}
        />
      ))}
    </>
  );
}
