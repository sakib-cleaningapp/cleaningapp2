'use client';

import { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Sparkles, Home, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

function LoginContent() {
  const router = useRouter();
  const { isLoading, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading Tap2Clean...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Tap2Clean Logo Overlay */}
      <div className="absolute top-8 left-1/2 z-20 pointer-events-none flex flex-col items-center -translate-x-1/2">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-3 shadow-xl">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">
          Tap2Clean
        </h1>
      </div>

      {/* Left Side - Customer */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-sky-300 via-sky-400 to-blue-500 relative flex flex-col justify-center items-center p-6 sm:p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300/20 to-transparent blur-xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Customer Icon */}
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8 shadow-xl">
            <Home className="h-8 w-8 text-white" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">
              For Customers
            </h2>
            <p className="text-lg text-sky-100 max-w-xs mx-auto leading-relaxed">
              Book trusted local cleaners in minutes. Vetted, insured, and
              reliable.
            </p>
          </div>

          <Link
            href="/login/customer"
            className="group w-full max-w-xs mx-auto flex justify-center items-center gap-2 py-3 px-6 bg-white text-sky-600 rounded-xl font-bold text-base hover:bg-yellow-300 hover:text-sky-700 shadow-2xl hover:shadow-xl transition-all duration-200 mb-3"
          >
            Sign in as Customer
          </Link>
          <Link
            href="/admin/login"
            className="group w-full max-w-xs mx-auto flex justify-center items-center gap-2 py-2 px-6 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 border border-white/30 transition-all duration-200"
          >
            Admin / Owner Login
          </Link>
        </div>
      </div>

      {/* Right Side - Business */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 relative flex flex-col justify-center items-center p-6 sm:p-12 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-white/10 to-transparent blur-xl" />
        <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300/20 to-transparent blur-xl" />

        <div className="relative z-10 w-full max-w-md">
          {/* Business Icon */}
          <div className="mx-auto h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8 shadow-xl">
            <Building2 className="h-8 w-8 text-white" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">
              For Partners
            </h2>
            <p className="text-lg text-indigo-100 max-w-xs mx-auto leading-relaxed">
              Grow your cleaning business. Get more jobs, manage bookings, and
              get paid.
            </p>
          </div>

          <Link
            href="/business/login"
            className="group w-full max-w-xs mx-auto flex justify-center items-center gap-2 py-3 px-6 bg-white text-blue-700 rounded-xl font-bold text-base hover:bg-yellow-300 hover:text-blue-800 shadow-2xl hover:shadow-xl transition-all duration-200 mb-3"
          >
            Sign in to Business Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}
