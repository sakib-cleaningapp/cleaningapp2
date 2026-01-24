# State Management Documentation

## Overview

This project uses Zustand for lightweight, predictable state management across the React application.

## Architecture

### Store Structure

```
src/stores/
├── auth-store.ts    # Authentication state
├── ui-store.ts      # UI/interface state
└── index.ts         # Store exports
```

## Authentication Store

### State

- `user`: Current user object or null
- `isAuthenticated`: Boolean authentication status
- `isLoading`: Loading state for auth operations

### Actions

- `login(user)`: Set authenticated user
- `logout()`: Clear user and auth state
- `updateProfile(data)`: Update user profile data
- `setLoading(boolean)`: Set loading state

### Usage

```tsx
import { useAuthStore } from '@/stores';

function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div>
      Welcome, {user?.profile?.firstName}!
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## UI Store

### State

- `sidebarOpen`: Boolean sidebar visibility
- `theme`: 'light' | 'dark' theme setting
- `notifications`: Array of app notifications
- `isPageLoading`: Global page loading state

### Actions

- `toggleSidebar()`: Toggle sidebar open/closed
- `setSidebarOpen(boolean)`: Set sidebar state
- `setTheme(theme)`: Change app theme
- `addNotification(notification)`: Add notification
- `removeNotification(id)`: Remove specific notification
- `clearNotifications()`: Clear all notifications
- `setPageLoading(boolean)`: Set page loading state

### Usage

```tsx
import { useUIStore } from '@/stores';

function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>{sidebarOpen ? 'Close' : 'Open'}</button>
    </aside>
  );
}
```

## DevTools

### Zustand DevTools

Enable Redux DevTools extension for debugging:

- Install Redux DevTools browser extension
- Stores are configured with `devtools()` middleware
- Action names are provided for debugging

### Usage

1. Open browser DevTools
2. Go to Redux tab
3. See store state and action history
4. Time-travel debug state changes

## Best Practices

### 1. Keep Stores Focused

- **Auth Store**: Only authentication-related state
- **UI Store**: Only interface/visual state
- Create new stores for distinct domains

### 2. Use Selectors

```tsx
// Good: Select only what you need
const userName = useAuthStore((state) => state.user?.profile?.firstName);

// Avoid: Selecting entire store
const authStore = useAuthStore();
```

### 3. Actions Over Direct Mutation

```tsx
// Good: Use store actions
const { login } = useAuthStore();
login(userData);

// Avoid: Direct state mutation
useAuthStore.setState({ user: userData });
```

### 4. TypeScript First

- All stores are fully typed
- Export types for external use
- Use proper interfaces for state shape

## Testing

### Mock Stores in Tests

```tsx
import { useAuthStore } from '@/stores';

// Mock the store in tests
vi.mock('@/stores', () => ({
  useAuthStore: vi.fn(() => ({
    user: mockUser,
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn(),
  })),
}));
```

## Performance

### Optimizations

- Zustand uses subscription-based updates
- Components only re-render when selected state changes
- No provider wrapper needed
- Minimal bundle size (2.5kb)

### Avoiding Re-renders

```tsx
// Good: Specific selector
const isLoggedIn = useAuthStore((state) => state.isAuthenticated);

// Better: Memoized selector for complex logic
const userDisplayName = useAuthStore((state) =>
  state.user
    ? `${state.user.profile?.firstName} ${state.user.profile?.lastName}`
    : 'Guest'
);
```
