'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BusinessAuthWrapper } from '@/components/business/business-auth-wrapper';
import { BookingRequestsManager } from '@/components/business/booking-requests-manager';
import { RevenueAnalytics } from '@/components/business/revenue-analytics';
import { ReviewsManager } from '@/components/business/reviews-manager';
import { StripeConnectOnboarding } from '@/components/stripe-connect-onboarding';
import { useBookingRequests } from '@/stores/booking-requests-store';
import { useBusinessProfileStore } from '@/stores/business-profile-store';
import { UnifiedNotificationsPanel } from '@/components/unified-notifications-panel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Settings,
  BarChart3,
  FileText,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Filter,
  Search,
  Wallet,
  HelpCircle,
  LogOut,
  User,
  Loader2,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/auth';

// Mock business data - in real app this would come from API
const mockBusinessData = {
  business: {
    name: 'Sparkle Clean Cardiff',
    category: 'CLEANING',
    rating: 4.8,
    reviewCount: 127,
    location: 'Cardiff, Wales',
    phone: '029 2034 5678',
    email: 'info@sparkleCleanCardiff.com',
    established: 2018,
    teamSize: '5-10',
    avatar: null,
  },
  metrics: {
    totalBookings: 1247,
    monthlyRevenue: 8950,
    averageRating: 4.8,
    responseTime: '2 hours',
    completionRate: 98,
    repeatCustomers: 85,
  },
  recentBookings: [
    {
      id: 'BK001',
      customerName: 'Sarah Johnson',
      service: 'Deep Cleaning',
      date: '2024-01-20',
      time: '14:00',
      status: 'confirmed',
      value: 85,
      location: 'CF10 3AZ',
    },
    {
      id: 'BK002',
      customerName: 'Mike Williams',
      service: 'Regular House Cleaning',
      date: '2024-01-20',
      time: '10:30',
      status: 'pending',
      value: 45,
      location: 'CF23 8HG',
    },
    {
      id: 'BK003',
      customerName: 'Emma Davis',
      service: 'End of Tenancy',
      date: '2024-01-21',
      time: '09:00',
      status: 'completed',
      value: 125,
      location: 'CF14 2LM',
    },
    {
      id: 'BK004',
      customerName: 'Tom Roberts',
      service: 'Office Cleaning',
      date: '2024-01-21',
      time: '16:00',
      status: 'confirmed',
      value: 95,
      location: 'CF24 1AB',
    },
  ],
  services: [
    {
      id: 'SRV001',
      name: 'Regular House Cleaning',
      price: 45,
      duration: '2-3 hours',
      bookings: 234,
      rating: 4.9,
      active: true,
    },
    {
      id: 'SRV002',
      name: 'Deep Cleaning',
      price: 85,
      duration: '4-5 hours',
      bookings: 178,
      rating: 4.8,
      active: true,
    },
    {
      id: 'SRV003',
      name: 'End of Tenancy',
      price: 125,
      duration: '6-8 hours',
      bookings: 89,
      rating: 4.7,
      active: true,
    },
    {
      id: 'SRV004',
      name: 'Office Cleaning',
      price: 95,
      duration: '3-4 hours',
      bookings: 156,
      rating: 4.8,
      active: false,
    },
  ],
};

// Fetch business info from database based on authenticated user
async function fetchBusinessFromAuth(): Promise<{
  businessId: string;
  businessName: string;
  email: string;
} | null> {
  try {
    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }

    // Get profile for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return null;
    }

    // Get business owned by this profile
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, business_name')
      .eq('owner_id', profile.id)
      .single();

    if (businessError || !business) {
      console.error('Business error:', businessError);
      return null;
    }

    return {
      businessId: business.id,
      businessName: business.business_name,
      email: profile.email || user.email || '',
    };
  } catch (error) {
    console.error('Error fetching business:', error);
    return null;
  }
}

