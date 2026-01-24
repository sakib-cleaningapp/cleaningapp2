'use client';

import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

interface StripePaymentFormProps {
  serviceName: string;
  businessName: string;
  amount: number;
  onPaymentSuccess: (paymentDetails: {
    paymentIntentId: string;
    cardLast4?: string;
    cardBrand?: string;
  }) => void;
  onBack: () => void;
}

export function StripePaymentForm({
  serviceName,
  businessName,
  amount,
  onPaymentSuccess,
  onBack,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if Stripe Elements is ready
  useEffect(() => {
    if (stripe && elements) {
      setIsReady(true);
    }
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe has not loaded yet. Please wait and try again.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-success`,
        },
        redirect: 'if_required', // Don't redirect, handle in-page
      });

      if (error) {
        // Show error to customer (e.g., insufficient funds, card declined)
        setErrorMessage(
          error.message || 'An error occurred while processing your payment.'
        );
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment succeeded!
        console.log('✅ Payment succeeded:', paymentIntent.id);

        // Extract card details from payment method if available
        const paymentMethod = paymentIntent.payment_method;
        let cardLast4: string | undefined;
        let cardBrand: string | undefined;

        if (typeof paymentMethod === 'string') {
          // If it's just an ID, we don't have the card details yet
          // The parent component will handle this
        } else if (paymentMethod?.card) {
          cardLast4 = paymentMethod.card.last4;
          cardBrand = paymentMethod.card.brand;
        }

        // Call parent callback with payment details
        onPaymentSuccess({
          paymentIntentId: paymentIntent.id,
          cardLast4,
          cardBrand,
        });
      } else {
        setErrorMessage('Payment status is unclear. Please contact support.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
          <span className="text-2xl font-bold text-gray-900">
            £{amount.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-gray-600">{businessName}</p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <Lock className="w-4 h-4 text-green-600" />
        <span>Your payment information is secure and encrypted by Stripe</span>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Stripe Payment Element */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  address: {
                    country: 'GB',
                  },
                },
              },
            }}
          />
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Payment Failed</h4>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Service Cost</span>
            <span className="font-medium text-gray-900">
              £{amount.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">
              £{amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            type="submit"
            disabled={!isReady || isProcessing || !stripe || !elements}
            className={`flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isProcessing || !isReady || !stripe || !elements
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : !isReady ? (
              <>Loading...</>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Pay £{amount.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Test Mode Notice */}
      {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.includes('test') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <strong>Test Mode:</strong> Use test card 4242 4242 4242 4242 with
            any future expiry date and any 3-digit CVC.
          </p>
        </div>
      )}
    </div>
  );
}
