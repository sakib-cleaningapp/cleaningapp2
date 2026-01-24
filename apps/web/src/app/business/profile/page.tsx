'use client';

import { useState } from 'react';
import {
  Building2,
  Upload,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  Camera,
  Save,
  ArrowLeft,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { BusinessAuthWrapper } from '@/components/business/business-auth-wrapper';
import Link from 'next/link';

// Mock business profile data
const mockBusinessProfile = {
  companyName: 'Sparkle Clean Cardiff',
  businessType: 'Limited Company',
  description:
    'Professional cleaning services with over 6 years of experience serving Cardiff and surrounding areas. We pride ourselves on attention to detail and customer satisfaction.',
  established: '2018',
  teamSize: '5-10',
  website: 'https://sparkleCleanCardiff.com',
  phone: '029 2034 5678',
  email: 'info@sparkleCleanCardiff.com',
  address: '123 Cardiff Business Park, Cardiff, CF10 4AA',
  serviceAreas: ['Cardiff', 'Penarth', 'Barry', 'Pontypridd'],
  certifications: ['Fully Insured', 'DBS Checked', 'ISO 9001'],
  specializations: [
    'Residential Cleaning',
    'Office Cleaning',
    'End of Tenancy',
    'Deep Cleaning',
  ],
  operatingHours: {
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '', close: '', closed: true },
  },
  logo: null,
  photos: [],
};

const businessTypes = [
  'Sole Trader',
  'Partnership',
  'Limited Company',
  'Limited Liability Partnership',
  'Other',
];

