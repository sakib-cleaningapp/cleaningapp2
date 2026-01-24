'use client';

import React from 'react';
import { isStripeConfigured } from '@/lib/stripe-client';
import { StripePaymentWrapper } from './stripe-payment-wrapper';
import { PaymentStep } from './payment-step';

interface PaymentStepCombinedProps {
  serviceName: string;
  businessName: string;
  amount: number;
  serviceId?: string;
  businessId?: string;
  stripeConnectAccountId?: string; // Business Stripe Connect account ID
  platformFeeAmount?: number; // Platform fee for splitting
  onPaymentComplete: (paymentDetails: {
    paymentIntentId?: string;
    cardLast4: string;
    cardBrand: string;
    cardName?: string;
  }) => void;
  onBack: () => void;
}

/**
 * Combined payment step that uses real Stripe when configured,
 * or falls back to demo payment form for development
 */
export function PaymentStepCombined({
  serviceName,
  businessName,
  amount,
  serviceId,
  businessId,
  stripeConnectAccountId,
  platformFeeAmount,
  onPaymentComplete,
  onBack,
}: PaymentStepCombinedProps) {
  const stripeConfigured = isStripeConfigured();

  // Use real Stripe integration if configured
  if (stripeConfigured) {
    return (
      <StripePaymentWrapper
        serviceName={serviceName}
        businessName={businessName}
        amount={amount}
        metadata={{
          serviceId: serviceId || '',
          businessId: businessId || '',
          serviceName,
          businessName,
        }}
        stripeConnectAccountId={stripeConnectAccountId}
        platformFeeAmount={platformFeeAmount}
        onPaymentSuccess={(details) => {
          // Stripe provides paymentIntentId, we need to add dummy card info
          // In real scenario, we'd fetch this from the payment intent
          onPaymentComplete({
            paymentIntentId: details.paymentIntentId,
            cardLast4: details.cardLast4 || '4242',
            cardBrand: details.cardBrand || 'visa',
          });
        }}
        onBack={onBack}
      />
    );
  }

  // Fall back to demo payment form
  return (
    <div className="space-y-4">
      {/* Demo Mode Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-semibold text-blue-900 mb-1">Demo Mode</h4>
        <p className="text-sm text-blue-700">
          Stripe is not configured. Using demo payment form. To enable real
          payments, add your Stripe keys to{' '}
          <code className="bg-blue-100 px-1 rounded">.env.local</code>
        </p>
      </div>

      <PaymentStep
        serviceName={serviceName}
        businessName={businessName}
        amount={amount}
        onPaymentComplete={(details) => {
          onPaymentComplete({
            cardLast4: details.cardLast4,
            cardBrand: details.cardBrand,
            cardName: details.cardName,
          });
        }}
        onBack={onBack}
      />
    </div>
  );
}
