import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  message: string | null;
}

export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    message: null,
  });

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Error occurred:', error);

    let message = customMessage || 'An unexpected error occurred';
    let errorObj: Error;

    if (error instanceof Error) {
      errorObj = error;
      if (!customMessage) {
        message = error.message;
      }
    } else if (typeof error === 'string') {
      errorObj = new Error(error);
      if (!customMessage) {
        message = error;
      }
    } else {
      errorObj = new Error('Unknown error');
    }

    setErrorState({
      error: errorObj,
      isError: true,
      message,
    });

    toast.error(message, {
      duration: 5000,
      action: {
        label: 'Dismiss',
        onClick: () => clearError(),
      },
    });

    return errorObj;
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      message: null,
    });
  }, []);

  const tryAsync = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      customMessage?: string
    ): Promise<T | null> => {
      try {
        return await asyncFn();
      } catch (error) {
        handleError(error, customMessage);
        return null;
      }
    },
    [handleError]
  );

  return {
    ...errorState,
    handleError,
    clearError,
    tryAsync,
  };
}