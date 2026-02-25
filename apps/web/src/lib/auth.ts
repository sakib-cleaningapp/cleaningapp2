import { createClient } from '@supabase/supabase-js';
import { type User } from '@supabase/supabase-js';

// Initialize Supabase client - credentials must be configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our application
export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  postcode?: string;
  createdAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  postcode?: string;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Auth service
export const authService = {
  // Sign up new user
  async signUp({ email, password, fullName, postcode }: SignUpData) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...(postcode ? { postcode: postcode.toUpperCase() } : {}),
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data,
        message:
          'Account created successfully! Please check your email to verify your account.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during sign up',
      };
    }
  },

  // Sign in existing user
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        data: data,
        message: 'Signed in successfully!',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during sign in',
      };
    }
  },

  // Sign out
  async signOut() {
    try {
      // Use 'global' scope to sign out from all tabs/windows
      const { error } = await supabase.auth.signOut({ scope: 'global' });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Signed out successfully!',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred during sign out',
      };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        fullName: user.user_metadata?.full_name,
        postcode: user.user_metadata?.postcode,
        createdAt: user.created_at,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          fullName: session.user.user_metadata?.full_name,
          postcode: session.user.user_metadata?.postcode,
          createdAt: session.user.created_at,
        };
        callback(authUser);
      } else {
        callback(null);
      }
    });
  },

  // Reset password
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: 'Password reset email sent! Check your inbox.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An error occurred sending reset email',
      };
    }
  },
};

// Validation helpers
export const validatePostcode = (postcode: string): boolean => {
  const SOUTH_WALES_POSTCODES = [
    'CF',
    'SA',
    'NP',
    'LD',
    'SY',
    'HR',
    'LL',
    'CH',
    'SN',
  ];
  const cleanPostcode = postcode.toUpperCase().replace(/\s/g, '');
  return SOUTH_WALES_POSTCODES.some((prefix) =>
    cleanPostcode.startsWith(prefix)
  );
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
