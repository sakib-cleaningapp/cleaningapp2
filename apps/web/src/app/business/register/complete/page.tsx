'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building2,
  FileText,
  Sparkles,
  AlertCircle,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { supabase } from '@/lib/supabase';

// Service selection with custom pricing
interface ServiceSelection {
  name: string;
  description: string;
  price: number;
  pricingType: 'fixed' | 'hourly';
}

interface BusinessRegistrationData {
  // Step 1: Business Type
  serviceCategory: string;
  businessType: string;

  // Step 2: Business Information
  businessName: string;
  businessDescription: string;
  establishedYear: string;
  teamSize: string;

  // Step 3: Contact Information
  ownerName: string;
  businessEmail: string;
  phone: string;
  businessAddress: string;

  // Step 4: Services - now stores full service objects with custom prices
  services: ServiceSelection[];
  insurance: boolean;

  // Terms
  agreeToTerms: boolean;
}

const STEPS = [
  { id: 1, title: 'Business Type', icon: Building2 },
  { id: 2, title: 'Business Info', icon: FileText },
  { id: 3, title: 'Contact Details', icon: Sparkles },
  { id: 4, title: 'Services', icon: CheckCircle },
];

const SERVICE_CATEGORIES = [
  {
    id: 'CLEANING',
    label: 'Home Cleaning',
    description: 'House, office, and commercial cleaning',
  },
  {
    id: 'CAR_DETAILING',
    label: 'Car Detailing',
    description: 'Vehicle cleaning and maintenance',
  },
  {
    id: 'PEST_CONTROL',
    label: 'Pest Control',
    description: 'Pest removal and prevention services',
  },
  {
    id: 'HANDYMAN',
    label: 'Handyman Services',
    description: 'Repairs, installations, and general maintenance',
  },
  {
    id: 'GARDENING',
    label: 'Gardening & Landscaping',
    description: 'Garden maintenance and landscaping services',
  },
];

const SERVICES_BY_CATEGORY: Record<
  string,
  Array<{ name: string; description: string; defaultPrice: number }>
> = {
  CLEANING: [
    {
      name: 'Standard Home Cleaning',
      description: 'Regular home cleaning service',
      defaultPrice: 50,
    },
    {
      name: 'Deep Cleaning',
      description: 'Thorough deep clean of your home',
      defaultPrice: 120,
    },
    {
      name: 'Move-in/Move-out Cleaning',
      description: 'Complete clean for moving',
      defaultPrice: 150,
    },
    {
      name: 'End of Tenancy',
      description: 'Professional end of tenancy clean',
      defaultPrice: 180,
    },
    {
      name: 'Oven Cleaning',
      description: 'Professional oven cleaning service',
      defaultPrice: 60,
    },
  ],
  CAR_DETAILING: [
    {
      name: 'Car Wash',
      description: 'Exterior car wash and dry',
      defaultPrice: 25,
    },
    {
      name: 'Full Valet',
      description: 'Complete interior and exterior valet',
      defaultPrice: 80,
    },
    {
      name: 'Interior Detailing',
      description: 'Deep clean of vehicle interior',
      defaultPrice: 60,
    },
    {
      name: 'Ceramic Coating',
      description: 'Professional ceramic paint protection',
      defaultPrice: 300,
    },
    {
      name: 'Paint Protection',
      description: 'Paint protection film application',
      defaultPrice: 200,
    },
  ],
  PEST_CONTROL: [
    {
      name: 'Rat Removal',
      description: 'Professional rat extermination',
      defaultPrice: 150,
    },
    {
      name: 'Ant Treatment',
      description: 'Ant infestation treatment',
      defaultPrice: 80,
    },
    {
      name: 'Wasp Nest Removal',
      description: 'Safe wasp nest removal',
      defaultPrice: 70,
    },
    {
      name: 'Bed Bug Treatment',
      description: 'Bed bug extermination service',
      defaultPrice: 200,
    },
    {
      name: 'Mouse Control',
      description: 'Mouse removal and prevention',
      defaultPrice: 120,
    },
  ],
  HANDYMAN: [
    {
      name: 'Furniture Assembly',
      description: 'Flat-pack furniture assembly',
      defaultPrice: 40,
    },
    {
      name: 'Door Hanging',
      description: 'Door installation and hanging',
      defaultPrice: 60,
    },
    {
      name: 'Shelf Installation',
      description: 'Shelf and bracket installation',
      defaultPrice: 35,
    },
    {
      name: 'TV Mounting',
      description: 'TV wall mounting service',
      defaultPrice: 50,
    },
    {
      name: 'General Repairs',
      description: 'General home repairs',
      defaultPrice: 45,
    },
  ],
  GARDENING: [
    {
      name: 'Lawn Mowing',
      description: 'Regular lawn mowing service',
      defaultPrice: 30,
    },
    {
      name: 'Hedge Trimming',
      description: 'Hedge cutting and shaping',
      defaultPrice: 50,
    },
    {
      name: 'Garden Design',
      description: 'Garden design consultation',
      defaultPrice: 100,
    },
    {
      name: 'Tree Pruning',
      description: 'Tree and shrub pruning',
      defaultPrice: 80,
    },
    {
      name: 'Lawn Treatment',
      description: 'Lawn feed and weed treatment',
      defaultPrice: 45,
    },
  ],
};

