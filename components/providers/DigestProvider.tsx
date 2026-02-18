'use client';

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useError } from '@/components/providers/ErrorProvider';
import { useUserContext } from '@/components/providers/AuthProvider';
import { parseErrorDetail } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/* ── Constants ── */
const FAST_POLL_MS = 1_000;
const SLOW_POLL_MS = 5_000;
const FAST_PHASE_MS = 10_000;
const POLL_TIMEOUT_MS = 5 * 60_000;
const PEPTIDE_FETCH_TIMEOUT_MS = 30_000;
const DIGEST_STATE_KEY = 'qpeptide-digest-state';

/* ── Types mirroring backend schemas ── */

export interface DigestResponse {
  id: string;
  status: string;
  user_id: string;
  protease: string;
  protein_name: string | null;
  sequence: string;
  created_at: string;
  updated_at: string;
}

export interface CriteriaResponse {
  code: string;
  goal: string;
  rationale: string;
  rank: number;
}

export interface PeptideResponse {
  id: string;
  sequence: string;
  position: number;
  pi: number | null;
  charge_state: number | null;
  max_kd_score: number | null;
  rank: number;
  criteria_ranks: number[];
}

export interface DigestPeptidesResponse {
  digest_id: string;
  peptides: PeptideResponse[];
  criteria: CriteriaResponse[];
}

/* ── Reducer ── */

export type DigestStatus = 'idle' | 'loading' | 'polling' | 'fetching' | 'completed';

interface DigestState {
  status: DigestStatus;
  digestId: string | null;
  digestResponse: DigestResponse | null;
  peptidesResponse: DigestPeptidesResponse | null;
}

type DigestAction =
  | { type: 'SUBMIT_START' }
  | { type: 'POLL_START'; digestId: string }
  | { type: 'FETCH_PEPTIDES_START'; digestResponse: DigestResponse }
  | { type: 'COMPLETED'; peptidesResponse: DigestPeptidesResponse }
  | { type: 'FAILED' }
  | { type: 'RESET' };

const initialState: DigestState = {
  status: 'idle',
  digestId: null,
  digestResponse: null,
  peptidesResponse: null,
};

