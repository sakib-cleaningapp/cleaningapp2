'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, Loader2 } from 'lucide-react';
import { supabase, isSupabaseReady } from '@/lib/supabase';

interface ReviewsManagerProps {
  businessId: string;
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  serviceName: string;
}

interface SupabaseReview {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  booking_id: string | null;
  customer: {
    full_name: string | null;
  } | null;
  booking: {
    services: {
      name: string;
    } | null;
  } | null;
}

export function ReviewsManager({ businessId }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const fetchReviews = async () => {
    if (!isSupabaseReady()) {
      setError('Database connection not available.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch reviews from Supabase with customer name via profiles
      // The reviews table has: id, booking_id, customer_id, business_id, rating, review_text, created_at
      const { data, error: fetchError } = await supabase
        .from('reviews')
        .select(
          `
          id,
          rating,
          review_text,
          created_at,
          booking_id,
          customer:profiles!reviews_customer_id_fkey(full_name),
          booking:bookings!reviews_booking_id_fkey(
            services(name)
          )
        `
        )
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching reviews:', fetchError);
        // Try a simpler query if the join fails
        const { data: simpleData, error: simpleError } = await supabase
          .from('reviews')
          .select('id, rating, review_text, created_at, customer_id')
          .eq('business_id', businessId)
          .order('created_at', { ascending: false });

        if (simpleError) {
          throw new Error(simpleError.message);
        }

        // Transform simple data (without customer names)
        const transformedReviews: Review[] = (simpleData || []).map(
          (review: any) => ({
            id: review.id,
            customerName: 'Customer',
            rating: review.rating,
            comment: review.review_text || '',
            date: review.created_at,
            serviceName: 'Service',
          })
        );

        setReviews(transformedReviews);
        return;
      }

      // Transform the data to match Review interface
      const transformedReviews: Review[] = (data || []).map((review: any) => ({
        id: review.id,
        customerName: review.customer?.full_name || 'Anonymous',
        rating: review.rating,
        comment: review.review_text || '',
        date: review.created_at,
        serviceName: review.booking?.services?.name || 'Service',
      }));

      setReviews(transformedReviews);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : '0.0';

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
        <span className="ml-3 text-gray-600">Loading reviews...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchReviews}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {averageRating}{' '}
              <span className="text-lg text-gray-500">/ 5.0</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            {renderStars(Math.round(Number(averageRating)))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600">
              Reviews from customers will appear here after completed bookings.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {review.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {review.customerName}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-500">-</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div className="pl-13">
                {review.comment && (
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{review.serviceName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
