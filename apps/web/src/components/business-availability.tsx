'use client';

import { Clock, CheckCircle, AlertCircle, Calendar, Phone } from 'lucide-react';

interface BusinessHours {
  [key: string]: {
    open: string;
    close: string;
    isOpen: boolean;
  };
}

interface BusinessAvailabilityProps {
  business: {
    id: string;
    name: string;
    responseTime: string;
    phone?: string;
    email?: string;
  };
  className?: string;
}

// Mock business hours - in real app this would come from database
const getBusinessHours = (businessId: string): BusinessHours => {
  // Different businesses have different schedules
  const schedules = {
    'demo-biz-1': {
      monday: { open: '08:00', close: '18:00', isOpen: true },
      tuesday: { open: '08:00', close: '18:00', isOpen: true },
      wednesday: { open: '08:00', close: '18:00', isOpen: true },
      thursday: { open: '08:00', close: '18:00', isOpen: true },
      friday: { open: '08:00', close: '18:00', isOpen: true },
      saturday: { open: '09:00', close: '16:00', isOpen: true },
      sunday: { open: '10:00', close: '14:00', isOpen: true },
    },
    'demo-biz-2': {
      monday: { open: '07:00', close: '20:00', isOpen: true },
      tuesday: { open: '07:00', close: '20:00', isOpen: true },
      wednesday: { open: '07:00', close: '20:00', isOpen: true },
      thursday: { open: '07:00', close: '20:00', isOpen: true },
      friday: { open: '07:00', close: '20:00', isOpen: true },
      saturday: { open: '08:00', close: '18:00', isOpen: true },
      sunday: { open: '00:00', close: '00:00', isOpen: false }, // Closed Sundays
    },
    'demo-biz-3': {
      monday: { open: '09:00', close: '17:00', isOpen: true },
      tuesday: { open: '09:00', close: '17:00', isOpen: true },
      wednesday: { open: '09:00', close: '17:00', isOpen: true },
      thursday: { open: '09:00', close: '17:00', isOpen: true },
      friday: { open: '09:00', close: '17:00', isOpen: true },
      saturday: { open: '00:00', close: '00:00', isOpen: false }, // Closed weekends
      sunday: { open: '00:00', close: '00:00', isOpen: false },
    },
  };

  return (
    schedules[businessId as keyof typeof schedules] || schedules['demo-biz-1']
  );
};

const getCurrentStatus = (businessHours: BusinessHours) => {
  const now = new Date();
  const currentDay = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const todayHours = businessHours[currentDay];

  if (!todayHours || !todayHours.isOpen) {
    return {
      status: 'closed',
      message: 'Closed today',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      icon: AlertCircle,
    };
  }

  const isCurrentlyOpen =
    currentTime >= todayHours.open && currentTime <= todayHours.close;

  if (isCurrentlyOpen) {
    return {
      status: 'open',
      message: `Open until ${todayHours.close}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: CheckCircle,
    };
  } else {
    return {
      status: 'closed',
      message: `Opens at ${todayHours.open}`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      icon: Clock,
    };
  }
};

const getNextAvailableTime = (businessHours: BusinessHours) => {
  const now = new Date();
  const currentDay = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();
  const todayHours = businessHours[currentDay];

  if (todayHours && todayHours.isOpen) {
    const currentTime = now.toTimeString().slice(0, 5);
    if (currentTime < todayHours.open) {
      return `Available today from ${todayHours.open}`;
    } else if (currentTime <= todayHours.close) {
      return 'Available now';
    }
  }

  // Find next available day
  const daysOfWeek = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const currentDayIndex = now.getDay();

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDay = daysOfWeek[nextDayIndex];
    const nextDayHours = businessHours[nextDay];

    if (nextDayHours && nextDayHours.isOpen) {
      const dayName = nextDay.charAt(0).toUpperCase() + nextDay.slice(1);
      return `Available ${dayName} from ${nextDayHours.open}`;
    }
  }

  return 'Availability unknown';
};

export function BusinessAvailability({
  business,
  className = '',
}: BusinessAvailabilityProps) {
  const businessHours = getBusinessHours(business.id);
  const currentStatus = getCurrentStatus(businessHours);
  const nextAvailable = getNextAvailableTime(businessHours);
  const StatusIcon = currentStatus.icon;

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Status */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${currentStatus.bgColor}`}
        >
          <StatusIcon className={`w-4 h-4 ${currentStatus.color}`} />
          <span className={`text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.message}
          </span>
        </div>
      </div>

      {/* Response Time & Contact */}
      <div className="flex items-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Responds within {business.responseTime}</span>
        </div>
        {business.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4" />
            <a
              href={`tel:${business.phone}`}
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              Call Now
            </a>
          </div>
        )}
      </div>

      {/* Next Available */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">{nextAvailable}</span>
      </div>

      {/* Weekly Schedule */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-900">Business Hours</h4>
        <div className="grid grid-cols-1 gap-1">
          {daysOfWeek.map((day) => {
            const hours = businessHours[day.key];
            const isToday =
              new Date()
                .toLocaleDateString('en-US', { weekday: 'long' })
                .toLowerCase() === day.key;

            return (
              <div
                key={day.key}
                className={`flex justify-between items-center py-1 px-2 rounded text-sm ${
                  isToday ? 'bg-sky-50 font-medium' : ''
                }`}
              >
                <span className={isToday ? 'text-sky-900' : 'text-gray-700'}>
                  {day.label}
                </span>
                <span className={isToday ? 'text-sky-700' : 'text-gray-600'}>
                  {hours && hours.isOpen
                    ? `${hours.open} - ${hours.close}`
                    : 'Closed'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Compact version for service cards
export function BusinessAvailabilityCompact({
  business,
  className = '',
}: BusinessAvailabilityProps) {
  const businessHours = getBusinessHours(business.id);
  const currentStatus = getCurrentStatus(businessHours);
  const StatusIcon = currentStatus.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <StatusIcon className={`w-3 h-3 ${currentStatus.color}`} />
      <span className={`text-xs ${currentStatus.color}`}>
        {currentStatus.message}
      </span>
      <span className="text-xs text-gray-500">
        • Responds in {business.responseTime}
      </span>
    </div>
  );
}
