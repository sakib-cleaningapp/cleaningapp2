'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Send,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  User,
  Home,
  Calendar,
  Sparkles,
  PawPrint,
  Leaf,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import { messagesApi } from '@/lib/api/messages';
import { useAuth } from '@/contexts/auth-context';

interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  responseTime: string;
  location: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

interface ContactBusinessModalProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  selectedService?: {
    name: string;
    price: number;
  };
}

// Service type options
const SERVICE_TYPES = [
  {
    id: 'regular',
    label: 'Regular cleaning',
    description: 'Recurring weekly/bi-weekly service',
  },
  {
    id: 'deep',
    label: 'Deep clean',
    description: 'Thorough top-to-bottom cleaning',
  },
  {
    id: 'move-out',
    label: 'Move-out clean',
    description: 'End of tenancy cleaning',
  },
  {
    id: 'one-time',
    label: 'One-time clean',
    description: 'Single cleaning session',
  },
  { id: 'other', label: 'Other', description: 'Something else' },
];

// Property size options
const PROPERTY_SIZES = [
  { id: 'studio', label: 'Studio / 1 bed', rooms: '1-2 rooms' },
  { id: '2bed', label: '2 bedroom', rooms: '3-4 rooms' },
  { id: '3bed', label: '3 bedroom', rooms: '5-6 rooms' },
  { id: '4bed', label: '4+ bedroom', rooms: '7+ rooms' },
  { id: 'office', label: 'Office / Commercial', rooms: 'Varies' },
];

// Timing options
const TIMING_OPTIONS = [
  { id: 'asap', label: 'ASAP', description: 'As soon as possible' },
  {
    id: 'this-week',
    label: 'This week',
    description: 'Within the next 7 days',
  },
  {
    id: 'flexible',
    label: 'Flexible',
    description: 'No rush, open to scheduling',
  },
  {
    id: 'specific',
    label: 'Specific date',
    description: 'I have a date in mind',
  },
];

// Special requirements options
const SPECIAL_REQUIREMENTS = [
  { id: 'pets', label: 'Pets in home', icon: PawPrint },
  { id: 'allergies', label: 'Allergies/sensitivities', icon: ShieldAlert },
  { id: 'eco-friendly', label: 'Eco-friendly products', icon: Leaf },
  { id: 'specific-areas', label: 'Focus on specific areas', icon: Sparkles },
];

