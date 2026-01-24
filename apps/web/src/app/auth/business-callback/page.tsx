'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

function BusinessAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Completing sign in...');

  useEffect(() => {
    const handleCallback = async () => {
      // Check for error in URL
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam || errorDescription) {
        setError(errorDescription || errorParam || 'Authentication failed');
        setTimeout(() => {
          router.push(
            `/business/login?error=${encodeURIComponent(errorDescription || errorParam || 'auth_error')}`
          );
        }, 2000);
        return;
      }

      // Check for code (PKCE flow)
      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          setTimeout(() => {
            router.push(
              `/business/login?error=${encodeURIComponent(error.message)}`
            );
          }, 2000);
          return;
        }
      }

      // Get the session
      setStatus('Checking your account...');
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setTimeout(() => {
          router.push(
            `/business/login?error=${encodeURIComponent(sessionError.message)}`
          );
        }, 2000);
        return;
      }

      if (!session?.user) {
        // Wait for auth state change
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            subscription.unsubscribe();
            await checkBusinessAndRedirect(session.user.id);
          }
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          router.push('/business/login?error=auth_timeout');
        }, 5000);
        return;
      }

      await checkBusinessAndRedirect(session.user.id);
    };

    const checkBusinessAndRedirect = async (userId: string) => {
      try {
        setStatus('Checking business profile...');

        // Check if user has a profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', userId)
          .single();

        if (profile) {
          // Check if they have a business
          const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', profile.id)
            .single();

          if (business || profile.role === 'BUSINESS_OWNER') {
            // User has a business - go to dashboard
            router.push('/business/dashboard');
            return;
          }
        }

        // No business found - redirect to complete registration
        router.push('/business/register/complete');
      } catch (err) {
        console.error('Error checking business:', err);
        // Even on error, send to complete registration
        router.push('/business/register/complete');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <p className="text-red-200 bg-red-500/20 px-4 py-2 rounded-lg">
            {error}
          </p>
          <p className="text-white/80">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <p className="text-white/90">{status}</p>
      </div>
    </div>
  );
}

export default function BusinessAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
            <p className="text-white/90">Loading...</p>
          </div>
        </div>
      }
    >
      <BusinessAuthCallbackContent />
    </Suspense>
  );
}
