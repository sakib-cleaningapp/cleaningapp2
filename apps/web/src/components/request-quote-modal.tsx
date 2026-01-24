'use client';

import { useState } from 'react';
import {
  X,
  Send,
  Calculator,
  Home,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { quotesApi } from '@/lib/api/quotes';

interface Business {
  id: string;
  name: string;
  rating: number;
  responseTime: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface RequestQuoteModalProps {
  business: Business | null;
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const PROPERTY_TYPES = [
  { id: 'house', label: 'House', icon: Home },
  { id: 'flat', label: 'Flat/Apartment', icon: Home },
  { id: 'office', label: 'Office', icon: Home },
  { id: 'commercial', label: 'Commercial Space', icon: Home },
];

const ROOM_TYPES = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Bathroom',
  'Dining Room',
  'Office/Study',
  'Utility Room',
  'Conservatory',
];

const FREQUENCY_OPTIONS = [
  {
    id: 'one-time',
    label: 'One-time Service',
    description: 'Single cleaning session',
  },
  { id: 'weekly', label: 'Weekly', description: 'Every week' },
  { id: 'bi-weekly', label: 'Bi-weekly', description: 'Every 2 weeks' },
  { id: 'monthly', label: 'Monthly', description: 'Once per month' },
  { id: 'custom', label: 'Custom Schedule', description: 'Other arrangement' },
];

export function RequestQuoteModal({
  business,
  service,
  isOpen,
  onClose,
}: RequestQuoteModalProps) {
  const [formData, setFormData] = useState({
    propertyType: 'house',
    propertySize: '',
    numberOfRooms: 1,
    specificRooms: [] as string[],
    frequency: 'one-time',
    customFrequency: '',
    preferredDate: '',
    preferredTime: '',
    timeFlexible: false,
    additionalServices: [] as string[],
    specialRequirements: '',
    budgetRange: '',
    contactInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !business || !service) return null;

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleRoom = (room: string) => {
    setFormData((prev) => ({
      ...prev,
      specificRooms: prev.specificRooms.includes(room)
        ? prev.specificRooms.filter((r) => r !== room)
        : [...prev.specificRooms, room],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Build description from form data
      const description = [
        `Property: ${formData.propertyType}`,
        formData.propertySize ? `Size: ${formData.propertySize}` : '',
        `Rooms: ${formData.numberOfRooms}`,
        formData.specificRooms.length > 0
          ? `Specific rooms: ${formData.specificRooms.join(', ')}`
          : '',
        `Frequency: ${formData.frequency}${formData.frequency === 'custom' ? ` (${formData.customFrequency})` : ''}`,
        formData.specialRequirements
          ? `Special requirements: ${formData.specialRequirements}`
          : '',
      ]
        .filter(Boolean)
        .join('\n');

      // Generate a customer ID (in production this would come from auth)
      const customerId = `customer-${Date.now()}`;

      const result = await quotesApi.createQuoteRequest({
        customer_id: customerId,
        business_id: business.id,
        service_id: service.id,
        customer_name: formData.contactInfo.name,
        customer_email: formData.contactInfo.email,
        customer_phone: formData.contactInfo.phone || undefined,
        description,
        preferred_date: formData.preferredDate || undefined,
        preferred_time: formData.preferredTime || undefined,
        budget_range: formData.budgetRange || undefined,
        property_type: formData.propertyType,
        property_size: formData.propertySize || undefined,
        number_of_rooms: formData.numberOfRooms,
        specific_rooms:
          formData.specificRooms.length > 0
            ? formData.specificRooms
            : undefined,
        frequency: formData.frequency,
        special_requirements: formData.specialRequirements || undefined,
        address: formData.contactInfo.address || undefined,
        postcode: formData.contactInfo.postcode,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit quote request');
      }

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting quote request:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit quote request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Quote Request Sent!
          </h3>
          <p className="text-gray-600 mb-4">
            Your quote request has been sent to {business.name}. You'll receive
            a detailed quote within{' '}
            <span className="font-medium text-sky-600">
              {business.responseTime}
            </span>
            .
          </p>
          <div className="bg-sky-50 rounded-lg p-4 border border-sky-200 mb-6">
            <p className="text-sm text-sky-800">
              📧 <strong>What's next?</strong> {business.name} will review your
              requirements and send you a personalized quote with pricing and
              availability.
            </p>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false);
              onClose();
            }}
            className="w-full py-3 px-6 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Request Quote</h2>
              <p className="text-gray-600">
                Get a personalized quote for{' '}
                <span className="font-medium text-sky-600">{service.name}</span>{' '}
                from {business.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Property Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Property Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Property Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {PROPERTY_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.id}
                        className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.propertyType === type.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="propertyType"
                          value={type.id}
                          checked={formData.propertyType === type.id}
                          onChange={(e) =>
                            updateFormData('propertyType', e.target.value)
                          }
                          className="sr-only"
                        />
                        <Icon
                          className={`w-4 h-4 ${formData.propertyType === type.id ? 'text-sky-600' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-sm ${formData.propertyType === type.id ? 'text-sky-900 font-medium' : 'text-gray-700'}`}
                        >
                          {type.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Size (sq ft/m²)
                </label>
                <input
                  type="text"
                  value={formData.propertySize}
                  onChange={(e) =>
                    updateFormData('propertySize', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="e.g., 1500 sq ft or Not sure"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Rooms *
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    updateFormData(
                      'numberOfRooms',
                      Math.max(1, formData.numberOfRooms - 1)
                    )
                  }
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-semibold text-gray-900 w-12 text-center">
                  {formData.numberOfRooms}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    updateFormData('numberOfRooms', formData.numberOfRooms + 1)
                  }
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Specific Rooms to Clean (Optional)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ROOM_TYPES.map((room) => (
                  <label
                    key={room}
                    className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors ${
                      formData.specificRooms.includes(room)
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.specificRooms.includes(room)}
                      onChange={() => toggleRoom(room)}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm ${formData.specificRooms.includes(room) ? 'text-sky-900 font-medium' : 'text-gray-700'}`}
                    >
                      {room}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Service Frequency */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Service Frequency
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FREQUENCY_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.frequency === option.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={option.id}
                    checked={formData.frequency === option.id}
                    onChange={(e) =>
                      updateFormData('frequency', e.target.value)
                    }
                    className="mt-1 h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300"
                  />
                  <div>
                    <div
                      className={`font-medium ${formData.frequency === option.id ? 'text-sky-900' : 'text-gray-900'}`}
                    >
                      {option.label}
                    </div>
                    <div
                      className={`text-sm ${formData.frequency === option.id ? 'text-sky-700' : 'text-gray-600'}`}
                    >
                      {option.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {formData.frequency === 'custom' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={formData.customFrequency}
                  onChange={(e) =>
                    updateFormData('customFrequency', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="Describe your preferred schedule..."
                />
              </div>
            )}
          </div>

          {/* Scheduling Preferences */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Scheduling Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) =>
                    updateFormData('preferredDate', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) =>
                    updateFormData('preferredTime', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Any time</option>
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.timeFlexible}
                  onChange={(e) =>
                    updateFormData('timeFlexible', e.target.checked)
                  }
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I'm flexible with timing (may help get better rates)
                </span>
              </label>
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Details
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requirements or Instructions
              </label>
              <textarea
                value={formData.specialRequirements}
                onChange={(e) =>
                  updateFormData('specialRequirements', e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Any specific requirements, pets, access instructions, or areas that need special attention..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range (Optional)
              </label>
              <select
                value={formData.budgetRange}
                onChange={(e) => updateFormData('budgetRange', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">No preference</option>
                <option value="under-50">Under £50</option>
                <option value="50-100">£50 - £100</option>
                <option value="100-200">£100 - £200</option>
                <option value="200-500">£200 - £500</option>
                <option value="over-500">Over £500</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.name}
                  onChange={(e) =>
                    updateFormData('contactInfo.name', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) =>
                    updateFormData('contactInfo.email', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.contactInfo.phone}
                  onChange={(e) =>
                    updateFormData('contactInfo.phone', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  value={formData.contactInfo.postcode}
                  onChange={(e) =>
                    updateFormData('contactInfo.postcode', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="CF10 3AZ"
                  required
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Address
              </label>
              <textarea
                value={formData.contactInfo.address}
                onChange={(e) =>
                  updateFormData('contactInfo.address', e.target.value)
                }
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                placeholder="Full address where the service will be provided"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Failed to submit quote request
                </p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !formData.contactInfo.name ||
                !formData.contactInfo.email ||
                !formData.contactInfo.phone
              }
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                isLoading ||
                !formData.contactInfo.name ||
                !formData.contactInfo.email ||
                !formData.contactInfo.phone
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting Request...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Request Quote
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