export function ContactBusinessModal({
  business,
  isOpen,
  onClose,
  selectedService,
}: ContactBusinessModalProps) {
  const { user } = useAuth();

  // Structured form state
  const [serviceType, setServiceType] = useState('');
  const [propertySize, setPropertySize] = useState('');
  const [timing, setTiming] = useState('');
  const [specificDate, setSpecificDate] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showAdditionalNotes, setShowAdditionalNotes] = useState(false);

  // Keep the urgent checkbox
  const [isUrgent, setIsUrgent] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setServiceType('');
      setPropertySize('');
      setTiming('');
      setSpecificDate('');
      setSpecialRequirements([]);
      setAdditionalNotes('');
      setShowAdditionalNotes(false);
      setIsUrgent(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !business) return null;

  const toggleSpecialRequirement = (id: string) => {
    setSpecialRequirements((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // Build a structured message from the form data
  const buildStructuredMessage = () => {
    const parts: string[] = [];

    // Service type
    const selectedServiceType = SERVICE_TYPES.find((s) => s.id === serviceType);
    if (selectedServiceType) {
      parts.push(`Service Type: ${selectedServiceType.label}`);
    }

    // Property size
    const selectedPropertySize = PROPERTY_SIZES.find(
      (p) => p.id === propertySize
    );
    if (selectedPropertySize) {
      parts.push(
        `Property Size: ${selectedPropertySize.label} (${selectedPropertySize.rooms})`
      );
    }

    // Timing
    const selectedTiming = TIMING_OPTIONS.find((t) => t.id === timing);
    if (selectedTiming) {
      let timingStr = `Preferred Timing: ${selectedTiming.label}`;
      if (timing === 'specific' && specificDate) {
        timingStr += ` - ${specificDate}`;
      }
      parts.push(timingStr);
    }

    // Special requirements
    if (specialRequirements.length > 0) {
      const reqLabels = specialRequirements
        .map((id) => SPECIAL_REQUIREMENTS.find((r) => r.id === id)?.label)
        .filter(Boolean);
      parts.push(`Special Requirements: ${reqLabels.join(', ')}`);
    }

    // Additional notes
    if (additionalNotes.trim()) {
      parts.push(`Additional Notes: ${additionalNotes.trim()}`);
    }

    return parts.join('\n\n');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use authenticated user ID or generate guest ID
      const senderId = user?.id || `guest-${Date.now()}`;

      // Build subject from service type and selected service
      const serviceTypeLabel =
        SERVICE_TYPES.find((s) => s.id === serviceType)?.label ||
        'Service Inquiry';
      const subject = selectedService
        ? `[${selectedService.name}] ${serviceTypeLabel}`
        : serviceTypeLabel;

      // Build the structured message
      const message = buildStructuredMessage();

      const result = await messagesApi.sendMessage({
        senderId,
        recipientBusinessId: business.id,
        senderName: user?.fullName || 'Guest User',
        senderEmail: user?.email || 'guest@example.com',
        senderPhone: undefined, // Could be added from user profile if available
        subject,
        message,
        messageType: 'quote',
        isUrgent,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to send message');
      }

      setIsSent(true);

      // Reset form after a delay
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid =
    serviceType &&
    propertySize &&
    timing &&
    (timing !== 'specific' || specificDate);

  if (isSent) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Inquiry Sent!
          </h3>
          <p className="text-gray-600 mb-4">
            Your service inquiry has been sent to {business.name}. You can
            expect a response within{' '}
            <span className="font-medium text-sky-600">
              {business.responseTime}
            </span>
            .
          </p>
          <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
            <p className="text-sm text-sky-800">
              <Lightbulb className="w-4 h-4 inline mr-1" />
              <strong>Pro tip:</strong> Check your email for updates and replies
              from the business.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                {business.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Get a Quote from {business.name}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {business.rating} ({business.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Responds within {business.responseTime}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Info Display (if logged in) */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contacting as</p>
                  <p className="font-medium text-gray-900">
                    {user.fullName || 'User'}{' '}
                    <span className="text-gray-500 font-normal">
                      ({user.email})
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Selected Service (if any) */}
          {selectedService && (
            <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-sky-800">
                  Inquiring about:
                </span>
              </div>
              <div className="text-sky-900">
                <span className="font-semibold">{selectedService.name}</span>
                <span className="text-sky-700 ml-2">
                  from £{selectedService.price}
                </span>
              </div>
            </div>
          )}

          {/* Step 1: Service Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                What type of cleaning do you need?
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setServiceType(type.id)}
                  className={`text-left p-3 border-2 rounded-lg transition-colors ${
                    serviceType === type.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`font-medium ${serviceType === type.id ? 'text-sky-900' : 'text-gray-900'}`}
                  >
                    {type.label}
                  </div>
                  <div
                    className={`text-xs ${serviceType === type.id ? 'text-sky-600' : 'text-gray-500'}`}
                  >
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Property Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <Home className="w-4 h-4" />
                What is your property size?
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROPERTY_SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setPropertySize(size.id)}
                  className={`text-left p-3 border-2 rounded-lg transition-colors ${
                    propertySize === size.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`font-medium ${propertySize === size.id ? 'text-sky-900' : 'text-gray-900'}`}
                  >
                    {size.label}
                  </div>
                  <div
                    className={`text-xs ${propertySize === size.id ? 'text-sky-600' : 'text-gray-500'}`}
                  >
                    {size.rooms}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Timing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <Calendar className="w-4 h-4" />
                When do you need the service?
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIMING_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTiming(option.id)}
                  className={`text-left p-3 border-2 rounded-lg transition-colors ${
                    timing === option.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`font-medium ${timing === option.id ? 'text-sky-900' : 'text-gray-900'}`}
                  >
                    {option.label}
                  </div>
                  <div
                    className={`text-xs ${timing === option.id ? 'text-sky-600' : 'text-gray-500'}`}
                  >
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
            {timing === 'specific' && (
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            )}
          </div>

          {/* Step 4: Special Requirements (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="inline-flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                Any special requirements?{' '}
                <span className="font-normal text-gray-500">(optional)</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_REQUIREMENTS.map((req) => {
                const Icon = req.icon;
                const isSelected = specialRequirements.includes(req.id);
                return (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => toggleSpecialRequirement(req.id)}
                    className={`flex items-center gap-2 p-3 border-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isSelected ? 'text-sky-600' : 'text-gray-400'}`}
                    />
                    <span
                      className={`text-sm font-medium ${isSelected ? 'text-sky-900' : 'text-gray-700'}`}
                    >
                      {req.label}
                    </span>
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-sky-600 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes (Collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdditionalNotes(!showAdditionalNotes)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showAdditionalNotes ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              Add additional notes
            </button>
            {showAdditionalNotes && (
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                rows={3}
                className="mt-3 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                placeholder="Any other details you'd like to share (access instructions, specific areas of concern, etc.)"
              />
            )}
          </div>

          {/* Urgent Request */}
          <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <input
              type="checkbox"
              id="urgent"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="urgent" className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-yellow-800">
                This is urgent (for same-day or emergency services)
              </span>
            </label>
          </div>

          {/* Business Contact Info */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">
              You can also contact {business.name} directly:
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{business.location}</span>
              </div>
              {business.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <a
                    href={`tel:${business.phone}`}
                    className="text-sky-600 hover:text-sky-700"
                  >
                    {business.phone}
                  </a>
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4" />
                  <a
                    href={`mailto:${business.email}`}
                    className="text-sky-600 hover:text-sky-700"
                  >
                    {business.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Not logged in warning */}
          {!user && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                <strong>Note:</strong> You are not logged in. For the best
                experience and to track responses, please{' '}
                <a
                  href="/login"
                  className="text-amber-800 underline hover:no-underline"
                >
                  sign in
                </a>{' '}
                first.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                isLoading || !isFormValid
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
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
