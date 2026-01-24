'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomerNotification {
  id: string;
  customerId: string;
  bookingRequestId: string;
  type:
    | 'booking_accepted'
    | 'booking_declined'
    | 'booking_completed'
    | 'booking_cancelled';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  businessName?: string;
  serviceName?: string;
}

interface NotificationsState {
  notifications: CustomerNotification[];
  addNotification: (
    notification: Omit<CustomerNotification, 'id' | 'createdAt' | 'isRead'>
  ) => string;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (customerId: string) => void;
  getNotificationsForCustomer: (customerId: string) => CustomerNotification[];
  getUnreadCount: (customerId: string) => number;
  deleteNotification: (notificationId: string) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notificationData) => {
        const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: CustomerNotification = {
          ...notificationData,
          id,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));

        return id;
      },

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        }));
      },

      markAllAsRead: (customerId) => {
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.customerId === customerId
              ? { ...notification, isRead: true }
              : notification
          ),
        }));
      },

      getNotificationsForCustomer: (customerId) => {
        return get().notifications.filter(
          (notification) => notification.customerId === customerId
        );
      },

      getUnreadCount: (customerId) => {
        return get().notifications.filter(
          (notification) =>
            notification.customerId === customerId && !notification.isRead
        ).length;
      },

      deleteNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== notificationId
          ),
        }));
      },
    }),
    {
      name: 'customer-notifications-storage',
    }
  )
);

// Hook for customer notifications
export const useCustomerNotifications = (customerId: string) => {
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    getNotificationsForCustomer,
    getUnreadCount,
    deleteNotification,
  } = useNotificationsStore();

  const customerNotifications = getNotificationsForCustomer(customerId);
  const unreadCount = getUnreadCount(customerId);

  return {
    notifications: customerNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
