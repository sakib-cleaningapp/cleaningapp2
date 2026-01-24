'use client';

import { useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
} from 'lucide-react';
import { useBookingRequests } from '@/stores/booking-requests-store';

interface RevenueAnalyticsProps {
  businessId: string;
}

export function RevenueAnalytics({ businessId }: RevenueAnalyticsProps) {
  const { requests } = useBookingRequests(businessId);

  // Calculate revenue metrics from actual booking data
  const metrics = useMemo(() => {
    const acceptedBookings = requests.filter((r) => r.status === 'accepted');
    const completedBookings = requests.filter((r) => r.status === 'completed');
    const pendingBookings = requests.filter((r) => r.status === 'pending');

    // Total revenue (from completed bookings)
    const totalRevenue = completedBookings.reduce(
      (sum, booking) => sum + booking.totalCost,
      0
    );

    // Potential revenue (from accepted but not completed)
    const potentialRevenue = acceptedBookings
      .filter((b) => b.status !== 'completed')
      .reduce((sum, booking) => sum + booking.totalCost, 0);

    // Pending revenue (from pending requests)
    const pendingRevenue = pendingBookings.reduce(
      (sum, booking) => sum + booking.totalCost,
      0
    );

    // Current month revenue
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = completedBookings
      .filter((booking) => {
        const bookingDate = new Date(booking.requestedDate);
        return (
          bookingDate.getMonth() === currentMonth &&
          bookingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, booking) => sum + booking.totalCost, 0);

    // Previous month for comparison
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastMonthRevenue = completedBookings
      .filter((booking) => {
        const bookingDate = new Date(booking.requestedDate);
        return (
          bookingDate.getMonth() === lastMonth &&
          bookingDate.getFullYear() === lastMonthYear
        );
      })
      .reduce((sum, booking) => sum + booking.totalCost, 0);

    // Calculate growth
    const growthPercentage =
      lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : monthlyRevenue > 0
          ? 100
          : 0;

    // Platform fee (15%)
    const platformFee = totalRevenue * 0.15;
    const netRevenue = totalRevenue - platformFee;

    // Average booking value
    const avgBookingValue =
      completedBookings.length > 0
        ? totalRevenue / completedBookings.length
        : 0;

    return {
      totalRevenue,
      potentialRevenue,
      pendingRevenue,
      monthlyRevenue,
      growthPercentage,
      platformFee,
      netRevenue,
      avgBookingValue,
      totalBookings: completedBookings.length,
      acceptedBookings: acceptedBookings.length,
      pendingBookings: pendingBookings.length,
    };
  }, [requests]);

  return (
    <div className="space-y-6">
      {/* Main Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900">
                £{metrics.monthlyRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1 text-sm ${metrics.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {metrics.growthPercentage >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {Math.abs(metrics.growthPercentage).toFixed(1)}% from last month
            </span>
          </div>
        </div>

        {/* Total Earned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">
                £{metrics.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            Net: £{metrics.netRevenue.toFixed(2)} (after 15% platform fee)
          </p>
        </div>

        {/* Potential Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                £{metrics.potentialRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {metrics.acceptedBookings} accepted booking
            {metrics.acceptedBookings !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Average Booking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Booking</p>
              <p className="text-2xl font-bold text-gray-900">
                £{metrics.avgBookingValue.toFixed(2)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {metrics.totalBookings} completed booking
            {metrics.totalBookings !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Breakdown
        </h3>

        <div className="space-y-4">
          {/* Completed */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Completed Bookings
              </span>
              <span className="text-sm font-bold text-gray-900">
                £{metrics.totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{
                  width: `${metrics.totalRevenue > 0 ? 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Platform Fee */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Platform Fee (15%)
              </span>
              <span className="text-sm font-bold text-red-600">
                -£{metrics.platformFee.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{
                  width: `${metrics.totalRevenue > 0 ? 15 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Net Revenue */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-gray-900">
                Your Earnings
              </span>
              <span className="text-xl font-bold text-green-600">
                £{metrics.netRevenue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Revenue */}
      {metrics.pendingRevenue > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Pending Requests
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                You have {metrics.pendingBookings} pending booking request
                {metrics.pendingBookings !== 1 ? 's' : ''} worth £
                {metrics.pendingRevenue.toFixed(2)}
              </p>
              <p className="text-xs text-gray-600">
                Accept these requests to add them to your upcoming revenue
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {metrics.totalBookings === 0 && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No revenue yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start accepting booking requests to see your revenue analytics here
          </p>
        </div>
      )}
    </div>
  );
}
