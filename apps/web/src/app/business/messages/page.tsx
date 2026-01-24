'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { BusinessAuthWrapper } from '@/components/business/business-auth-wrapper';
import { messagesApi, Message } from '@/lib/api/messages';
import {
  Building2,
  Mail,
  MailOpen,
  Clock,
  User,
  Phone,
  AlertTriangle,
  MessageCircle,
  Star,
  Calendar,
  ChevronLeft,
  Trash2,
  CheckCheck,
  Filter,
  Search,
  RefreshCw,
  Inbox,
  ArrowLeft,
  Send,
  Reply,
} from 'lucide-react';
import { supabase } from '@/lib/auth';

// Fetch business info from database based on authenticated user
async function fetchBusinessFromAuth(): Promise<{
  businessId: string;
  businessName: string;
} | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) return null;

    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, business_name')
      .eq('owner_id', profile.id)
      .single();

    if (businessError || !business) return null;

    return {
      businessId: business.id,
      businessName: business.business_name,
    };
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

type FilterType = 'all' | 'unread' | 'urgent' | 'general' | 'quote' | 'booking';

export default function BusinessMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [businessId, setBusinessId] = useState<string>('');
  const [businessName, setBusinessName] = useState<string>('');

  // Reply functionality
  const [replyText, setReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [conversationThread, setConversationThread] = useState<Message[]>([]);

  // Load business ID and name from auth + database on mount
  useEffect(() => {
    const loadBusiness = async () => {
      const info = await fetchBusinessFromAuth();
      if (info) {
        setBusinessId(info.businessId);
        setBusinessName(info.businessName || 'Business');
      }
    };
    loadBusiness();
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!businessId) return;
    const result = await messagesApi.getBusinessMessages(businessId);
    if (result.success) {
      setMessages(result.messages);
    }
  }, [businessId]);

  // Initial load
  useEffect(() => {
    if (!businessId) return;
    const loadMessages = async () => {
      setIsLoading(true);
      await fetchMessages();
      setIsLoading(false);
    };
    loadMessages();
  }, [fetchMessages, businessId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!businessId) return;
    const unsubscribe = messagesApi.subscribeToMessages(
      businessId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === payload.new.id ? payload.new : msg))
          );
          // Update selected message if it's the one that was updated
          if (selectedMessage?.id === payload.new.id) {
            setSelectedMessage(payload.new);
          }
        }
      }
    );

    return unsubscribe;
  }, [selectedMessage?.id]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
  };

  // Handle mark as read
  const handleMarkAsRead = async (messageId: string) => {
    const result = await messagesApi.markAsRead(messageId);
    if (result.success) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_read: true, read_at: new Date().toISOString() }
            : msg
        )
      );
      if (selectedMessage?.id === messageId) {
        setSelectedMessage((prev) =>
          prev
            ? { ...prev, is_read: true, read_at: new Date().toISOString() }
            : null
        );
      }
    }
  };

  // Handle mark as unread
  const handleMarkAsUnread = async (messageId: string) => {
    const result = await messagesApi.markAsUnread(messageId);
    if (result.success) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_read: false, read_at: undefined }
            : msg
        )
      );
      if (selectedMessage?.id === messageId) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, is_read: false, read_at: undefined } : null
        );
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!businessId) return;
    const result = await messagesApi.markAllAsRead(businessId);
    if (result.success) {
      setMessages((prev) =>
        prev.map((msg) => ({
          ...msg,
          is_read: true,
          read_at: new Date().toISOString(),
        }))
      );
    }
  };

  // Handle delete
  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const result = await messagesApi.deleteMessage(messageId);
    if (result.success) {
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    }
  };

  // Handle select message
  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    setReplyText(''); // Clear reply text when selecting new message
    if (!message.is_read) {
      await handleMarkAsRead(message.id);
    }
    // Load conversation thread if there's a conversation_id
    if (message.conversation_id) {
      const result = await messagesApi.getConversation(message.conversation_id);
      if (result.success) {
        setConversationThread(result.messages);
      }
    } else {
      // Single message, no thread
      setConversationThread([message]);
    }
  };

  // Handle send reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim() || !businessId) return;

    setIsSendingReply(true);
    const result = await messagesApi.replyToMessage({
      parentMessageId: selectedMessage.id,
      senderBusinessId: businessId,
      senderName: businessName,
      message: replyText.trim(),
      recipientCustomerId: selectedMessage.sender_id,
      recipientEmail: selectedMessage.sender_email,
    });

    if (result.success && result.message) {
      // Add reply to conversation thread
      setConversationThread((prev) => [...prev, result.message!]);
      setReplyText('');
    } else {
      alert('Failed to send reply. Please try again.');
    }
    setIsSendingReply(false);
  };

  // Filter messages
  const filteredMessages = messages.filter((msg) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        msg.sender_name.toLowerCase().includes(query) ||
        msg.sender_email.toLowerCase().includes(query) ||
        msg.subject.toLowerCase().includes(query) ||
        msg.message.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Apply type filter
    switch (filter) {
      case 'unread':
        return !msg.is_read;
      case 'urgent':
        return msg.is_urgent;
      case 'general':
        return msg.message_type === 'general';
      case 'quote':
        return msg.message_type === 'quote';
      case 'booking':
        return msg.message_type === 'booking';
      default:
        return true;
    }
  });

  // Count unread
  const unreadCount = messages.filter((msg) => !msg.is_read).length;

  // Get message type badge
  const getMessageTypeBadge = (type: string, isUrgent: boolean) => {
    if (isUrgent) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="w-3 h-3" />
          Urgent
        </span>
      );
    }

    switch (type) {
      case 'quote':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Star className="w-3 h-3" />
            Quote Request
          </span>
        );
      case 'booking':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3" />
            Booking
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <MessageCircle className="w-3 h-3" />
            General
          </span>
        );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <BusinessAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/business/dashboard"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Messages
                    </h1>
                    <p className="text-sm text-gray-600">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : 'All caught up'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6 h-[calc(100vh-160px)]">
            {/* Messages List */}
            <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {(
                    [
                      'all',
                      'unread',
                      'urgent',
                      'general',
                      'quote',
                      'booking',
                    ] as FilterType[]
                  ).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                        filter === filterType
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                      {filterType === 'unread' && unreadCount > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
                    <Inbox className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No messages</p>
                    <p className="text-sm text-center">
                      {filter !== 'all'
                        ? `No ${filter} messages found`
                        : 'Messages from customers will appear here'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredMessages.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          selectedMessage?.id === msg.id ? 'bg-sky-50' : ''
                        } ${!msg.is_read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                              msg.is_urgent
                                ? 'bg-red-500'
                                : 'bg-gradient-to-br from-sky-500 to-blue-700'
                            }`}
                          >
                            {msg.sender_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <p
                                className={`text-sm truncate ${
                                  !msg.is_read
                                    ? 'font-semibold text-gray-900'
                                    : 'text-gray-700'
                                }`}
                              >
                                {msg.sender_name}
                              </p>
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                            <p
                              className={`text-sm truncate mb-1 ${
                                !msg.is_read
                                  ? 'font-medium text-gray-800'
                                  : 'text-gray-600'
                              }`}
                            >
                              {msg.subject}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {msg.message}
                            </p>
                            <div className="mt-2">
                              {getMessageTypeBadge(
                                msg.message_type,
                                msg.is_urgent
                              )}
                            </div>
                          </div>
                          {!msg.is_read && (
                            <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
              {selectedMessage ? (
                <>
                  {/* Message Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            selectedMessage.is_urgent
                              ? 'bg-red-500'
                              : 'bg-gradient-to-br from-sky-500 to-blue-700'
                          }`}
                        >
                          {selectedMessage.sender_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {selectedMessage.subject}
                          </h2>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              <span>{selectedMessage.sender_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              <a
                                href={`mailto:${selectedMessage.sender_email}`}
                                className="text-sky-600 hover:text-sky-700"
                              >
                                {selectedMessage.sender_email}
                              </a>
                            </div>
                            {selectedMessage.sender_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <a
                                  href={`tel:${selectedMessage.sender_phone}`}
                                  className="text-sky-600 hover:text-sky-700"
                                >
                                  {selectedMessage.sender_phone}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            {getMessageTypeBadge(
                              selectedMessage.message_type,
                              selectedMessage.is_urgent
                            )}
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(
                                selectedMessage.created_at
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedMessage.is_read ? (
                          <button
                            onClick={() =>
                              handleMarkAsUnread(selectedMessage.id)
                            }
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mark as unread"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkAsRead(selectedMessage.id)}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <MailOpen className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(selectedMessage.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete message"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Related Service */}
                  {selectedMessage.related_service_name && (
                    <div className="px-6 py-3 bg-sky-50 border-b border-sky-100">
                      <p className="text-sm text-sky-800">
                        <span className="font-medium">Regarding service:</span>{' '}
                        {selectedMessage.related_service_name}
                      </p>
                    </div>
                  )}

                  {/* Conversation Thread */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {conversationThread.length > 0 ? (
                      conversationThread.map((msg, index) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'business' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-xl p-4 ${
                              msg.sender_type === 'business'
                                ? 'bg-gradient-to-r from-sky-500 to-blue-700 text-white'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-sm font-medium ${msg.sender_type === 'business' ? 'text-white/90' : 'text-gray-600'}`}
                              >
                                {msg.sender_type === 'business'
                                  ? 'You'
                                  : msg.sender_name}
                              </span>
                              <span
                                className={`text-xs ${msg.sender_type === 'business' ? 'text-white/70' : 'text-gray-400'}`}
                              >
                                {formatDate(msg.created_at)}
                              </span>
                            </div>
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {selectedMessage.message}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-3 mb-3">
                      <div className="flex-1 relative">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {selectedMessage.sender_phone && (
                          <a
                            href={`tel:${selectedMessage.sender_phone}`}
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Call
                          </a>
                        )}
                        <a
                          href={`mailto:${selectedMessage.sender_email}?subject=Re: ${selectedMessage.subject}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      </div>
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim() || isSendingReply}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingReply ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send Reply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a message</p>
                    <p className="text-sm">
                      Choose a message from the list to view its contents
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BusinessAuthWrapper>
  );
}
