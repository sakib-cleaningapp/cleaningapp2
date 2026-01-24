import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreDemo } from '@/components/examples/store-demo';
import { useAuthStore, useUIStore } from '@/stores';

// Reset stores before each test
beforeEach(() => {
  useAuthStore.getState().logout();
  useUIStore.getState().clearNotifications();
  useUIStore.getState().setSidebarOpen(false);
});

describe('Store Integration Tests', () => {
  it('authentication flow works end-to-end', async () => {
    const user = userEvent.setup();
    render(<StoreDemo />);

    // Initially not logged in
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
    expect(screen.getByText('Demo Login')).toBeInTheDocument();

    // Click login
    await user.click(screen.getByText('Demo Login'));

    // Should be logged in now
    expect(screen.getByText('Demo User')).toBeInTheDocument();
    expect(screen.getByText('demo@cleanly.com')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Should have login notification
    expect(screen.getByText('Login Successful')).toBeInTheDocument();

    // Click logout
    await user.click(screen.getByText('Logout'));

    // Should be logged out
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
    expect(screen.getByText('Logged Out')).toBeInTheDocument();
  });

  it('UI state management works correctly', async () => {
    const user = userEvent.setup();
    render(<StoreDemo />);

    // Initially sidebar closed
    expect(screen.getByText('Closed')).toBeInTheDocument();

    // Toggle sidebar
    await user.click(screen.getByText('Toggle Sidebar'));
    expect(screen.getByText('Open')).toBeInTheDocument();

    // Toggle back
    await user.click(screen.getByText('Toggle Sidebar'));
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('notifications system works', async () => {
    const user = userEvent.setup();
    render(<StoreDemo />);

    // Initially no notifications
    expect(screen.getByText('0')).toBeInTheDocument();

    // Add a notification
    await user.click(screen.getByText('Add Notification'));

    // Should show notification count and content
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
    expect(
      screen.getByText('This is a demo notification!')
    ).toBeInTheDocument();
  });

  it('stores maintain state across component unmounts', () => {
    // Login user
    const { unmount } = render(<StoreDemo />);

    fireEvent.click(screen.getByText('Demo Login'));
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // Unmount component
    unmount();

    // State should persist
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.email).toBe('demo@cleanly.com');

    // Re-render should show logged in state
    render(<StoreDemo />);
    expect(screen.getByText('Demo User')).toBeInTheDocument();
  });
});
