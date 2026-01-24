'use client';

import React, { useState } from 'react';
import { CreditCard, Lock, ArrowLeft, CheckCircle } from 'lucide-react';

interface PaymentStepProps {
  serviceName: string;
  businessName: string;
  amount: number;
  onPaymentComplete: (paymentDetails: {
    cardLast4: string;
    cardBrand: string;
    cardName: string;
  }) => void;
  onBack: () => void;
}

export function PaymentStep({
  serviceName,
  businessName,
  amount,
  onPaymentComplete,
  onBack,
}: PaymentStepProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanCardNumber || cleanCardNumber.length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!expiryDate || !/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid CVV';
    }

    if (!cardName || cardName.trim().length < 3) {
      newErrors.cardName = 'Please enter the cardholder name';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsProcessing(false);

    // Extract last 4 digits and determine card brand
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    const cardLast4 = cleanCardNumber.substring(cleanCardNumber.length - 4);
    const cardBrand = cleanCardNumber.startsWith('4')
      ? 'visa'
      : cleanCardNumber.startsWith('5')
        ? 'mastercard'
        : cleanCardNumber.startsWith('3')
          ? 'amex'
          : 'unknown';

    // Pass payment details to parent
    onPaymentComplete({
      cardLast4,
      cardBrand,
      cardName,
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Info */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
          <span className="text-2xl font-bold text-gray-900">£{amount}</span>
        </div>
        <p className="text-sm text-gray-600">{businessName}</p>
      </div>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
        <Lock className="w-4 h-4 text-green-600" />
        <span>Your payment information is secure and encrypted</span>
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Card Number */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              className={`w-full p-4 pl-12 border-2 rounded-xl outline-none transition-all duration-200 ${
                errors.cardNumber
                  ? 'border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              }`}
            />
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          {errors.cardNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.cardNumber}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Expiry Date
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              className={`w-full p-4 border-2 rounded-xl outline-none transition-all duration-200 ${
                errors.expiryDate
                  ? 'border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              }`}
            />
            {errors.expiryDate && (
              <p className="text-sm text-red-600 mt-1">{errors.expiryDate}</p>
            )}
          </div>

          {/* CVV */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))
              }
              placeholder="123"
              className={`w-full p-4 border-2 rounded-xl outline-none transition-all duration-200 ${
                errors.cvv
                  ? 'border-red-500 focus:ring-4 focus:ring-red-100'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
              }`}
            />
            {errors.cvv && (
              <p className="text-sm text-red-600 mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="John Smith"
            className={`w-full p-4 border-2 rounded-xl outline-none transition-all duration-200 ${
              errors.cardName
                ? 'border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
            }`}
          />
          {errors.cardName && (
            <p className="text-sm text-red-600 mt-1">{errors.cardName}</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Service Cost</span>
            <span className="font-medium text-gray-900">£{amount}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-300">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-blue-600">£{amount}</span>
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
            disabled={isProcessing}
            className={`flex items-center justify-center gap-2 flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Pay £{amount}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Demo Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <p className="text-sm text-yellow-800">
          <strong>Demo Mode:</strong> This is a demonstration payment form. No
          actual charges will be made. Use any test card number like 4242 4242
          4242 4242.
        </p>
      </div>
    </div>
  );
}
