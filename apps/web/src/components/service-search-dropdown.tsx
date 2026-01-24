'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export interface ServiceSuggestion {
  id: string;
  name: string;
  businessName: string;
  businessId: string;
  category: string;
}

interface ServiceSearchDropdownProps {
  services: ServiceSuggestion[];
  onServiceSelect: (service: ServiceSuggestion) => void;
  placeholder?: string;
}

export function ServiceSearchDropdown({
  services,
  onServiceSelect,
  placeholder = 'Search for a specific service...',
}: ServiceSearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on query (minimum 2 characters)
  const suggestions =
    query.trim().length >= 2
      ? services
          .filter((service) => {
            const searchTerm = query.toLowerCase().trim();
            const serviceName = service.name.toLowerCase();
            const businessName = service.businessName.toLowerCase();

            // Only show if search term is found in service name OR business name
            const matches =
              serviceName.includes(searchTerm) ||
              businessName.includes(searchTerm);

            return matches;
          })
          .slice(0, 8) // Max 8 suggestions
      : [];

  // Group suggestions by service name (same service from different businesses)
  const groupedSuggestions = suggestions.reduce(
    (acc, service) => {
      const existing = acc.find((item) => item.serviceName === service.name);
      if (existing) {
        existing.businesses.push({
          id: service.businessId,
          name: service.businessName,
        });
        existing.serviceIds.push(service.id);
      } else {
        acc.push({
          serviceName: service.name,
          category: service.category,
          businesses: [{ id: service.businessId, name: service.businessName }],
          serviceIds: [service.id],
          originalService: service,
        });
      }
      return acc;
    },
    [] as Array<{
      serviceName: string;
      category: string;
      businesses: Array<{ id: string; name: string }>;
      serviceIds: string[];
      originalService: ServiceSuggestion;
    }>
  );

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen && e.key !== 'Escape') {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < groupedSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < groupedSuggestions.length
        ) {
          handleSelect(groupedSuggestions[highlightedIndex].originalService);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelect = (service: ServiceSuggestion) => {
    onServiceSelect(service);
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => query && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow shadow-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown suggestions */}
      {isOpen && query && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {query.trim().length < 2 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          ) : groupedSuggestions.length > 0 ? (
            <ul className="max-h-80 overflow-y-auto">
              {groupedSuggestions.map((group, index) => (
                <li key={`${group.serviceName}-${index}`}>
                  <button
                    onClick={() => handleSelect(group.originalService)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                      highlightedIndex === index
                        ? 'bg-sky-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {group.serviceName}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {group.businesses.length === 1
                            ? group.businesses[0].name
                            : `${group.businesses.length} businesses offer this`}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md whitespace-nowrap">
                        {group.category.replace('_', ' ')}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">
                No services found for "{query}"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try: car wash, carpet cleaning, lawn mowing
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
