'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { FormInput } from '@/components/auth/form-input';
import { FormButton } from '@/components/auth/form-button';
import { supabase } from '@/lib/supabase';
import { validatePassword } from '@/lib/auth';

function ResetPasswordContent() {
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingToken, setIsProcessingToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenProcessed, setTokenProcessed] = useState(false);

  // On mount, exchange the code from the URL for a session
  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError(
        'Invalid or expired reset link. Please request a new password reset.'
      );
      setIsProcessingToken(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError(
            exchangeError.message ||
              'Failed to verify reset link. It may have expired.'
          );
        } else {
          setTokenProcessed(true);
        }
      } catch (err) {
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setIsProcessingToken(false);
      }
    };

    exchangeCode();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password length
    if (!validatePassword(newPassword)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(
          updateError.message || 'Failed to update password. Please try again.'
        );
      } else {
        setSuccess('Your password has been reset successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while processing the token
  if (isProcessingToken) {
    return (
      <AuthLayout
        title="Reset Password"
        subtitle="Verifying your reset link..."
      >
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <p className="text-sm text-gray-600">Verifying your reset link...</p>
        </div>
      </AuthLayout>
    );
  }

  // Show error state if token exchange failed or no code was provided
  if (!tokenProcessed && error) {
    return (
      <AuthLayout title="Reset Password" subtitle="Something went wrong">
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Unable to Reset Password
              </h3>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Show success state after password has been updated
  if (success) {
    return (
      <AuthLayout
        title="Password Reset"
        subtitle="Your password has been updated"
      >
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Password Updated!
              </h3>
              <p className="text-sm text-gray-600">{success}</p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Show the password reset form
  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password below">
      <div className="space-y-6">
        {error && (
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="New Password"
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            hint="At least 8 characters"
            autoComplete="new-password"
            disabled={isLoading}
            required
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            success={
              confirmPassword &&
              newPassword === confirmPassword &&
              validatePassword(newPassword)
                ? 'Passwords match'
                : undefined
            }
            autoComplete="new-password"
            disabled={isLoading}
            required
          />

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Updating Password..."
            leftIcon={<Lock className="h-4 w-4" />}
          >
            Reset Password
          </FormButton>
        </form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
