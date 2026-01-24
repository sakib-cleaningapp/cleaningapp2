'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ownerConfig, isOwnerEmail } from '@/lib/owner-config';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, isLoading, signIn, signInWithProvider, isOwner } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');

    const result = await signInWithProvider('google', '/admin');

    if (!result.success) {
      setError(result.error || 'Google sign in failed');
      setIsGoogleLoading(false);
    }
    // If successful, user will be redirected by OAuth flow
    // Then the useEffect above will check if they're an owner
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

          {error && (
            <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
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

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-transparent text-sky-100/70">or</span>
          </div>
        </div>

        <Button
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-lg py-6 text-base"
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </Button>

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
