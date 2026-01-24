'use client';

import React from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Shield,
  Award,
  CheckCircle,
  Heart,
} from 'lucide-react';
import { BusinessAvailability } from './business-availability';
import { ServiceWithBusiness } from '@/hooks/use-services';

interface ServiceDetailModalProps {
  service: ServiceWithBusiness | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (service: ServiceWithBusiness) => void;
  onContactBusiness: (service: ServiceWithBusiness) => void;
  onToggleFavorite?: (service: ServiceWithBusiness) => void;
  isFavorite?: boolean;
}

export function ServiceDetailModal({
  service,
  isOpen,
  onClose,
  onBookNow,
  onContactBusiness,
  onToggleFavorite,
  isFavorite = false,
}: ServiceDetailModalProps) {
  if (!isOpen || !service) return null;

  // Mock additional business information that would come from database
  const businessDetails = {
    yearEstablished: 2018,
    employees: '5-10',
    responseTime: '< 2 hours',
    completedJobs: Math.floor(Math.random() * 500) + 100,
    repeatCustomers: '85%',
    insurance: 'Fully Insured',
    certifications: [
      'Licensed Professional',
      'Background Checked',
      'Customer Verified',
    ],
    availability: 'Mon-Sat 8AM-6PM',
  };

  // Service features based on category
  const getServiceFeatures = (category: string) => {
    const features: Record<string, string[]> = {
      CLEANING: [
        'All cleaning supplies included',
        'Eco-friendly products available',
        'Fully insured cleaning team',
        'Satisfaction guarantee',
        'Flexible scheduling',
      ],
      PLUMBING: [
        '24/7 emergency service',
        'Fixed price guarantee',
        'All parts and labor included',
        'Fully licensed plumbers',
        '12-month warranty',
      ],
      ELECTRICAL: [
        'Qualified electricians only',
        'Safety testing included',
        'NICEIC approved',
        'Emergency callouts available',
        'Certification provided',
      ],
      DECORATION: [
        'Premium paint brands',
        'Color consultation included',
        'Furniture protection',
        'Clean-up service',
        'Touch-up warranty',
      ],
      CAR_DETAILING: [
        'Interior & exterior cleaning',
        'Professional grade products',
        'Paint protection available',
        'Mobile service option',
        'Satisfaction guarantee',
      ],
    };
    return features[category] || [];
  };

  const serviceFeatures = getServiceFeatures(service.category);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-5 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-white/60 rounded-lg transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="flex items-start gap-6 pr-16">
            {/* Business Logo/Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {service.name}
              </h1>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 whitespace-nowrap">
                    {service.business.rating}
                  </span>
                  <span className="text-gray-600 whitespace-nowrap">
                    ({businessDetails.completedJobs} reviews)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 flex-shrink-0">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {service.business.profile?.postcode}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-600 flex-shrink-0">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap">{service.duration}</span>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-sky-700 mb-1">
                {service.business.name}
              </h2>
              <p className="text-gray-600">
                Professional {service.category.toLowerCase()} services since{' '}
                {businessDetails.yearEstablished}
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                £{service.price}
              </div>
              <div className="text-sm text-gray-600">per session</div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Service Description */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Service Details
              </h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                {service.description}
              </p>

              {/* Service Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {serviceFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  About {service.business.name}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Established:</span>
                    <span className="font-medium text-gray-900">
                      {businessDetails.yearEstablished}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team Size:</span>
                    <span className="font-medium text-gray-900">
                      {businessDetails.employees} professionals
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time:</span>
                    <span className="font-medium text-gray-900">
                      {businessDetails.responseTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed Jobs:</span>
                    <span className="font-medium text-gray-900">
                      {businessDetails.completedJobs}+
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Repeat Customers:</span>
                    <span className="font-medium text-gray-900">
                      {businessDetails.repeatCustomers}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Credentials & Coverage
                </h3>

                {/* Certifications */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Certifications
                  </h4>
                  <div className="space-y-2">
                    {businessDetails.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability and Contact */}
            <div className="bg-gray-50 rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Availability & Hours
                  </h3>
                  <BusinessAvailability
                    business={{
                      id: service.business.id,
                      name: service.business.name,
                      responseTime: businessDetails.responseTime,
                      phone: '(029) 2034 5678',
                      email: `hello@${service.business.name.toLowerCase().replace(/\s+/g, '')}.com`,
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    Contact Business
                  </h3>
                  <button
                    onClick={() =>
                      onContactBusiness && onContactBusiness(service)
                    }
                    className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-5 border-t border-gray-200 bg-gray-50">
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(service)}
              className={`flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg transition-colors ${
                isFavorite
                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                  : 'hover:bg-white'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
              />
              {isFavorite ? 'Saved' : 'Save'}
            </button>
          )}
          <button
            onClick={() => onContactBusiness && onContactBusiness(service)}
            className="flex-1 bg-gray-100 border border-gray-200 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
          >
            Contact Business
          </button>
          <button
            onClick={() => onBookNow(service)}
            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-700 text-white font-bold py-3 px-6 rounded-xl hover:from-sky-600 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
