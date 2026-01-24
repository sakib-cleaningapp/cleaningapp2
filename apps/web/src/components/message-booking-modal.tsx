'use client';

import { useState } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Calendar,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { messagesApi } from '@/lib/api/messages';
import { CustomerBooking } from '@/hooks/use-customer-bookings';

interface MessageBookingModalProps {
  booking: CustomerBooking;
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export function MessageBookingModal({
  booking,
  isOpen,
  onClose,
  customerName,
  customerEmail,
  customerPhone,
}: MessageBookingModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const formattedDate = new Date(booking.requestedDate).toLocaleDateString(
    'en-GB',
    {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }
  );

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      const result = await messagesApi.sendMessage({
        senderId: booking.customerId,
        recipientBusinessId: booking.businessId,
        senderName: customerName,
        senderEmail: customerEmail,
        senderPhone: customerPhone || '',
        subject: `Re: ${booking.serviceName} booking on ${formattedDate}`,
        message: message.trim(),
        messageType: 'booking',
        isUrgent: false,
      });

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setMessage('');
          onClose();
        }, 2000);
      } else {
        setError(result.error || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-lg font-semibold">
                Message {booking.businessName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Booking Context */}
        <div className="px-6 py-3 bg-sky-50 border-b border-sky-100">
          <div className="flex items-center gap-2 text-sm text-sky-700">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{booking.serviceName}</span>
            <span className="text-sky-500">•</span>
            <span>
              {formattedDate} at {booking.requestedTime}
            </span>
          </div>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Message Sent!
            </h3>
            <p className="text-gray-600">
              {booking.businessName} will be notified and can reply to your
              message.
            </p>
          </div>
        ) : (
          <>
            {/* Message Input */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question about your booking, request changes, or let them know anything important..."
                className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                disabled={isSending}
              />

              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                disabled={isSending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
