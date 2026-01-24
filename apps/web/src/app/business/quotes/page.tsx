'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  Filter,
  MessageSquare,
  Send,
  User,
  Home,
  RefreshCw,
} from 'lucide-react';
import { BusinessAuthWrapper } from '@/components/business/business-auth-wrapper';
import { quotesApi, QuoteRequest } from '@/lib/api/quotes';
import { supabase } from '@/lib/auth';

// Fetch business ID from database based on authenticated user
async function fetchBusinessIdFromAuth(): Promise<string | null> {
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
      .select('id')
      .eq('owner_id', profile.id)
      .single();

    if (businessError || !business) return null;

    return business.id;
  } catch (error) {
    console.error('Error fetching business ID:', error);
    return null;
  }
}

// Status configuration
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  quoted: {
    label: 'Quoted',
    color: 'bg-blue-100 text-blue-800',
    icon: DollarSign,
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export default function BusinessQuotesPage() {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteFormData, setQuoteFormData] = useState({
    amount: '',
    message: '',
  });
  const [businessId, setBusinessId] = useState<string>('');

  // Load business ID from auth + database on mount
  useEffect(() => {
    const loadBusinessId = async () => {
      const id = await fetchBusinessIdFromAuth();
      if (id) {
        setBusinessId(id);
      }
    };
    loadBusinessId();
  }, []);

  // Fetch quote requests
  const fetchQuoteRequests = async () => {
    if (!businessId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await quotesApi.getBusinessQuoteRequests(businessId);
      if (result.success) {
        setQuoteRequests(result.quoteRequests || []);
      } else {
        setError(result.error || 'Failed to fetch quote requests');
      }
    } catch (err) {
      console.error('Error fetching quote requests:', err);
      setError('Failed to load quote requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchQuoteRequests();
    }
  }, [businessId]);

  // Filter quote requests
  const filteredQuotes = quoteRequests.filter((quote) => {
    const matchesSearch =
      quote.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.customer_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle sending a quote
  const handleSendQuote = async () => {
    if (!selectedQuote || !quoteFormData.amount) return;

    setIsSubmittingQuote(true);
    try {
      const result = await quotesApi.updateQuoteStatus(
        selectedQuote.id,
        'quoted',
        {
          quotedAmount: parseFloat(quoteFormData.amount),
          quotedMessage: quoteFormData.message || undefined,
        }
      );

      if (result.success) {
        // Update local state
        setQuoteRequests((prev) =>
          prev.map((q) =>
            q.id === selectedQuote.id
              ? {
                  ...q,
                  status: 'quoted' as const,
                  quoted_amount: parseFloat(quoteFormData.amount),
                  quoted_message: quoteFormData.message,
                }
              : q
          )
        );
        setSelectedQuote(null);
        setQuoteFormData({ amount: '', message: '' });
      } else {
        alert('Failed to send quote. Please try again.');
      }
    } catch (err) {
      console.error('Error sending quote:', err);
      alert('Failed to send quote. Please try again.');
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Flexible';
    const timeLabels: Record<string, string> = {
      morning: 'Morning (8AM - 12PM)',
      afternoon: 'Afternoon (12PM - 5PM)',
      evening: 'Evening (5PM - 8PM)',
    };
    return timeLabels[timeString] || timeString;
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
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </Link>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    Quote Requests
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage incoming quote requests from customers
                  </p>
                </div>
              </div>

              <button
                onClick={fetchQuoteRequests}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="quoted">Quoted</option>
                <option value="accepted">Accepted</option>
                <option value="declined">Declined</option>
              </select>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {quoteRequests.length}
                </p>
                <p className="text-sm text-gray-600">Total Requests</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">
                  {quoteRequests.filter((q) => q.status === 'pending').length}
                </p>
                <p className="text-sm text-yellow-600">Pending</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {quoteRequests.filter((q) => q.status === 'quoted').length}
                </p>
                <p className="text-sm text-blue-600">Quoted</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {quoteRequests.filter((q) => q.status === 'accepted').length}
                </p>
                <p className="text-sm text-green-600">Accepted</p>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading quote requests...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredQuotes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quote requests found
              </h3>
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'When customers request quotes, they will appear here.'}
              </p>
            </div>
          )}

          {/* Quote Requests List */}
          {!isLoading && filteredQuotes.length > 0 && (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => {
                const statusConfig = STATUS_CONFIG[quote.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={quote.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-lg font-semibold">
                            {quote.customer_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {quote.customer_name}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {quote.customer_email}
                              </span>
                              {quote.customer_phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {quote.customer_phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(quote.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Quote Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {quote.property_type && (
                          <div className="flex items-center gap-2 text-sm">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Property:</span>
                            <span className="text-gray-900 capitalize">
                              {quote.property_type}
                            </span>
                          </div>
                        )}
                        {quote.preferred_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Preferred:</span>
                            <span className="text-gray-900">
                              {formatDate(quote.preferred_date)}
                            </span>
                          </div>
                        )}
                        {quote.budget_range && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Budget:</span>
                            <span className="text-gray-900">
                              {quote.budget_range.replace(/-/g, ' - ')}
                            </span>
                          </div>
                        )}
                        {quote.postcode && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Postcode:</span>
                            <span className="text-gray-900">
                              {quote.postcode}
                            </span>
                          </div>
                        )}
                        {quote.frequency && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Frequency:</span>
                            <span className="text-gray-900 capitalize">
                              {quote.frequency.replace(/-/g, ' ')}
                            </span>
                          </div>
                        )}
                        {quote.number_of_rooms && (
                          <div className="flex items-center gap-2 text-sm">
                            <Home className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Rooms:</span>
                            <span className="text-gray-900">
                              {quote.number_of_rooms}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {quote.description}
                        </p>
                        {quote.special_requirements && (
                          <p className="text-sm text-gray-600 mt-2 pt-2 border-t border-gray-200">
                            <strong>Special requirements:</strong>{' '}
                            {quote.special_requirements}
                          </p>
                        )}
                      </div>

                      {/* Quoted Amount Display */}
                      {quote.status !== 'pending' && quote.quoted_amount && (
                        <div className="bg-blue-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              Quoted Amount:
                            </span>
                            <span className="text-lg font-bold text-blue-900">
                              £{quote.quoted_amount.toFixed(2)}
                            </span>
                          </div>
                          {quote.quoted_message && (
                            <p className="text-sm text-blue-700 mt-2">
                              {quote.quoted_message}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      {quote.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setSelectedQuote(quote)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-800 transition-colors"
                          >
                            <Send className="h-4 w-4" />
                            Send Quote
                          </button>
                          <a
                            href={`mailto:${quote.customer_email}`}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            Email Customer
                          </a>
                        </div>
                      )}

                      {quote.status === 'accepted' && (
                        <div className="flex gap-3">
                          <a
                            href={`mailto:${quote.customer_email}?subject=Booking%20Confirmation`}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                          >
                            <Mail className="h-4 w-4" />
                            Contact to Schedule
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Send Quote Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Send Quote</h3>
                <p className="text-gray-600 mt-1">
                  Provide a quote for {selectedQuote.customer_name}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Amount (GBP) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      £
                    </span>
                    <input
                      type="number"
                      value={quoteFormData.amount}
                      onChange={(e) =>
                        setQuoteFormData((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={quoteFormData.message}
                    onChange={(e) =>
                      setQuoteFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Add any details about the quote, what's included, terms, etc."
                  />
                </div>

                {/* Quote Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Request Summary
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <strong>Customer:</strong> {selectedQuote.customer_name}
                    </p>
                    <p>
                      <strong>Property:</strong>{' '}
                      {selectedQuote.property_type || 'Not specified'}
                    </p>
                    <p>
                      <strong>Budget:</strong>{' '}
                      {selectedQuote.budget_range
                        ? selectedQuote.budget_range.replace(/-/g, ' - ')
                        : 'No preference'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-4">
                <button
                  onClick={() => {
                    setSelectedQuote(null);
                    setQuoteFormData({ amount: '', message: '' });
                  }}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendQuote}
                  disabled={isSubmittingQuote || !quoteFormData.amount}
                  className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                    isSubmittingQuote || !quoteFormData.amount
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800'
                  }`}
                >
                  {isSubmittingQuote ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" />
                      Send Quote
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessAuthWrapper>
  );
}