const teamSizes = [
  'Just me',
  '2-4 people',
  '5-10 people',
  '11-25 people',
  '26-50 people',
  '50+ people',
];

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function BusinessProfilePage() {
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState(mockBusinessProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [newServiceArea, setNewServiceArea] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Saving business profile:', profile);
      alert('Business profile updated successfully!');
    } catch (error) {
      alert('Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: string, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addServiceArea = () => {
    if (
      newServiceArea.trim() &&
      !profile.serviceAreas.includes(newServiceArea.trim())
    ) {
      updateProfile('serviceAreas', [
        ...profile.serviceAreas,
        newServiceArea.trim(),
      ]);
      setNewServiceArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    updateProfile(
      'serviceAreas',
      profile.serviceAreas.filter((a) => a !== area)
    );
  };

  const addSpecialization = () => {
    if (
      newSpecialization.trim() &&
      !profile.specializations.includes(newSpecialization.trim())
    ) {
      updateProfile('specializations', [
        ...profile.specializations,
        newSpecialization.trim(),
      ]);
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    updateProfile(
      'specializations',
      profile.specializations.filter((s) => s !== spec)
    );
  };

  const updateOperatingHours = (
    day: string,
    field: string,
    value: string | boolean
  ) => {
    updateProfile('operatingHours', {
      ...profile.operatingHours,
      [day]: {
        ...profile.operatingHours[day as keyof typeof profile.operatingHours],
        [field]: value,
      },
    });
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'contact', label: 'Contact & Location', icon: MapPin },
    { id: 'hours', label: 'Operating Hours', icon: Calendar },
    { id: 'branding', label: 'Branding & Media', icon: Camera },
  ];

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
                    Business Profile
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage your business information and branding
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-sky-100 text-sky-700 border border-sky-200'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {/* Basic Info Tab */}
                {activeTab === 'basic' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Basic Information
                      </h2>
                      <p className="text-gray-600">
                        Tell customers about your business and what makes you
                        special.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            value={profile.companyName}
                            onChange={(e) =>
                              updateProfile('companyName', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Your Business Name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Business Type
                          </label>
                          <select
                            value={profile.businessType}
                            onChange={(e) =>
                              updateProfile('businessType', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          >
                            {businessTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Established
                          </label>
                          <input
                            type="text"
                            value={profile.established}
                            onChange={(e) =>
                              updateProfile('established', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="2018"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Team Size
                          </label>
                          <select
                            value={profile.teamSize}
                            onChange={(e) =>
                              updateProfile('teamSize', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          >
                            {teamSizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Business Description *
                        </label>
                        <textarea
                          value={profile.description}
                          onChange={(e) =>
                            updateProfile('description', e.target.value)
                          }
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder="Tell customers about your business, experience, and what makes you special..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {profile.description.length}/500 characters
                        </p>
                      </div>

                      {/* Service Areas */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Areas
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profile.serviceAreas.map((area) => (
                            <span
                              key={area}
                              className="inline-flex items-center gap-1 bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm"
                            >
                              {area}
                              <button
                                onClick={() => removeServiceArea(area)}
                                className="hover:text-sky-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newServiceArea}
                            onChange={(e) => setNewServiceArea(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === 'Enter' && addServiceArea()
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Add service area (e.g., Cardiff, Penarth)"
                          />
                          <button
                            onClick={addServiceArea}
                            className="px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Specializations */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specializations
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profile.specializations.map((spec) => (
                            <span
                              key={spec}
                              className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                            >
                              {spec}
                              <button
                                onClick={() => removeSpecialization(spec)}
                                className="hover:text-green-900"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newSpecialization}
                            onChange={(e) =>
                              setNewSpecialization(e.target.value)
                            }
                            onKeyPress={(e) =>
                              e.key === 'Enter' && addSpecialization()
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Add specialization (e.g., Deep Cleaning, Office Cleaning)"
                          />
                          <button
                            onClick={addSpecialization}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Contact & Location Tab */}
                {activeTab === 'contact' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Contact & Location
                      </h2>
                      <p className="text-gray-600">
                        How customers can reach you and find your business.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Mail className="inline h-4 w-4 mr-1" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                              updateProfile('email', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="business@example.com"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="inline h-4 w-4 mr-1" />
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) =>
                              updateProfile('phone', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="029 2034 5678"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Globe className="inline h-4 w-4 mr-1" />
                            Website (Optional)
                          </label>
                          <input
                            type="url"
                            value={profile.website}
                            onChange={(e) =>
                              updateProfile('website', e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="https://yourbusiness.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          Business Address
                        </label>
                        <textarea
                          value={profile.address}
                          onChange={(e) =>
                            updateProfile('address', e.target.value)
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                          placeholder="123 Business Street, City, Postcode"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This will be shown to customers when they book your
                          services
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Operating Hours Tab */}
                {activeTab === 'hours' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Operating Hours
                      </h2>
                      <p className="text-gray-600">
                        Set your availability so customers know when you're
                        working.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {daysOfWeek.map((day) => {
                        const dayHours =
                          profile.operatingHours[
                            day.key as keyof typeof profile.operatingHours
                          ];
                        return (
                          <div
                            key={day.key}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="w-24 font-medium text-gray-700">
                              {day.label}
                            </div>

                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!dayHours.closed}
                                onChange={(e) =>
                                  updateOperatingHours(
                                    day.key,
                                    'closed',
                                    !e.target.checked
                                  )
                                }
                                className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-600">
                                Open
                              </span>
                            </label>

                            {!dayHours.closed && (
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-gray-600">
                                    From:
                                  </label>
                                  <input
                                    type="time"
                                    value={dayHours.open}
                                    onChange={(e) =>
                                      updateOperatingHours(
                                        day.key,
                                        'open',
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-gray-600">
                                    To:
                                  </label>
                                  <input
                                    type="time"
                                    value={dayHours.close}
                                    onChange={(e) =>
                                      updateOperatingHours(
                                        day.key,
                                        'close',
                                        e.target.value
                                      )
                                    }
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                                  />
                                </div>
                              </div>
                            )}

                            {dayHours.closed && (
                              <div className="flex-1 text-sm text-gray-500 italic">
                                Closed
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Branding & Media Tab */}
                {activeTab === 'branding' && (
                  <div className="p-8">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Branding & Media
                      </h2>
                      <p className="text-gray-600">
                        Showcase your work and build trust with photos and
                        branding.
                      </p>
                    </div>

                    <div className="space-y-8">
                      {/* Logo Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Business Logo
                        </label>
                        <div className="flex items-center gap-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-sky-100 to-blue-200 rounded-xl flex items-center justify-center border-2 border-sky-200">
                            <Building2 className="h-8 w-8 text-sky-600" />
                          </div>
                          <div>
                            <button className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-sky-500 hover:bg-sky-50 transition-colors">
                              <Upload className="h-4 w-4" />
                              Upload Logo
                            </button>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG up to 2MB. Recommended: 300x300px
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Photo Gallery */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Work Gallery
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div
                              key={i}
                              className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-sky-500 hover:bg-sky-50 transition-colors cursor-pointer"
                            >
                              <div className="text-center">
                                <Camera className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">
                                  Add Photo
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Show before/after photos, your team at work, or
                          completed projects. Up to 12 photos.
                        </p>
                      </div>

                      {/* Certifications */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Certifications & Credentials
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {profile.certifications.map((cert, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-green-50"
                            >
                              <Award className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                {cert}
                              </span>
                              <Check className="h-4 w-4 text-green-600 ml-auto" />
                            </div>
                          ))}
                        </div>
                        <button className="mt-4 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
                          <Plus className="h-4 w-4" />
                          Add Certification
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </BusinessAuthWrapper>
  );
}
