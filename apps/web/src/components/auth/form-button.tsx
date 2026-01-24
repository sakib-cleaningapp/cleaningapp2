import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const FormButton = forwardRef<HTMLButtonElement, FormButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
          'focus:outline-none focus:ring-4 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'transform active:scale-[0.98] disabled:active:scale-100',

          // Size variants
          {
            'px-3 py-2 text-sm': size === 'sm',
            'px-4 py-3 text-sm': size === 'md',
            'px-6 py-4 text-base': size === 'lg',
          },

          // Color variants
          {
            // Primary - Sky blue gradient
            'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/25':
              variant === 'primary',
            'hover:from-sky-600 hover:to-blue-700 hover:shadow-xl hover:shadow-sky-500/30':
              variant === 'primary' && !isDisabled,
            'focus:ring-sky-500/40': variant === 'primary',

            // Secondary - Light gray
            'bg-gray-100 text-gray-900 border border-gray-200':
              variant === 'secondary',
            'hover:bg-gray-200 hover:border-gray-300':
              variant === 'secondary' && !isDisabled,
            'focus:ring-gray-500/20': variant === 'secondary',

            // Outline - Sky blue border
            'bg-white text-sky-600 border border-sky-300 shadow-sm':
              variant === 'outline',
            'hover:bg-sky-50 hover:border-sky-400':
              variant === 'outline' && !isDisabled,
            'focus:ring-sky-500/30': variant === 'outline',

            // Ghost - Transparent
            'bg-transparent text-gray-600': variant === 'ghost',
            'hover:bg-gray-100 hover:text-gray-900':
              variant === 'ghost' && !isDisabled,
            'focus:ring-gray-500/20': variant === 'ghost',

            // Link - Text only
            'bg-transparent text-sky-600 underline-offset-4':
              variant === 'link',
            'hover:underline hover:text-sky-700':
              variant === 'link' && !isDisabled,
            'focus:ring-sky-500/20': variant === 'link',
          },

          // Full width
          fullWidth && 'w-full',

          className
        )}
        {...props}
      >
        {/* Loading spinner or left icon */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="flex-shrink-0">{leftIcon}</span>
        ) : null}

        {/* Button text */}
        <span className="flex-1">
          {isLoading && loadingText ? loadingText : children}
        </span>

        {/* Right icon (only when not loading) */}
        {!isLoading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

FormButton.displayName = 'FormButton';

// Convenience components
export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  Omit<FormButtonProps, 'variant'>
>((props, ref) => <FormButton ref={ref} variant="primary" {...props} />);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  Omit<FormButtonProps, 'variant'>
>((props, ref) => <FormButton ref={ref} variant="secondary" {...props} />);
SecondaryButton.displayName = 'SecondaryButton';

export const OutlineButton = forwardRef<
  HTMLButtonElement,
  Omit<FormButtonProps, 'variant'>
>((props, ref) => <FormButton ref={ref} variant="outline" {...props} />);
OutlineButton.displayName = 'OutlineButton';
