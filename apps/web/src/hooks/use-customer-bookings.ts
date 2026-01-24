'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookingsApi } from '@/lib/api/bookings';

export interface CustomerBooking {
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
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  createdAt: string;
  responseMessage?: string;
  refundStatus?: 'pending' | 'processed' | 'failed' | null;
  refundId?: string | null;
  cancellationReason?: string | null;
  cancelledBy?: 'customer' | 'business' | 'admin' | null;
}

// Map Supabase snake_case to camelCase
function mapBookingFromSupabase(booking: any): CustomerBooking {
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
    status: booking.status,
    createdAt: booking.created_at,
    responseMessage: booking.response_message,
    refundStatus: booking.refund_status,
    refundId: booking.refund_id,
    cancellationReason: booking.cancellation_reason,
    cancelledBy: booking.cancelled_by,
  };
}

export function useCustomerBookings(customerId: string) {
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch bookings from Supabase
  const fetchBookings = useCallback(async () => {
    if (!customerId) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await bookingsApi.getCustomerBookings(customerId);

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
      console.error('Error fetching customer bookings:', err);
      setError('Failed to fetch bookings');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // Fetch on mount and when customerId changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Group by status
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted');
  const declinedBookings = bookings.filter((b) => b.status === 'declined');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  // Cancel booking via API
  const cancelBooking = useCallback(
    async (bookingId: string) => {
      try {
        const result = await bookingsApi.cancelBooking(
          bookingId,
          'Cancelled by customer'
        );
        if (result.success) {
          // Refresh bookings after cancellation
          await fetchBookings();
        } else {
          console.error('Failed to cancel booking:', result.error);
        }
      } catch (err) {
        console.error('Error cancelling booking:', err);
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
