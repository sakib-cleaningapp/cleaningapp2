'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const next = searchParams.get('next') || '/dashboard';

      // Check for error in URL
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam || errorDescription) {
        setError(errorDescription || errorParam || 'Authentication failed');
        setTimeout(() => {
          router.push(
            `/login?error=${encodeURIComponent(errorDescription || errorParam || 'auth_error')}`
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
            router.push(`/login?error=${encodeURIComponent(error.message)}`);
          }, 2000);
          return;
        }
        router.push(next);
        return;
      }

      // Check for access_token in hash (implicit flow)
      // The hash is handled automatically by Supabase client
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        setTimeout(() => {
          router.push(
            `/login?error=${encodeURIComponent(sessionError.message)}`
          );
        }, 2000);
        return;
      }

      if (session) {
        router.push(next);
        return;
      }

      // No session found - might need to wait for hash to be processed
      // Listen for auth state change
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe();
          router.push(next);
        }
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        subscription.unsubscribe();
        router.push('/login?error=auth_timeout');
      }, 5000);
    };

    handleCallback();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <p className="text-red-600">{error}</p>
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
