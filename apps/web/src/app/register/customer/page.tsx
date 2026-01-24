'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  User,
  MapPin,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AuthLayout } from '@/components/auth/auth-layout';
import { FormInput } from '@/components/auth/form-input';
import { FormButton } from '@/components/auth/form-button';
import { useAuth } from '@/contexts/auth-context';
import { validatePostcode, validateEmail, validatePassword } from '@/lib/auth';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    postcode: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { signUp, signInWithProvider, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Postcode validation
    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!validatePostcode(formData.postcode)) {
      newErrors.postcode =
        'Sorry, we only serve South Wales areas (CF, SA, NP, LD, etc.)';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms validation
    if (!formData.termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    return newErrors;
  };

  const handleGoogleSignIn = async () => {
    try {
      setMessage('');
      setMessageType('');

      const result = await signInWithProvider('google');

      if (result.success) {
        setMessage(result.message || 'Redirecting to Google...');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Failed to connect with Google');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setMessageType('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setMessage('');

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      postcode: formData.postcode,
    });

    if (result.success) {
      setRegistrationSuccess(true);
      setMessage(result.message || 'Account created successfully!');
      setMessageType('success');
    } else {
      setMessage(result.error || 'An error occurred during registration');
      setMessageType('error');
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Clear messages when user starts typing
    if (message) {
      setMessage('');
      setMessageType('');
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <AuthLayout title="Tap2Clean" subtitle="Loading...">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
        </div>
      </AuthLayout>
    );
  }

  if (registrationSuccess) {
    return (
      <AuthLayout
        title="Welcome to Tap2Clean!"
        subtitle="Your account has been created successfully"
        showBackToHome={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Account Created!
            </h3>
            <p className="text-gray-600">
              Welcome to Tap2Clean, {formData.fullName.split(' ')[0]}! Please
              check your email to verify your account.
            </p>
            {message && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                {message}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg"
            >
              Go to Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/"
              className="block text-sm text-sky-600 hover:text-sky-700 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Join Tap2Clean"
      subtitle="Create your account to access premium cleaning services in South Wales"
    >
      <div className="space-y-6">
        {/* Message Display */}
        {message && (
          <div
            className={`flex items-center space-x-2 p-3 rounded-lg ${
              messageType === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {messageType === 'success' ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            error={errors.fullName}
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="name"
            required
          />

          <FormInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
          />

          <FormInput
            label="Postcode"
            type="text"
            placeholder="Enter your postcode (e.g., CF10, SA1)"
            value={formData.postcode}
            onChange={(e) =>
              handleInputChange('postcode', e.target.value.toUpperCase())
            }
            error={errors.postcode}
            success={
              formData.postcode && validatePostcode(formData.postcode)
                ? 'Great! We serve your area.'
                : undefined
            }
            leftIcon={<MapPin className="h-4 w-4" />}
            hint="We currently serve South Wales areas"
            required
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="Create a secure password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            hint="At least 8 characters"
            autoComplete="new-password"
            required
          />

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange('confirmPassword', e.target.value)
            }
            error={errors.confirmPassword}
            success={
              formData.confirmPassword &&
              formData.password === formData.confirmPassword &&
              validatePassword(formData.password)
                ? 'Passwords match'
                : undefined
            }
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            autoComplete="new-password"
            required
          />

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                id="terms"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) =>
                  handleInputChange('termsAccepted', e.target.checked)
                }
                className="h-4 w-4 mt-0.5 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-700 leading-relaxed"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-sky-600 hover:text-sky-700 font-medium"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-sky-600 hover:text-sky-700 font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.terms && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.terms}</span>
              </div>
            )}
          </div>

          <FormButton
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            loadingText="Creating Account..."
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Create Account
          </FormButton>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-in */}
        <FormButton
          type="button"
          variant="outline"
          fullWidth
          onClick={handleGoogleSignIn}
          isLoading={isLoading}
          leftIcon={
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          }
        >
          Continue with Google
        </FormButton>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
          </span>
          <Link
            href="/login"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
