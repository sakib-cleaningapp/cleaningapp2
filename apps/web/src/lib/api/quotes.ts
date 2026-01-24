'use client';

import { supabase, isSupabaseReady } from '@/lib/supabase';

// Type for creating a quote request
// Note: quote_requests table ONLY has: id, customer_id, business_id, service_id, customer_name,
// customer_email, customer_phone, description, preferred_date, preferred_time, budget_range, status, created_at
export interface CreateQuoteRequestInput {
  customer_id: string;
  business_id: string;
  service_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  description: string;
  preferred_date?: string;
  preferred_time?: string;
  budget_range?: string;
}

// Type for quote request from database
export interface QuoteRequest {
  id: string;
  customer_id: string;
  business_id: string;
  service_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  description: string;
  preferred_date?: string;
  preferred_time?: string;
  budget_range?: string;
  status: 'pending' | 'quoted' | 'accepted' | 'declined';
  created_at: string;
}

/**
 * Quotes API - All quote request related database operations
 */
export const quotesApi = {
  /**
   * Create a new quote request
   */
  async createQuoteRequest(data: CreateQuoteRequestInput) {
    // If Supabase is not configured, fall back to mock behavior
    if (!isSupabaseReady()) {
      console.warn(
        '⚠️ Supabase not configured - using mock quote request creation'
      );
      return {
        success: true,
        quoteRequest: {
          id: `mock-quote-${Date.now()}`,
          ...data,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    try {
      // Insert quote request
      const { data: quoteRequest, error } = await supabase
        .from('quote_requests')
        .insert([
          {
            ...data,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Get business owner for notification
      const { data: business } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', data.business_id)
        .single();

      // Create notification for business owner
      // Note: notifications table only has: id, user_id, type, title, message, read, created_at
      if (business?.owner_id) {
        await supabase.from('notifications').insert([
          {
            user_id: business.owner_id,
            type: 'new_quote_request',
            title: 'New Quote Request!',
            message: `${data.customer_name} has requested a quote${data.service_id ? '' : ' for your services'}`,
          },
        ]);
      }

      return { success: true, quoteRequest };
    } catch (error) {
      console.error('Error creating quote request:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create quote request',
      };
    }
  },

  /**
   * Get all quote requests for a business
   */
  async getBusinessQuoteRequests(businessId: string) {
    // If Supabase is not configured, return empty array
    if (!isSupabaseReady()) {
      console.warn('⚠️ Supabase not configured - returning empty quote list');
      return { success: true, quoteRequests: [] };
    }

    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, quoteRequests: data as QuoteRequest[] };
    } catch (error) {
      console.error('Error fetching business quote requests:', error);
      return {
        success: false,
        error: 'Failed to fetch quote requests',
        quoteRequests: [],
      };
    }
  },

  /**
   * Get all quote requests for a customer
   */
  async getCustomerQuoteRequests(customerId: string) {
    // If Supabase is not configured, return empty array
    if (!isSupabaseReady()) {
      return { success: true, quoteRequests: [] };
    }

    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, quoteRequests: data as QuoteRequest[] };
    } catch (error) {
      console.error('Error fetching customer quote requests:', error);
      return {
        success: false,
        error: 'Failed to fetch quote requests',
        quoteRequests: [],
      };
    }
  },

  /**
   * Get a single quote request by ID
   */
  async getQuoteRequest(quoteId: string) {
    // If Supabase is not configured, return null
    if (!isSupabaseReady()) {
      return { success: false, error: 'Database not configured' };
    }

    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .eq('id', quoteId)
        .single();

      if (error) throw error;

      return { success: true, quoteRequest: data as QuoteRequest };
    } catch (error) {
      console.error('Error fetching quote request:', error);
      return {
        success: false,
        error: 'Failed to fetch quote request',
      };
    }
  },

  /**
   * Update quote status (business responds with quote or customer accepts/declines)
   */
  async updateQuoteStatus(
    quoteId: string,
    status: 'quoted' | 'accepted' | 'declined',
    options?: {
      quotedAmount?: number;
      quotedMessage?: string;
    }
  ) {
    // If Supabase is not configured, fall back to mock behavior
    if (!isSupabaseReady()) {
      console.warn('⚠️ Supabase not configured - using mock status update');
      return {
        success: true,
        quoteRequest: {
          id: quoteId,
          status,
          quoted_amount: options?.quotedAmount,
          quoted_message: options?.quotedMessage,
          updated_at: new Date().toISOString(),
        },
      };
    }

    try {
      // Note: quote_requests table doesn't have updated_at, quoted_amount, or quoted_message columns
      const updateData: Record<string, unknown> = {
        status,
      };

      const { data: quoteRequest, error } = await supabase
        .from('quote_requests')
        .update(updateData)
        .eq('id', quoteId)
        .select()
        .single();

      if (error) throw error;

      // Create notification based on status change
      const notificationData = await getStatusNotification(
        status,
        quoteRequest,
        options
      );
      if (notificationData) {
        await supabase.from('notifications').insert([notificationData]);
      }

      return { success: true, quoteRequest };
    } catch (error) {
      console.error('Error updating quote status:', error);
      return {
        success: false,
        error: 'Failed to update quote status',
      };
    }
  },

  /**
   * Subscribe to quote request updates (real-time)
   */
  subscribeToQuoteRequests(
    type: 'customer' | 'business',
    id: string,
    callback: (payload: unknown) => void
  ) {
    const channel = supabase
      .channel(`quotes_${type}_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quote_requests',
          filter:
            type === 'customer'
              ? `customer_id=eq.${id}`
              : `business_id=eq.${id}`,
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};

/**
 * Helper function to generate notification data based on status change
 * Note: notifications table only has: id, user_id, type, title, message, read, created_at
 */
async function getStatusNotification(
  status: 'quoted' | 'accepted' | 'declined',
  quoteRequest: QuoteRequest,
  options?: { quotedAmount?: number; quotedMessage?: string }
): Promise<Record<string, unknown> | null> {
  switch (status) {
    case 'quoted':
      // Notify customer that business has provided a quote
      return {
        user_id: quoteRequest.customer_id,
        type: 'quote_received',
        title: 'Quote Received!',
        message: `You've received a quote${options?.quotedAmount ? ` of £${options.quotedAmount}` : ''}. Review and accept to book.`,
      };
    case 'accepted':
    case 'declined': {
      // Notify business owner that customer accepted/declined the quote
      const { data: business } = await supabase
        .from('businesses')
        .select('owner_id')
        .eq('id', quoteRequest.business_id)
        .single();

      if (!business?.owner_id) return null;

      if (status === 'accepted') {
        return {
          user_id: business.owner_id,
          type: 'quote_accepted',
          title: 'Quote Accepted!',
          message: `${quoteRequest.customer_name} has accepted your quote. Contact them to schedule.`,
        };
      } else {
        return {
          user_id: business.owner_id,
          type: 'quote_declined',
          title: 'Quote Declined',
          message: `${quoteRequest.customer_name} has declined your quote.`,
        };
      }
    }
    default:
      return null;
  }
}
