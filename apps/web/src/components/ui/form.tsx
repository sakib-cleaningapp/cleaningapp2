import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    return <form className={cn('space-y-4', className)} ref={ref} {...props} />;
  }
);
Form.displayName = 'Form';

// Form field wrapper
export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, ...props }, ref) => {
    return <div className={cn('space-y-2', className)} ref={ref} {...props} />;
  }
);
FormField.displayName = 'FormField';

// Form message for errors/descriptions
export interface FormMessageProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: 'default' | 'destructive';
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <p
        className={cn(
          'text-sm',
          variant === 'destructive' && 'text-destructive',
          variant === 'default' && 'text-muted-foreground',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FormMessage.displayName = 'FormMessage';

export { Form, FormField, FormMessage };
