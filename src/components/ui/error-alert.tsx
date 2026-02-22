import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ErrorAlertProps {
  type?: 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  className?: string;
}

const alertStyles = {
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-800 dark:text-red-300',
    message: 'text-red-700 dark:text-red-400',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    title: 'text-yellow-800 dark:text-yellow-300',
    message: 'text-yellow-700 dark:text-yellow-400',
  },
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-300',
    message: 'text-blue-700 dark:text-blue-400',
  },
};

const alertIcons = {
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export function ErrorAlert({
  type = 'error',
  title,
  message,
  className,
}: ErrorAlertProps) {
  const styles = alertStyles[type];
  const Icon = alertIcons[type];

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg border',
        styles.container,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1">
        {title && (
          <h3 className={cn('font-medium mb-1', styles.title)}>{title}</h3>
        )}
        <p className={cn('text-sm', styles.message)}>{message}</p>
      </div>
    </div>
  );
}