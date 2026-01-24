'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Grid3X3,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Business as BaseBusiness } from './business-listings';

type Business = BaseBusiness & {
  availability?: string;
  location?: string;
  initials?: string;
  logoUrl?: string;
};

interface BusinessListingsV2Props {
  categoryName: string;
  businesses: BaseBusiness[];
  onBusinessSelect: (businessId: string) => void;
  isLoading?: boolean;
  onBack?: () => void;
}

const filterOptions = [
  { id: 'popular', label: 'Popular' },
  { id: 'highly-rated', label: 'Highly Rated' },
  { id: 'new', label: 'New' },
  { id: 'available-today', label: 'Available Today' },
  { id: 'open-now', label: 'Open Now' },
];

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'rating-desc', label: 'Rating (High to Low)' },
  { value: 'price-asc', label: 'Price (Low to High)' },
  { value: 'price-desc', label: 'Price (High to Low)' },
  { value: 'distance', label: 'Distance' },
  { value: 'availability', label: 'Availability' },
];

export function BusinessListingsV2({
  categoryName,
  businesses,
  onBusinessSelect,
  isLoading = false,
  onBack,
}: BusinessListingsV2Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('recommended');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const derived: Business[] = useMemo(
    () =>
      businesses.map((b) => ({
        ...b,
        initials: b.name.substring(0, 2).toUpperCase(),
        availability: b.deliveryTime || 'Next available: Tomorrow',
        location: b.postcode,
      })),
    [businesses]
  );

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const filtered = useMemo(() => {
    let result = derived;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          b.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (activeFilters.length) {
      result = result.filter((b) => {
        const checks: boolean[] = [];
        if (activeFilters.includes('popular')) checks.push(!!b.isPopular);
        if (activeFilters.includes('highly-rated'))
          checks.push(b.rating >= 4.7);
        if (activeFilters.includes('new'))
          checks.push(b.badges.some((x) => x.toLowerCase().includes('new')));
        if (activeFilters.includes('available-today')) checks.push(true); // placeholder
        if (activeFilters.includes('open-now')) checks.push(true); // placeholder
        return checks.length ? checks.every(Boolean) : true;
      });
    }

    switch (sortBy) {
      case 'rating-desc':
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case 'price-asc':
        result = [...result].sort(
          (a, b) => parsePrice(a.priceRange) - parsePrice(b.priceRange)
        );
        break;
      case 'price-desc':
        result = [...result].sort(
          (a, b) => parsePrice(b.priceRange) - parsePrice(a.priceRange)
        );
        break;
      case 'availability':
      case 'distance':
      default:
        break;
    }

    return result;
  }, [derived, searchQuery, activeFilters, sortBy]);

  const BusinessCard = ({ business }: { business: Business }) => (
    <Card
      className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus-within:ring-2 focus-within:ring-ring"
      onClick={() => onBusinessSelect(business.id)}
      role="button"
      tabIndex={0}
      aria-label={`View ${business.name} - ${business.rating} stars, ${business.reviewCount} reviews, ${business.availability}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onBusinessSelect(business.id);
        }
      }}
    >
      <div className="p-4 flex items-center gap-4">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-lg font-semibold text-primary border border-border overflow-hidden">
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl || '/placeholder.svg'}
                alt={`${business.name} logo`}
                className="w-full h-full object-cover"
              />
            ) : (
              business.initials
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                  {business.name}
                </h3>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full text-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="font-medium">
                    {business.rating.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">
                    • {business.reviewCount}
                  </span>
                </div>
                {business.badges.map((badge) => (
                  <Badge key={badge} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                {business.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{business.postcode}</span>
                </div>
                <div className="flex gap-1">
                  {business.specialties.slice(0, 3).map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="outline"
                      className="text-xs"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
          <div className="text-lg font-semibold text-foreground mb-1">
            {business.priceRange}
          </div>
          <Badge variant="secondary" className="mb-2">
            {business.availability}
          </Badge>
          <div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </Card>
  );

  const SkeletonCard = () => (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 bg-muted rounded-lg animate-pulse" />
        <div className="flex-1">
          <div className="h-5 bg-muted rounded animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded animate-pulse mb-2 w-3/4" />
          <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <div className="w-20 h-16 bg-muted rounded animate-pulse" />
      </div>
    </Card>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
        <Search className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        No businesses found in {categoryName} near you
      </h3>
      <p className="text-muted-foreground mb-4">
        Try adjusting your filters or search terms
      </p>
      <Button variant="outline" onClick={() => setActiveFilters([])}>
        Change filters
      </Button>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={onBack}
              aria-label="Go back"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Go back</span>
            </Button>
            <div className="flex-1">
              <nav className="text-sm text-muted-foreground mb-1">
                Home / {categoryName}
              </nav>
              <h1 className="text-2xl font-bold text-foreground">
                {categoryName} Services
              </h1>
              <p className="text-muted-foreground">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'business' : 'businesses'} available
                near you
              </p>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses or services"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Chips */}
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => {
                  const isActive = activeFilters.includes(filter.id);
                  return (
                    <Button
                      key={filter.id}
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFilter(filter.id)}
                      className={cn(
                        'h-8 transition-all',
                        isActive
                          ? 'bg-sky-500 text-white border-sky-500 hover:bg-sky-600 hover:border-sky-600 shadow-md'
                          : 'hover:border-sky-300 hover:bg-sky-50'
                      )}
                    >
                      {filter.label}
                      {isActive && <span className="ml-1.5 text-white">✓</span>}
                    </Button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex border border-border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'rounded-none',
                      viewMode === 'list' &&
                        'bg-primary text-primary-foreground'
                    )}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'rounded-none border-l',
                      viewMode === 'grid' &&
                        'bg-primary text-primary-foreground'
                    )}
                    aria-label="Grid view"
                  >
                    <Grid3X3 className="w-4 h-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            className={cn(
              viewMode === 'list'
                ? 'space-y-4'
                : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            )}
          >
            {filtered.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function parsePrice(range: string): number {
  // crude parser: takes the first number found
  const m = range.match(/\d+(?:\.\d+)?/);
  return m ? parseFloat(m[0]) : Number.POSITIVE_INFINITY;
}
