'use client';

import { supabase, isSupabaseReady } from '@/lib/supabase';
import type { BookingRequest } from '@/stores/booking-requests-store';

// Type for creating a new booking
// Note: booking_requests table only has: customer_id, customer_name, customer_email,
// business_id, business_name, service_id, service_name, requested_date, requested_time,
// total_cost, platform_fee, status, created_at
export interface CreateBookingInput {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string; // Not in DB schema - will be stripped
  business_id: string;
  business_name: string;
  service_id: string;
  service_name: string;
  requested_date: string; // ISO date string
  requested_time: string;
  special_instructions?: string; // Not in DB schema - will be stripped
  total_cost: number;
  platform_fee: number;
  business_earnings?: number; // Not in DB schema - used for calculations only
}

// Type for creating a payment record
// Note: payments table only has: id, booking_id, stripe_payment_intent_id, amount, status, paid_at, created_at
export interface CreatePaymentInput {
  booking_id: string;
  amount: number;
  platform_fee?: number; // Not in DB schema - used for calculations only
  business_earnings?: number; // Not in DB schema - used for calculations only
  card_last4?: string; // Not in DB schema
  card_brand?: string; // Not in DB schema
  payment_method_type?: string; // Not in DB schema
  stripe_payment_intent_id?: string;
}

/**
 * Bookings API - All booking-related database operations
 */
export const bookingsApi = {
  /**
   * Create a new booking request with payment
   */
  async createBooking(
    bookingData: CreateBookingInput,
    paymentData: Omit<CreatePaymentInput, 'booking_id'>
  ) {
    // If Supabase is not configured, fall back to mock behavior
    if (!isSupabaseReady()) {
      console.warn('⚠️ Supabase not configured - using mock booking creation');
      return {
        success: true,
        booking: {
          id: `mock-booking-${Date.now()}`,
          ...bookingData,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        payment: {
          id: `mock-payment-${Date.now()}`,
          booking_id: `mock-booking-${Date.now()}`,
          ...paymentData,
          status: 'succeeded' as const,
          paid_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    try {
      // Get auth token for API call
      // Note: We use getSession() only - refreshSession() can trigger onAuthStateChange
      // which may cause unexpected logouts if the refresh fails
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        throw new Error('Authentication required. Please log in again.');
      }

      const token = session.access_token;

      // Call server-side API route (bypasses RLS with service role key)
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingData, paymentData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      return {
        success: true,
        booking: result.booking,
        payment: result.payment,
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create booking';
      console.error('Error creating booking:', errorMessage, error);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Get all bookings for a customer
   * Uses the API route which properly maps auth user ID to profile ID
   */
  async getCustomerBookings(customerId: string) {
    if (!customerId) {
      return { success: true, bookings: [] };
    }

    try {
      // Get auth token for API call
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('No auth session for fetching bookings');
        return {
          success: false,
          error: 'Authentication required',
          bookings: [],
        };
      }

      const response = await fetch('/api/bookings?type=customer', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }

      return { success: true, bookings: result.bookings || [] };
    } catch (error) {
      console.error('Error fetching customer bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch bookings',
        bookings: [],
      };
    }
  },

  /**
   * Get all bookings for a business
   * Uses the API route which bypasses RLS
   * Note: Business auth may use localStorage session, not Supabase auth
   */
  async getBusinessBookings(businessId: string) {
    if (!businessId) {
      return { success: true, bookings: [] };
    }

    try {
      // Try to get auth token if available (customer flow uses Supabase auth)
      // Business flow may use localStorage session instead
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const headers: Record<string, string> = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(
        `/api/bookings?type=business&businessId=${businessId}`,
        {
          method: 'GET',
          headers,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch bookings');
      }

      return { success: true, bookings: result.bookings || [] };
    } catch (error) {
      console.error('Error fetching business bookings:', error);
      return {
        success: false,
        error: 'Failed to fetch bookings',
        bookings: [],
      };
    }
  },

  /**
   * Update booking status (accept, decline, complete, cancel)
   * Uses API route which bypasses RLS with service role key
   */
  async updateBookingStatus(
    bookingId: string,
    status: 'accepted' | 'declined' | 'completed' | 'cancelled',
    options?: {
      responseMessage?: string;
      cancelledBy?: 'customer' | 'business';
      cancellationReason?: string;
    }
  ) {
    try {
      // Call server-side API route (bypasses RLS with service role key)
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status,
          responseMessage: options?.responseMessage,
          cancelledBy: options?.cancelledBy,
          cancellationReason: options?.cancellationReason,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update booking status');
      }

      return { success: true, booking: result.booking, refund: result.refund };
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      return {
        success: false,
        error: error?.message || 'Failed to update booking status',
      };
    }
  },

  /**
   * Cancel a booking (customer-initiated)
   * Automatically triggers a refund if the booking was paid
   */
  async cancelBooking(bookingId: string, reason?: string) {
    return this.updateBookingStatus(bookingId, 'cancelled', {
      cancelledBy: 'customer',
      cancellationReason: reason,
    });
  },

  /**
   * Cancel a booking (business-initiated)
   * Automatically triggers a refund if the booking was paid
   */
  async cancelBookingByBusiness(bookingId: string, reason?: string) {
    return this.updateBookingStatus(bookingId, 'cancelled', {
      cancelledBy: 'business',
      cancellationReason: reason,
    });
  },

  /**
   * Subscribe to booking updates (real-time)
   */
  subscribeToBookings(
    type: 'customer' | 'business',
    id: string,
    callback: (payload: any) => void
  ) {
    const channel = supabase
      .channel(`bookings_${type}_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_requests',
          filter:
            type === 'customer'
              ? `customer_id=eq.${id}`
              : `business_id=eq.${id}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
