'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { supabase, isSupabaseReady } from '@/lib/supabase';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onReviewSubmitted?: () => void;
}

export function LeaveReviewModal({
  isOpen,
  onClose,
  booking,
  onReviewSubmitted,
}: LeaveReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!isSupabaseReady()) {
      setError('Database connection not available. Please try again later.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert review into the reviews table
      const { data: reviewData, error: insertError } = await supabase
        .from('reviews')
        .insert({
          booking_id: booking.id,
          customer_id: booking.customerId,
          business_id: booking.businessId,
          rating: rating,
          review_text: comment || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to insert review:', insertError);
        throw new Error(insertError.message);
      }

      // Update the business's rating and review_count
      // First, get all reviews for this business to calculate new average
      const { data: allReviews, error: fetchError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', booking.businessId);

      if (fetchError) {
        console.error('Failed to fetch reviews for rating update:', fetchError);
        // Continue anyway - review was saved
      } else if (allReviews && allReviews.length > 0) {
        // Calculate new average rating
        const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = totalRating / allReviews.length;
        const reviewCount = allReviews.length;

        // Update business with new rating and review count
        const { error: updateError } = await supabase
          .from('businesses')
          .update({
            rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
            review_count: reviewCount,
          })
          .eq('id', booking.businessId);

        if (updateError) {
          console.error('Failed to update business rating:', updateError);
          // Continue anyway - review was saved
        }
      }

      // Reset form state
      setRating(0);
      setComment('');

      // Call callback if provided
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Failed to submit review:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Leave a Review</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-1">
            {booking.serviceName}
          </h3>
          <p className="text-sm text-gray-600">{booking.businessName}</p>
        </div>

        {/* Rating */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
              placeholder="Tell us about your experience..."
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
