import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore } from '@/stores';

export function StoreDemo() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, addNotification, notifications } =
    useUIStore();

  const handleLogin = () => {
    login({
      id: '1',
      email: 'demo@cleanly.com',
      role: 'customer',
      profile: {
        firstName: 'Demo',
        lastName: 'User',
      },
    });
    addNotification({
      type: 'success',
      title: 'Login Successful',
      message: 'Welcome to Tap2Clean!',
    });
  };

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'Come back soon!',
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Zustand Store Demo</h2>
        <p className="text-muted-foreground">
          Demonstrating global state management
        </p>
      </div>

      {/* Authentication State */}
      <div className="p-4 border rounded-lg space-y-3">
        <h3 className="font-semibold">Authentication Store</h3>

        {isAuthenticated ? (
          <div className="space-y-2">
            <p className="text-sm">
              <strong>User:</strong> {user?.profile?.firstName}{' '}
              {user?.profile?.lastName}
            </p>
            <p className="text-sm">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm">
              <strong>Role:</strong> {user?.role}
            </p>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Not logged in</p>
            <Button onClick={handleLogin}>Demo Login</Button>
          </div>
        )}
      </div>

      {/* UI State */}
      <div className="p-4 border rounded-lg space-y-3">
        <h3 className="font-semibold">UI Store</h3>

        <div className="space-y-2">
          <p className="text-sm">
            <strong>Sidebar:</strong> {sidebarOpen ? 'Open' : 'Closed'}
          </p>
          <Button onClick={toggleSidebar} variant="outline">
            Toggle Sidebar
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm">
            <strong>Notifications:</strong> {notifications.length}
          </p>
          <Button
            onClick={() =>
              addNotification({
                type: 'info',
                title: 'Test Notification',
                message: 'This is a demo notification!',
              })
            }
            variant="outline"
          >
            Add Notification
          </Button>
        </div>
      </div>

      {/* Notifications Display */}
      {notifications.length > 0 && (
        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-semibold">Recent Notifications</h3>
          {notifications.slice(-3).map((notification) => (
            <div key={notification.id} className="p-2 bg-muted rounded text-sm">
              <div className="font-medium">{notification.title}</div>
              {notification.message && (
                <div className="text-muted-foreground">
                  {notification.message}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
