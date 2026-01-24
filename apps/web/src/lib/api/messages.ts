'use client';

import { supabase, isSupabaseReady } from '@/lib/supabase';

// Type for sending a message
// Note: messages table ONLY has: id, sender_id, recipient_business_id, sender_name, sender_email,
// sender_phone, subject, message, message_type, is_urgent, is_read, created_at
export interface SendMessageInput {
  senderId: string;
  recipientBusinessId: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
  messageType?: 'general' | 'quote' | 'booking';
  isUrgent?: boolean;
}

// Type for a message from the database
export interface Message {
  id: string;
  sender_id: string;
  recipient_business_id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  subject: string;
  message: string;
  message_type: 'general' | 'quote' | 'booking';
  is_urgent: boolean;
  is_read: boolean;
  created_at: string;
  // Reply/conversation fields
  conversation_id?: string;
  parent_message_id?: string;
  sender_type?: 'customer' | 'business';
  sender_business_id?: string;
}

// Type for replying to a message
export interface ReplyMessageInput {
  parentMessageId: string;
  senderBusinessId: string;
  senderName: string; // Business name
  message: string;
  recipientCustomerId: string;
  recipientEmail: string;
}

/**
 * Messages API - All message-related database operations
 */
export const messagesApi = {
  /**
   * Send a message to a business
   */
  async sendMessage(data: SendMessageInput) {
    try {
      // Use API endpoint to bypass RLS
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: data.senderId,
          recipientBusinessId: data.recipientBusinessId,
          senderName: data.senderName,
          senderEmail: data.senderEmail,
          senderPhone: data.senderPhone,
          subject: data.subject,
          message: data.message,
          messageType: data.messageType || 'general',
          isUrgent: data.isUrgent || false,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      return { success: true, message: result.message as Message };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      };
    }
  },

  /**
   * Get all messages for a business
   */
  async getBusinessMessages(businessId: string) {
    // If Supabase is not configured, return empty array
    if (!isSupabaseReady()) {
      return { success: true, messages: [] as Message[] };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, messages: (data || []) as Message[] };
    } catch (error) {
      console.error('Error fetching business messages:', error);
      return {
        success: false,
        error: 'Failed to fetch messages',
        messages: [] as Message[],
      };
    }
  },

  /**
   * Get unread messages count for a business
   */
  async getUnreadCount(businessId: string) {
    // If Supabase is not configured, return 0
    if (!isSupabaseReady()) {
      return { success: true, count: 0 };
    }

    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_business_id', businessId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return {
        success: false,
        error: 'Failed to fetch unread count',
        count: 0,
      };
    }
  },

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      // Note: messages table doesn't have read_at or updated_at columns
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
        })
        .eq('id', messageId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error);
      return { success: false, error: 'Failed to mark message as read' };
    }
  },

  /**
   * Mark a message as unread
   */
  async markAsUnread(messageId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      // Note: messages table doesn't have read_at or updated_at columns
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: false,
        })
        .eq('id', messageId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking message as unread:', error);
      return { success: false, error: 'Failed to mark message as unread' };
    }
  },

  /**
   * Mark all messages as read for a business
   */
  async markAllAsRead(businessId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      // Note: messages table doesn't have read_at or updated_at columns
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
        })
        .eq('recipient_business_id', businessId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking all messages as read:', error);
      return { success: false, error: 'Failed to mark all messages as read' };
    }
  },

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string) {
    // If Supabase is not configured, return success
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      return { success: false, error: 'Failed to delete message' };
    }
  },

  /**
   * Subscribe to real-time messages for a business
   */
  subscribeToMessages(
    businessId: string,
    callback: (payload: { new: Message; eventType: string }) => void
  ) {
    // If Supabase is not configured, return no-op unsubscribe function
    if (!isSupabaseReady()) {
      return () => {};
    }

    const channel = supabase
      .channel(`messages_${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_business_id=eq.${businessId}`,
        },
        (payload) => {
          callback({ new: payload.new as Message, eventType: 'INSERT' });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `recipient_business_id=eq.${businessId}`,
        },
        (payload) => {
          callback({ new: payload.new as Message, eventType: 'UPDATE' });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Reply to a message (as a business)
   */
  async replyToMessage(data: ReplyMessageInput) {
    if (!isSupabaseReady()) {
      console.warn('Supabase not configured - using mock reply');
      return {
        success: true,
        message: {
          id: `mock-reply-${Date.now()}`,
          sender_id: data.senderBusinessId,
          recipient_business_id: data.senderBusinessId, // Not used for replies
          sender_name: data.senderName,
          sender_email: '',
          subject: 'Re: Message',
          message: data.message,
          message_type: 'general' as const,
          is_urgent: false,
          is_read: false,
          created_at: new Date().toISOString(),
          parent_message_id: data.parentMessageId,
          sender_type: 'business' as const,
          sender_business_id: data.senderBusinessId,
        } as Message,
      };
    }

    try {
      // Get the parent message to extract subject and conversation context
      const { data: parentMessage, error: parentError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', data.parentMessageId)
        .single();

      if (parentError) throw parentError;

      // Insert the reply - include conversation_id so customers can find it
      const { data: reply, error: replyError } = await supabase
        .from('messages')
        .insert([
          {
            sender_id: data.senderBusinessId,
            recipient_business_id: parentMessage.recipient_business_id,
            sender_name: data.senderName,
            sender_email: data.recipientEmail,
            subject: parentMessage.subject.startsWith('Re:')
              ? parentMessage.subject
              : `Re: ${parentMessage.subject}`,
            message: data.message,
            message_type: parentMessage.message_type,
            is_urgent: false,
            is_read: false,
            parent_message_id: data.parentMessageId,
            conversation_id: parentMessage.conversation_id, // Include conversation_id so customer can find replies
            sender_type: 'business',
            sender_business_id: data.senderBusinessId,
          },
        ])
        .select()
        .single();

      if (replyError) throw replyError;

      // Create notification for the customer
      await supabase.from('notifications').insert([
        {
          user_id: data.recipientCustomerId,
          type: 'message_reply',
          title: `Reply from ${data.senderName}`,
          message:
            data.message.substring(0, 100) +
            (data.message.length > 100 ? '...' : ''),
        },
      ]);

      return { success: true, message: reply as Message };
    } catch (error) {
      console.error('Error replying to message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reply',
      };
    }
  },

  /**
   * Get all messages in a conversation thread
   */
  async getConversation(conversationId: string) {
    if (!isSupabaseReady()) {
      return { success: true, messages: [] as Message[] };
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return { success: true, messages: (data || []) as Message[] };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return {
        success: false,
        error: 'Failed to fetch conversation',
        messages: [] as Message[],
      };
    }
  },

  /**
   * Get all messages for a customer (includes their sent messages and replies)
   * Uses API endpoint to properly map auth user ID to profile ID
   */
  async getCustomerMessages(customerId: string) {
    if (!isSupabaseReady()) {
      return {
        success: true,
        messages: [] as Message[],
        profileId: null,
        unreadCount: 0,
      };
    }

    try {
      // Get auth token for API call
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.warn('No auth session for fetching customer messages');
        return {
          success: true,
          messages: [] as Message[],
          profileId: null,
          unreadCount: 0,
        };
      }

      // Use API endpoint which maps auth user ID to profile ID
      const response = await fetch('/api/messages/customer', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch messages');
      }

      return {
        success: true,
        messages: (result.messages || []) as Message[],
        profileId: result.profileId, // For real-time subscription
        unreadCount: result.unreadCount || 0, // Unread business replies count
      };
    } catch (error) {
      console.error('Error fetching customer messages:', error);
      return {
        success: false,
        error: 'Failed to fetch messages',
        messages: [] as Message[],
        profileId: null,
        unreadCount: 0,
      };
    }
  },

  /**
   * Mark messages as read for a customer (business replies)
   * Uses API endpoint to handle auth
   */
  async markCustomerMessagesAsRead(options: {
    messageId?: string;
    messageIds?: string[];
    conversationId?: string;
  }) {
    if (!isSupabaseReady()) {
      return { success: true };
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch('/api/messages/customer', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(options),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to mark messages as read');
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking customer messages as read:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to mark messages as read',
      };
    }
  },

  /**
   * Get messages with their reply counts (for displaying conversation previews)
   */
  async getBusinessMessagesWithReplies(businessId: string) {
    if (!isSupabaseReady()) {
      return { success: true, messages: [] as Message[] };
    }

    try {
      // Get only original messages (no parent), with reply count
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_business_id', businessId)
        .is('parent_message_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, messages: (data || []) as Message[] };
    } catch (error) {
      console.error('Error fetching business messages with replies:', error);
      return {
        success: false,
        error: 'Failed to fetch messages',
        messages: [] as Message[],
      };
    }
  },

  /**
   * Subscribe to real-time messages for a customer (to see replies)
   */
  subscribeToCustomerMessages(
    customerId: string,
    callback: (payload: { new: Message; eventType: string }) => void
  ) {
    if (!isSupabaseReady()) {
      return () => {};
    }

    const channel = supabase
      .channel(`customer_messages_${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          // Only include messages that are replies in conversations started by this customer
          if (newMessage.sender_type === 'business') {
            callback({ new: newMessage, eventType: 'INSERT' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
