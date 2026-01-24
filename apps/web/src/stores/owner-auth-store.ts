'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ownerConfig, isOwnerEmail } from '@/lib/owner-config';

interface OwnerAuthState {
  email: string | null;
  isAuthenticated: boolean;
  loginAsOwner: (email: string) => boolean;
  logoutOwner: () => void;
}

export const useOwnerAuthStore = create<OwnerAuthState>()(
  persist(
    (set) => ({
      email: null,
      isAuthenticated: false,
      loginAsOwner: (email) => {
        if (!isOwnerEmail(email)) {
          return false;
        }
        set({ email: email.toLowerCase(), isAuthenticated: true });
        return true;
      },
      logoutOwner: () => set({ email: null, isAuthenticated: false }),
    }),
    {
      name: 'owner-auth-session',
      partialize: (state) => ({
        email: state.email,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Convenience helpers
export const isOwnerAuthenticated = () =>
  useOwnerAuthStore.getState().isAuthenticated;

export const getOwnerEmail = () => useOwnerAuthStore.getState().email;

export const getOwnerName = () => ownerConfig.name;
