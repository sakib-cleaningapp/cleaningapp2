import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StripeConnectStatus {
  accountId: string | null;
  connected: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirementsCurrentlyDue: string[];
  lastChecked: string | null;
}

export interface BusinessProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  postcode?: string;
  description?: string;
  stripeConnect: StripeConnectStatus;
}

interface BusinessProfileState {
  profile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: BusinessProfile) => void;
  updateStripeConnect: (status: Partial<StripeConnectStatus>) => void;
  clearProfile: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBusinessProfileStore = create<BusinessProfileState>()(
  persist(
    (set) => ({
      profile: null,
      isLoading: false,
      error: null,

      setProfile: (profile) => set({ profile, error: null }),

      updateStripeConnect: (status) =>
        set((state) => ({
          profile: state.profile
            ? {
                ...state.profile,
                stripeConnect: {
                  ...state.profile.stripeConnect,
                  ...status,
                  lastChecked: new Date().toISOString(),
                },
              }
            : null,
        })),

      clearProfile: () => set({ profile: null, error: null }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'business-profile-storage',
    }
  )
);
