'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  MapPin,
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

function MetricCard({ title, value, change, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="text-blue-600">{icon}</div>
        </div>
        <div className="flex items-center mt-4">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span
            className={`text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

interface RecentBooking {
  id: string;
  customerName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
  amount: number;
}

export function ServiceDashboard() {
  const metrics = [
    {
      title: 'Total Bookings',
      value: '127',
      change: 12,
      trend: 'up' as const,
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      title: 'Monthly Revenue',
      value: '$8,420',
      change: 8,
      trend: 'up' as const,
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: 'Active Customers',
      value: '89',
      change: 15,
      trend: 'up' as const,
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: 'Average Rating',
      value: '4.9',
      change: 2,
      trend: 'up' as const,
      icon: <Star className="w-6 h-6" />,
    },
  ];

  const recentBookings: RecentBooking[] = [
    {
      id: '1',
      customerName: 'Sarah Johnson',
      service: 'Deep House Cleaning',
      date: 'Today',
      time: '2:00 PM',
      status: 'confirmed',
      amount: 120,
    },
    {
      id: '2',
      customerName: 'Mike Chen',
      service: 'Regular Cleaning',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'pending',
      amount: 80,
    },
    {
      id: '3',
      customerName: 'Emma Davis',
      service: 'Move-out Cleaning',
      date: 'Dec 28',
      time: '9:00 AM',
      status: 'confirmed',
      amount: 200,
    },
    {
      id: '4',
      customerName: 'John Smith',
      service: 'Office Cleaning',
      date: 'Dec 27',
      time: '6:00 PM',
      status: 'completed',
      amount: 150,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's your business overview.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {booking.customerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-gray-600">{booking.service}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {booking.date}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {booking.time}
                    </div>
                  </div>

                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>

                  <div className="text-right">
                    <p className="font-bold text-gray-900">${booking.amount}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Manage Schedule
            </h3>
            <p className="text-sm text-gray-600">
              View and update your availability
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Customer Reviews
            </h3>
            <p className="text-sm text-gray-600">
              Respond to customer feedback
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">
              Earnings Report
            </h3>
            <p className="text-sm text-gray-600">
              View detailed financial reports
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
