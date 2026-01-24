import { create } from 'zustand';
import { supabase, isSupabaseReady } from '@/lib/supabase';

export interface Review {
  id: string;
  bookingId: string;
  businessId: string;
  businessName: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchReviewsForBusiness: (businessId: string) => Promise<void>;
  fetchReviewForBooking: (bookingId: string) => Promise<Review | null>;
  addReview: (
    review: Omit<Review, 'id' | 'createdAt'>
  ) => Promise<Review | null>;

  // Local getters (from cached data)
  getReviewForBooking: (bookingId: string) => Review | undefined;
  getBusinessReviews: (businessId: string) => Review[];
  getAverageRating: (businessId: string) => number;

  // Clear cache
  clearCache: () => void;
}

export const useReviewsStore = create<ReviewsState>((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,

  // Fetch reviews for a business from Supabase
  fetchReviewsForBusiness: async (businessId: string) => {
    if (!isSupabaseReady()) {
      set({ error: 'Database connection not available' });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          id,
          booking_id,
          customer_id,
          business_id,
          rating,
          review_text,
          created_at,
          customer:profiles!reviews_customer_id_fkey(full_name),
          business:businesses!reviews_business_id_fkey(name)
        `
        )
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      const transformedReviews: Review[] = (data || []).map((r: any) => ({
        id: r.id,
        bookingId: r.booking_id || '',
        businessId: r.business_id,
        businessName: r.business?.name || '',
        customerId: r.customer_id,
        customerName: r.customer?.full_name || 'Anonymous',
        rating: r.rating,
        comment: r.review_text || '',
        createdAt: r.created_at,
      }));

      // Merge with existing reviews (avoid duplicates)
      set((state) => {
        const existingIds = new Set(transformedReviews.map((r) => r.id));
        const otherReviews = state.reviews.filter(
          (r) => !existingIds.has(r.id) && r.businessId !== businessId
        );
        return {
          reviews: [...otherReviews, ...transformedReviews],
          isLoading: false,
        };
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch reviews',
        isLoading: false,
      });
    }
  },

  // Fetch a single review for a booking
  fetchReviewForBooking: async (bookingId: string) => {
    if (!isSupabaseReady()) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          `
          id,
          booking_id,
          customer_id,
          business_id,
          rating,
          review_text,
          created_at,
          customer:profiles!reviews_customer_id_fkey(full_name),
          business:businesses!reviews_business_id_fkey(name)
        `
        )
        .eq('booking_id', bookingId)
        .single();

      if (error || !data) {
        return null;
      }

      const review: Review = {
        id: data.id,
        bookingId: data.booking_id || '',
        businessId: data.business_id,
        businessName: (data.business as any)?.name || '',
        customerId: data.customer_id,
        customerName: (data.customer as any)?.full_name || 'Anonymous',
        rating: data.rating,
        comment: data.review_text || '',
        createdAt: data.created_at,
      };

      // Add to cache if not already present
      set((state) => {
        if (state.reviews.some((r) => r.id === review.id)) {
          return state;
        }
        return { reviews: [...state.reviews, review] };
      });

      return review;
    } catch {
      return null;
    }
  },

  // Add a new review to Supabase
  addReview: async (reviewData) => {
    if (!isSupabaseReady()) {
      set({ error: 'Database connection not available' });
      return null;
    }

    set({ isLoading: true, error: null });

    try {
      // Insert the review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          booking_id: reviewData.bookingId || null,
          customer_id: reviewData.customerId,
          business_id: reviewData.businessId,
          rating: reviewData.rating,
          review_text: reviewData.comment || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const newReview: Review = {
        id: data.id,
        bookingId: data.booking_id || '',
        businessId: data.business_id,
        businessName: reviewData.businessName,
        customerId: data.customer_id,
        customerName: reviewData.customerName,
        rating: data.rating,
        comment: data.review_text || '',
        createdAt: data.created_at,
      };

      // Update business rating
      await updateBusinessRating(reviewData.businessId);

      // Add to local cache
      set((state) => ({
        reviews: [newReview, ...state.reviews],
        isLoading: false,
      }));

      return newReview;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add review',
        isLoading: false,
      });
      return null;
    }
  },

  // Get review for a booking from local cache
  getReviewForBooking: (bookingId) => {
    return get().reviews.find((review) => review.bookingId === bookingId);
  },

  // Get all reviews for a business from local cache
  getBusinessReviews: (businessId) => {
    return get().reviews.filter((review) => review.businessId === businessId);
  },

  // Calculate average rating from local cache
  getAverageRating: (businessId) => {
    const businessReviews = get().getBusinessReviews(businessId);
    if (businessReviews.length === 0) return 0;
    const sum = businessReviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / businessReviews.length;
  },

  // Clear the local cache
  clearCache: () => {
    set({ reviews: [], error: null });
  },
}));

// Helper function to update business rating after a review
async function updateBusinessRating(businessId: string) {
  if (!isSupabaseReady()) return;

  try {
    // Get all reviews for the business
    const { data: reviews, error: fetchError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId);

    if (fetchError || !reviews || reviews.length === 0) return;

    // Calculate average
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update business
    await supabase
      .from('businesses')
      .update({
        rating: Math.round(averageRating * 10) / 10,
        review_count: reviews.length,
      })
      .eq('id', businessId);
  } catch (err) {
    console.error('Failed to update business rating:', err);
  }
}
