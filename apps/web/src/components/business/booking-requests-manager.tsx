'use client';

import { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  AlertCircle,
  Loader2,
  Send,
} from 'lucide-react';
import {
  useBusinessBookings,
  BusinessBooking,
} from '@/hooks/use-business-bookings';
import { BusinessActionModal } from './business-action-modal';
import { MessageCustomerModal } from './message-customer-modal';

interface BookingRequestsManagerProps {
  businessId: string;
  businessName?: string;
}

export function BookingRequestsManager({
  businessId,
  businessName = 'Business',
}: BookingRequestsManagerProps) {
  const {
    bookings,
    pendingBookings,
    acceptedBookings,
    declinedBookings,
    cancelledBookings,
    updateBookingStatus,
    cancelBooking,
    stats,
    isLoading,
    error,
    refetch,
  } = useBusinessBookings(businessId);

  const [activeTab, setActiveTab] = useState<
    'pending' | 'accepted' | 'declined' | 'cancelled' | 'all'
  >('pending');
  const [cancelReason, setCancelReason] = useState('');
  const [selectedRequest, setSelectedRequest] =
    useState<BusinessBooking | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
    details?: any;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [messageModalBooking, setMessageModalBooking] =
    useState<BusinessBooking | null>(null);

  const getDisplayRequests = () => {
    switch (activeTab) {
      case 'pending':
        return pendingBookings;
      case 'accepted':
        return acceptedBookings;
      case 'declined':
        return declinedBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return bookings;
    }
  };

  const handleCancelBooking = async (requestId: string) => {
    if (!cancelReason.trim()) {
      setActionModal({
        isOpen: true,
        type: 'warning',
        title: 'Reason Required',
        message: 'Please provide a reason for cancelling this booking.',
      });
      return;
    }

    setActionLoadingId(requestId);
    try {
      const request = bookings.find((r) => r.id === requestId);
      const result = await cancelBooking(requestId, cancelReason);

      if (result.success) {
        const refundMessage = result.refund?.success
          ? ' A refund has been automatically processed.'
          : '';
        setActionModal({
          isOpen: true,
          type: 'success',
          title: 'Booking Cancelled',
          message: `The booking has been cancelled and the customer has been notified.${refundMessage}`,
          details: request
            ? {
                customerName: request.customerName,
                serviceName: request.serviceName,
                date: new Date(request.requestedDate).toLocaleDateString(),
                time: request.requestedTime,
                refundProcessed: result.refund?.success || false,
              }
            : undefined,
        });
      } else {
        throw new Error(result.error);
      }

      setCancelReason('');
      setSelectedRequest(null);
    } catch (error) {
      setActionModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to cancel booking. Please try again.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    setActionLoadingId(requestId);
    try {
      const request = bookings.find((r) => r.id === requestId);
      const result = await updateBookingStatus(
        requestId,
        'accepted',
        responseMessage ||
          'Your booking has been confirmed! We look forward to providing our services.'
      );

      if (result.success) {
        setActionModal({
          isOpen: true,
          type: 'success',
          title: 'Booking Accepted!',
          message:
            'The customer has been notified and will receive confirmation details.',
          details: request
            ? {
                customerName: request.customerName,
                serviceName: request.serviceName,
                date: new Date(request.requestedDate).toLocaleDateString(),
                time: request.requestedTime,
              }
            : undefined,
        });
      } else {
        throw new Error(result.error);
      }

      setResponseMessage('');
      setSelectedRequest(null);
    } catch (error) {
      setActionModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to accept booking request. Please try again.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    if (!responseMessage.trim()) {
      setActionModal({
        isOpen: true,
        type: 'warning',
        title: 'Message Required',
        message: 'Please provide a reason for declining this booking request.',
      });
      return;
    }

    setActionLoadingId(requestId);
    try {
      const request = bookings.find((r) => r.id === requestId);
      const result = await updateBookingStatus(
        requestId,
        'declined',
        responseMessage
      );

      if (result.success) {
        setActionModal({
          isOpen: true,
          type: 'success',
          title: 'Booking Declined',
          message: 'The customer has been notified with your response.',
          details: request
            ? {
                customerName: request.customerName,
                serviceName: request.serviceName,
                date: new Date(request.requestedDate).toLocaleDateString(),
                time: request.requestedTime,
              }
            : undefined,
        });
      } else {
        throw new Error(result.error);
      }

      setResponseMessage('');
      setSelectedRequest(null);
    } catch (error) {
      setActionModal({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to decline booking request. Please try again.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getStatusBadge = (status: BusinessBooking['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      declined: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const icons = {
      pending: Clock,
      accepted: CheckCircle,
      declined: XCircle,
      cancelled: XCircle,
      completed: Star,
    };

    const Icon = icons[status];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleStripeRefund = async (paymentIntentId?: string) => {
    if (!paymentIntentId) {
      return { success: false, reason: 'No payment intent on this booking.' };
    }

    try {
      const res = await fetch('/api/stripe/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          reason: data.error || 'Stripe refund could not be started.',
        };
      }

      return { success: true as const, refundId: data.refundId as string };
    } catch (err) {
      console.error('Stripe refund request failed', err);
      return {
        success: false,
        reason: 'Refund request failed (network or config).',
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking requests...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const displayRequests = getDisplayRequests();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.accepted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Declined</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.declined}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'pending', label: 'Pending', count: stats.pending },
              { id: 'accepted', label: 'Accepted', count: stats.accepted },
              { id: 'declined', label: 'Declined', count: stats.declined },
              { id: 'cancelled', label: 'Cancelled', count: stats.cancelled },
              { id: 'all', label: 'All Requests', count: stats.total },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Booking Requests List */}
        <div className="p-6">
          {displayRequests.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab === 'all' ? '' : activeTab} booking requests
              </h3>
              <p className="text-gray-600">
                {activeTab === 'pending'
                  ? 'New booking requests will appear here.'
                  : `You have no ${activeTab} requests at the moment.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-50 rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Request Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.serviceName}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            £{request.totalCost}
                          </span>
                        </div>
                      </div>

                      {/* Request Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="font-medium">
                              {request.customerName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span>{request.customerEmail}</span>
                          </div>
                          {request.customerPhone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span>{request.customerPhone}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {formatDate(request.requestedDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(request.requestedTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>
                              Requested{' '}
                              {new Date(request.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions */}
                      {request.specialInstructions && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Special Instructions:
                          </h4>
                          <p className="text-sm text-gray-600 bg-white rounded p-3 border">
                            {request.specialInstructions}
                          </p>
                        </div>
                      )}

                      {/* Response Message */}
                      {request.responseMessage && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Your Response:
                          </h4>
                          <p className="text-sm text-gray-600 bg-white rounded p-3 border">
                            {request.responseMessage}
                          </p>
                        </div>
                      )}

                      {/* Actions for Pending Requests */}
                      {request.status === 'pending' && (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Response Message (optional for accept, required
                                for decline):
                              </label>
                              <textarea
                                value={
                                  selectedRequest?.id === request.id
                                    ? responseMessage
                                    : ''
                                }
                                onChange={(e) => {
                                  setSelectedRequest(request);
                                  setResponseMessage(e.target.value);
                                }}
                                placeholder="Add a message for the customer..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={2}
                              />
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  handleAcceptRequest(request.id);
                                }}
                                disabled={actionLoadingId === request.id}
                                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {actionLoadingId === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                                Accept Booking
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  handleDeclineRequest(request.id);
                                }}
                                disabled={actionLoadingId === request.id}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {actionLoadingId === request.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                                Decline Booking
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions for Accepted Bookings - Message and Cancel options */}
                      {request.status === 'accepted' && (
                        <div className="border-t border-gray-200 pt-4">
                          <div className="space-y-4">
                            {/* Message Customer Section */}
                            <div className="bg-sky-50 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-sky-600" />
                                    Contact Customer
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Send a message about this booking
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    setMessageModalBooking(request)
                                  }
                                  className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
                                >
                                  <Send className="w-4 h-4" />
                                  Message Customer
                                </button>
                              </div>
                            </div>

                            {/* Cancel Booking Section */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Cancellation Reason (required):
                                </label>
                                <textarea
                                  value={
                                    selectedRequest?.id === request.id
                                      ? cancelReason
                                      : ''
                                  }
                                  onChange={(e) => {
                                    setSelectedRequest(request);
                                    setCancelReason(e.target.value);
                                  }}
                                  placeholder="Explain why you need to cancel this booking..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  rows={2}
                                />
                              </div>

                              <div className="flex gap-3">
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    handleCancelBooking(request.id);
                                  }}
                                  disabled={actionLoadingId === request.id}
                                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {actionLoadingId === request.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  Cancel Booking & Issue Refund
                                </button>
                              </div>
                              <p className="text-xs text-gray-500">
                                Cancelling will automatically refund the
                                customer if payment was already collected.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Business Action Modal */}
      <BusinessActionModal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal((prev) => ({ ...prev, isOpen: false }))}
        type={actionModal.type}
        title={actionModal.title}
        message={actionModal.message}
        details={actionModal.details}
      />

      {/* Message Customer Modal */}
      {messageModalBooking && (
        <MessageCustomerModal
          booking={messageModalBooking}
          businessId={businessId}
          businessName={businessName}
          isOpen={!!messageModalBooking}
          onClose={() => setMessageModalBooking(null)}
        />
      )}
    </div>
  );
}
