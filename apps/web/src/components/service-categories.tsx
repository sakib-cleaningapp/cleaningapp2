'use client';

import React from 'react';
import {
  Sparkles,
  Wrench,
  Zap,
  Paintbrush,
  Bug,
  Car,
  Home,
  Settings,
  Hammer,
  Droplets,
  Scissors,
  Package,
} from 'lucide-react';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'CLEANING',
    name: 'Cleaning',
    icon: <Sparkles className="w-8 h-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'House & office cleaning',
  },
  {
    id: 'PLUMBING',
    name: 'Plumbing',
    icon: <Wrench className="w-8 h-8" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description: 'Pipes, leaks & repairs',
  },
  {
    id: 'ELECTRICAL',
    name: 'Electrical',
    icon: <Zap className="w-8 h-8" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    description: 'Wiring & installations',
  },
  {
    id: 'DECORATION',
    name: 'Decoration',
    icon: <Paintbrush className="w-8 h-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Painting & decorating',
  },
  {
    id: 'PEST_CONTROL',
    name: 'Pest Control',
    icon: <Bug className="w-8 h-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Pest removal services',
  },
  {
    id: 'CAR_DETAILING',
    name: 'Car Detailing',
    icon: <Car className="w-8 h-8" />,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Vehicle cleaning & care',
  },
  {
    id: 'HANDYMAN',
    name: 'Handyman',
    icon: <Hammer className="w-8 h-8" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'General repairs & fixes',
  },
  {
    id: 'GARDENING',
    name: 'Gardening',
    icon: <Scissors className="w-8 h-8" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    description: 'Garden maintenance',
  },
];

interface ServiceCategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export function ServiceCategories({
  selectedCategory,
  onCategorySelect,
}: ServiceCategoriesProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        What service do you need?
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {serviceCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`
              p-4 rounded-2xl transition-smooth text-center hover:shadow-md
              ${
                selectedCategory === category.id
                  ? 'ring-2 ring-primary bg-primary/5 shadow-md'
                  : 'hover:bg-muted'
              }
            `}
          >
            <div
              className={`
              w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3
              ${selectedCategory === category.id ? 'bg-primary/10' : category.bgColor}
            `}
            >
              <div
                className={
                  selectedCategory === category.id
                    ? 'text-primary'
                    : category.color
                }
              >
                {category.icon}
              </div>
            </div>
            <h3 className="font-medium text-sm text-foreground mb-1">
              {category.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {category.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
