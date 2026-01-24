'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useBusinessProfileStore } from '@/stores/business-profile-store';

interface StripeConnectOnboardingProps {
  businessId: string;
  businessEmail: string;
  businessName: string;
}

export function StripeConnectOnboarding({
  businessId,
  businessEmail,
  businessName,
}: StripeConnectOnboardingProps) {
  const { profile, updateStripeConnect, setProfile } =
    useBusinessProfileStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const stripeConnect = profile?.stripeConnect;

  // Initialize profile if it doesn't exist
  useEffect(() => {
    if (!profile) {
      setProfile({
        id: businessId,
        name: businessName,
        email: businessEmail,
        stripeConnect: {
          accountId: null,
          connected: false,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          requirementsCurrentlyDue: [],
          lastChecked: null,
        },
      });
    }
  }, []);

  // Check account status on mount if account exists
  useEffect(() => {
    if (stripeConnect?.accountId && !stripeConnect.detailsSubmitted) {
      checkAccountStatus();
    }
  }, []);

  // Check for Stripe Connect redirect (user returned from onboarding)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stripeConnectStatus = urlParams.get('stripe_connect');

      console.log('🔍 Checking redirect:', {
        hasRedirectParam: stripeConnectStatus === 'complete',
        accountId: stripeConnect?.accountId,
        fullUrl: window.location.href,
      });

      if (stripeConnectStatus === 'complete') {
        console.log('🎉 Stripe Connect onboarding complete!');

        // Remove the URL parameter immediately
        window.history.replaceState({}, '', window.location.pathname);

        // Check status after a short delay to ensure account is ready
        setTimeout(() => {
          if (stripeConnect?.accountId) {
            console.log(
              '🔄 Checking account status for:',
              stripeConnect.accountId
            );
            checkAccountStatus();
          } else {
            console.warn('⚠️ No account ID found in profile');
          }
        }, 1000);
      }
    }
  }, []);

  const checkAccountStatus = async () => {
    if (!stripeConnect?.accountId) {
      console.error('❌ Cannot check status: No account ID');
      return;
    }

    console.log(
      '⏳ Starting account status check for:',
      stripeConnect.accountId
    );
    setIsCheckingStatus(true);

    try {
      const response = await fetch('/api/stripe-connect/account-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: stripeConnect.accountId }),
      });

      console.log('📡 Account status response:', response.status);
      const data = await response.json();
      console.log('📦 Account status data:', data);

      if (data.success) {
        const isFullyConnected =
          data.account.detailsSubmitted &&
          data.account.chargesEnabled &&
          data.account.payoutsEnabled;

        console.log('📊 Stripe Connect Status:', {
          detailsSubmitted: data.account.detailsSubmitted,
          chargesEnabled: data.account.chargesEnabled,
          payoutsEnabled: data.account.payoutsEnabled,
          isFullyConnected,
          requirements: data.account.requirements.currentlyDue,
        });

        updateStripeConnect({
          connected: isFullyConnected,
          chargesEnabled: data.account.chargesEnabled,
          payoutsEnabled: data.account.payoutsEnabled,
          detailsSubmitted: data.account.detailsSubmitted,
          requirementsCurrentlyDue: data.account.requirements.currentlyDue,
        });

        console.log('✅ Profile updated successfully');
      } else {
        console.error('❌ Account status check failed:', data.error);
        setError(data.error || 'Failed to check account status');
      }
    } catch (err) {
      console.error('❌ Error checking account status:', err);
      setError('Failed to check account status');
    } finally {
      setIsCheckingStatus(false);
      console.log('🏁 Account status check complete');
    }
  };

  const handleConnectStripe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create or retrieve Stripe Connect account
      let accountId = stripeConnect?.accountId;

      if (!accountId) {
        const createResponse = await fetch(
          '/api/stripe-connect/create-account',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              businessId,
              businessEmail,
              businessName,
            }),
          }
        );

        const createData = await createResponse.json();

        if (!createData.success) {
          throw new Error(
            createData.error || 'Failed to create Stripe account'
          );
        }

        accountId = createData.accountId;
        updateStripeConnect({
          accountId,
          connected: true,
          chargesEnabled: createData.chargesEnabled,
          payoutsEnabled: createData.payoutsEnabled,
          detailsSubmitted: createData.detailsSubmitted,
        });
      }

      // Step 2: Create onboarding link
      const linkResponse = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      });

      const linkData = await linkResponse.json();

      if (!linkData.success) {
        throw new Error(linkData.error || 'Failed to create onboarding link');
      }

      // Step 3: Redirect to Stripe onboarding
      window.location.href = linkData.url;
    } catch (err: any) {
      console.error('Error connecting Stripe:', err);
      setError(err.message || 'Failed to connect Stripe account');
      setIsLoading(false);
    }
  };

  const handleAccessDashboard = async () => {
    if (!stripeConnect?.accountId) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe-connect/login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: stripeConnect.accountId }),
      });

      const data = await response.json();

      if (data.success) {
        window.open(data.url, '_blank');
      } else {
        throw new Error(data.error || 'Failed to create login link');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to access dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Not connected yet
  if (!stripeConnect?.accountId) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Connect Your Bank Account
            </h3>
            <p className="text-gray-600 mb-4">
              To receive automatic payouts for completed bookings, connect your
              bank account through Stripe. This is secure, takes about 5
              minutes, and only needs to be done once.
            </p>

            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-green-900 mb-2">
                What you'll need:
              </h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li>• Business information (name, address)</li>
                <li>• Bank account details (sort code, account number)</li>
                <li>• Identification (passport or driving license)</li>
                <li>• Tax information (VAT number if registered)</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">
                    Connection Failed
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <button
              onClick={handleConnectStripe}
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  Connect with Stripe
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connected but onboarding not complete
  if (!stripeConnect.detailsSubmitted) {
    return (
      <div className="bg-white rounded-xl border-2 border-yellow-300 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Complete Your Setup
            </h3>
            <p className="text-gray-600 mb-4">
              You've started the Stripe onboarding process, but it's not
              complete yet. You need to finish providing your information to
              receive payouts.
            </p>

            {stripeConnect.requirementsCurrentlyDue &&
              stripeConnect.requirementsCurrentlyDue.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Still needed:
                  </h4>
                  <ul className="space-y-1 text-sm text-yellow-800">
                    {stripeConnect.requirementsCurrentlyDue.map((req) => (
                      <li key={req}>• {req.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="flex gap-3">
              <button
                onClick={handleConnectStripe}
                disabled={isLoading}
                className="px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-5 h-5" />
                    Continue Setup
                  </>
                )}
              </button>

              <button
                onClick={checkAccountStatus}
                disabled={isCheckingStatus}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCheckingStatus ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Refresh Status
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fully connected and verified
  return (
    <div className="bg-white rounded-xl border-2 border-green-300 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Bank Account Connected ✅
          </h3>
          <p className="text-gray-600 mb-4">
            Your bank account is connected and verified. You'll receive
            automatic weekly payouts for all completed bookings.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm font-semibold text-green-900">
                Payments
              </div>
              <div className="text-xs text-green-700">
                {stripeConnect.chargesEnabled ? 'Enabled' : 'Pending'}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-sm font-semibold text-green-900">
                Payouts
              </div>
              <div className="text-xs text-green-700">
                {stripeConnect.payoutsEnabled ? 'Enabled' : 'Pending'}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-sm font-semibold text-green-900">
                Schedule
              </div>
              <div className="text-xs text-green-700">Weekly (Friday)</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAccessDashboard}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <ExternalLink className="w-5 h-5" />
                  View Stripe Dashboard
                </>
              )}
            </button>

            <button
              onClick={checkAccountStatus}
              disabled={isCheckingStatus}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCheckingStatus ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Refresh Status
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
