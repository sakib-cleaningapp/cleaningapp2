'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  authService,
  type AuthUser,
  type SignUpData,
  type SignInData,
} from '@/lib/auth';
import { isOwnerEmail } from '@/lib/owner-config';
import { useOwnerApprovalsStore } from '@/stores/owner-approvals-store';
import { useOwnerAuthStore } from '@/stores/owner-auth-store';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isOwner: boolean;
  signUp: (
    data: SignUpData
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  signIn: (
    data: SignInData
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  signInWithProvider: (
    provider: 'google' | 'facebook',
    redirectPath?: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const isOwner = user ? isOwnerEmail(user.email) : false;

  useEffect(() => {
    // Get initial user
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const result = await authService.signUp(data);

      if (result.success) {
        // Create an approval request for owner review
        const approvalsStore = useOwnerApprovalsStore.getState();
        approvalsStore.enqueueApproval({
          email: data.email,
          fullName: data.fullName,
          postcode: data.postcode,
        });

        // Redirect to login for email verification
        router.push(
          '/login?message=Please check your email to verify your account'
        );
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during sign up',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (data: SignInData) => {
    setIsLoading(true);
    try {
      const approvalsStore = useOwnerApprovalsStore.getState();
      const existingApproval = approvalsStore.approvals.find(
        (a) => a.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingApproval?.status === 'denied') {
        setIsLoading(false);
        return {
          success: false,
          error: 'Your signup request was denied by the owner.',
        };
      }

      if (existingApproval?.status === 'pending') {
        setIsLoading(false);
        return {
          success: false,
          error: 'Awaiting owner approval. Please try again later.',
        };
      }

      const result = await authService.signIn(data);

      if (result.success) {
        router.push('/dashboard');
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during sign in',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      // Use window.location for a hard redirect to clear all cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred sending reset email',
      };
    }
  };

  const signInWithProvider = async (
    provider: 'google' | 'facebook',
    redirectPath?: string
  ) => {
    try {
      return await authService.signInWithProvider(provider, redirectPath);
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : `An error occurred with ${provider} sign in`,
      };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isOwner,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithProvider,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper hook for protecting routes
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}

// Helper hook for protecting owner/admin routes
export function useRequireOwner(redirectTo: string = '/admin/login') {
  const { user, isLoading, isOwner } = useAuth();
  const { isAuthenticated } = useOwnerAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const ownerLoggedIn = isOwner || isAuthenticated;
      if (!ownerLoggedIn) {
        router.push(redirectTo);
      }
    }
  }, [user, isOwner, isLoading, isAuthenticated, router, redirectTo]);

  return { user, isLoading, isOwner: isOwner || isAuthenticated };
}
