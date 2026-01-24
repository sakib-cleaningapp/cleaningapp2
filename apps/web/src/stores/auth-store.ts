import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type UserRole = 'customer' | 'business';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (profile: Partial<User['profile']>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (user) =>
        set({ user, isAuthenticated: true }, false, 'auth/login'),

      logout: () =>
        set({ user: null, isAuthenticated: false }, false, 'auth/logout'),

      updateProfile: (profileUpdate) => {
        const currentUser = get().user;
        if (currentUser) {
          set(
            {
              user: {
                ...currentUser,
                profile: { ...currentUser.profile, ...profileUpdate },
              },
            },
            false,
            'auth/updateProfile'
          );
        }
      },

      setLoading: (loading) =>
        set({ isLoading: loading }, false, 'auth/setLoading'),
    }),
    { name: 'auth-store' }
  )
);
