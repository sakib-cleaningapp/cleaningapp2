'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect, useCallback } from 'react';
import { useNotificationsStore } from './notifications-store';
import { useBusinessNotificationsStore } from './business-notifications-store';
import { bookingsApi } from '@/lib/api/bookings';

export type BookingIssueAction =
  | 'message_customer'
  | 'request_cancellation'
  | 'note';

export interface BookingIssueNote {
  id: string;
  action: BookingIssueAction;
  text: string;
  createdAt: string;
}

export interface BookingRequest {
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
  counterOffer?: {
    date?: string;
    time?: string;
    price?: number;
    message?: string;
  };
  hasIssue?: boolean;
  issueDescription?: string;
  issueNotes?: BookingIssueNote[];
  paymentIntentId?: string;
}

interface BookingRequestsState {
  requests: BookingRequest[];
  addRequest: (
    request: Omit<BookingRequest, 'id' | 'createdAt' | 'status'>
  ) => string;
  updateRequestStatus: (
    id: string,
    status: BookingRequest['status'],
    responseMessage?: string
  ) => void;
  getRequestsForBusiness: (businessId: string) => BookingRequest[];
  getRequestById: (id: string) => BookingRequest | undefined;
  addCounterOffer: (
    id: string,
    counterOffer: BookingRequest['counterOffer']
  ) => void;
  logIssueNote: (id: string, action: BookingIssueAction, text: string) => void;
}

export const useBookingRequestsStore = create<BookingRequestsState>()(
  persist(
    (set, get) => ({
      requests: [],

      addRequest: (requestData) => {
        const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newRequest: BookingRequest = {
          ...requestData,
          id,
          status: 'pending',
          createdAt: new Date().toISOString(),
          hasIssue: false,
          issueNotes: [],
        };

        set((state) => ({
          requests: [newRequest, ...state.requests],
        }));

        // Create business notification for new booking request
        const businessNotificationsStore =
          useBusinessNotificationsStore.getState();
        businessNotificationsStore.addNotification({
          businessId: newRequest.businessId,
          customerId: newRequest.customerId,
          customerName: newRequest.customerName,
          bookingRequestId: newRequest.id,
          type: 'new_booking_request',
          title: '🔔 New Booking Request!',
          message: `${newRequest.customerName} has requested ${newRequest.serviceName} for ${new Date(newRequest.requestedDate).toLocaleDateString()}`,
          serviceName: newRequest.serviceName,
          requestedDate: newRequest.requestedDate,
          requestedTime: newRequest.requestedTime,
          totalCost: newRequest.totalCost,
        });

        console.log('Business notification created for new booking request');

        return id;
      },

      updateRequestStatus: (id, status, responseMessage) => {
        const request = get().requests.find((r) => r.id === id);
        if (!request) return;

        // Update the request status
        set((state) => ({
          requests: state.requests.map((req) =>
            req.id === id ? { ...req, status, responseMessage } : req
          ),
        }));

        // Create customer notification
        console.log(
          'Creating notification for customer:',
          request.customerId,
          'Status:',
          status
        );

        // Add a small delay to ensure stores are synchronized
        setTimeout(() => {
          const notificationsStore = useNotificationsStore.getState();

          let notificationTitle = '';
          let notificationMessage = '';
          let notificationType:
            | 'booking_accepted'
            | 'booking_declined'
            | 'booking_completed'
            | 'booking_cancelled' = 'booking_accepted';

          switch (status) {
            case 'accepted':
              notificationTitle = 'Booking Confirmed! 🎉';
              notificationMessage =
                responseMessage ||
                `Your ${request.serviceName} booking has been confirmed!`;
              notificationType = 'booking_accepted';
              break;
            case 'declined':
              notificationTitle = 'Booking Update';
              notificationMessage =
                responseMessage ||
                `Unfortunately, your ${request.serviceName} booking was declined.`;
              notificationType = 'booking_declined';
              break;
            case 'completed':
              notificationTitle = 'Service Completed';
              notificationMessage = `Your ${request.serviceName} service has been completed. Please consider leaving a review!`;
              notificationType = 'booking_completed';
              break;
            case 'cancelled':
              notificationTitle = 'Booking Cancelled';
              notificationMessage = `Your ${request.serviceName} booking has been cancelled.`;
              notificationType = 'booking_cancelled';
              break;
          }

          const notificationId = notificationsStore.addNotification({
            customerId: request.customerId,
            bookingRequestId: request.id,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            businessName: request.businessName,
            serviceName: request.serviceName,
          });

          console.log(
            'Notification created with ID:',
            notificationId,
            'for customer:',
            request.customerId
          );

          // Force a storage sync
          localStorage.setItem('notification-sync', Date.now().toString());
        }, 100);
      },

      getRequestsForBusiness: (businessId) => {
        return get().requests.filter(
          (request) => request.businessId === businessId
        );
      },

      getRequestById: (id) => {
        return get().requests.find((request) => request.id === id);
      },

      addCounterOffer: (id, counterOffer) => {
        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? { ...request, counterOffer, status: 'pending' }
              : request
          ),
        }));
      },

      logIssueNote: (id, action, text) => {
        const trimmedText = text.trim();
        if (!trimmedText) return;

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === id
              ? {
                  ...request,
                  hasIssue: true,
                  issueNotes: [
                    {
                      id: `issue-note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                      action,
                      text: trimmedText,
                      createdAt: new Date().toISOString(),
                    },
                    ...(request.issueNotes || []),
                  ],
                }
              : request
          ),
        }));
      },
    }),
    {
      name: 'booking-requests-storage',
      // Only persist the requests array
      partialize: (state) => ({ requests: state.requests }),
    }
  )
);

// Hook to get booking requests with real-time updates from Supabase
export const useBookingRequests = (businessId?: string) => {
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch booking requests from Supabase
  const fetchBookings = useCallback(async () => {
    if (!businessId) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const result = await bookingsApi.getBusinessBookings(businessId);

      if (result.success && result.bookings) {
        // Transform Supabase data to match BookingRequest interface
        const transformedBookings: BookingRequest[] = result.bookings.map(
          (booking: any) => ({
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
            paymentIntentId: booking.payment?.stripe_payment_intent_id,
            hasIssue: false,
            issueNotes: [],
          })
        );
        setRequests(transformedBookings);
      } else {
        setError(result.error || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Fetch on mount and when businessId changes
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Update request status via API
  const updateRequestStatus = useCallback(
    async (
      id: string,
      status: BookingRequest['status'],
      responseMessage?: string
    ) => {
      const result = await bookingsApi.updateBookingStatus(
        id,
        status,
        responseMessage
      );
      if (result.success) {
        // Refresh bookings after update
        fetchBookings();
      }
      return result;
    },
    [fetchBookings]
  );

  // Legacy Zustand store methods (for backwards compatibility)
  const {
    addRequest,
    getRequestById: getRequestByIdFromStore,
    addCounterOffer,
    logIssueNote,
  } = useBookingRequestsStore();

  const getRequestById = (id: string) => {
    return requests.find((request) => request.id === id);
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const acceptedRequests = requests.filter((r) => r.status === 'accepted');
  const declinedRequests = requests.filter((r) => r.status === 'declined');

  return {
    requests,
    pendingRequests,
    acceptedRequests,
    declinedRequests,
    addRequest,
    updateRequestStatus,
    getRequestById,
    addCounterOffer,
    logIssueNote,
    refetch: fetchBookings,
    isLoading,
    error,
    stats: {
      total: requests.length,
      pending: pendingRequests.length,
      accepted: acceptedRequests.length,
      declined: declinedRequests.length,
    },
  };
};
