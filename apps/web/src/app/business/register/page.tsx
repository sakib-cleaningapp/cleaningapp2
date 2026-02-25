'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  Building2,
  Users,
  CreditCard,
  Star,
  Sparkles,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';
import { validateEmail, validatePassword } from '@/lib/auth';

const BENEFITS = [
  {
    icon: Users,
    title: 'Reach More Customers',
    description:
      'Get discovered by thousands of potential customers in your area',
  },
  {
    icon: CreditCard,
    title: 'Easy Payments',
    description: 'Receive payments directly to your bank account automatically',
  },
  {
    icon: Star,
    title: 'Build Your Reputation',
    description: 'Collect reviews and ratings to stand out from competitors',
  },
  {
    icon: Building2,
    title: 'Manage Your Business',
    description: 'Track bookings, manage availability, and grow your business',
  },
];

export default function BusinessRegisterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If user is already authenticated, redirect to complete registration
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/business/register/complete');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validate all fields required
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password length
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccess('Account created successfully! Redirecting...');
    setTimeout(() => {
      router.push('/business/register/complete');
    }, 1500);
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      {/* Back Button */}
      <div className="absolute top-6 left-6 z-30">
        <Link
          href="/login"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors bg-white/80 hover:bg-white px-4 py-2 rounded-lg shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    Tap2Clean
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Grow Your Cleaning Business
                </h1>
                <p className="text-xl text-gray-600">
                  Join hundreds of service professionals who use Tap2Clean to
                  find new customers and manage their business.
                </p>
              </div>

              <div className="space-y-4">
                {BENEFITS.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-sky-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex -space-x-2">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                      JD
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                      ST
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white flex items-center justify-center text-white font-semibold text-sm">
                      MK
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Since joining Tap2Clean, I've doubled my bookings. The
                  platform makes it so easy to manage my schedule and get paid."
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  - Sarah T., Home Cleaning
                </p>
              </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="mx-auto h-14 w-14 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Start Your Free Registration
                </h2>
                <p className="text-gray-600">
                  Create your account to get started
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password (min 8 characters)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Free to join, no monthly fees</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Keep 85% of every booking</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Get paid automatically to your bank</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">
                  Already have a business account?{' '}
                  <Link
                    href="/business/login"
                    className="text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Looking for cleaning services?{' '}
                  <Link
                    href="/login/customer"
                    className="text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Customer sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
