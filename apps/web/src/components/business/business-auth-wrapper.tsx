'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/auth';

interface BusinessAuthWrapperProps {
  children: ReactNode;
}

export function BusinessAuthWrapper({ children }: BusinessAuthWrapperProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [hasBusiness, setHasBusiness] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBusinessAccess = async () => {
      if (authLoading) return;

      if (!user) {
        setHasBusiness(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check if user has a business profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          // Check if they have a business
          const { data: business } = await supabase
            .from('businesses')
            .select('id')
            .eq('owner_id', profile.id)
            .single();

          setHasBusiness(!!business || profile.role === 'BUSINESS_OWNER');
        } else {
          setHasBusiness(false);
        }
      } catch (error) {
        console.error('Error checking business access:', error);
        setHasBusiness(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBusinessAccess();
  }, [user, authLoading]);

  // Show loading state while checking auth
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasBusiness) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Business Access Required
            </h1>
            <p className="text-gray-600 mb-8">
              {!user
                ? 'Please sign in to your business account to access the dashboard.'
                : 'You need a business account to access this area. Please register your business first.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="space-y-4">
              {!user ? (
                <Link
                  href="/business/login"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-700 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign in to Business Portal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/business/register"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-sky-500 to-blue-700 text-white font-semibold rounded-xl hover:from-sky-600 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Register Your Business
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {!user ? (
                    <>
                      Don't have a business account?{' '}
                      <Link
                        href="/business/register"
                        className="text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Register here
                      </Link>
                    </>
                  ) : (
                    <>
                      Already have a business?{' '}
                      <Link
                        href="/business/login"
                        className="text-sky-600 hover:text-sky-700 font-medium"
                      >
                        Try signing in again
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
