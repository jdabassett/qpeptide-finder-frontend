'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useError } from '@/components/providers/ErrorProvider';
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
  const [criteria, setCriteria] = useState<GlobalCriteria[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchCriteria = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/v1/criteria`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!mountedRef.current) return;

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = parseErrorDetail(body, `Failed to load criteria (${response.status})`);
        setError(response.status, message);
        setCriteria(null);
        return;
      }

      const data: GlobalCriteria[] = await response.json();
      data.sort((a, b) => a.rank - b.rank);

      if (!mountedRef.current) return;
      setCriteria(data);
      setHasLoaded(true);
    } catch {
      if (!mountedRef.current) return;
      setError(0, 'Unable to reach the server. Please check your connection.');
      setCriteria(null);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [setError]);

  // Load once on mount when not yet loaded (no auth required).
  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      fetchCriteria();
    }
  }, [hasLoaded, isLoading, fetchCriteria]);

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