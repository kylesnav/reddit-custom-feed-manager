import { cn } from '@/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

export function LoadingSpinner({ 
  size = 'md', 
  className,
  label = 'Loading...'
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <div
        className={cn(
          'animate-spin rounded-full border-t-reddit-orange border-r-reddit-orange border-b-transparent border-l-transparent',
          sizeClasses[size],
          className
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      {label && size !== 'sm' && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
}

export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-reddit-gray-100 to-reddit-gray-200 dark:from-reddit-gray-900 dark:to-reddit-gray-800">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}

export function InlineLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoadingSpinner size="sm" />
      <span className="text-gray-600 dark:text-gray-400">{text}</span>
    </span>
  );
}