const BUSINESS_TYPES = [
  {
    id: 'SOLE_TRADER',
    label: 'Sole Trader',
    description: 'Individual service provider',
  },
  {
    id: 'LIMITED_COMPANY',
    label: 'Limited Company',
    description: 'Registered company',
  },
  {
    id: 'PARTNERSHIP',
    label: 'Partnership',
    description: 'Business partnership',
  },
  { id: 'FRANCHISE', label: 'Franchise', description: 'Franchise operation' },
];

export default function BusinessRegisterCompletePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(
    null
  );
  const [isSettingUpStripe, setIsSettingUpStripe] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  const [formData, setFormData] = useState<BusinessRegistrationData>({
    serviceCategory: '',
    businessType: '',
    businessName: '',
    businessDescription: '',
    establishedYear: '',
    teamSize: '',
    ownerName: '',
    businessEmail: '',
    phone: '',
    businessAddress: '',
    services: [],
    insurance: false,
    agreeToTerms: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/business/register');
    }
  }, [user, authLoading, router]);

  // Pre-fill from user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        ownerName: prev.ownerName || user.fullName || '',
        businessEmail: prev.businessEmail || user.email || '',
      }));
    }
  }, [user]);

  const updateFormData = (
    field: keyof BusinessRegistrationData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be signed in to complete registration');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Services already have custom prices from the form
      const servicesToCreate = formData.services.map((service) => ({
        name: service.name,
        description: service.description,
        price: service.price,
        pricingType: service.pricingType,
      }));

      const response = await fetch('/api/business/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          profileData: {
            email: formData.businessEmail,
            fullName: formData.ownerName,
          },
          businessData: {
            businessName: formData.businessName,
            bio: formData.businessDescription,
            serviceCategory: formData.serviceCategory,
          },
          services: servicesToCreate,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Business registration failed');
      }

      setCreatedBusinessId(result.business.id);
      setRegistrationSuccess(true);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStripeSetup = async () => {
    if (!createdBusinessId || !user) {
      setStripeError('Business ID not found. Please try signing in.');
      return;
    }

    setIsSettingUpStripe(true);
    setStripeError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Please sign in first to set up payments');
      }

      const createResponse = await fetch('/api/stripe-connect/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          businessId: createdBusinessId,
          businessEmail: formData.businessEmail,
          businessName: formData.businessName,
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok || !createData.accountId) {
        throw new Error(createData.error || 'Failed to create Stripe account');
      }

      const linkResponse = await fetch('/api/stripe-connect/onboarding-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountId: createData.accountId,
          returnUrl: `${window.location.origin}/business/dashboard?stripe_connect=complete`,
          refreshUrl: `${window.location.origin}/business/register/complete?stripe_refresh=true`,
        }),
      });

      const linkData = await linkResponse.json();

      if (!linkResponse.ok || !linkData.url) {
        throw new Error(linkData.error || 'Failed to get onboarding link');
      }

      window.location.href = linkData.url;
    } catch (err) {
      console.error('Stripe setup error:', err);
      setStripeError(
        err instanceof Error ? err.message : 'Failed to set up payments'
      );
      setIsSettingUpStripe(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.serviceCategory && formData.businessType;
      case 2:
        return (
          formData.businessName &&
          formData.businessDescription &&
          formData.establishedYear
        );
      case 3:
        return (
          formData.ownerName &&
          formData.businessEmail &&
          formData.phone &&
          formData.businessAddress
        );
      case 4:
        return formData.services.length > 0 && formData.agreeToTerms;
      default:
        return false;
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Success screen
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />
        <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Business Created!
              </h1>

              <p className="text-gray-600 mb-6">
                <span className="font-semibold">{formData.businessName}</span>{' '}
                has been registered. Now let's set up your payment account so
                you can receive earnings from bookings.
              </p>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border border-purple-100">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">
                    Set Up Payments
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your bank account through Stripe to receive automatic
                  payouts when customers book your services. You'll keep 85% of
                  each booking.
                </p>

                {stripeError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{stripeError}</p>
                  </div>
                )}

                <button
                  onClick={handleStripeSetup}
                  disabled={isSettingUpStripe}
                  className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSettingUpStripe ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5" />
                      Set Up Payment Account
                    </>
                  )}
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">1.</span>
                    <span>Complete Stripe verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">2.</span>
                    <span>Our team reviews your application</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">3.</span>
                    <span>
                      Start receiving bookings and get paid automatically!
                    </span>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Link
                  href="/business/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip for now (you can set up payments later)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BusinessTypeStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <BusinessInfoStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <ContactDetailsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <ServicesStep formData={formData} updateFormData={updateFormData} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Business Profile
            </h1>
            <p className="text-gray-600">
              Signed in as <span className="font-medium">{user?.email}</span>
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;

                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                            ? 'bg-sky-500 border-sky-500 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-16 h-0.5 mx-2 transition-colors ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {STEPS.length}:{' '}
                {STEPS[currentStep - 1]?.title}
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden max-w-2xl mx-auto">
            {error && (
              <div className="mx-8 mt-8 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">
                    Registration Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="p-8">{renderStep()}</div>

            {/* Navigation */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="text-sm text-gray-500">
                {currentStep} / {STEPS.length}
              </div>

              {currentStep === STEPS.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || isLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    isStepValid() && !isLoading
                      ? 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Business
                      <CheckCircle className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    isStepValid()
                      ? 'bg-gradient-to-r from-sky-500 to-blue-700 text-white hover:from-sky-600 hover:to-blue-800 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components
function BusinessTypeStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What type of business are you?
        </h2>
        <p className="text-gray-600">
          Select your service category and business structure
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Service Category
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFormData('serviceCategory', category.id)}
              className={`p-4 text-left rounded-xl border-2 transition-all ${
                formData.serviceCategory === category.id
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-gray-200 hover:border-sky-300'
              }`}
            >
              <div className="font-semibold text-gray-900">
                {category.label}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {category.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Business Structure
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => updateFormData('businessType', type.id)}
              className={`p-4 text-left rounded-xl border-2 transition-all ${
                formData.businessType === type.id
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-gray-200 hover:border-sky-300'
              }`}
            >
              <div className="font-semibold text-gray-900">{type.label}</div>
              <div className="text-sm text-gray-600 mt-1">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BusinessInfoStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Tell us about your business
        </h2>
        <p className="text-gray-600">Provide details about your company</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Name
          </label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => updateFormData('businessName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Enter your business name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Established Year
          </label>
          <input
            type="number"
            value={formData.establishedYear}
            onChange={(e) => updateFormData('establishedYear', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Business Description
        </label>
        <textarea
          value={formData.businessDescription}
          onChange={(e) =>
            updateFormData('businessDescription', e.target.value)
          }
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          placeholder="Describe your business and what makes you unique..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Team Size
        </label>
        <select
          value={formData.teamSize}
          onChange={(e) => updateFormData('teamSize', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="">Select team size</option>
          <option value="1">Just me</option>
          <option value="2-5">2-5 people</option>
          <option value="6-10">6-10 people</option>
          <option value="11-25">11-25 people</option>
          <option value="25+">25+ people</option>
        </select>
      </div>
    </div>
  );
}

function ContactDetailsStep({ formData, updateFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Contact Information
        </h2>
        <p className="text-gray-600">How can customers reach you?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Name
          </label>
          <input
            type="text"
            value={formData.ownerName}
            onChange={(e) => updateFormData('ownerName', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateFormData('phone', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="07123 456789"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Business Email
        </label>
        <input
          type="email"
          value={formData.businessEmail}
          onChange={(e) => updateFormData('businessEmail', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          placeholder="business@example.com"
        />
        <p className="text-xs text-gray-500 mt-1">
          This is where customers will contact you
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Business Address
        </label>
        <textarea
          value={formData.businessAddress}
          onChange={(e) => updateFormData('businessAddress', e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          placeholder="Your business address or main operating location"
        />
      </div>
    </div>
  );
}

function ServicesStep({ formData, updateFormData }: any) {
  const availableServices =
    SERVICES_BY_CATEGORY[formData.serviceCategory] || [];
  const categoryLabel =
    SERVICE_CATEGORIES.find((c) => c.id === formData.serviceCategory)?.label ||
    'Selected Category';

  // Check if a service is selected
  const isServiceSelected = (serviceName: string) => {
    return formData.services.some(
      (s: ServiceSelection) => s.name === serviceName
    );
  };

  // Get selected service data
  const getSelectedService = (
    serviceName: string
  ): ServiceSelection | undefined => {
    return formData.services.find(
      (s: ServiceSelection) => s.name === serviceName
    );
  };

  // Toggle service selection
  const toggleService = (
    serviceName: string,
    defaultPrice: number,
    description: string
  ) => {
    if (isServiceSelected(serviceName)) {
      // Remove service
      const services = formData.services.filter(
        (s: ServiceSelection) => s.name !== serviceName
      );
      updateFormData('services', services);
    } else {
      // Add service with default values
      const newService: ServiceSelection = {
        name: serviceName,
        description: description,
        price: defaultPrice,
        pricingType: 'fixed',
      };
      updateFormData('services', [...formData.services, newService]);
    }
  };

  // Update service price
  const updateServicePrice = (serviceName: string, price: number) => {
    const services = formData.services.map((s: ServiceSelection) =>
      s.name === serviceName ? { ...s, price } : s
    );
    updateFormData('services', services);
  };

  // Update service pricing type
  const updateServicePricingType = (
    serviceName: string,
    pricingType: 'fixed' | 'hourly'
  ) => {
    const services = formData.services.map((s: ServiceSelection) =>
      s.name === serviceName ? { ...s, pricingType } : s
    );
    updateFormData('services', services);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What services do you offer?
        </h2>
        <p className="text-gray-600">
          Select the {categoryLabel.toLowerCase()} services you provide and set
          your prices
        </p>
      </div>

      {availableServices.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Please go back and select a service category first.
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Available Services
          </label>
          <div className="grid grid-cols-1 gap-3">
            {availableServices.map((service) => {
              const selected = isServiceSelected(service.name);
              const selectedService = getSelectedService(service.name);

              return (
                <div
                  key={service.name}
                  className={`rounded-lg border-2 transition-all ${
                    selected
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-sky-300'
                  }`}
                >
                  {/* Service header - clickable to toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleService(
                        service.name,
                        service.defaultPrice,
                        service.description
                      )
                    }
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          selected
                            ? 'border-sky-500 bg-sky-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {selected && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">
                            {service.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            Suggested: £{service.defaultPrice}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Price configuration - shown when selected */}
                  {selected && selectedService && (
                    <div className="px-4 pb-4 pt-2 border-t border-sky-200 bg-white rounded-b-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Your Price (£)
                          </label>
                          <input
                            type="number"
                            value={selectedService.price}
                            onChange={(e) =>
                              updateServicePrice(
                                service.name,
                                Number(e.target.value)
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                            placeholder={`Suggested: £${service.defaultPrice}`}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Pricing Type
                          </label>
                          <select
                            value={selectedService.pricingType}
                            onChange={(e) =>
                              updateServicePricingType(
                                service.name,
                                e.target.value as 'fixed' | 'hourly'
                              )
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                          >
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly Rate</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {selectedService.pricingType === 'fixed'
                          ? 'This is a one-time price for the complete service'
                          : 'This is the price per hour of service'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.insurance}
            onChange={(e) => updateFormData('insurance', e.target.checked)}
            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
          />
          <span className="text-sm font-medium text-gray-700">
            I have business insurance and appropriate certifications
          </span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500 mt-1"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <Link
              href="/business/terms"
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              Business Partner Terms & Conditions
            </Link>{' '}
            and{' '}
            <Link
              href="/privacy"
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              Privacy Policy
            </Link>
          </span>
        </label>
      </div>
    </div>
  );
}
