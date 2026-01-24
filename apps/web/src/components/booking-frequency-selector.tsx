'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export interface FrequencyOption {
  value: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  label: string;
  description: string;
}

const FREQUENCY_OPTIONS: FrequencyOption[] = [
  {
    value: 'one-time',
    label: 'One-time Service',
    description: 'Single cleaning session',
  },
  {
    value: 'weekly',
    label: 'Weekly',
    description: 'Every week',
  },
  {
    value: 'bi-weekly',
    label: 'Bi-weekly',
    description: 'Every 2 weeks',
  },
  {
    value: 'monthly',
    label: 'Monthly',
    description: 'Once per month',
  },
];

interface BookingFrequencySelectorProps {
  selectedFrequency: string;
  onFrequencyChange: (frequency: string) => void;
  basePrice: number;
}

export function BookingFrequencySelector({
  selectedFrequency,
  onFrequencyChange,
  basePrice,
}: BookingFrequencySelectorProps) {
  return (
    <div>
      <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-6 h-6 text-blue-600" />
        Service Frequency
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FREQUENCY_OPTIONS.map((option) => {
          return (
            <button
              key={option.value}
              onClick={() => onFrequencyChange(option.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                selectedFrequency === option.value
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {option.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900">
                  £{basePrice}
                </div>
                <div className="text-sm text-gray-500">per session</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Enhanced booking details interface with frequency support
export interface FrequencyBookingDetails {
  service: any; // ServiceWithBusiness type
  selectedDate?: string;
  selectedTime?: string;
  frequency?: 'one-time' | 'weekly' | 'bi-weekly' | 'monthly';
  specialInstructions?: string;
  totalCost?: number;
}
