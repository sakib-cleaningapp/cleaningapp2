'use client';

import React from 'react';
import {
  CheckCircle,
  XCircle,
  X,
  AlertTriangle,
  Calendar,
  User,
  Mail,
} from 'lucide-react';

interface BusinessActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  details?: {
    customerName?: string;
    serviceName?: string;
    date?: string;
    time?: string;
  };
}

export function BusinessActionModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
}: BusinessActionModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <XCircle className="w-8 h-8 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      default:
        return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600';
      default:
        return 'bg-gradient-to-r from-green-500 to-emerald-600';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-50';
      case 'error':
        return 'text-red-50';
      case 'warning':
        return 'text-yellow-50';
      default:
        return 'text-green-50';
    }
  };

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

        {/* Header */}
        <div className={`${getHeaderColor()} p-6 text-center`}>
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            {getIcon()}
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className={`${getTextColor()}`}>{message}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Booking Details */}
          {details && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Booking Details
              </h3>

              <div className="space-y-2">
                {details.customerName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {details.customerName}
                    </span>
                  </div>
                )}
                {details.serviceName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{details.serviceName}</span>
                  </div>
                )}
                {details.date && details.time && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {details.date} at {details.time}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full px-4 py-3 rounded-xl transition-colors font-medium ${
              type === 'success'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : type === 'error'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
            }`}
          >
            {type === 'success'
              ? 'Great!'
              : type === 'error'
                ? 'Try Again'
                : 'Got It'}
          </button>
        </div>
      </div>
    </div>
  );
}
