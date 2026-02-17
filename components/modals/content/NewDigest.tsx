'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FlaskConical, Type, AlignLeft, AlertCircle, Loader2, Check, BarChart3 } from 'lucide-react';
import { useError } from '@/components/providers/ErrorProvider';
import { useUserContext } from '@/components/providers/AuthProvider';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/* ── Constants ── */
const STORAGE_KEY = 'qpeptide-new-digest-draft';
const MAX_NAME_LENGTH = 255;
const MAX_SEQUENCE_LENGTH = 3000;
const VALID_AMINO_ACIDS = new Set('ACDEFGHIKLMNPQRSTVWY');
const FAST_POLL_MS = 1_000;       // 1 second
const SLOW_POLL_MS = 5_000;       // 5 seconds
const FAST_PHASE_MS = 10_000;     // first 10 seconds: use fast polling
const POLL_TIMEOUT_MS = 5 * 60_000; // 5 minutes total

/* ── Validation ── */

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateName(name: string): ValidationResult {
  if (!name.trim()) {
    return { valid: false, error: 'Protein name is required' };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be ${MAX_NAME_LENGTH} characters or fewer` };
  }
  return { valid: true };
}

function validateSequence(sequence: string): ValidationResult {
  const cleaned = sequence.replace(/[\s\d]/g, '').toUpperCase();
  if (cleaned.length === 0) {
    return { valid: false, error: 'Sequence is required' };
  }
  if (cleaned.length > MAX_SEQUENCE_LENGTH) {
    return {
      valid: false,
      error: `Sequence must be ${MAX_SEQUENCE_LENGTH} characters or fewer (currently ${cleaned.length})`,
    };
  }
  const invalidChars = [...new Set(cleaned.split('').filter(c => !VALID_AMINO_ACIDS.has(c)))];
  if (invalidChars.length > 0) {
    return {
      valid: false,
      error: `Invalid amino acid(s): ${invalidChars.sort().join(', ')}. Only the 20 standard amino acids are allowed.`,
    };
  }
  return { valid: true };
}

/* ── localStorage helpers ── */

function loadDraft(): { proteinName: string; sequence: string } {
  if (typeof window === 'undefined') return { proteinName: '', sequence: '' };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { proteinName: '', sequence: '' };
    const parsed = JSON.parse(stored);
    return {
      proteinName: typeof parsed.proteinName === 'string' ? parsed.proteinName : '',
      sequence: typeof parsed.sequence === 'string' ? parsed.sequence : '',
    };
  } catch {
    return { proteinName: '', sequence: '' };
  }
}

function saveDraft(proteinName: string, sequence: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ proteinName, sequence }));
  } catch { /* localStorage full or unavailable */ }
}

/* ── Component ── */

export default function NewDigestContent() {
  const { setError } = useError();
  const { user } = useUserContext();

  const [proteinName, setProteinName] = useState('');
  const [sequence, setSequence] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [sequenceError, setSequenceError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'polling' | 'completed'>('idle');
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const digestIdRef = useRef<string | null>(null);

  // ── Stop polling helper ──
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  // Clean up polling on unmount
  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const startPolling = useCallback((digestId: string) => {
    stopPolling();
    digestIdRef.current = digestId;
    setSubmitStatus('polling');
  
    const startTime = Date.now();
  
    // 5-minute hard timeout
    pollTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setSubmitStatus('idle');
      setError(0, 'Digest timed out after 5 minutes. Find record in Digests window.');
    }, POLL_TIMEOUT_MS);
  
    const poll = async () => {
      if (!user?.id || !digestIdRef.current) return;
  
      try {
        const response = await fetch(
          `${API_URL}/v1/digest/${user.id}/${digestIdRef.current}`
        );
  
        if (!response.ok) {
          // Transient error — schedule next tick and skip
          scheduleNext();
          return;
        }
  
        const data = await response.json();
  
        if (data.status === 'completed') {
          stopPolling();
          setSubmitStatus('completed');
          return;
        } else if (data.status === 'failed') {
          stopPolling();
          setSubmitStatus('idle');
          setError(500, 'Digest processing failed on the server. Please try again.');
          return;
        }
      } catch {
        // Network error — schedule next tick
      }
  
      scheduleNext();
    };
  
    const scheduleNext = () => {
      const elapsed = Date.now() - startTime;
      const delay = elapsed < FAST_PHASE_MS ? FAST_POLL_MS : SLOW_POLL_MS;
      pollIntervalRef.current = setTimeout(poll, delay);
    };
  
    // Fire the first poll immediately after a short delay
    pollIntervalRef.current = setTimeout(poll, FAST_POLL_MS);
  }, [user, setError, stopPolling]);
  

  // Hydrate from localStorage on mount
  useEffect(() => {
    const draft = loadDraft();
    setProteinName(draft.proteinName);
    setSequence(draft.sequence);
    setHydrated(true);
  }, []);
  
  // Save to localStorage on change — only AFTER hydration
  useEffect(() => {
    if (!hydrated) return;
    saveDraft(proteinName, sequence);
  }, [proteinName, sequence, hydrated]);

  // Clear inline errors as user types
  const handleNameChange = useCallback((value: string) => {
    setProteinName(value);
    if (nameError) setNameError(null);
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  }, [nameError, submitStatus]);

  const handleSequenceChange = useCallback((value: string) => {
    setSequence(value);
    if (sequenceError) setSequenceError(null);
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  }, [sequenceError, submitStatus]);

  const handleClear = useCallback(() => {
    setProteinName('');
    setSequence('');
    setNameError(null);
    setSequenceError(null);
    setSubmitStatus('idle');
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitStatus === 'loading') return;
    const nameResult = validateName(proteinName);
    const seqResult = validateSequence(sequence);

    setNameError(nameResult.error || null);
    setSequenceError(seqResult.error || null);

    if (!nameResult.valid || !seqResult.valid) {
      const messages = [nameResult.error, seqResult.error].filter(Boolean).join('; ');
      setError(400, messages);
      return;
    }


    if (!user?.id) {
      setError(401, 'You must be logged in to submit a digest.');
      return;
    }

    setSubmitStatus('loading');

    try {
      const response = await fetch(`${API_URL}/v1/digest/job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          protease: 'trypsin',
          protein_name: proteinName.trim(),
          sequence: sequence.replace(/[\s\d]/g, '').toUpperCase(),
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        let message = `Failed to submit digest (${response.status})`;
        if (body?.detail) {
          if (typeof body.detail === 'string') {
            message = body.detail;
          } else if (Array.isArray(body.detail)) {
            message = body.detail.map((e: any) => e.msg).join('; ');
          }
        }
        setError(response.status, message);
        setSubmitStatus('idle');
        return;
      }
      const data = await response.json();
      // Start polling with the returned digest_id
      startPolling(data.digest_id);
    } catch {
      setError(0, 'Unable to reach the server. Please check your connection.');
      setSubmitStatus('idle');
    }
  }, [proteinName, sequence, user, setError, submitStatus]);

  const cleanedLength = sequence.replace(/\s/g, '').length;

  const isInputDisabled = submitStatus === 'loading' || submitStatus === 'polling';

  return (
    <div className="space-y-6 p-2">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5" style={{ color: 'var(--dark-orange)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
          New Digest
        </h2>
      </div>
      <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
        Enter a protein name and amino acid sequence to begin a new digest analysis.
        Your draft is saved automatically.
      </p>

      {/* Protein Name */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--black)' }}>
          <Type className="w-4 h-4" />
          Protein Name
        </label>
        <input
          type="text"
          value={proteinName}
          onChange={e => handleNameChange(e.target.value)}
          disabled={isInputDisabled}
          placeholder="e.g. Human Serum Albumin"
          maxLength={MAX_NAME_LENGTH}
          className="w-full px-3 py-2 text-sm font-mono outline-none"
          style={{
            backgroundColor: 'var(--white)',
            color: 'var(--black)',
            border: `2px solid ${nameError ? 'var(--red)' : 'var(--dark-gray)'}`,
            borderTop: `2px solid ${nameError ? 'var(--red)' : 'var(--black)'}`,
            borderLeft: `2px solid ${nameError ? 'var(--red)' : 'var(--black)'}`,
            borderRight: `2px solid ${nameError ? 'var(--light-red)' : 'var(--gray)'}`,
            borderBottom: `2px solid ${nameError ? 'var(--light-red)' : 'var(--gray)'}`,
          }}
        />
        <div className="flex justify-between text-xs" style={{ color: nameError ? 'var(--red)' : 'var(--dark-gray)' }}>
          <span>{nameError && <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 inline" /> {nameError}</span>}</span>
          <span>{proteinName.length}/{MAX_NAME_LENGTH}</span>
        </div>
      </div>

      {/* Protein Sequence */}
      <div className="space-y-1">
        <label className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--black)' }}>
          <AlignLeft className="w-4 h-4" />
          Protein Sequence
        </label>
        <textarea
          value={sequence}
          onChange={e => handleSequenceChange(e.target.value)}
          disabled={isInputDisabled}
          placeholder={` 1 malwmrllpl lallalwgpd paaafvnqhl cgshlvealy lvcgergffy tpktrreaed\n61 lqvealylvc gergffytpk trreaedlqa salslsssts twpegldkdi atevcrkala`}
          rows={8}
          className="w-full px-3 py-2 text-sm font-mono outline-none resize-y"
          style={{
            backgroundColor: 'var(--white)',
            color: 'var(--black)',
            border: `2px solid ${sequenceError ? 'var(--red)' : 'var(--dark-gray)'}`,
            borderTop: `2px solid ${sequenceError ? 'var(--red)' : 'var(--black)'}`,
            borderLeft: `2px solid ${sequenceError ? 'var(--red)' : 'var(--black)'}`,
            borderRight: `2px solid ${sequenceError ? 'var(--light-red)' : 'var(--gray)'}`,
            borderBottom: `2px solid ${sequenceError ? 'var(--light-red)' : 'var(--gray)'}`,
            lineHeight: '1.5',
            letterSpacing: '0.05em',
          }}
        />
        <div className="flex justify-between text-xs" style={{ color: sequenceError ? 'var(--red)' : 'var(--dark-gray)' }}>
          <span>{sequenceError && <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 inline" /> {sequenceError}</span>}</span>
          <span>{cleanedLength}/{MAX_SEQUENCE_LENGTH} residues</span>
        </div>
        <p className="text-xs" style={{ color: 'var(--gray)' }}>
          Standard 20 amino acids only (A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y). Whitespace and line numbers are ignored.
        </p>
        <p className="text-xs" style={{ color: 'var(--gray)' }}>
        Future versions of QPeptide Finder will support additional proteases beyond Trypsin 
        and allow curation of the criteria used to grade QPeptide candidates.
        </p>
      </div>

      {/* Buttons */}
      <div className="border-t pt-4 flex gap-3" style={{ borderColor: 'var(--dark-gray)' }}>
        { !isInputDisabled && <button
          onClick={handleClear}
          className="px-6 py-3 font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor: 'var(--cream)',
            color: 'var(--black)',
            border: '1px ridge var(--dark-gray)',
            borderBottom: '4px ridge var(--dark-gray)',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--light-gray)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--cream)'; }}
        >
          Clear
        </button>
        }
        <button
          onClick={submitStatus === 'completed' ? () => { /* TODO: open analysis */ } : handleSubmit}
          disabled={isInputDisabled}
          className="flex-1 px-6 py-3 font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor:
              submitStatus === 'completed' ? 'var(--rainbow-green)'
              : submitStatus === 'polling' ? 'var(--dark-orange)'
              : 'var(--dark-blue)',
            color: 'var(--white)',
            border: '1px ridge var(--dark-gray)',
            borderBottom: '4px ridge var(--dark-gray)',
            opacity: (submitStatus === 'loading' || submitStatus === 'polling') ? 0.7 : 1,
          }}
          onMouseEnter={e => {
            if (submitStatus === 'idle') e.currentTarget.style.backgroundColor = 'var(--blue)';
            if (submitStatus === 'completed') e.currentTarget.style.backgroundColor = 'var(--green)';
          }}
          onMouseLeave={e => {
            if (submitStatus === 'idle') e.currentTarget.style.backgroundColor = 'var(--dark-blue)';
            if (submitStatus === 'completed') e.currentTarget.style.backgroundColor = 'var(--rainbow-green)';
          }}
        >
          {submitStatus === 'loading' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting…
            </>
          )}
          {submitStatus === 'polling' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Digesting…
            </>
          )}
          {submitStatus === 'completed' && (
            <>
              <BarChart3 className="w-5 h-5" />
              Analyze Digest
            </>
          )}
          {submitStatus === 'idle' && (
            <>
              <FlaskConical className="w-5 h-5" />
              Submit Digest
            </>
          )}
        </button>
      </div>
    </div>
  );
}