'use client';

import { supabase, isSupabaseReady } from '@/lib/supabase';

// Type for creating a review
// Note: reviews table ONLY has: id, booking_id, customer_id, business_id, rating, review_text, created_at
export interface CreateReviewInput {
  booking_id: string;
  customer_id: string;
  business_id: string;
  rating: number; // 1-5
  review_text?: string;
  // These fields are for display/notification purposes only, not stored in reviews table
  customer_name?: string;
  service_name?: string;
}

/**
 * Reviews API - All review-related database operations
 */
export const reviewsApi = {
  /**
   * Create a new review for a completed booking
   */
  async createReview(reviewData: CreateReviewInput) {
    // If Supabase is not configured, fall back to mock behavior
    if (!isSupabaseReady()) {
      console.warn('⚠️ Supabase not configured - using mock review creation');
      return {
        success: true,
        review: {
          id: `mock-review-${Date.now()}`,
          ...reviewData,
          created_at: new Date().toISOString(),
        },
      };
    }

    try {
      // 1. Create review - only insert columns that exist in the table
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert([
          {
            booking_id: reviewData.booking_id,
            customer_id: reviewData.customer_id,
            business_id: reviewData.business_id,
            rating: reviewData.rating,
            review_text: reviewData.review_text,
          },
        ])
        .select()
        .single();

      if (reviewError) throw reviewError;

      // 2. Mark the booking as having a review submitted
      await supabase
        .from('booking_requests')
        .update({ review_submitted: true })
        .eq('id', reviewData.booking_id);

      // 3. Recalculate business rating and update business
      const { data: businessReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', reviewData.business_id);

      if (businessReviews && businessReviews.length > 0) {
        const averageRating =
          businessReviews.reduce((sum, r) => sum + r.rating, 0) /
          businessReviews.length;

        // Update business rating and review count
        await supabase
          .from('businesses')
          .update({
            rating: Math.round(averageRating * 10) / 10,
            review_count: businessReviews.length,
          })
          .eq('id', reviewData.business_id);
      }

      // 4. Get business owner for notification
      const { data: business } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', reviewData.business_id)
        .single();

      // 5. Create notification for business owner
      // Note: notifications table only has: id, user_id, type, title, message, read, created_at
      if (business?.owner_id) {
        await supabase.from('notifications').insert([
          {
            user_id: business.owner_id,
            type: 'new_review',
            title: 'New Review Received!',
            message: `${reviewData.customer_name || 'A customer'} left a ${reviewData.rating}-star review${reviewData.service_name ? ` for ${reviewData.service_name}` : ''}`,
          },
        ]);
      }

      return { success: true, review };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to create review',
      };
    }
  },

  /**
   * Get all reviews for a business
   */
  async getBusinessReviews(businessId: string) {
    // If Supabase is not configured, return empty array
    if (!isSupabaseReady()) {
      return { success: true, reviews: [] };
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, reviews: data };
    } catch (error) {
      console.error('Error fetching business reviews:', error);
      return { success: false, error: 'Failed to fetch reviews', reviews: [] };
    }
  },

  /**
   * Get all reviews by a customer
   */
  async getCustomerReviews(customerId: string) {
    // If Supabase is not configured, return empty array
    if (!isSupabaseReady()) {
      return { success: true, reviews: [] };
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, reviews: data };
    } catch (error) {
      console.error('Error fetching customer reviews:', error);
      return { success: false, error: 'Failed to fetch reviews', reviews: [] };
    }
  },

  /**
   * Get review for a specific booking
   */
  async getBookingReview(bookingId: string) {
    // If Supabase is not configured, return null
    if (!isSupabaseReady()) {
      return { success: true, review: null };
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return { success: true, review: data };
    } catch (error) {
      console.error('Error fetching booking review:', error);
      return {
        success: false,
        error: 'Failed to fetch review',
        review: null,
      };
    }
  },

  /**
   * Get business rating statistics
   */
  async getBusinessRatingStats(businessId: string) {
    // If Supabase is not configured, return default stats
    if (!isSupabaseReady()) {
      return {
        success: true,
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }

    try {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('business_id', businessId);

      if (error) throw error;

      const totalReviews = reviews?.length || 0;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews?.forEach((r) => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
      });

      return {
        success: true,
        stats: { averageRating, totalReviews, ratingDistribution },
      };
    } catch (error) {
      console.error('Error fetching rating stats:', error);
      return {
        success: false,
        error: 'Failed to fetch rating statistics',
        stats: {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      };
    }
  },
};
