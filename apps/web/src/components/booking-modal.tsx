'use client';

import React from 'react';
import { X, Calendar, Clock, Star, MapPin, User } from 'lucide-react';
import { BookingDetails, UseBookingReturn } from '@/hooks/use-booking';
import { BookingConfirmation } from './booking-confirmation';
import { BookingFrequencySelector } from './booking-frequency-selector';
import { PaymentStepCombined } from './payment-step-combined';
import { useFeatureFlag } from '@/lib/feature-flags';
import { useBusinessProfileStore } from '@/stores/business-profile-store';

interface BookingModalProps {
  booking: UseBookingReturn;
}

export function BookingModal({ booking }: BookingModalProps) {
  const {
    selectedService,
    bookingDetails,
    isBookingModalOpen,
    bookingStep,
    updateBookingDetails,
    closeBookingModal,
    proceedToPayment,
    goBackToDetails,
    goBackToPayment,
    handlePaymentComplete,
    confirmBooking,
    isConfirming,
  } = booking;

  // Get business profile to check for Stripe Connect account ID
  const { profile } = useBusinessProfileStore();

  // In demo mode, if this business matches the profile business, use their Stripe Connect account
  const getStripeConnectAccountId = () => {
    if (!selectedService) return undefined;

    // Check if service data already has it
    const serviceAccountId = (selectedService.business as any)
      .stripeConnectAccountId;
    if (serviceAccountId) return serviceAccountId;

    // In demo mode, if profile exists and business ID matches, use profile's Stripe account
    if (
      profile &&
      selectedService.business.id === profile.id &&
      profile.stripeConnect?.accountId
    ) {
      console.log(
        '✅ Using Stripe Connect account from business profile:',
        profile.stripeConnect.accountId
      );
      return profile.stripeConnect.accountId;
    }

    console.log(
      '⚠️ No Stripe Connect account found for business:',
      selectedService.business.id
    );
    return undefined;
  };

  // Feature flag to conditionally show frequency booking
  const isFrequencyBookingEnabled = useFeatureFlag('ENABLE_FREQUENCY_BOOKING');

  if (!isBookingModalOpen || !selectedService || !bookingDetails) {
    return null;
  }

  // Simplified to single booking only
  const bookingType = {
    value: 'one-time',
    label: 'One-time Service',
    description: 'Single service booking',
  };

  const timeSlots = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];

  // Generate next 7 days for booking
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-GB', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Show payment step
  if (bookingStep === 'payment' && bookingDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Payment</h2>
              <p className="text-sm text-gray-600 mt-1">Step 2 of 3</p>
            </div>
            <button
              onClick={closeBookingModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Payment Content */}
          <div className="p-6 pb-12">
            <PaymentStepCombined
              serviceName={selectedService.name}
              businessName={selectedService.business.name}
              amount={bookingDetails.totalCost || selectedService.price || 0}
              serviceId={selectedService.id}
              businessId={selectedService.business.id}
              stripeConnectAccountId={getStripeConnectAccountId()}
              platformFeeAmount={
                (bookingDetails.totalCost || selectedService.price || 0) * 0.15
              }
              onPaymentComplete={handlePaymentComplete}
              onBack={goBackToDetails}
            />
          </div>
        </div>
      </div>
    );
  }
  // Show confirmation step
  if (bookingStep === 'confirmation' && bookingDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <BookingConfirmation
            bookingDetails={bookingDetails}
            onEdit={goBackToDetails}
            onConfirm={confirmBooking}
            isLoading={isConfirming}
          />
        </div>
      </div>
    );
  }

  // Show booking details step
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Service</h2>
            <p className="text-sm text-gray-600 mt-1">Step 1 of 3</p>
          </div>
          <button
            onClick={closeBookingModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-6 pb-12 space-y-8">
            {/* Service Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedService.name}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {selectedService.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900">
                        {selectedService.business.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">
                        {selectedService.business.profile?.postcode}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 rounded-lg px-3 py-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-700">
                        {selectedService.business.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-center md:text-right">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    £{bookingDetails.totalCost}
                  </div>
                  <div className="text-sm text-gray-600 bg-white/60 rounded-lg px-3 py-1">
                    per session
                  </div>
                </div>
              </div>
            </div>

            {/* Service Type - Conditional Frequency Selection */}
            {isFrequencyBookingEnabled ? (
              <BookingFrequencySelector
                selectedFrequency={bookingDetails.frequency || 'one-time'}
                onFrequencyChange={(frequency) =>
                  updateBookingDetails({ frequency: frequency as any })
                }
                basePrice={selectedService.price || 0}
              />
            ) : (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      {bookingType.label}
                    </h4>
                    <p className="text-gray-600">{bookingType.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Select Date
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {availableDates.map((date) => (
                  <button
                    key={date.value}
                    onClick={() =>
                      updateBookingDetails({ selectedDate: date.value })
                    }
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      bookingDetails.selectedDate === date.value
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-sm font-medium">{date.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Select Time
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => updateBookingDetails({ selectedTime: time })}
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 font-medium ${
                      bookingDetails.selectedTime === time
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Special Instructions (Optional)
              </h4>
              <textarea
                value={bookingDetails.specialInstructions || ''}
                onChange={(e) =>
                  updateBookingDetails({ specialInstructions: e.target.value })
                }
                placeholder="Any specific requirements or areas to focus on..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none h-32 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200"
              />
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                Booking Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">
                    {selectedService.name}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-900">
                    {selectedService.duration}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-gray-600">Service Type:</span>
                  <span className="font-medium text-gray-900">
                    {bookingType.label}
                  </span>
                </div>
                {bookingDetails.selectedDate && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(bookingDetails.selectedDate).toLocaleDateString(
                        'en-GB'
                      )}
                    </span>
                  </div>
                )}
                {bookingDetails.selectedTime && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">
                      {bookingDetails.selectedTime}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-bold text-gray-900">
                    Total Cost:
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    £{bookingDetails.totalCost}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={closeBookingModal}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={proceedToPayment}
            disabled={
              !bookingDetails.selectedDate || !bookingDetails.selectedTime
            }
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              bookingDetails.selectedDate && bookingDetails.selectedTime
                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {bookingDetails.selectedDate && bookingDetails.selectedTime
              ? 'Continue to Payment'
              : 'Select Date & Time'}
          </button>
        </div>
      </div>
    </div>
  );
}
