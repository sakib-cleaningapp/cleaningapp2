'use client';

import Link from 'next/link';
import {
  Home,
  Sparkles,
  Calendar,
  MapPin,
  User,
  Settings,
  LogOut,
  Plus,
  Clock,
  Star,
  ArrowRight,
  BookmarkCheck,
  MessageSquare,
} from 'lucide-react';
import { useAuth, useRequireAuth } from '@/contexts/auth-context';
import { useServices } from '@/hooks/use-services';
import { useBooking } from '@/hooks/use-booking';
import { BookingModal } from '@/components/booking-modal';
import { ServiceCategories } from '@/components/service-categories';
import { Business } from '@/components/business-listings';
import { BusinessListingsV2 } from '@/components/business-listings-v2';
import { ServiceDetailModal } from '@/components/service-detail-modal';
import { ContactBusinessModal } from '@/components/contact-business-modal';
import { ToastContainer } from '@/components/notifications/toast-notification';
import { BookingSuccessModal } from '@/components/booking-success-modal';
import { useCustomerBookings } from '@/hooks/use-customer-bookings';
import { useEffect, useRef, useState } from 'react';
import {
  ServiceSearchDropdown,
  ServiceSuggestion,
} from '@/components/service-search-dropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UnifiedNotificationsPanel } from '@/components/unified-notifications-panel';
import { useNotifications } from '@/hooks/use-notifications';
import { messagesApi } from '@/lib/api/messages';

