'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ownerConfig, isOwnerEmail } from '@/lib/owner-config';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn, resetPassword, isOwner } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      if (isOwner) {
        // User is owner, redirect to admin
        router.replace('/admin');
      } else {
        // User is logged in but NOT an owner
        setError(
          'This email is not authorized for admin access. Only owner emails can access admin.'
        );
      }
    }
  }, [user, isOwner, isLoading, router]);

  const handleForgotPassword = async () => {
    if (!email) {
      setResetError('Please enter your email address first.');
      setResetMessage('');
      return;
    }
    setResetError('');
    setResetMessage('');
    try {
      const result = await resetPassword(email);
      if (result.success) {
        setResetMessage('Password reset email sent. Check your inbox.');
      } else {
        setResetError(result.error || 'Failed to send reset email.');
      }
    } catch {
      setResetError('An unexpected error occurred.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Check if email is in owner list (client-side check for UX)
      // Note: Server-side middleware enforces actual access control
      if (!isOwnerEmail(email)) {
        setError(
          'This email is not authorized for admin access. Contact the platform owner if you believe this is an error.'
        );
        setIsSubmitting(false);
        return;
      }

      // Sign in with Supabase
      const result = await signIn({ email, password });

      if (!result.success) {
        setError(result.error || 'Invalid email or password');
        setIsSubmitting(false);
        return;
      }

      // The middleware will verify owner access and redirect if not authorized
      router.push('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_25%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_20%)]" />
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sky-100 text-sm font-semibold uppercase tracking-wide">
              Tap2Clean Admin
            </p>
            <h1 className="text-2xl font-bold text-white">Owner Sign In</h1>
          </div>
        </div>

        <p className="text-sky-100/80 text-sm">
          Sign in with your admin credentials to access platform-wide analytics
          and approvals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 text-white px-4 py-3 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="admin@tap2clean.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/20 bg-white/10 text-white px-4 py-3 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter your password"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-sky-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {resetMessage && (
            <div className="text-sm text-green-200 bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-2">
              {resetMessage}
            </div>
          )}

          {resetError && (
            <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {resetError}
            </div>
          )}

          {error && (
            <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:from-sky-600 hover:to-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Access Admin
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-xs text-sky-100/70">
          Admin access is restricted to authorized owner emails configured via
          the OWNER_EMAILS environment variable.
        </div>

        <div className="flex items-center justify-between text-xs text-sky-100/70 pt-2">
          <Link
            href="/login"
            className="hover:text-white underline underline-offset-2"
          >
            Back to app
          </Link>
          <span>Owner: {ownerConfig.name}</span>
        </div>
      </div>
    </div>
  );
}