function digestReducer(state: DigestState, action: DigestAction): DigestState {
  switch (action.type) {
    case 'SUBMIT_START':
      return { ...initialState, status: 'loading' };
    case 'POLL_START':
      return { ...initialState, status: 'polling', digestId: action.digestId };
    case 'FETCH_PEPTIDES_START':
      return { ...state, status: 'fetching', digestResponse: action.digestResponse };
    case 'COMPLETED':
      return { ...state, status: 'completed', peptidesResponse: action.peptidesResponse };
    case 'FAILED':
      return initialState;
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

/* ── Context ── */

interface DigestContextType {
  status: DigestStatus;
  digestId: string | null;
  digestResponse: DigestResponse | null;
  peptidesResponse: DigestPeptidesResponse | null;
  submitDigest: (params: { proteinName: string; sequence: string }) => Promise<void>;
  reset: () => void;
}

const DigestContext = createContext<DigestContextType | undefined>(undefined);

/* ── Provider ── */

export default function DigestProvider({ children }: { children: ReactNode }) {
  const { setError } = useError();
  const { user } = useUserContext();
  const [state, dispatch] = useReducer(digestReducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const digestIdRef = useRef<string | null>(null);

  // Ref so polling closures always read the latest user ID without
  // forcing startPolling to re-create when the user object changes.
  const userIdRef = useRef<string | null | undefined>(user?.id);
  useEffect(() => { userIdRef.current = user?.id; }, [user?.id]);

  /* ── Persist to localStorage ── */

  useEffect(() => {
    if (!hydrated) return;
    if (state.status === 'idle' && !state.digestId) {
      try { localStorage.removeItem(DIGEST_STATE_KEY); } catch {}
      return;
    }
    try {
      localStorage.setItem(DIGEST_STATE_KEY, JSON.stringify({
        digestId: state.digestId,
        status: state.status,
      }));
    } catch {}
  }, [state.status, state.digestId, hydrated]);

  /* ── Cleanup timers ── */

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  /* ── Fetch peptides after digest completes ── */

  const fetchPeptides = useCallback(
    async (userId: string, digestId: string, digestResponse: DigestResponse) => {
      dispatch({ type: 'FETCH_PEPTIDES_START', digestResponse });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), PEPTIDE_FETCH_TIMEOUT_MS);

      try {
        const response = await fetch(
          `${API_URL}/v1/digest/${userId}/${digestId}/peptides`,
          { signal: controller.signal },
        );
        clearTimeout(timeout);

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setError(response.status, parseErrorDetail(body, `Failed to fetch peptides (${response.status})`));
          dispatch({ type: 'FAILED' });
          return;
        }

        const data: DigestPeptidesResponse = await response.json();
        dispatch({ type: 'COMPLETED', peptidesResponse: data });
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          setError(0, 'Peptide fetch timed out. Try opening the digest from the Digests list.');
        } else {
          setError(0, 'Unable to reach the server. Please check your connection.');
        }
        dispatch({ type: 'FAILED' });
      }
    },
    [setError],
  );

  /* ── Polling logic ── */

  const startPolling = useCallback(
    (digestId: string) => {
      stopPolling();
      digestIdRef.current = digestId;
      dispatch({ type: 'POLL_START', digestId });

      const startTime = Date.now();

      pollTimeoutRef.current = setTimeout(() => {
        stopPolling();
        dispatch({ type: 'FAILED' });
        setError(0, 'Digest timed out after 5 minutes. Find the record in the Digests list.');
      }, POLL_TIMEOUT_MS);

      const poll = async () => {
        const userId = userIdRef.current;
        if (!userId || !digestIdRef.current) {
          scheduleNext();
          return;
        }

        try {
          const response = await fetch(
            `${API_URL}/v1/digest/${userId}/${digestIdRef.current}`,
          );

          if (!response.ok) {
            scheduleNext();
            return;
          }

          const data: DigestResponse = await response.json();

          if (data.status === 'completed') {
            stopPolling();
            fetchPeptides(userId, digestIdRef.current!, data);
            return;
          }

          if (data.status === 'failed') {
            stopPolling();
            dispatch({ type: 'FAILED' });
            setError(500, 'Digest processing failed on the server. Please try again.');
            return;
          }
        } catch {
          // Transient network error — keep polling
        }

        scheduleNext();
      };

      const scheduleNext = () => {
        const elapsed = Date.now() - startTime;
        const delay = elapsed < FAST_PHASE_MS ? FAST_POLL_MS : SLOW_POLL_MS;
        pollTimerRef.current = setTimeout(poll, delay);
      };

      pollTimerRef.current = setTimeout(poll, FAST_POLL_MS);
    },
    [setError, stopPolling, fetchPeptides],
  );

  /* ── Rehydrate from localStorage ── */

  useEffect(() => {
    if (hydrated || !user?.id) return;
    setHydrated(true);

    try {
      const stored = localStorage.getItem(DIGEST_STATE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (!parsed?.digestId) return;

      // Always resume via polling. If the backend job already completed,
      // the first poll tick sees 'completed' and chains into fetchPeptides.
      startPolling(parsed.digestId);
    } catch {}
  }, [hydrated, user?.id, startPolling]);

  /* ── Submit a new digest ── */

  const submitDigest = useCallback(
    async (params: { proteinName: string; sequence: string }) => {
      if (state.status === 'loading' || state.status === 'polling' || state.status === 'fetching') return;

      if (!user?.id) {
        setError(401, 'You must be logged in to submit a digest.');
        return;
      }

      dispatch({ type: 'SUBMIT_START' });

      try {
        const response = await fetch(`${API_URL}/v1/digest/job`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            protease: 'trypsin',
            protein_name: params.proteinName.trim(),
            sequence: params.sequence,
          }),
        });

        if (!response.ok) {
          const body = await response.json().catch(() => null);
          setError(response.status, parseErrorDetail(body, `Failed to submit digest (${response.status})`));
          dispatch({ type: 'FAILED' });
          return;
        }

        const data = await response.json();
        startPolling(data.digest_id);
      } catch {
        setError(0, 'Unable to reach the server. Please check your connection.');
        dispatch({ type: 'FAILED' });
      }
    },
    [user, setError, state.status, startPolling],
  );

  /* ── Reset ── */

  const reset = useCallback(() => {
    stopPolling();
    digestIdRef.current = null;
    dispatch({ type: 'RESET' });
    try { localStorage.removeItem(DIGEST_STATE_KEY); } catch {}
  }, [stopPolling]);

  /* ── Memoized context value ── */

  const value = useMemo<DigestContextType>(
    () => ({
      status: state.status,
      digestId: state.digestId,
      digestResponse: state.digestResponse,
      peptidesResponse: state.peptidesResponse,
      submitDigest,
      reset,
    }),
    [state.status, state.digestId, state.digestResponse, state.peptidesResponse, submitDigest, reset],
  );

  return (
    <DigestContext.Provider value={value}>
      {children}
    </DigestContext.Provider>
  );
}

export function useDigest() {
  const context = useContext(DigestContext);
  if (context === undefined) {
    throw new Error('useDigest must be used within a DigestProvider');
  }
  return context;
}