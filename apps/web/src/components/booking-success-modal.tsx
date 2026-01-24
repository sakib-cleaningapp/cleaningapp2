'use client';

import React from 'react';
import {
  CheckCircle,
  X,
  Calendar,
  Clock,
  Mail,
  ArrowRight,
} from 'lucide-react';

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: {
    requestId: string;
    serviceName: string;
    businessName: string;
    date: string;
    time: string;
    totalCost: number;
  };
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  bookingDetails,
}: BookingSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Request Submitted!
          </h2>
          <p className="text-green-50">
            Your booking request has been sent successfully
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Booking Details
            </h3>

            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">
                  {bookingDetails.serviceName}
                </p>
                <p className="text-gray-600">{bookingDetails.businessName}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(bookingDetails.date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{bookingDetails.time}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">Total Cost</span>
                <span className="text-xl font-bold text-gray-900">
                  £{bookingDetails.totalCost}
                </span>
              </div>
            </div>
          </div>

          {/* Request ID */}
          <div className="bg-blue-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Request ID:</span>{' '}
              {bookingDetails.requestId.slice(-8).toUpperCase()}
            </p>
          </div>

          {/* What Happens Next */}
          <div className="space-y-3 mb-6">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-600" />
              What happens next?
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  The business will review your request and check availability
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>You'll receive a notification once they respond</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>Track your booking status in "My Bookings"</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              Continue Browsing
            </button>
            <button
              onClick={() => {
                window.location.href = '/my-bookings';
              }}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              View Bookings
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