export default function BusinessDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMounted, setIsMounted] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<{
    businessId: string;
    businessName: string;
    email: string;
  } | null>(null);

  // Load business info from auth + database on mount
  useEffect(() => {
    const loadBusinessInfo = async () => {
      const info = await fetchBusinessFromAuth();
      setBusinessInfo(info);
      setIsMounted(true);
    };
    loadBusinessInfo();
  }, []);

  // Get the business ID from database query, fallback to empty string if not loaded yet
  const businessId = businessInfo?.businessId || '';
  const businessName = businessInfo?.businessName || 'Your Business';

  // Get real booking requests using the actual business ID
  const {
    requests: bookingRequests,
    stats,
    isLoading: bookingsLoading,
  } = useBookingRequests(businessId);

  // Get business profile for Stripe Connect status
  const { profile } = useBusinessProfileStore();

  // State for Stripe account status from database
  const [stripeAccountStatus, setStripeAccountStatus] = useState<{
    hasAccount: boolean;
    chargesEnabled: boolean;
    isLoading: boolean;
  }>({ hasAccount: false, chargesEnabled: false, isLoading: true });

  // Check Stripe account status from database
  useEffect(() => {
    if (!businessId) return;

    const checkStripeAccount = async () => {
      try {
        const response = await fetch(
          `https://bpdehoxivkvrxpxniwjp.supabase.co/rest/v1/business_stripe_accounts?business_id=eq.${businessId}&select=stripe_connect_account_id,charges_enabled`,
          {
            headers: {
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setStripeAccountStatus({
            hasAccount: true,
            chargesEnabled: data[0].charges_enabled,
            isLoading: false,
          });
        } else {
          setStripeAccountStatus({
            hasAccount: false,
            chargesEnabled: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error checking Stripe account:', error);
        setStripeAccountStatus({
          hasAccount: false,
          chargesEnabled: false,
          isLoading: false,
        });
      }
    };

    checkStripeAccount();
  }, [businessId]);

  const [bookingFilter, setBookingFilter] = useState('all');

  const handleSignOut = async () => {
    // Clear business session from localStorage
    localStorage.removeItem('business_session');

    // Also sign out from Supabase to clear the auth session
    // This prevents auto-login when redirecting to the login page
    try {
      const { supabase } = await import('@/lib/auth');
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('Error signing out from Supabase:', error);
    }

    // Use window.location for a hard redirect to clear all cached state
    window.location.href = '/business/login';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredBookings = mockBusinessData.recentBookings.filter((booking) => {
    if (bookingFilter === 'all') return true;
    return booking.status === bookingFilter;
  });

  return (
    <BusinessAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                {/* Logo & Business Name */}
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {businessName}
                    </h1>
                    <p className="text-sm text-gray-600">Business Dashboard</p>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                <UnifiedNotificationsPanel />
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:text-red-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                      <Settings className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Business Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/business/profile"
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Business Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/business/services"
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <Building2 className="h-4 w-4" />
                        <span>Manage Services</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/business/quotes"
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Quote Requests</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/business/messages"
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <Mail className="h-4 w-4" />
                        <span>Messages</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/business/dashboard#payouts"
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <Wallet className="h-4 w-4" />
                        <span>Payouts & Banking</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold">
                  SC
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stripe Setup Required Banner */}
          {!stripeAccountStatus.isLoading &&
            !stripeAccountStatus.hasAccount && (
              <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 text-lg mb-1">
                      Set Up Payments to Receive Earnings
                    </h3>
                    <p className="text-amber-800 text-sm mb-4">
                      Connect your bank account through Stripe to receive
                      automatic payouts when customers book your services.
                      Without this, you won't be able to receive payments for
                      bookings.
                    </p>
                    <button
                      onClick={() => setActiveTab('payouts')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Set Up Payments Now
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Stripe Charges Not Enabled Banner */}
          {!stripeAccountStatus.isLoading &&
            stripeAccountStatus.hasAccount &&
            !stripeAccountStatus.chargesEnabled && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-lg mb-1">
                      Complete Your Stripe Verification
                    </h3>
                    <p className="text-blue-800 text-sm mb-4">
                      Your Stripe account needs additional verification before
                      you can receive payments. Please complete the verification
                      process to start accepting bookings.
                    </p>
                    <button
                      onClick={() => setActiveTab('payouts')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-medium shadow-sm"
                    >
                      Complete Verification
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'bookings', label: 'Bookings', icon: Calendar },
                { id: 'services', label: 'Services', icon: Building2 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'payouts', label: 'Payouts', icon: Wallet },
                { id: 'reviews', label: 'Reviews', icon: Star },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-sky-500 text-sky-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Monthly Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        £
                        {mockBusinessData.metrics.monthlyRevenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12% from last month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Bookings
                      </p>
                      <p
                        className="text-2xl font-bold text-gray-900"
                        suppressHydrationWarning
                      >
                        {stats.total}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+8% this month</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Average Rating
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockBusinessData.metrics.averageRating}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm text-yellow-600">
                    <Star className="w-4 h-4" />
                    <span>
                      From {mockBusinessData.business.reviewCount} reviews
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Repeat Customers
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {mockBusinessData.metrics.repeatCustomers}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm text-purple-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>+5% from last month</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Bookings */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Recent Bookings
                      </h3>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {!isMounted || bookingsLoading ? (
                      <div className="p-8 text-center text-gray-500">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                        <p className="text-lg font-medium mb-2">
                          Loading bookings...
                        </p>
                      </div>
                    ) : bookingRequests.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium mb-2">
                          No booking requests yet
                        </p>
                        <p className="text-sm">
                          When customers book your services, they'll appear
                          here.
                        </p>
                      </div>
                    ) : (
                      bookingRequests.slice(0, 4).map((request) => (
                        <div
                          key={request.id}
                          className="p-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold">
                                  {request.customerName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {request.customerName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {request.serviceName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {new Date(
                                      request.requestedDate
                                    ).toLocaleDateString()}{' '}
                                    at {request.requestedTime}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{request.customerEmail}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900 mb-2">
                                £{request.totalCost}
                              </div>
                              <div
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                              >
                                {getStatusIcon(request.status)}
                                {request.status}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Actions & Business Info */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Quick Actions
                    </h3>
                    <div className="space-y-3">
                      <Link
                        href="/business/services"
                        className="w-full flex items-center gap-3 p-3 text-left rounded-lg border-2 border-dashed border-gray-300 hover:border-sky-500 hover:bg-sky-50 transition-colors group"
                      >
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-sky-600" />
                        <span className="font-medium text-gray-700 group-hover:text-sky-700">
                          Add New Service
                        </span>
                      </Link>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="w-full flex items-center gap-3 p-3 text-left rounded-lg bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors"
                      >
                        <Calendar className="w-5 h-5 text-sky-600" />
                        <span className="font-medium text-sky-700">
                          Manage Bookings
                        </span>
                      </button>
                      <Link
                        href="/business/profile"
                        className="w-full flex items-center gap-3 p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-gray-700">
                          Business Profile
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Business Summary */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Business Profile
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {mockBusinessData.business.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {mockBusinessData.business.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {mockBusinessData.business.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-600">
                          {mockBusinessData.business.rating} (
                          {mockBusinessData.business.reviewCount} reviews)
                        </span>
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <BookingRequestsManager
              businessId={businessId}
              businessName={businessName}
            />
          )}

          {/* Old Bookings Tab - Replaced with BookingRequestsManager */}
          {false && activeTab === 'bookings' && (
            <div className="space-y-6">
              {/* Bookings Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Booking Management
                  </h2>
                  <p className="text-gray-600">
                    Manage your customer bookings and appointments
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search bookings..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                  </div>
                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Bookings List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white text-sm font-semibold">
                                {booking.customerName.charAt(0)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {booking.customerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {booking.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.service}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(booking.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.location}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              £{booking.value}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}
                            >
                              {getStatusIcon(booking.status)}
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button className="text-sky-600 hover:text-sky-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-gray-600 hover:text-gray-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Services Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Service Management
                  </h2>
                  <p className="text-gray-600">
                    Manage your service offerings and pricing
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/business/services"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Manage All Services
                  </Link>
                  <Link
                    href="/business/services"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Service
                  </Link>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockBusinessData.services.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {service.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {service.duration}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="text-lg font-bold text-gray-900">
                          £{service.price}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Bookings</span>
                        <span className="text-sm font-medium text-gray-900">
                          {service.bookings}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-gray-900">
                            {service.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex-1 py-2 px-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 py-2 px-3 bg-sky-100 text-sky-700 rounded-lg text-sm font-medium hover:bg-sky-200 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Revenue & Analytics
                </h2>
                <p className="text-gray-600 mb-6">
                  Track your earnings, bookings, and business performance
                </p>
              </div>

              <RevenueAnalytics businessId={businessId} />
            </div>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payouts & Bank Account
                </h2>
                <p className="text-gray-600 mb-6">
                  Connect your bank account to receive automatic payouts for
                  completed bookings
                </p>
              </div>

              {/* Stripe Connect Onboarding */}
              <StripeConnectOnboarding
                businessId={businessId}
                businessEmail={
                  businessInfo?.email || mockBusinessData.business.email
                }
                businessName={businessName}
              />

              {/* Payout Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">
                  How Payouts Work
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>
                    • Payouts are sent automatically to your connected bank
                    account
                  </li>
                  <li>• Default schedule: Weekly every Friday</li>
                  <li>
                    • You'll receive 85% of each booking (15% platform fee)
                  </li>
                  <li>• Funds typically arrive in 2-3 business days</li>
                  <li>
                    • View detailed transaction history in your Stripe Dashboard
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Customer Reviews
                </h2>
                <p className="text-gray-600 mb-6">
                  Manage your reviews and respond to customer feedback
                </p>
              </div>

              <ReviewsManager businessId={businessId} />
            </div>
          )}
        </div>
      </div>
    </BusinessAuthWrapper>
  );
}
