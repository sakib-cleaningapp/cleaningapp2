'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Search,
  ArrowLeft,
  Save,
  X,
  Check,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { BusinessAuthWrapper } from '@/components/business/business-auth-wrapper';
import Link from 'next/link';
import { supabase } from '@/lib/auth';

const PRICING_TYPES = [
  {
    id: 'fixed',
    name: 'Fixed Price',
    description: 'One set price for the service',
  },
  { id: 'hourly', name: 'Hourly Rate', description: 'Price per hour of work' },
  {
    id: 'quote',
    name: 'Custom Quote',
    description: 'Price varies, customers request quotes',
  },
];

// Database service structure
interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string;
  pricingType: 'fixed' | 'hourly' | 'quote';
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Form state for creating/editing services
interface ServiceFormData {
  name: string;
  description: string;
  pricingType: 'fixed' | 'hourly' | 'quote';
  price: number;
  isActive: boolean;
}

// Fetch business ID from database based on authenticated user
async function fetchBusinessIdFromAuth(): Promise<string | null> {
  try {
    // Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return null;
    }

    // Get profile for this user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile error:', profileError);
      return null;
    }

    // Get business owned by this profile
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', profile.id)
      .single();

    if (businessError || !business) {
      console.error('Business error:', businessError);
      return null;
    }

    return business.id;
  } catch (error) {
    console.error('Error fetching business ID:', error);
    return null;
  }
}

export default function BusinessServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    pricingType: 'fixed',
    price: 0,
    isActive: true,
  });

  // Get business ID on mount from authenticated user + database
  useEffect(() => {
    const loadBusinessId = async () => {
      const id = await fetchBusinessIdFromAuth();
      if (id) {
        setBusinessId(id);
      } else {
        setError('Could not find your business. Please try logging in again.');
        setIsLoading(false);
      }
    };
    loadBusinessId();
  }, []);

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    if (!businessId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/business/services?businessId=${businessId}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch services');
      }

      setServices(data.services || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err instanceof Error ? err.message : 'Failed to load services');
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  // Fetch services when businessId is available
  useEffect(() => {
    if (businessId) {
      fetchServices();
    }
  }, [businessId, fetchServices]);

  // Filter services based on search and status
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && service.isActive) ||
      (filterStatus === 'inactive' && !service.isActive);

    return matchesSearch && matchesStatus;
  });

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricingType: 'fixed',
      price: 0,
      isActive: true,
    });
  };

  // Handle opening edit mode
  const handleEditService = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      pricingType: service.pricingType,
      price: service.price || 0,
      isActive: service.isActive,
    });
    setEditingService(service);
    setIsAddingService(true);
  };

  // Handle saving (create or update)
  const handleSaveService = async () => {
    if (!businessId) {
      setError('Business ID not found');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingService) {
        // Update existing service
        const response = await fetch(
          `/api/business/services/${editingService.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              pricingType: formData.pricingType,
              price: formData.pricingType === 'quote' ? null : formData.price,
              isActive: formData.isActive,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update service');
        }

        // Update local state
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? data.service : s))
        );
      } else {
        // Create new service
        const response = await fetch('/api/business/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId,
            name: formData.name,
            description: formData.description,
            pricingType: formData.pricingType,
            price: formData.pricingType === 'quote' ? null : formData.price,
            isActive: formData.isActive,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create service');
        }

        // Add to local state
        setServices((prev) => [data.service, ...prev]);
      }

      // Close form
      setIsAddingService(false);
      setEditingService(null);
      resetForm();
    } catch (err) {
      console.error('Error saving service:', err);
      setError(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle deleting a service
  const handleDeleteService = async (serviceId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this service? This action cannot be undone.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/business/services/${serviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete service');
      }

      // Remove from local state
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (err) {
      console.error('Error deleting service:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  // Handle toggling service active status
  const toggleServiceStatus = async (service: Service) => {
    try {
      const response = await fetch(`/api/business/services/${service.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !service.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update service status');
      }

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? data.service : s))
      );
    } catch (err) {
      console.error('Error toggling service status:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to update service status'
      );
    }
  };

  // Format price for display
  const formatPrice = (service: Service) => {
    if (service.pricingType === 'quote') return 'Quote Required';
    if (service.price === null) return 'Not set';
    if (service.pricingType === 'hourly') return `£${service.price}/hr`;
    return `£${service.price}`;
  };

  return (
    <BusinessAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Link
                  href="/business/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-medium">Back to Dashboard</span>
                </Link>
                <div className="border-l border-gray-300 pl-4">
                  <h1 className="text-xl font-bold text-gray-900">
                    Service Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your service offerings and pricing
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  resetForm();
                  setEditingService(null);
                  setIsAddingService(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New Service
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!isAddingService ? (
            <>
              {/* Filters and Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search services..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-4" />
                  <p className="text-gray-600">Loading services...</p>
                </div>
              ) : filteredServices.length === 0 ? (
                /* Empty State */
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {services.length === 0
                      ? 'No services yet'
                      : 'No services found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {services.length === 0
                      ? 'Create your first service to start accepting bookings.'
                      : 'Try adjusting your search or filters.'}
                  </p>
                  {services.length === 0 && (
                    <button
                      onClick={() => {
                        resetForm();
                        setEditingService(null);
                        setIsAddingService(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-700 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-800 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Service
                    </button>
                  )}
                </div>
              ) : (
                /* Services Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${
                        !service.isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-1">
                            {service.name}
                          </h3>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              service.pricingType === 'fixed'
                                ? 'bg-green-100 text-green-700'
                                : service.pricingType === 'hourly'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {PRICING_TYPES.find(
                              (p) => p.id === service.pricingType
                            )?.name || service.pricingType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleServiceStatus(service)}
                            className={`p-1 rounded ${service.isActive ? 'text-green-600' : 'text-gray-400'}`}
                            title={
                              service.isActive
                                ? 'Service is active - click to deactivate'
                                : 'Service is inactive - click to activate'
                            }
                          >
                            {service.isActive ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {service.description || 'No description provided'}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(service)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <span
                            className={`font-medium ${service.isActive ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="flex items-center justify-center py-2 px-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Add/Edit Service Form */
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <p className="text-gray-600">
                      Configure your service details and pricing
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddingService(false);
                      setEditingService(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="e.g., Regular House Cleaning"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Describe what's included in this service..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pricing Type *
                    </label>
                    <select
                      value={formData.pricingType}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pricingType: e.target.value as
                            | 'fixed'
                            | 'hourly'
                            | 'quote',
                        }))
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    >
                      {PRICING_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      {
                        PRICING_TYPES.find((p) => p.id === formData.pricingType)
                          ?.description
                      }
                    </p>
                  </div>

                  {formData.pricingType !== 'quote' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {formData.pricingType === 'hourly'
                          ? 'Hourly Rate (GBP) *'
                          : 'Price (GBP) *'}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                          £
                        </span>
                        <input
                          type="number"
                          value={formData.price || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              price: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder={
                            formData.pricingType === 'hourly' ? '25' : '50'
                          }
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      Service is active and bookable
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setIsAddingService(false);
                    setEditingService(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveService}
                  disabled={
                    isSaving ||
                    !formData.name ||
                    !formData.description ||
                    (formData.pricingType !== 'quote' && formData.price <= 0)
                  }
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    isSaving ||
                    !formData.name ||
                    !formData.description ||
                    (formData.pricingType !== 'quote' && formData.price <= 0)
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800'
                  }`}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      {editingService ? 'Update Service' : 'Create Service'}
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BusinessAuthWrapper>
  );
}
