'use client';

/**
 * Central place to manage owner/admin access for the front end.
 *
 * IMPORTANT: This is for CLIENT-SIDE display/UX purposes only.
 * Actual authentication and authorization is enforced by:
 * - Server-side middleware (/middleware.ts) for route protection
 * - API auth helper (/lib/api-auth.ts) for API route protection
 *
 * The server uses the OWNER_EMAILS env variable (not NEXT_PUBLIC) for
 * secure admin validation.
 */

// Client-side owner emails for display purposes
// Note: Actual auth validation uses server-side OWNER_EMAILS env var
const providedOwnerEmails =
  process.env.NEXT_PUBLIC_OWNER_EMAILS || process.env.NEXT_PUBLIC_OWNER_EMAIL;

const OWNER_EMAILS = (
  providedOwnerEmails && providedOwnerEmails.length > 0
    ? providedOwnerEmails
    : 'josh@scailer.io,sakibsupabase@gmail.com'
)
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Owner display name
const OWNER_NAME = process.env.NEXT_PUBLIC_OWNER_NAME || 'Tap2Clean Owner';

/**
 * Configuration for owner/admin display
 * Note: Actual auth is enforced server-side via middleware and api-auth
 */
export const ownerConfig = {
  emails: OWNER_EMAILS,
  name: OWNER_NAME,
};

/**
 * Check if an email is an owner email (for client-side display purposes)
 *
 * Note: This is used for UI display decisions only.
 * Actual authorization is enforced server-side.
 *
 * @param email - Email address to check
 * @returns True if the email is in the owner list
 */
export const isOwnerEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase());
};

/**
 * Get the primary owner email
 * @returns First owner email in the list
 */
export const getPrimaryOwnerEmail = (): string => OWNER_EMAILS[0] || '';
