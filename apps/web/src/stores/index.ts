// Authentication Store
export { useAuthStore } from './auth-store';
export type { User, UserRole } from './auth-store';

// UI Store
export { useUIStore } from './ui-store';
export type { Notification } from './ui-store';

// Store utilities
export const resetAllStores = () => {
  // Reset auth store
  useAuthStore.getState().logout();

  // Reset UI store
  useUIStore.getState().clearNotifications();
  useUIStore.getState().setSidebarOpen(false);
};
