import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

// Use service role key for server-side auth verification
// This allows us to verify tokens without needing to refresh sessions
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Result type for authentication checks
 */
export interface AuthResult {
  user: User | null;
  error: NextResponse | null;
}

/**
 * Result type for admin authentication checks
 */
export interface AdminAuthResult extends AuthResult {
  isAdmin: boolean;
}

/**
 * Require authentication for an API route
 *
 * Validates the Authorization header contains a valid Bearer token
 * and returns the authenticated user.
 *
 * @param request - The incoming Next.js request
 * @returns Object with user (if authenticated) or error response
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const { user, error } = await requireAuth(request);
 *   if (error) return error;
 *
 *   // User is authenticated - proceed with logic
 *   console.log('User ID:', user.id);
 * }
 * ```
 */
export async function requireAuth(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Unauthorized - Missing or invalid authorization header' },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.replace('Bearer ', '');

  // Check if Supabase is properly configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co'
  ) {
    console.warn(
      'Supabase not configured - API auth check skipped (demo mode)'
    );
    // In demo mode, return a mock user so the API can still function
    return {
      user: {
        id: 'demo-user',
        email: 'demo@tap2clean.com',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User,
      error: null,
    };
  }

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return {
        user: null,
        error: NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    return { user, error: null };
  } catch (err) {
    console.error('Error verifying auth token:', err);
    return {
      user: null,
      error: NextResponse.json(
        { error: 'Authentication verification failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Require admin (owner) access for an API route
 *
 * First validates authentication, then checks if the user's email
 * is in the OWNER_EMAILS environment variable.
 *
 * @param request - The incoming Next.js request
 * @returns Object with user, isAdmin flag, and error response if denied
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const { user, isAdmin, error } = await requireAdmin(request);
 *   if (error) return error;
 *
 *   // User is authenticated admin - proceed with admin logic
 *   console.log('Admin user:', user.email);
 * }
 * ```
 */
export async function requireAdmin(
  request: NextRequest
): Promise<AdminAuthResult> {
  const authResult = await requireAuth(request);

  if (authResult.error) {
    return { user: null, isAdmin: false, error: authResult.error };
  }

  const user = authResult.user!;

  // Get owner emails from environment variable (with fallback default)
  const providedOwnerEmails = process.env.OWNER_EMAILS;
  const ownerEmails = (
    providedOwnerEmails && providedOwnerEmails.length > 0
      ? providedOwnerEmails
      : 'josh@scailer.io,sakibsupabase@gmail.com'
  )
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = user.email?.toLowerCase() || '';

  // Check if user email is in the owner list
  const isAdmin = ownerEmails.includes(userEmail);

  if (!isAdmin) {
    // Log the attempt for security monitoring
    console.warn('Admin API access denied for:', userEmail);

    return {
      user,
      isAdmin: false,
      error: NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { user, isAdmin: true, error: null };
}

/**
 * Get owner emails from environment
 *
 * @returns Array of owner email addresses (lowercase)
 */
export function getOwnerEmails(): string[] {
  const providedOwnerEmails = process.env.OWNER_EMAILS;
  return (
    providedOwnerEmails && providedOwnerEmails.length > 0
      ? providedOwnerEmails
      : 'josh@scailer.io,sakibsupabase@gmail.com'
  )
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Check if an email is an owner/admin email
 *
 * @param email - Email to check
 * @returns True if the email is in the OWNER_EMAILS list
 */
export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false;
  return getOwnerEmails().includes(email.toLowerCase());
}