export default function DashboardPage() {
  // Protect this route - redirect to login if not authenticated
  const { user: authUser, isLoading: authLoading } = useRequireAuth();
  const { signOut } = useAuth();

  // Fetch services data
  const {
    services,
    filteredServices,
    isLoading: servicesLoading,
    error: servicesError,
    filters,
    updateFilters,
    clearFilters,
  } = useServices();

  // Booking functionality
  const booking = useBooking();

  // Customer notifications (database-backed)
  const notifications = useNotifications();

  // Customer bookings for Recent Bookings section
  const customerBookings = useCustomerBookings('customer-1');

  // Derive the next upcoming booking (accepted/pending, future date)
  const nextUpcomingBooking = (() => {
    try {
      const now = new Date();
      const toDate = (d: string, t?: string) =>
        new Date(`${d}${t ? ' ' + t : ''}`);

      return (
        customerBookings.bookings
          .filter((b) => {
            const dt = toDate(b.requestedDate, b.requestedTime);
            return dt.getTime() > now.getTime();
          })
          .sort(
            (a, b) =>
              toDate(a.requestedDate, a.requestedTime).getTime() -
              toDate(b.requestedDate, b.requestedTime).getTime()
          )[0] || null
      );
    } catch {
      return null;
    }
  })();

  // Derive the most recent completed booking for quick rebook
  const lastCompletedBooking = (() => {
    try {
      const toDate = (d: string, t?: string) =>
        new Date(`${d}${t ? ' ' + t : ''}`);
      return (
        customerBookings.completedBookings
          .slice()
          .sort(
            (a, b) =>
              toDate(b.requestedDate, b.requestedTime).getTime() -
              toDate(a.requestedDate, a.requestedTime).getTime()
          )[0] || null
      );
    } catch {
      return null;
    }
  })();

  // Category and business selection state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(
    null
  );

  // Service detail modal state
  const [selectedServiceForDetails, setSelectedServiceForDetails] =
    useState<any>(null);
  const [isServiceDetailModalOpen, setIsServiceDetailModalOpen] =
    useState(false);

  // Contact business modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactBusiness, setContactBusiness] = useState<any>(null);

  // Unread messages count for header badge
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await messagesApi.getCustomerMessages();
        if (result.success && typeof result.unreadCount === 'number') {
          setUnreadMessagesCount(result.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread messages count:', error);
      }
    };

    if (authUser) {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [authUser]);

  // Anchor for marketplace section
  const marketplaceRef = useRef<HTMLDivElement | null>(null);
  const scrollToMarketplace = () => {
    marketplaceRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Check for "Book Again" navigation from my-bookings page
  useEffect(() => {
    const viewBusinessDetails = sessionStorage.getItem('viewBusinessDetails');
    if (viewBusinessDetails) {
      try {
        const { category, businessId } = JSON.parse(viewBusinessDetails);
        setSelectedCategory(category);
        setSelectedBusiness(businessId);
        updateFilters({ category });
        sessionStorage.removeItem('viewBusinessDetails');
        setTimeout(() => scrollToMarketplace(), 100);
      } catch (error) {
        console.error('Error parsing viewBusinessDetails:', error);
        sessionStorage.removeItem('viewBusinessDetails');
      }
    }
  }, [updateFilters]);

  // Show loading state while checking auth
  if (authLoading || !authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
  };

  // Get first name from full name
  const firstName = authUser.fullName?.split(' ')[0] || 'User';

  // Get services by category using the actual filtered services
  const getServicesForCategory = (categoryId: string) => {
    return filteredServices.filter(
      (service) => service.category === categoryId
    );
  };

  // Get businesses for category (unique businesses from services)
  const getBusinessesForCategory = (categoryId: string): Business[] => {
    const categoryServices = getServicesForCategory(categoryId);
    const businessMap = new Map<string, Business>();

    categoryServices.forEach((service) => {
      const business = service.business;
      if (!businessMap.has(business.id)) {
        businessMap.set(business.id, {
          id: business.id,
          name: business.name,
          rating: business.rating,
          reviewCount: Math.floor(Math.random() * 200) + 50, // Mock review count
          description: `Professional ${categoryId.toLowerCase()} services. Trusted by customers across ${business.profile?.postcode || 'Wales'}.`,
          postcode: business.profile?.postcode || 'CF10 1AB',
          deliveryTime: '30-90 min', // Mock delivery time
          priceRange: (() => {
            const businessServices = categoryServices.filter(
              (s) => s.business.id === business.id
            );
            const prices = businessServices
              .map((s) => s.price)
              .filter((p): p is number => p !== null);
            if (prices.length === 0) return 'Quote Required';
            return `£${Math.min(...prices)}-${Math.max(...prices)}`;
          })(),
          specialties: categoryServices
            .filter((s) => s.business.id === business.id)
            .map((s) => s.name),
          badges:
            business.rating >= 4.8 ? ['Popular', 'Highly Rated'] : ['Trusted'],
          isPopular: business.rating >= 4.8,
        });
      }
    });

    return Array.from(businessMap.values());
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedBusiness(null);
    // Update service filters to show only this category
    updateFilters({ category: categoryId });
    // Scroll into view when category chosen
    setTimeout(() => scrollToMarketplace(), 0);
  };

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusiness(businessId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedBusiness(null);
    setSelectedServiceName(null);
    // Clear category filter
    clearFilters();
  };

  // Convert services to search suggestions format
  const getServiceSuggestions = (): ServiceSuggestion[] => {
    return services.map((service) => ({
      id: service.id,
      name: service.name,
      businessName: service.business.name,
      businessId: service.business.id,
      category: service.category,
    }));
  };

  // Get businesses offering a specific service
  const getBusinessesOfferingService = (serviceName: string): Business[] => {
    const matchingServices = services.filter(
      (service) => service.name.toLowerCase() === serviceName.toLowerCase()
    );
    const businessMap = new Map<string, Business>();

    matchingServices.forEach((service) => {
      const business = service.business;
      if (!businessMap.has(business.id)) {
        businessMap.set(business.id, {
          id: business.id,
          name: business.name,
          rating: business.rating,
          reviewCount: Math.floor(Math.random() * 200) + 50,
          description: `Offering ${serviceName} and more. Trusted by customers across ${business.profile?.postcode || 'Wales'}.`,
          postcode: business.profile?.postcode || 'CF10 1AB',
          deliveryTime: '30-90 min',
          priceRange: service.price
            ? `From £${service.price}`
            : 'Quote Required',
          specialties: services
            .filter((s) => s.business.id === business.id)
            .map((s) => s.name),
          badges:
            business.rating >= 4.8 ? ['Popular', 'Highly Rated'] : ['Trusted'],
          isPopular: business.rating >= 4.8,
        });
      }
    });

    return Array.from(businessMap.values());
  };

  // Handle service selection from search dropdown
  const handleServiceSelect = (service: ServiceSuggestion) => {
    setSelectedServiceName(service.name);
    setSelectedCategory(service.category);
    setSelectedBusiness(null);
    // Update filters to show this category
    updateFilters({ category: service.category });
    // Scroll to marketplace
    setTimeout(() => scrollToMarketplace(), 0);
  };

  // Service detail modal handlers
  const handleServiceDetailsOpen = (service: any) => {
    setSelectedServiceForDetails(service);
    setIsServiceDetailModalOpen(true);
  };

  const handleServiceDetailsClose = () => {
    setIsServiceDetailModalOpen(false);
    setSelectedServiceForDetails(null);
  };

  const handleContactBusiness = (service: any) => {
    setContactBusiness({
      id: service.business.id,
      name: service.business.name,
      rating: service.business.rating,
      reviewCount: Math.floor(Math.random() * 200) + 50,
      responseTime: '< 2 hours',
      location: service.business.profile?.postcode || 'Wales',
    });
    setIsContactModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      {/* Navigation Header */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Tap2Clean
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-600 font-medium">
                Hello, {firstName}!
              </span>
              <div className="flex items-center space-x-3">
                <Link
                  href="/my-bookings"
                  className="p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-white/60 transition-all duration-200 shadow-sm"
                  title="My Bookings"
                >
                  <BookmarkCheck className="h-5 w-5" />
                </Link>
                <Link
                  href="/my-messages"
                  className="relative p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-white/60 transition-all duration-200 shadow-sm"
                  title="My Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>
                <UnifiedNotificationsPanel />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-white/60 transition-all duration-200 shadow-sm">
                      <Settings className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuLabel>Account Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 cursor-pointer py-2"
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="flex items-center gap-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 py-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative container mx-auto px-6 py-10">
        {/* Hero Section (replaces the three stat boxes) */}
        <section className="grid lg:grid-cols-2 gap-10 items-center mb-12">
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-transparent">
                Welcome back, {firstName}! 👋
              </h1>
              <p className="text-lg text-gray-600 text-pretty">
                Ready to book your next cleaning service
                {authUser.postcode ? ` in ${authUser.postcode}` : ''}?
              </p>
            </div>

            <button
              onClick={scrollToMarketplace}
              className="bg-gradient-to-r from-sky-500 to-blue-700 hover:from-sky-600 hover:to-blue-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1 w-max"
            >
              Browse Services
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl border-2 border-sky-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  {nextUpcomingBooking ? 'Upcoming Booking' : 'Recent Bookings'}
                </h3>
              </div>
              <div className="p-6">
                {customerBookings.bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      No bookings yet - let's get started!
                    </p>
                    <button
                      onClick={scrollToMarketplace}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Browse Services
                    </button>
                  </div>
                ) : nextUpcomingBooking ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {nextUpcomingBooking.serviceName} –{' '}
                          {nextUpcomingBooking.businessName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(
                            nextUpcomingBooking.requestedDate
                          ).toLocaleDateString()}{' '}
                          at {nextUpcomingBooking.requestedTime}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href="/my-bookings"
                          className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-white transition-colors text-sm font-medium"
                        >
                          View details
                        </Link>
                        <button
                          onClick={scrollToMarketplace}
                          className="px-3 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors text-sm font-semibold"
                        >
                          Book again
                        </button>
                      </div>
                    </div>
                    <Link
                      href="/my-bookings"
                      className="w-full mt-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-center block"
                    >
                      View all bookings
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerBookings.bookings.slice(0, 1).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {booking.serviceName} - {booking.businessName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(
                              booking.requestedDate
                            ).toLocaleDateString()}{' '}
                            at {booking.requestedTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">4.8</span>
                        </div>
                      </div>
                    ))}
                    <Link
                      href="/my-bookings"
                      className="w-full mt-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-center block"
                    >
                      View all bookings
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Marketplace Flow */}
        <div ref={marketplaceRef} />
        {!selectedCategory ? (
          /* Step 1: Service Categories (like Deliveroo) */
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Choose a Service
                  </h2>
                  <p className="text-gray-600 mt-1">
                    What would you like help with today?
                  </p>
                </div>
                <div className="flex-shrink-0 w-full max-w-md">
                  <ServiceSearchDropdown
                    services={getServiceSuggestions()}
                    onServiceSelect={handleServiceSelect}
                  />
                </div>
              </div>
            </div>
            <div className="p-8">
              <ServiceCategories
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
            </div>
          </div>
        ) : !selectedBusiness ? (
          /* Step 2: Business Listings for Selected Category */
          <BusinessListingsV2
            categoryName={selectedServiceName || selectedCategory}
            businesses={
              selectedServiceName
                ? getBusinessesOfferingService(selectedServiceName)
                : getBusinessesForCategory(selectedCategory)
            }
            onBusinessSelect={handleBusinessSelect}
            onBack={handleBackToCategories}
          />
        ) : (
          /* Step 3: Business Services (existing service cards for selected business) */
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
              <button
                onClick={() => setSelectedBusiness(null)}
                className="mb-4 text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-2 font-medium"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to {selectedCategory.toLowerCase()} businesses
              </button>

              <h2 className="text-2xl font-bold text-gray-900">
                {
                  getBusinessesForCategory(selectedCategory).find(
                    (b) => b.id === selectedBusiness
                  )?.name
                }{' '}
                Services
              </h2>
              <p className="text-gray-600 mt-1">
                Choose from their available services
              </p>
            </div>

            <div className="p-8">
              {/* Existing service cards for the selected business */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(() => {
                  const categoryServices =
                    getServicesForCategory(selectedCategory);
                  const businessServices = categoryServices.filter(
                    (service) => service.business.id === selectedBusiness
                  );

                  if (businessServices.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12">
                        <p className="text-gray-500 mb-4">
                          No services found for this business.
                        </p>
                        <button
                          onClick={() => setSelectedBusiness(null)}
                          className="text-sky-600 hover:text-sky-700 font-medium"
                        >
                          Go back to browse other businesses
                        </button>
                      </div>
                    );
                  }

                  return businessServices.map((service, index) => {
                    const isPopular = index === 0;
                    const getServiceIcon = (name: string) => {
                      if (name.toLowerCase().includes('regular')) return Home;
                      if (name.toLowerCase().includes('deep')) return Sparkles;
                      if (name.toLowerCase().includes('move')) return MapPin;
                      return Home;
                    };

                    const Icon = getServiceIcon(service.name);

                    return (
                      <div
                        key={service.id}
                        className={`relative bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer group ${
                          isPopular
                            ? 'ring-2 ring-sky-400 shadow-lg'
                            : 'shadow-md'
                        }`}
                      >
                        {isPopular && (
                          <div className="absolute -top-4 left-8 bg-gradient-to-r from-sky-500 to-blue-700 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-lg">
                            Most Popular
                          </div>
                        )}

                        <div className="flex items-start justify-between mb-6">
                          <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                              isPopular
                                ? 'bg-gradient-to-br from-sky-500 to-blue-700 text-white'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                            }`}
                          >
                            <Icon className="h-8 w-8" />
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-gray-900">
                              £{service.price}
                            </div>
                            <div className="text-sm text-gray-600 font-medium">
                              per session
                            </div>
                          </div>
                        </div>

                        <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-sky-600 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {service.duration}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {service.business.rating}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleServiceDetailsOpen(service)}
                            className="flex-1 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => booking.selectService(service)}
                            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-700 text-white font-bold py-3 px-4 rounded-xl hover:from-sky-600 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                          >
                            Book now
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Book New Service */}
          <div className="bg-gradient-to-br from-sky-500 via-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-bold mb-3">
              Need a cleaning service?
            </h3>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Book your next appointment in just a few clicks
            </p>
            <button
              onClick={scrollToMarketplace}
              className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all duration-200 inline-flex items-center space-x-3 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-5 w-5" />
              <span>Book Now</span>
            </button>

            {lastCompletedBooking && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    // Try to find the service to preselect; fall back to marketplace
                    const service = services.find(
                      (s) => s.id === lastCompletedBooking.serviceId
                    );
                    if (service) {
                      booking.selectService(service);
                    } else {
                      scrollToMarketplace();
                    }
                  }}
                  className="text-white/90 underline-offset-4 hover:underline text-sm font-medium"
                >
                  Rebook last service – {lastCompletedBooking.serviceName}
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4 mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  {authUser.fullName || 'User'}
                </h3>
                <p className="text-gray-600 font-medium">{authUser.email}</p>
                {authUser.postcode && (
                  <p className="text-sm text-gray-500">{authUser.postcode}</p>
                )}
              </div>
            </div>
            <Link
              href="/profile"
              className="text-sky-600 hover:text-sky-700 font-bold inline-flex items-center space-x-2 transition-colors"
            >
              <span>Manage Profile</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal booking={booking} />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedServiceForDetails}
        isOpen={isServiceDetailModalOpen}
        onClose={handleServiceDetailsClose}
        onBookNow={(service) => {
          booking.selectService(service);
          handleServiceDetailsClose();
        }}
        onContactBusiness={handleContactBusiness}
      />

      {/* Booking Success Modal */}
      {booking.successDetails && (
        <BookingSuccessModal
          isOpen={booking.showSuccessModal}
          onClose={() => booking.setShowSuccessModal(false)}
          bookingDetails={booking.successDetails}
        />
      )}

      {/* Contact Business Modal */}
      <ContactBusinessModal
        business={contactBusiness}
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setContactBusiness(null);
        }}
        selectedService={
          selectedServiceForDetails
            ? {
                name: selectedServiceForDetails.name,
                price: selectedServiceForDetails.price,
              }
            : undefined
        }
      />
    </div>
  );
}
