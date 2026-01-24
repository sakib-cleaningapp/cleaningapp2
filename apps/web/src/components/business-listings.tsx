'use client';

import React from 'react';
import { Star, Clock, MapPin, ArrowRight } from 'lucide-react';

export interface Business {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  description: string;
  postcode: string;
  deliveryTime: string;
  priceRange: string;
  specialties: string[];
  badges: string[];
  imageUrl?: string;
  isPopular?: boolean;
}

interface BusinessListingsProps {
  categoryName: string;
  businesses: Business[];
  onBusinessSelect: (businessId: string) => void;
  isLoading?: boolean;
}

export function BusinessListings({
  categoryName,
  businesses,
  onBusinessSelect,
  isLoading = false,
}: BusinessListingsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          {categoryName} Services
        </h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-elevated p-6 animate-pulse">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-muted rounded"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full"></div>
                  <div className="h-6 w-20 bg-muted rounded-full"></div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 w-16 bg-muted rounded"></div>
                <div className="h-4 w-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          {categoryName} Services
        </h2>
        <p className="text-muted-foreground">
          {businesses.length}{' '}
          {businesses.length === 1 ? 'business' : 'businesses'} available
        </p>
      </div>

      <div className="space-y-4">
        {businesses.map((business) => (
          <button
            key={business.id}
            onClick={() => onBusinessSelect(business.id)}
            className="w-full card-interactive p-6 text-left group"
          >
            <div className="flex gap-4">
              {/* Business Image/Logo */}
              <div className="w-24 h-24 bg-gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                {business.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Business Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
                      {business.name}
                      {business.isPopular && (
                        <span className="ml-2 badge-popular text-xs">
                          Popular
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-sm">
                          {business.rating}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          ({business.reviewCount} reviews)
                        </span>
                      </div>
                      <span className="text-muted-foreground">•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {business.postcode}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-smooth" />
                </div>

                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {business.description}
                </p>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {business.specialties.slice(0, 3).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {business.specialties.length > 3 && (
                    <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                      +{business.specialties.length - 3} more
                    </span>
                  )}
                </div>

                {/* Badges */}
                {business.badges.length > 0 && (
                  <div className="flex gap-2">
                    {business.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Time Info */}
              <div className="text-right">
                <div className="flex items-center gap-1 text-muted-foreground text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>{business.deliveryTime}</span>
                </div>
                <div className="font-medium text-foreground">
                  {business.priceRange}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {businesses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No businesses found
          </h3>
          <p className="text-muted-foreground">
            We don't have any {categoryName.toLowerCase()} services in your area
            yet.
          </p>
        </div>
      )}
    </div>
  );
}
