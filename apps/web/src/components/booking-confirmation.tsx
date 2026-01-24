'use client';

import React from 'react';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  ArrowRight,
  Edit3,
} from 'lucide-react';
import { BookingDetails } from '@/hooks/use-booking';

interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onEdit: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function BookingConfirmation({
  bookingDetails,
  onEdit,
  onConfirm,
  isLoading = false,
}: BookingConfirmationProps) {
  const {
    service,
    selectedDate,
    selectedTime,
    specialInstructions,
    totalCost,
  } = bookingDetails;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Submit Booking Request
        </h1>
        <p className="text-gray-600">
          Review your details and submit your request to {service.business.name}
        </p>
      </div>

      {/* Service Summary */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Service Details
        </h2>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {service.name}
            </h3>
            <p className="text-gray-600 mb-3">{service.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{service.business.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{service.business.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{service.business.profile?.postcode}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">£{totalCost}</div>
            <div className="text-sm text-gray-600">per session</div>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Booking Information
            </h2>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {selectedDate && (
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Date</div>
                <div className="text-gray-600">{formatDate(selectedDate)}</div>
              </div>
            </div>
          )}

          {selectedTime && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">Time</div>
                <div className="text-gray-600">{formatTime(selectedTime)}</div>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-1" />
            <div>
              <div className="font-semibold text-gray-900">Duration</div>
              <div className="text-gray-600">{service.duration}</div>
            </div>
          </div>

          {specialInstructions && (
            <div className="flex items-start gap-3">
              <Edit3 className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">
                  Special Instructions
                </div>
                <div className="text-gray-600">{specialInstructions}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Pricing Summary
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{service.name}</span>
            <span className="font-medium text-gray-900">£{service.price}</span>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                £{totalCost}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="font-bold text-gray-900 mb-2">What happens next?</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Your booking request will be sent to {service.business.name}
          </li>
          <li className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            The business will review your request and check availability
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            You'll receive an email when they accept or propose alternatives
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Track your booking status in your dashboard
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={onEdit}
          className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Go Back & Edit
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading || !selectedDate || !selectedTime}
          className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            selectedDate && selectedTime && !isLoading
              ? 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Submitting Request...
            </>
          ) : (
            <>
              Submit Booking Request
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
