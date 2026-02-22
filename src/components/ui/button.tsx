import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-reddit-orange disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-reddit-orange text-white shadow hover:bg-orange-600': variant === 'default',
            'bg-red-500 text-white shadow-sm hover:bg-red-600': variant === 'destructive',
            'border border-reddit-gray-300 dark:border-reddit-gray-600 bg-transparent shadow-sm hover:bg-reddit-gray-100 dark:hover:bg-reddit-gray-800':
              variant === 'outline',
            'bg-reddit-blue text-white shadow-sm hover:bg-blue-600': variant === 'secondary',
            'hover:bg-reddit-gray-100 dark:hover:bg-reddit-gray-800': variant === 'ghost',
            'text-reddit-blue underline-offset-4 hover:underline': variant === 'link',
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };