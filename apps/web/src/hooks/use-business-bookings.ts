'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookingsApi } from '@/lib/api/bookings';

export interface BusinessBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: string;
  serviceName: string;
  businessId: string;
  businessName: string;
  requestedDate: string;
  requestedTime: string;
  specialInstructions?: string;
  totalCost: number;
  platformFee?: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  createdAt: string;
  responseMessage?: string;
}

// Map Supabase snake_case to camelCase
function mapBookingFromSupabase(booking: any): BusinessBooking {
  return {
    id: booking.id,
    customerId: booking.customer_id,
    customerName: booking.customer_name,
    customerEmail: booking.customer_email,
    customerPhone: booking.customer_phone,
    serviceId: booking.service_id,
    serviceName: booking.service_name,
    businessId: booking.business_id,
    businessName: booking.business_name,
    requestedDate: booking.requested_date,
    requestedTime: booking.requested_time,
    specialInstructions: booking.special_instructions,
    totalCost: booking.total_cost,
    platformFee: booking.platform_fee,
    status: booking.status,
    createdAt: booking.created_at,
    responseMessage: booking.response_message,
  };
}

export function useBusinessBookings(businessId: string) {
  const [bookings, setBookings] = useState<BusinessBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings from Supabase
  const fetchBookings = useCallback(async () => {
    if (!businessId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await bookingsApi.getBusinessBookings(businessId);

      if (result.success && result.bookings) {
        const mappedBookings = result.bookings.map(mapBookingFromSupabase);
        // Sort by most recent first
        mappedBookings.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(mappedBookings);
      } else {
        setError(result.error || 'Failed to fetch bookings');
        setBookings([]);
      }
    } catch (err) {
      console.error('Error fetching business bookings:', err);
      setError('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Fetch on mount and when businessId changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Group by status
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const declinedBookings = bookings.filter((b) => b.status === 'declined');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  // Update booking status via Supabase API
  const updateBookingStatus = useCallback(
    async (
      bookingId: string,
      status: 'accepted' | 'declined' | 'completed' | 'cancelled',
      responseMessage?: string
    ) => {
      try {
        const result = await bookingsApi.updateBookingStatus(
          bookingId,
          status,
          { responseMessage }
        );
        if (result.success) {
          // Refresh bookings after status update
          await fetchBookings();
          return { success: true, refund: result.refund };
        } else {
          console.error('Failed to update booking status:', result.error);
          return { success: false, error: result.error };
        }
      } catch (err) {
        console.error('Error updating booking status:', err);
        return { success: false, error: 'Failed to update booking status' };
      }
    },
    [fetchBookings]
  );

  // Cancel booking (business-initiated) with automatic refund
  const cancelBooking = useCallback(
    async (bookingId: string, cancellationReason?: string) => {
      try {
        const result = await bookingsApi.cancelBookingByBusiness(
          bookingId,
          cancellationReason
        );
        if (result.success) {
          // Refresh bookings after cancellation
          await fetchBookings();
          return { success: true, refund: result.refund };
        } else {
          console.error('Failed to cancel booking:', result.error);
          return { success: false, error: result.error };
        }
      } catch (err) {
        console.error('Error cancelling booking:', err);
        return { success: false, error: 'Failed to cancel booking' };
      }
    },
    [fetchBookings]
  );

  return {
    bookings,
    pendingBookings,
    acceptedBookings,
    declinedBookings,
    completedBookings,
    cancelledBookings,
    updateBookingStatus,
    cancelBooking,
    isLoading,
    error,
    refetch: fetchBookings,
    stats: {
      total: bookings.length,
      pending: pendingBookings.length,
      accepted: acceptedBookings.length,
      declined: declinedBookings.length,
      completed: completedBookings.length,
      cancelled: cancelledBookings.length,
    },
  };
}
