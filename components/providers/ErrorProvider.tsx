'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AppError {
  statusCode: number;
  message: string;
}

interface ErrorContextType {
  error: AppError | null;
  setError: (statusCode: number, message: string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export default function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback((statusCode: number, message: string) => {
    setErrorState({ statusCode, message });
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, setError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}