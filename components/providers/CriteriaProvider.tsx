'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useError } from '@/components/providers/ErrorProvider';
import { useUserContext } from '@/components/providers/AuthProvider';
import { parseErrorDetail } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface GlobalCriteria {
  id: string;
  code: string;
  goal: string;
  rationale: string;
  rank: number;
  is_optional: boolean;
}

interface CriteriaContextType {
  criteria: GlobalCriteria[] | null;
  isLoading: boolean;
  hasLoaded: boolean;
  refetch: () => Promise<void>;
}

const CriteriaContext = createContext<CriteriaContextType | undefined>(undefined);

export default function CriteriaProvider({ children }: { children: ReactNode }) {
  const { setError } = useError();
  const { isAuthenticated } = useUserContext();
  const [criteria, setCriteria] = useState<GlobalCriteria[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchCriteria = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/criteria`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = parseErrorDetail(body, `Failed to load criteria (${response.status})`);
        setError(response.status, message);
        setCriteria(null);
        return;
      }

      const data: GlobalCriteria[] = await response.json();
      data.sort((a, b) => a.rank - b.rank);
      setCriteria(data);
      setHasLoaded(true);
    } catch {
      setError(0, 'Unable to reach the server. Please check your connection.');
      setCriteria(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, setError]);

  // Load once when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && !hasLoaded && !isLoading) {
      fetchCriteria();
    }
  }, [isAuthenticated, hasLoaded, isLoading, fetchCriteria]);

  // Clear when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCriteria(null);
      setHasLoaded(false);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const value: CriteriaContextType = {
    criteria,
    isLoading,
    hasLoaded,
    refetch: fetchCriteria,
  };

  return (
    <CriteriaContext.Provider value={value}>
      {children}
    </CriteriaContext.Provider>
  );
}

export function useCriteria() {
  const ctx = useContext(CriteriaContext);
  if (!ctx) {
    throw new Error('useCriteria must be used within a CriteriaProvider');
  }
  return ctx;
}