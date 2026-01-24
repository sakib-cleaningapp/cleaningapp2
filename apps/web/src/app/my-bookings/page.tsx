'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  X,
  RefreshCw,
  RotateCw,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useCustomerBookings } from '@/hooks/use-customer-bookings';
import { useState } from 'react';
import { LeaveReviewModal } from '@/components/leave-review-modal';
import { MessageBookingModal } from '@/components/message-booking-modal';
import { useReviewsStore } from '@/stores/reviews-store';
import { useAuth } from '@/contexts/auth-context';
import { CustomerBooking } from '@/hooks/use-customer-bookings';

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  // Fetch bookings from Supabase using the logged-in user's ID
  const {
    isLoading: bookingsLoading,
    error: bookingsError,
    ...customerBookings
  } = useCustomerBookings(user?.id || '');
  const { getReviewForBooking } = useReviewsStore();
  const [activeTab, setActiveTab] = useState<
    'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'
  >('all');
  const [reviewModalBooking, setReviewModalBooking] = useState<any | null>(
    null
  );
  const [messageBusinessBooking, setMessageBusinessBooking] =
    useState<CustomerBooking | null>(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const getFilteredBookings = () => {
    switch (activeTab) {
      case 'pending':
        return customerBookings.pendingBookings;
      case 'accepted':
        return customerBookings.acceptedBookings;
      case 'completed':
        return customerBookings.completedBookings;
      case 'cancelled':
        return customerBookings.cancelledBookings;
      default:
        return customerBookings.bookings;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'declined':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return '✅';
      case 'pending':
        return '⏳';
      case 'declined':
        return '❌';
      case 'completed':
        return '🎉';
      case 'cancelled':
        return '🚫';
      default:
        return '❓';
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      customerBookings.cancelBooking(bookingId);
    }
  };

  const handleBookAgain = (booking: any) => {
    // Navigate to dashboard and show the business's offerings page
    // Store the category and business to pre-select them
    sessionStorage.setItem(
      'viewBusinessDetails',
      JSON.stringify({
        category: booking.category,
        businessId: booking.businessId,
        businessName: booking.businessName,
      })
    );
    router.push('/dashboard');
  };

  const handleMessageBusiness = (booking: CustomerBooking) => {
    setMessageBusinessBooking(booking);
    setIsMessageModalOpen(true);
  };

  // Show loading state while auth or bookings are loading
  if (authLoading || bookingsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Show error state if bookings failed to load
  if (bookingsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{bookingsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            </div>
            <div className="text-sm text-gray-600">
              {customerBookings.stats.total} total bookings
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerBookings.stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerBookings.stats.accepted}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerBookings.stats.completed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {customerBookings.stats.total}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Book Again Quick Access */}
        {customerBookings.completedBookings.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Book Again
                </h2>
                <p className="text-sm text-gray-600">
                  Quick rebooking for your favorite services
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customerBookings.completedBookings.slice(0, 3).map((booking) => (
                <button
                  key={booking.id}
                  onClick={() => handleBookAgain(booking)}
                  className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-all text-left group"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-sky-700">
                      {booking.serviceName}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {booking.businessName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Last booked:{' '}
                      {new Date(booking.requestedDate).toLocaleDateString(
                        'en-GB',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                  <RotateCw className="w-5 h-5 text-gray-400 group-hover:text-sky-600 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                {
                  id: 'all',
                  label: 'All Bookings',
                  count: customerBookings.stats.total,
                },
                {
                  id: 'pending',
                  label: 'Pending',
                  count: customerBookings.stats.pending,
                },
                {
                  id: 'accepted',
                  label: 'Confirmed',
                  count: customerBookings.stats.accepted,
                },
                {
                  id: 'completed',
                  label: 'Completed',
                  count: customerBookings.stats.completed,
                },
                {
                  id: 'cancelled',
                  label: 'Cancelled',
                  count: customerBookings.stats.cancelled,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-sky-100 text-sky-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {getFilteredBookings().length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                {activeTab === 'all'
                  ? "You haven't made any bookings yet."
                  : `No ${activeTab} bookings at the moment.`}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            getFilteredBookings().map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.serviceName}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}
                      >
                        <span>{getStatusIcon(booking.status)}</span>
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-lg text-gray-700 mb-3">
                      {booking.businessName}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(booking.requestedDate).toLocaleDateString(
                            'en-US',
                            {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{booking.requestedTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{booking.customerEmail}</span>
                      </div>
                    </div>

                    {booking.specialInstructions && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">
                            Special instructions:
                          </span>{' '}
                          {booking.specialInstructions}
                        </p>
                      </div>
                    )}

                    {booking.responseMessage && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">
                            Business response:
                          </span>{' '}
                          {booking.responseMessage}
                        </p>
                      </div>
                    )}

                    {booking.status === 'cancelled' &&
                      booking.cancellationReason && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">
                              Cancellation reason:
                            </span>{' '}
                            {booking.cancellationReason}
                          </p>
                          {booking.cancelledBy && (
                            <p className="text-xs text-gray-500 mt-1">
                              Cancelled by:{' '}
                              {booking.cancelledBy === 'customer'
                                ? 'You'
                                : booking.cancelledBy === 'business'
                                  ? 'Business'
                                  : 'Platform admin'}
                            </p>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      £{booking.totalCost}
                    </div>
                    <div className="text-sm text-gray-500 mb-3">
                      Requested{' '}
                      {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>

                    <div className="flex flex-col gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleMessageBusiness(booking)}
                            className="flex items-center gap-2 px-4 py-2 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors text-sm font-medium"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="flex items-center gap-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === 'completed' && (
                        <>
                          {!getReviewForBooking(booking.id) ? (
                            <button
                              onClick={() => setReviewModalBooking(booking)}
                              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                            >
                              <Star className="w-4 h-4" />
                              Leave Review
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                              <Star className="w-4 h-4 fill-green-600 text-green-600" />
                              Review Submitted
                            </div>
                          )}
                          <button
                            onClick={() => handleMessageBusiness(booking)}
                            className="flex items-center gap-2 px-4 py-2 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors text-sm font-medium"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                          <button
                            onClick={() => handleBookAgain(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                          >
                            <RotateCw className="w-4 h-4" />
                            Book Again
                          </button>
                        </>
                      )}
                      {booking.status === 'accepted' && (
                        <>
                          <button
                            onClick={() => handleMessageBusiness(booking)}
                            className="flex items-center gap-2 px-4 py-2 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition-colors text-sm font-medium"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                          <button
                            onClick={() => handleBookAgain(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                          >
                            <RotateCw className="w-4 h-4" />
                            Book Again
                          </button>
                        </>
                      )}
                      {booking.status === 'cancelled' && (
                        <>
                          {booking.refundStatus === 'processed' && (
                            <div className="flex items-center gap-1 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                              <RefreshCw className="w-4 h-4" />
                              Refund Processed
                            </div>
                          )}
                          {booking.refundStatus === 'pending' && (
                            <div className="flex items-center gap-1 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                              <Clock className="w-4 h-4" />
                              Refund Pending
                            </div>
                          )}
                          {booking.refundStatus === 'failed' && (
                            <div className="flex items-center gap-1 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                              <X className="w-4 h-4" />
                              Refund Failed
                            </div>
                          )}
                          <button
                            onClick={() => handleBookAgain(booking)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                          >
                            <RotateCw className="w-4 h-4" />
                            Book Again
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {getFilteredBookings().length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Book Another Service
            </Link>
          </div>
        )}
      </div>

      {/* Leave Review Modal */}
      {reviewModalBooking && (
        <LeaveReviewModal
          isOpen={!!reviewModalBooking}
          onClose={() => setReviewModalBooking(null)}
          booking={reviewModalBooking}
          onReviewSubmitted={() => {
            // Refresh the page to show updated review status
            window.location.reload();
          }}
        />
      )}

      {/* Message Business Modal */}
      {isMessageModalOpen && messageBusinessBooking && (
        <MessageBookingModal
          booking={messageBusinessBooking}
          isOpen={isMessageModalOpen}
          onClose={() => {
            setIsMessageModalOpen(false);
            setMessageBusinessBooking(null);
          }}
          customerName={user?.name || user?.email?.split('@')[0] || 'Customer'}
          customerEmail={user?.email || ''}
          customerPhone={user?.phone}
        />
      )}
    </div>
  );
}
