'use client';

import { useState } from 'react';
import { ServiceWithBusiness } from './use-services';

export interface UseComparisonReturn {
  comparisonServices: ServiceWithBusiness[];
  isInComparison: (serviceId: string) => boolean;
  addToComparison: (service: ServiceWithBusiness) => void;
  removeFromComparison: (serviceId: string) => void;
  toggleComparison: (service: ServiceWithBusiness) => void;
  clearComparison: () => void;
  isComparisonOpen: boolean;
  openComparison: () => void;
  closeComparison: () => void;
  canAddMore: boolean;
}

const MAX_COMPARISON_SERVICES = 3;

export function useComparison(): UseComparisonReturn {
  const [comparisonServices, setComparisonServices] = useState<
    ServiceWithBusiness[]
  >([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const isInComparison = (serviceId: string): boolean => {
    return comparisonServices.some((service) => service.id === serviceId);
  };

  const addToComparison = (service: ServiceWithBusiness) => {
    if (
      !isInComparison(service.id) &&
      comparisonServices.length < MAX_COMPARISON_SERVICES
    ) {
      setComparisonServices((prev) => [...prev, service]);
    }
  };

  const removeFromComparison = (serviceId: string) => {
    setComparisonServices((prev) =>
      prev.filter((service) => service.id !== serviceId)
    );
  };

  const toggleComparison = (service: ServiceWithBusiness) => {
    if (isInComparison(service.id)) {
      removeFromComparison(service.id);
    } else if (comparisonServices.length < MAX_COMPARISON_SERVICES) {
      addToComparison(service);
    }
  };

  const clearComparison = () => {
    setComparisonServices([]);
  };

  const openComparison = () => {
    if (comparisonServices.length > 0) {
      setIsComparisonOpen(true);
    }
  };

  const closeComparison = () => {
    setIsComparisonOpen(false);
  };

  const canAddMore = comparisonServices.length < MAX_COMPARISON_SERVICES;

  return {
    comparisonServices,
    isInComparison,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    clearComparison,
    isComparisonOpen,
    openComparison,
    closeComparison,
    canAddMore,
  };
}
