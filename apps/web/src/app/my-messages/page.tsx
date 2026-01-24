'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Clock,
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  Star,
  Building2,
  ChevronRight,
  RefreshCw,
  Inbox,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { useAuth, useRequireAuth } from '@/contexts/auth-context';
import { messagesApi, Message } from '@/lib/api/messages';

type FilterType = 'all' | 'replied' | 'pending';

export default function MyMessagesPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Message | null>(null);
  const [conversationThread, setConversationThread] = useState<Message[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Group messages by conversation
  const groupedConversations = useCallback(() => {
    const conversations = new Map<string, Message[]>();
    messages.forEach((msg) => {
      const convId = msg.conversation_id || msg.id;
      if (!conversations.has(convId)) {
        conversations.set(convId, []);
      }
      conversations.get(convId)!.push(msg);
    });
    // Return the first message of each conversation (original message) with reply count
    return Array.from(conversations.entries()).map(([convId, msgs]) => {
      const originalMsg = msgs.find((m) => !m.parent_message_id) || msgs[0];
      const replyCount = msgs.filter(
        (m) => m.sender_type === 'business'
      ).length;
      const hasUnreadReply = msgs.some(
        (m) => m.sender_type === 'business' && !m.is_read
      );
      return { ...originalMsg, replyCount, hasUnreadReply };
    });
  }, [messages]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user?.id) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const result = await messagesApi.getCustomerMessages(user.id);
      if (result.success) {
        setMessages(result.messages);
        setUnreadCount(result.unreadCount || 0);
      } else {
        setError(result.error || 'Failed to load messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load your messages');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    if (!user?.id) return;
    setIsLoading(true);
    fetchMessages();
  }, [fetchMessages, user?.id]);

  // Subscribe to real-time updates for replies
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = messagesApi.subscribeToCustomerMessages(
      user.id,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [payload.new, ...prev]);
          // If this is a business reply, increment unread count
          if (payload.new.sender_type === 'business' && !payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
          // Update conversation thread if this is for the selected conversation
          if (
            selectedConversation &&
            payload.new.conversation_id === selectedConversation.conversation_id
          ) {
            setConversationThread((prev) => [...prev, payload.new]);
            // If viewing this conversation, mark the new message as read immediately
            if (payload.new.sender_type === 'business') {
              messagesApi.markCustomerMessagesAsRead({
                messageId: payload.new.id,
              });
              // Update the message in state to show as read
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === payload.new.id ? { ...m, is_read: true } : m
                )
              );
              // Don't increment count if we're viewing the conversation
              setUnreadCount((prev) => Math.max(0, prev - 1));
            }
          }
        }
      }
    );

    return unsubscribe;
  }, [user?.id, selectedConversation]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchMessages();
    setIsRefreshing(false);
  };

  // Handle select conversation
  const handleSelectConversation = async (message: Message) => {
    setSelectedConversation(message);
    // Load full conversation thread
    if (message.conversation_id) {
      const result = await messagesApi.getConversation(message.conversation_id);
      if (result.success) {
        setConversationThread(result.messages);

        // Mark all business replies in this conversation as read
        const unreadBusinessReplies = result.messages.filter(
          (m) => m.sender_type === 'business' && !m.is_read
        );
        if (unreadBusinessReplies.length > 0) {
          await messagesApi.markCustomerMessagesAsRead({
            conversationId: message.conversation_id,
          });
          // Update local state to reflect read status
          setMessages((prev) =>
            prev.map((m) =>
              m.conversation_id === message.conversation_id &&
              m.sender_type === 'business'
                ? { ...m, is_read: true }
                : m
            )
          );
          // Update unread count
          setUnreadCount((prev) =>
            Math.max(0, prev - unreadBusinessReplies.length)
          );
        }
      }
    } else {
      setConversationThread([message]);
    }
  };

  // Get conversations with filter
  const conversations = groupedConversations();
  const filteredConversations = conversations.filter((conv) => {
    switch (filter) {
      case 'replied':
        return (conv as any).replyCount > 0;
      case 'pending':
        return (conv as any).replyCount === 0;
      default:
        return true;
    }
  });

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
            Quote
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Please log in to view your messages
          </p>
          <Link
            href="/login"
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-4">
                <div className="relative h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
                  <Mail className="h-6 w-6 text-white" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    My Messages
                  </h1>
                  <p className="text-sm text-gray-600">
                    {conversations.length} conversation
                    {conversations.length !== 1 ? 's' : ''}
                    {unreadCount > 0 && (
                      <span className="text-sky-600 font-medium">
                        {' '}
                        ({unreadCount} unread)
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

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
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="flex gap-6 h-[calc(100vh-160px)]">
          {/* Conversations List */}
          <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {/* Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                {(['all', 'replied', 'pending'] as FilterType[]).map(
                  (filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                        filter === filterType
                          ? 'bg-sky-100 text-sky-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filterType === 'all' && 'All'}
                      {filterType === 'replied' && 'Replied'}
                      {filterType === 'pending' && 'Awaiting Reply'}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 px-4">
                  <Inbox className="h-12 w-12 mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No messages</p>
                  <p className="text-sm text-center">
                    Messages you send to businesses will appear here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-sky-50' : ''
                      } ${(conv as any).hasUnreadReply ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p
                              className={`text-sm truncate ${(conv as any).hasUnreadReply ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                            >
                              {conv.subject}
                            </p>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatDate(conv.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-2">
                            {conv.message}
                          </p>
                          <div className="flex items-center gap-2">
                            {getMessageTypeBadge(
                              conv.message_type,
                              conv.is_urgent
                            )}
                            {(conv as any).replyCount > 0 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <MessageCircle className="w-3 h-3" />
                                {(conv as any).replyCount} repl
                                {(conv as any).replyCount === 1 ? 'y' : 'ies'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                Awaiting reply
                              </span>
                            )}
                          </div>
                        </div>
                        {(conv as any).hasUnreadReply && (
                          <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0 mt-2"></div>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversation Detail */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedConversation.subject}
                  </h2>
                  <div className="flex items-center gap-3 mt-2">
                    {getMessageTypeBadge(
                      selectedConversation.message_type,
                      selectedConversation.is_urgent
                    )}
                    <span className="text-sm text-gray-500">
                      Started {formatDate(selectedConversation.created_at)}
                    </span>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {conversationThread.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_type === 'business' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-4 ${
                          msg.sender_type === 'business'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-gradient-to-r from-sky-500 to-blue-700 text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`text-sm font-medium ${
                              msg.sender_type === 'business'
                                ? 'text-gray-600'
                                : 'text-white/90'
                            }`}
                          >
                            {msg.sender_type === 'business'
                              ? msg.sender_name
                              : 'You'}
                          </span>
                          <span
                            className={`text-xs ${
                              msg.sender_type === 'business'
                                ? 'text-gray-400'
                                : 'text-white/70'
                            }`}
                          >
                            {formatDate(msg.created_at)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Awaiting reply notice */}
                  {conversationThread.filter(
                    (m) => m.sender_type === 'business'
                  ).length === 0 && (
                    <div className="flex justify-center py-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm">
                        <Clock className="w-4 h-4" />
                        Awaiting reply from business
                      </div>
                    </div>
                  )}
                </div>

                {/* Info footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray-500 text-center">
                    Replies from the business will appear here automatically
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Mail className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Select a conversation</p>
                  <p className="text-sm">
                    Choose a message to view the conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
