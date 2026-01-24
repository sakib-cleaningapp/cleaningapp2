'use client';

import React from 'react';
import {
  X,
  Star,
  Clock,
  MapPin,
  CheckCircle,
  Minus,
  Plus,
  Calendar,
  Shield,
} from 'lucide-react';
import { ServiceWithBusiness } from '@/hooks/use-services';

interface ServiceComparisonProps {
  services: ServiceWithBusiness[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveService: (serviceId: string) => void;
  onBookService: (service: ServiceWithBusiness) => void;
}

export function ServiceComparison({
  services,
  isOpen,
  onClose,
  onRemoveService,
  onBookService,
}: ServiceComparisonProps) {
  if (!isOpen || services.length === 0) return null;

  const getAvailabilityStatus = (service: ServiceWithBusiness) => {
    // Mock availability logic based on business rating and category
    if (service.business.rating >= 4.8) return 'Available Today';
    if (service.category === 'PLUMBING') return 'Emergency Available';
    return 'Available Tomorrow';
  };

  const getAvailabilityColor = (availability: string) => {
    if (availability.includes('Today') || availability.includes('Emergency'))
      return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getServiceFeatures = (category: string): string[] => {
    const features: Record<string, string[]> = {
      CLEANING: ['Supplies Included', 'Insured Team', 'Satisfaction Guarantee'],
      PLUMBING: ['24/7 Emergency', 'Licensed Plumbers', '12-month Warranty'],
      ELECTRICAL: ['Safety Testing', 'NICEIC Approved', 'Certification'],
      DECORATION: ['Premium Paint', 'Color Consultation', 'Clean-up Service'],
      CAR_DETAILING: [
        'Interior & Exterior',
        'Professional Products',
        'Mobile Service',
      ],
    };
    return (
      features[category] || [
        'Professional Service',
        'Quality Guarantee',
        'Trusted Provider',
      ]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-sky-50 to-blue-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Compare Services
            </h2>
            <p className="text-gray-600 mt-1">
              Compare {services.length} services side by side
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200"
            aria-label="Close comparison"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => {
                const availability = getAvailabilityStatus(service);
                const features = getServiceFeatures(service.category);

                return (
                  <div
                    key={service.id}
                    className="bg-white border-2 border-gray-200 rounded-2xl p-6 relative hover:shadow-lg transition-all duration-200"
                  >
                    {/* Remove button */}
                    <button
                      onClick={() => onRemoveService(service.id)}
                      className="absolute top-4 right-4 p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove from comparison"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Service Header */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 pr-8">
                        {service.name}
                      </h3>
                      <div className="text-sm text-gray-600 mb-2">
                        {service.business.name}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {service.business.rating}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{service.business.profile?.postcode}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        £{service.price}
                      </div>
                      <div className="text-sm text-gray-600">per session</div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                        <Clock className="w-3 h-3" />
                        <span>{service.duration}</span>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-900">
                          Availability
                        </span>
                      </div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(availability)}`}
                      >
                        {availability}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-900">
                          Includes
                        </span>
                      </div>
                      <div className="space-y-2">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => onBookService(service)}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-700 text-white font-bold py-3 px-4 rounded-xl hover:from-sky-600 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Book This Service
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Comparison Summary */}
            {services.length > 1 && (
              <div className="mt-8 p-6 bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl border border-blue-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Quick Comparison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Price Range
                    </h4>
                    <div className="text-gray-600">
                      £{Math.min(...services.map((s) => s.price))} - £
                      {Math.max(...services.map((s) => s.price))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Highest Rated
                    </h4>
                    <div className="text-gray-600">
                      {
                        services.reduce((max, service) =>
                          service.business.rating > max.business.rating
                            ? service
                            : max
                        ).business.name
                      }
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">
                      Categories
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(services.map((s) => s.category))].map(
                        (category) => (
                          <span
                            key={category}
                            className="bg-white text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            {category}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
