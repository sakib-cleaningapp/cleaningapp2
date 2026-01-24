import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: Date;
}

interface UIState {
  // State
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  isPageLoading: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setPageLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      theme: 'light',
      notifications: [],
      isPageLoading: false,

      // Actions
      toggleSidebar: () =>
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          'ui/toggleSidebar'
        ),

      setSidebarOpen: (open) =>
        set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

      setTheme: (theme) => set({ theme }, false, 'ui/setTheme'),

      addNotification: (notificationData) => {
        const notification: Notification = {
          ...notificationData,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        };

        set(
          (state) => ({
            notifications: [...state.notifications, notification],
          }),
          false,
          'ui/addNotification'
        );
      },

      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'ui/removeNotification'
        ),

      clearNotifications: () =>
        set({ notifications: [] }, false, 'ui/clearNotifications'),

      setPageLoading: (loading) =>
        set({ isPageLoading: loading }, false, 'ui/setPageLoading'),
    }),
    { name: 'ui-store' }
  )
);
