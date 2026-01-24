'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Clock,
  Home,
  LogOut,
  MapPin,
  Settings,
  Sparkles,
  Star,
  User,
  Bell,
  HelpCircle,
  CreditCard,
  Calendar,
  BookmarkCheck,
} from 'lucide-react';

import { useAuth, useRequireAuth } from '@/contexts/auth-context';
import { useServices } from '@/hooks/use-services';
import { useBooking } from '@/hooks/use-booking';
import { BookingModal } from '@/components/booking-modal';
import { Business } from '@/components/business-listings';
import { BusinessListingsV2 } from '@/components/business-listings-v2';
import { ServiceDetailModal } from '@/components/service-detail-modal';
import { serviceCategories } from '@/components/service-categories';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCustomerNotifications } from '@/stores/notifications-store';
import { NotificationsPanel } from '@/components/notifications/notifications-panel';
import { ContactBusinessModal } from '@/components/contact-business-modal';

interface ServiceCategoryPageProps {
  params: {
    category: string;
  };
}

const formatCategoryName = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function ServiceCategoryPage({
  params,
}: ServiceCategoryPageProps) {
  const router = useRouter();
  const rawCategoryId = decodeURIComponent(params.category || '');
  const categoryMatch = serviceCategories.find(
    (category) => category.id.toUpperCase() === rawCategoryId.toUpperCase()
  );
  const categoryId = categoryMatch?.id ?? rawCategoryId.toUpperCase();
  const categoryName = categoryMatch?.name ?? formatCategoryName(categoryId);

  const { user: authUser, isLoading: authLoading } = useRequireAuth();
  const { signOut } = useAuth();

  const {
    filteredServices,
    isLoading: servicesLoading,
    updateFilters,
    clearFilters,
  } = useServices();
  const booking = useBooking();

  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] =
    useState<any>(null);
  const [isServiceDetailModalOpen, setIsServiceDetailModalOpen] =
    useState(false);
  const [contactModalService, setContactModalService] = useState<any>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const servicesSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    updateFilters({ category: categoryId });
    setSelectedBusiness(null);

    return () => {
      clearFilters();
    };
  }, [categoryId, updateFilters, clearFilters]);

  const businesses = useMemo(() => {
    const categoryServices = filteredServices.filter(
      (service) => service.category === categoryId
    );
    const businessMap = new Map<string, Business>();

    categoryServices.forEach((service) => {
      const businessServices = categoryServices.filter(
        (candidate) => candidate.business.id === service.business.id
      );
      const prices = businessServices.map((item) => item.price);

      if (!businessMap.has(service.business.id)) {
        businessMap.set(service.business.id, {
          id: service.business.id,
          name: service.business.name,
          rating: service.business.rating,
          reviewCount: Math.floor(Math.random() * 200) + 50,
          description: `Professional ${categoryName.toLowerCase()} services. Trusted by customers across ${service.business.profile?.postcode || 'Wales'}.`,
          postcode: service.business.profile?.postcode || 'CF10 1AB',
          deliveryTime: '30-90 min',
          priceRange: prices.length
            ? `£${Math.min(...prices)}-${Math.max(...prices)}`
            : '£0-£0',
          specialties: businessServices.map((item) => item.name),
          badges:
            service.business.rating >= 4.8
              ? ['Popular', 'Highly Rated']
              : ['Trusted'],
          isPopular: service.business.rating >= 4.8,
        });
      }
    });

    return Array.from(businessMap.values());
  }, [filteredServices, categoryId, categoryName]);

  useEffect(() => {
    if (!selectedBusiness && businesses.length > 0) {
      setSelectedBusiness(businesses[0].id);
    }
  }, [businesses, selectedBusiness]);

  const servicesForBusiness = useMemo(
    () =>
      filteredServices.filter(
        (service) =>
          service.category === categoryId &&
          service.business.id === selectedBusiness
      ),
    [filteredServices, categoryId, selectedBusiness]
  );

  const selectedBusinessDetails = useMemo(
    () =>
      businesses.find((business) => business.id === selectedBusiness) ?? null,
    [businesses, selectedBusiness]
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const handleBusinessSelect = (businessId: string) => {
    setSelectedBusiness(businessId);
    setTimeout(() => {
      servicesSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 0);
  };

  const handleServiceDetailsOpen = (service: any) => {
    setSelectedServiceForDetails(service);
    setIsServiceDetailModalOpen(true);
  };

  const handleServiceDetailsClose = () => {
    setIsServiceDetailModalOpen(false);
    setSelectedServiceForDetails(null);
  };

  const handleContactBusiness = (service: any) => {
    setContactModalService(service);
    setIsContactModalOpen(true);
    handleServiceDetailsClose();
  };

  // Prepare business data for contact modal
  const contactBusinessData = contactModalService
    ? {
        id: contactModalService.business.id,
        name: contactModalService.business.name,
        rating: contactModalService.business.rating,
        reviewCount: Math.floor(Math.random() * 200) + 50,
        responseTime: '24 hours',
        location: contactModalService.business.profile?.postcode || 'Wales',
        email: contactModalService.business.profile?.email,
        phone: contactModalService.business.profile?.phone,
      }
    : null;

  if (authLoading || !authUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Tap2Clean
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <span className="text-sm text-gray-600 font-medium">
                {categoryName} services near you
              </span>
              <div className="flex items-center space-x-3">
                <Link
                  href="/my-bookings"
                  className="p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-white/60 transition-all duration-200 shadow-sm"
                  title="My Bookings"
                >
                  <BookmarkCheck className="h-5 w-5" />
                </Link>
                <button
                  onClick={() =>
                    setIsNotificationsPanelOpen(!isNotificationsPanelOpen)
                  }
                  className="relative p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-white/60 transition-all duration-200 shadow-sm"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.unreadCount > 0 && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                </button>
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

      <div className="relative container mx-auto px-6 py-10 space-y-10">
        <BusinessListingsV2
          categoryName={categoryName}
          businesses={businesses}
          onBusinessSelect={handleBusinessSelect}
          isLoading={servicesLoading}
          onBack={() => router.push('/dashboard')}
        />

        <div
          ref={servicesSectionRef}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-sky-50 to-blue-50">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedBusinessDetails
                ? `${selectedBusinessDetails.name} Services`
                : 'Select a business to view services'}
            </h2>
            <p className="text-gray-600 mt-1">
              {selectedBusinessDetails
                ? 'Choose from their available services and book in seconds.'
                : 'Pick a business above to see exactly what they offer.'}
            </p>
          </div>

          <div className="p-8">
            {servicesLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600" />
              </div>
            ) : servicesForBusiness.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No services available yet
                </h3>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Check back soon or choose another business from the list
                  above.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicesForBusiness.map((service, index) => {
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
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="h-16 w-16 bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
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

      <BookingModal booking={booking} />
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

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={isNotificationsPanelOpen}
        onClose={() => setIsNotificationsPanelOpen(false)}
        notifications={notifications.notifications}
        onMarkAsRead={notifications.markAsRead}
        onMarkAllAsRead={notifications.markAllAsRead}
        onDeleteNotification={notifications.removeNotification}
        unreadCount={notifications.unreadCount}
      />

      {/* Contact Business Modal */}
      <ContactBusinessModal
        business={contactBusinessData}
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setContactModalService(null);
        }}
        selectedService={
          contactModalService
            ? {
                name: contactModalService.name,
                price: contactModalService.price,
              }
            : undefined
        }
      />
    </div>
  );
}
