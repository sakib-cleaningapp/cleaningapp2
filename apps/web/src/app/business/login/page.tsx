'use client';

import { useState, useEffect, Suspense, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  Building2,
  Loader2,
  Mail,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

function BusinessLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, resetPassword, isLoading: authLoading, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/business/dashboard');
    }
  }, [user, router]);

  // Check for error message from URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const result = await signIn({ email, password });

    if (result.success) {
      router.push('/business/dashboard');
    } else {
      setError(result.error || 'Sign in failed');
    }

    setIsLoading(false);
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    const result = await resetPassword(email);

    if (result.success) {
      setMessage(
        result.message || 'Password reset email sent. Check your inbox.'
      );
    } else {
      setError(result.error || 'Failed to send reset email');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 relative flex flex-col justify-center items-center p-6 sm:p-12 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300/20 to-transparent blur-xl" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          href="/login"
          className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Business Icon */}
        <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8 shadow-xl">
          <Building2 className="h-8 w-8 text-white" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">
            Partner Login
          </h2>
          <p className="text-lg text-indigo-100 max-w-xs mx-auto leading-relaxed">
            Grow your cleaning business. Get more jobs, manage bookings, and get
            paid.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-md border border-white/20">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-white">Partner Portal</h3>
            <p className="text-sm text-white/80 mt-1">
              {isForgotPassword
                ? 'Enter your email to reset your password'
                : 'Sign in with your email and password'}
            </p>
          </div>

          {error && (
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg mb-6 text-sm',
                'bg-red-500/20 text-red-100 border border-red-500/30'
              )}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg mb-6 text-sm',
                'bg-green-500/20 text-green-100 border border-green-500/30'
              )}
            >
              <span>{message}</span>
            </div>
          )}

          <form
            onSubmit={isForgotPassword ? handleResetPassword : handleSignIn}
          >
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-1.5">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-white/20 bg-white/10 text-white px-4 py-3 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {!isForgotPassword && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/90 mb-1.5">
                    <Lock className="h-4 w-4" />
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-white/20 bg-white/10 text-white px-4 py-3 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}
            </div>

            {!isForgotPassword && (
              <div className="mt-3 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setError('');
                    setMessage('');
                  }}
                  className="text-sm text-white/80 hover:text-white hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || authLoading}
              className="mt-6 w-full bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-lg py-3 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading || authLoading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {isForgotPassword ? 'Sending...' : 'Signing in...'}
                </span>
              ) : isForgotPassword ? (
                'Send Reset Email'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {isForgotPassword && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setMessage('');
                }}
                className="text-sm text-white/80 hover:text-white hover:underline"
              >
                Back to sign in
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-white/80">Not a partner yet? </span>
            <Link
              href="/business/register"
              className="font-semibold text-white hover:text-white/90 hover:underline"
            >
              Join us
            </Link>
          </div>

          <div className="mt-4 text-center text-sm pt-4 border-t border-white/20">
            <span className="text-white/80">Looking for cleaning? </span>
            <Link
              href="/login/customer"
              className="font-semibold text-white hover:text-white/90 hover:underline"
            >
              Customer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BusinessLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-white/80">Loading...</p>
          </div>
        </div>
      }
    >
      <BusinessLoginContent />
    </Suspense>
  );
}
