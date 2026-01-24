import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  showPasswordToggle?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      type = 'text',
      isLoading = false,
      leftIcon,
      rightIcon,
      showPasswordToggle = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const isDisabled = disabled || isLoading;

    return (
      <div className="space-y-2">
        {/* Label */}
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            disabled={isDisabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              // Base styles
              'w-full px-4 py-3 rounded-lg border text-sm transition-all duration-200',
              'placeholder:text-gray-400 focus:outline-none',

              // Left padding when icon present
              leftIcon && 'pl-10',

              // Right padding for icons/toggles
              (rightIcon ||
                showPasswordToggle ||
                isLoading ||
                hasError ||
                hasSuccess) &&
                'pr-10',

              // Default state
              'border-gray-200 bg-white text-gray-900',
              'hover:border-gray-300',

              // Focus state
              isFocused &&
                !hasError &&
                !isDisabled && [
                  'border-sky-500 ring-4 ring-sky-500/10',
                  'shadow-sm',
                ],

              // Success state
              hasSuccess && [
                'border-green-500 bg-green-50/50',
                isFocused && 'ring-4 ring-green-500/10',
              ],

              // Error state
              hasError && [
                'border-red-500 bg-red-50/50',
                isFocused && 'ring-4 ring-red-500/10',
              ],

              // Disabled state
              isDisabled && [
                'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed',
                'placeholder:text-gray-300',
              ],

              className
            )}
            {...props}
          />

          {/* Right Side Icons */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {/* Loading Spinner */}
            {isLoading && (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            )}

            {/* Success Icon */}
            {hasSuccess && !isLoading && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}

            {/* Error Icon */}
            {hasError && !isLoading && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}

            {/* Password Toggle */}
            {showPasswordToggle && type === 'password' && !isLoading && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Custom Right Icon */}
            {rightIcon && !isLoading && !hasError && !hasSuccess && (
              <div className="text-gray-400">{rightIcon}</div>
            )}
          </div>
        </div>

        {/* Help Text / Error / Success Messages */}
        <div className="min-h-[1.25rem]">
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {error}
            </p>
          )}

          {success && !error && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3 flex-shrink-0" />
              {success}
            </p>
          )}

          {hint && !error && !success && (
            <p className="text-sm text-gray-500">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
