'use client';

import { useState, useEffect, useMemo } from 'react';

// Types for the service data we'll display
export interface ServiceWithBusiness {
  id: string;
  name: string;
  description: string;
  price: number | null;
  pricingType?: 'fixed' | 'quote' | 'hourly';
  duration: string;
  category: string;
  business: {
    id: string;
    name: string;
    rating: number;
    serviceCategory: string;
    profile: {
      fullName: string;
      postcode: string;
    } | null;
  };
}

export interface ServiceFilters {
  category?: string;
  searchQuery?: string;
  sortBy?: 'price' | 'rating' | 'name' | 'distance';
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface UseServicesReturn {
  services: ServiceWithBusiness[];
  filteredServices: ServiceWithBusiness[];
  isLoading: boolean;
  error: string | null;
  filters: ServiceFilters;
  updateFilters: (newFilters: Partial<ServiceFilters>) => void;
  clearFilters: () => void;
  refetch: () => void;
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<ServiceWithBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceFilters>({});

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch services via API endpoint (uses service role key to bypass RLS)
      const response = await fetch('/api/services');
      const data = await response.json();

      if (!response.ok) {
        console.error('Error fetching services:', data.error);
        setError(data.error || 'Failed to fetch services.');
        setServices([]);
        return;
      }

      setServices(data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to fetch services.');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Filtered and sorted services based on current filters
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Category filter
    if (filters.category) {
      result = result.filter(
        (service) => service.category === filters.category
      );
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query) ||
          service.business.name.toLowerCase().includes(query)
      );
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      result = result.filter((service) => service.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((service) => service.price <= filters.maxPrice!);
    }

    // Rating filter
    if (filters.minRating !== undefined) {
      result = result.filter(
        (service) => service.business.rating >= filters.minRating!
      );
    }

    // Sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'rating':
            comparison = b.business.rating - a.business.rating; // Higher rating first by default
            break;
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'distance':
            // For now, sort by postcode as a proxy for distance
            comparison = (a.business.profile?.postcode || '').localeCompare(
              b.business.profile?.postcode || ''
            );
            break;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [services, filters]);

  const updateFilters = (newFilters: Partial<ServiceFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    services,
    filteredServices,
    isLoading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch: fetchServices,
  };
}
