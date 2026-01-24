'use client';

import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe, createPaymentIntent } from '@/lib/stripe-client';
import { StripePaymentForm } from './stripe-payment-form';
import { Loader2, AlertCircle } from 'lucide-react';

interface StripePaymentWrapperProps {
  serviceName: string;
  businessName: string;
  amount: number;
  metadata?: Record<string, string>;
  stripeConnectAccountId?: string; // Business Stripe Connect account
  platformFeeAmount?: number; // Platform fee for automatic splitting
  onPaymentSuccess: (paymentDetails: {
    paymentIntentId: string;
    cardLast4?: string;
    cardBrand?: string;
  }) => void;
  onBack: () => void;
}

export function StripePaymentWrapper({
  serviceName,
  businessName,
  amount,
  metadata,
  stripeConnectAccountId,
  platformFeeAmount,
  onPaymentSuccess,
  onBack,
}: StripePaymentWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usingConnect, setUsingConnect] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await createPaymentIntent(
          amount,
          {
            serviceName,
            businessName,
            ...metadata,
          },
          stripeConnectAccountId,
          platformFeeAmount
        );

        if (!result) {
          throw new Error('Failed to initialize payment. Please try again.');
        }

        setClientSecret(result.clientSecret);
        setUsingConnect(result.usingConnect);

        if (result.usingConnect) {
          console.log(
            '✅ Using Stripe Connect for automatic payout to business'
          );
        } else {
          console.log(
            '⚠️ Payment will go to platform account (manual payout needed)'
          );
        }
      } catch (err: any) {
        console.error('Error initializing payment:', err);
        setError(err.message || 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [
    amount,
    serviceName,
    businessName,
    metadata,
    stripeConnectAccountId,
    platformFeeAmount,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-gray-600">Initializing secure payment...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">
              Payment Initialization Failed
            </h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Go Back
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show payment form
  if (!clientSecret) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <p className="text-yellow-800">
          Unable to initialize payment. Please try again.
        </p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      <StripePaymentForm
        serviceName={serviceName}
        businessName={businessName}
        amount={amount}
        onPaymentSuccess={onPaymentSuccess}
        onBack={onBack}
      />
    </Elements>
  );
}
