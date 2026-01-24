'use client';

import { useState, useCallback } from 'react';
import { ServiceWithBusiness } from './use-services';
import { bookingsApi } from '@/lib/api/bookings';
import {
  calculatePlatformFee,
  calculateBusinessEarnings,
} from '@/lib/stripe-config';
import { useAuth } from '@/contexts/auth-context';

export interface BookingDetails {
  service: ServiceWithBusiness;
  selectedDate?: string;
  selectedTime?: string;
  frequency?: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly'; // Optional for feature flag support
  specialInstructions?: string;
  totalCost?: number;
}

export interface UseBookingReturn {
  selectedService: ServiceWithBusiness | null;
  bookingDetails: BookingDetails | null;
  isBookingModalOpen: boolean;
  bookingStep: 'details' | 'payment' | 'confirmation';
  selectService: (service: ServiceWithBusiness) => void;
  updateBookingDetails: (details: Partial<BookingDetails>) => void;
  openBookingModal: () => void;
  closeBookingModal: () => void;
  resetBooking: () => void;
  proceedToPayment: () => void;
  goBackToDetails: () => void;
  goBackToPayment: () => void;
  handlePaymentComplete: (paymentDetails: any) => void;
  confirmBooking: () => void;
  isConfirming: boolean;
  showSuccessModal: boolean;
  setShowSuccessModal: (show: boolean) => void;
  successDetails: any;
  paymentDetails: any;
}

export function useBooking(): UseBookingReturn {
  const [selectedService, setSelectedService] =
    useState<ServiceWithBusiness | null>(null);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<
    'details' | 'payment' | 'confirmation'
  >('details');
  const [isConfirming, setIsConfirming] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successDetails, setSuccessDetails] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const { user } = useAuth();

  const selectService = useCallback((service: ServiceWithBusiness) => {
    setSelectedService(service);
    setBookingDetails({
      service,
      frequency: 'one-time', // Default to one-time
      totalCost: service.price || undefined,
    });
    setIsBookingModalOpen(true);
  }, []);

  const updateBookingDetails = useCallback(
    (details: Partial<BookingDetails>) => {
      setBookingDetails((prev) => {
        if (!prev) return null;

        const updated = { ...prev, ...details };

        // Keep total cost as the base service price
        if (updated.service && !updated.totalCost) {
          updated.totalCost = updated.service.price || undefined;
        }

        return updated;
      });
    },
    []
  );

  const openBookingModal = useCallback(() => {
    setIsBookingModalOpen(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  const resetBooking = useCallback(() => {
    setSelectedService(null);
    setBookingDetails(null);
    setIsBookingModalOpen(false);
    setBookingStep('details');
    setIsConfirming(false);
  }, []);

  const proceedToPayment = useCallback(() => {
    if (bookingDetails?.selectedDate && bookingDetails?.selectedTime) {
      setBookingStep('payment');
    }
  }, [bookingDetails]);

  const goBackToDetails = useCallback(() => {
    setBookingStep('details');
  }, []);

  const goBackToPayment = useCallback(() => {
    setBookingStep('payment');
  }, []);

  const handlePaymentComplete = useCallback((payment: any) => {
    console.log('Payment completed:', payment);
    setPaymentDetails(payment);
    setBookingStep('confirmation');
  }, []);

  const confirmBooking = useCallback(async () => {
    console.log('confirmBooking called', { bookingDetails, paymentDetails });

    if (!bookingDetails?.selectedDate || !bookingDetails?.selectedTime) {
      console.error('Missing booking details');
      alert(
        'Missing booking date or time. Please go back and complete the booking form.'
      );
      return;
    }

    if (!paymentDetails) {
      console.error('Missing payment details');
      alert('Missing payment details. Please complete the payment step.');
      return;
    }

    if (!user) {
      console.error('User not authenticated');
      alert('You must be logged in to create a booking.');
      return;
    }

    setIsConfirming(true);

    try {
      const totalCost =
        bookingDetails.totalCost || bookingDetails.service.price || 0;
      const platformFee = calculatePlatformFee(totalCost);
      const businessEarnings = calculateBusinessEarnings(totalCost);

      console.log('Creating booking with data:', {
        totalCost,
        platformFee,
        businessEarnings,
        cardLast4: paymentDetails.cardLast4,
        cardBrand: paymentDetails.cardBrand,
      });

      // Create booking in database with payment
      const result = await bookingsApi.createBooking(
        {
          customer_id: user.id,
          customer_name: user.fullName || 'Customer',
          customer_email: user.email,
          customer_phone: '029 1234 5678',
          service_id: bookingDetails.service.id,
          service_name: bookingDetails.service.name,
          business_id: bookingDetails.service.business.id,
          business_name: bookingDetails.service.business.name,
          requested_date: bookingDetails.selectedDate,
          requested_time: bookingDetails.selectedTime,
          special_instructions: bookingDetails.specialInstructions,
          total_cost: totalCost,
          platform_fee: platformFee,
          business_earnings: businessEarnings,
        },
        {
          amount: totalCost,
          platform_fee: platformFee,
          business_earnings: businessEarnings,
          card_last4: paymentDetails.cardLast4,
          card_brand: paymentDetails.cardBrand,
          payment_method_type: 'card',
          stripe_payment_intent_id: paymentDetails.paymentIntentId, // Add Stripe payment intent ID
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to create booking');
      }

      console.log('Booking created successfully:', result.booking);

      // Show success modal
      setSuccessDetails({
        requestId: result.booking.id,
        serviceName: bookingDetails.service.name,
        businessName: bookingDetails.service.business.name,
        date: bookingDetails.selectedDate,
        time: bookingDetails.selectedTime,
        totalCost,
        paymentStatus: 'paid',
      });
      setShowSuccessModal(true);
      resetBooking();
    } catch (error) {
      console.error('Booking request failed:', error);
      alert('Failed to submit booking request. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  }, [bookingDetails, paymentDetails, resetBooking, user]);

  return {
    selectedService,
    bookingDetails,
    isBookingModalOpen,
    bookingStep,
    selectService,
    updateBookingDetails,
    openBookingModal,
    closeBookingModal,
    resetBooking,
    proceedToPayment,
    goBackToDetails,
    goBackToPayment,
    handlePaymentComplete,
    confirmBooking,
    isConfirming,
    showSuccessModal,
    setShowSuccessModal,
    successDetails,
    paymentDetails,
  };
}
