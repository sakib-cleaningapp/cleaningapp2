'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BusinessNotification {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  bookingRequestId: string;
  type: 'new_booking_request' | 'booking_cancelled' | 'customer_message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  serviceName?: string;
  requestedDate?: string;
  requestedTime?: string;
  totalCost?: number;
}

interface BusinessNotificationsState {
  notifications: BusinessNotification[];
  addNotification: (
    notification: Omit<BusinessNotification, 'id' | 'createdAt' | 'isRead'>
  ) => string;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (businessId: string) => void;
  getNotificationsForBusiness: (businessId: string) => BusinessNotification[];
  getUnreadCount: (businessId: string) => number;
  deleteNotification: (notificationId: string) => void;
}

export const useBusinessNotificationsStore =
  create<BusinessNotificationsState>()(
    persist(
      (set, get) => ({
        notifications: [],

        addNotification: (notificationData) => {
          const id = `biz-notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newNotification: BusinessNotification = {
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

        markAllAsRead: (businessId) => {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.businessId === businessId
                ? { ...notification, isRead: true }
                : notification
            ),
          }));
        },

        getNotificationsForBusiness: (businessId) => {
          return get().notifications.filter(
            (notification) => notification.businessId === businessId
          );
        },

        getUnreadCount: (businessId) => {
          return get().notifications.filter(
            (notification) =>
              notification.businessId === businessId && !notification.isRead
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
        name: 'business-notifications-storage',
      }
    )
  );

// Hook for business notifications
export const useBusinessNotifications = (businessId: string) => {
  const {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    getNotificationsForBusiness,
    getUnreadCount,
    deleteNotification,
  } = useBusinessNotificationsStore();

  const businessNotifications = getNotificationsForBusiness(businessId);
  const unreadCount = getUnreadCount(businessId);

  return {
    notifications: businessNotifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};
