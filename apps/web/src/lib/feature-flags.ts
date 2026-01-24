// Feature flags configuration
// This allows us to easily toggle features on/off without code changes

export interface FeatureFlags {
  // Booking features
  ENABLE_FREQUENCY_BOOKING: boolean;
  ENABLE_SUBSCRIPTION_BOOKING: boolean;
  ENABLE_BOOKING_ADDONS: boolean;

  // Service features
  ENABLE_SERVICE_COMPARISON: boolean;
  ENABLE_SERVICE_FAVORITES: boolean;
  ENABLE_SERVICE_REVIEWS: boolean;

  // Business features
  ENABLE_BUSINESS_DASHBOARD: boolean;
  ENABLE_BUSINESS_ANALYTICS: boolean;
  ENABLE_BUSINESS_MESSAGING: boolean;

  // Payment features
  ENABLE_ONLINE_PAYMENTS: boolean;
  ENABLE_PAYMENT_PLANS: boolean;

  // Advanced features
  ENABLE_AI_RECOMMENDATIONS: boolean;
  ENABLE_MAP_INTEGRATION: boolean;
  ENABLE_REAL_TIME_CHAT: boolean;
}

// Default feature flag values
const DEFAULT_FLAGS: FeatureFlags = {
  // Booking features
  ENABLE_FREQUENCY_BOOKING: false, // Currently disabled per user request
  ENABLE_SUBSCRIPTION_BOOKING: false,
  ENABLE_BOOKING_ADDONS: false,

  // Service features
  ENABLE_SERVICE_COMPARISON: true,
  ENABLE_SERVICE_FAVORITES: true,
  ENABLE_SERVICE_REVIEWS: false,

  // Business features
  ENABLE_BUSINESS_DASHBOARD: false, // Will enable when Story 4 is complete
  ENABLE_BUSINESS_ANALYTICS: false,
  ENABLE_BUSINESS_MESSAGING: false,

  // Payment features
  ENABLE_ONLINE_PAYMENTS: false,
  ENABLE_PAYMENT_PLANS: false,

  // Advanced features
  ENABLE_AI_RECOMMENDATIONS: false,
  ENABLE_MAP_INTEGRATION: false,
  ENABLE_REAL_TIME_CHAT: false,
};

// Environment-based overrides
const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  // In development, we might want to enable more features
  if (process.env.NODE_ENV === 'development') {
    return {
      ENABLE_BUSINESS_DASHBOARD: true, // Enable for Story 4 development
      ENABLE_SERVICE_REVIEWS: true,
    };
  }

  // Production overrides can be set via environment variables
  return {
    ENABLE_FREQUENCY_BOOKING:
      process.env.NEXT_PUBLIC_ENABLE_FREQUENCY_BOOKING === 'true',
    ENABLE_BUSINESS_DASHBOARD:
      process.env.NEXT_PUBLIC_ENABLE_BUSINESS_DASHBOARD === 'true',
    ENABLE_ONLINE_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  };
};

// Combine default flags with environment overrides
export const featureFlags: FeatureFlags = {
  ...DEFAULT_FLAGS,
  ...getEnvironmentFlags(),
};

// Helper hook for using feature flags in components
export const useFeatureFlag = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (flag: keyof FeatureFlags): boolean => {
  return featureFlags[flag];
};

// Development helper to toggle flags (only in dev mode)
export const toggleFeatureFlag = (
  flag: keyof FeatureFlags,
  enabled?: boolean
) => {
  if (process.env.NODE_ENV === 'development') {
    (featureFlags as any)[flag] = enabled ?? !featureFlags[flag];
    console.log(
      `Feature flag ${flag} is now ${featureFlags[flag] ? 'enabled' : 'disabled'}`
    );
  }
};

// Log current feature flags (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 Feature Flags:', featureFlags);
}
