'use client';

import { useState, useEffect, useCallback } from 'react';
import { FlaskConical, Type, AlignLeft, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { useError } from '@/components/providers/ErrorProvider';
import { useDigest } from '@/components/providers/DigestProvider';
import { useCriteria } from '@/components/providers/CriteriaProvider';

/* ── Constants ── */
const STORAGE_KEY = 'qpeptide-new-digest-draft';
const MAX_NAME_LENGTH = 255;
const MAX_SEQUENCE_LENGTH = 3000;
const VALID_AMINO_ACIDS = new Set('ACDEFGHIKLMNPQRSTVWY');

/* ── Validation ── */

type SelectionMode = 'default' | 'custom';

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

const formatGoalLabel = (goal: string) => {
  const [label] = goal.split(':');
  return label.trim();
};

/* ── localStorage helpers ── */

function loadDraft(): {
  proteinName: string;
  sequence: string;
  newDraft: boolean;
  selectedCriteriaIds: string[];
  selectionMode: SelectionMode;
} {
  if (typeof window === 'undefined') {
    return { proteinName: '', sequence: '', newDraft: true, selectedCriteriaIds: [], selectionMode: 'default' };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { proteinName: '', sequence: '', newDraft: true, selectedCriteriaIds: [], selectionMode: 'default' };
    }
    const parsed = JSON.parse(stored);

    const rawIds = Array.isArray(parsed.selectedCriteriaIds)
    ? parsed.selectedCriteriaIds
    : [];
  
    const filteredIds = rawIds.filter(
      (x: unknown): x is string => typeof x === 'string',
    );
    
    const selectedCriteriaIds = Array.from(
      new Set<string>(filteredIds),
    );

    const selectionMode: SelectionMode =
      parsed.selectionMode === 'custom' ? 'custom' : 'default';

    return {
      proteinName: typeof parsed.proteinName === 'string' ? parsed.proteinName : '',
      sequence: typeof parsed.sequence === 'string' ? parsed.sequence : '',
      newDraft: parsed.newDraft !== false,
      selectedCriteriaIds,
      selectionMode,
    };
  } catch {
    return { proteinName: '', sequence: '', newDraft: true, selectedCriteriaIds: [], selectionMode: 'default' };
  }
}

function saveDraft(
  proteinName: string,
  sequence: string,
  newDraft: boolean,
  selectedCriteriaIds: string[],
  selectionMode: SelectionMode,
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        proteinName,
        sequence,
        newDraft,
        selectedCriteriaIds,
        selectionMode,
      }),
    );
  } catch (err) {
    console.error("New Digest: unable to save to local storage.", { error: err });
  }
}

/* ── Component ── */
interface NewDigestContentProps {
  onOpenAnalysis?: () => void;
}

export default function NewDigestContent({ onOpenAnalysis }: NewDigestContentProps) {
  const { setError } = useError();
  const { status: digestStatus, submitDigest } = useDigest();
  const { criteria } = useCriteria();

  const [proteinName, setProteinName] = useState('');
  const [sequence, setSequence] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [sequenceError, setSequenceError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [newDraft, setNewDraft] = useState(true);
  const [selectedCriteriaIds, setSelectedCriteriaIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('default');
  

  // Hydrate from localStorage on mount
  useEffect(() => {
    const draft = loadDraft();
    setProteinName(draft.proteinName);
    setSequence(draft.sequence);
    setSelectedCriteriaIds(draft.selectedCriteriaIds ?? []);
    setSelectionMode(draft.selectionMode ?? 'default');
    setNewDraft(true);
    setHydrated(true);
  }, []);
  
  // Save to localStorage on change — only AFTER hydration
  useEffect(() => {
    if (!hydrated) return;
    saveDraft(proteinName, sequence, newDraft, selectedCriteriaIds, selectionMode);
  }, [proteinName, sequence, newDraft, selectedCriteriaIds, selectionMode, hydrated]);

  // Clear inline errors as user types
  const handleNameChange = useCallback((value: string) => {
    setProteinName(value);
    if (nameError) setNameError(null);
    setNewDraft(true);
  }, [nameError]);

  const handleSequenceChange = useCallback((value: string) => {
    setSequence(value);
    if (sequenceError) setSequenceError(null);
    setNewDraft(true);
  }, [sequenceError]);

  const handleClear = useCallback(() => {
    setProteinName('');
    setSequence('');
    setNameError(null);
    setSequenceError(null);
    setNewDraft(true);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch(err) {
      console.error("New Digest: couldn't clear local storage", {error: err})
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (digestStatus === 'loading' || digestStatus === 'polling' || digestStatus === 'fetching') return;

    const nameResult = validateName(proteinName);
    const seqResult = validateSequence(sequence);

    setNameError(nameResult.error || null);
    setSequenceError(seqResult.error || null);

    if (!nameResult.valid || !seqResult.valid) {
      const messages = [nameResult.error, seqResult.error].filter(Boolean).join('; ');
      setError(400, messages);
      return;
    }

    const allCriteria = criteria ?? [];
    const mandatoryCriteria = allCriteria.filter((c) => !c.is_optional);
    const optionalCriteria = allCriteria.filter((c) => c.is_optional);
    const appliedIds = [
      ...mandatoryCriteria.map((c) => c.id),
      ...(selectionMode === 'default'
        ? optionalCriteria.map((c) => c.id)
        : selectedCriteriaIds),
    ];

    setNewDraft(false);
    await submitDigest({
      proteinName: proteinName.trim(),
      sequence: sequence.replace(/[\s\d]/g, '').toUpperCase(),
      criteria_ids: appliedIds,
    });
  }, [proteinName, sequence, digestStatus, setError, submitDigest, criteria, selectionMode, selectedCriteriaIds]);

  // Validate selectedCriteriaIds against current backend criteria
  useEffect(() => {
    if (!hydrated || !criteria) return;
    if (selectedCriteriaIds.length === 0) return;
  
    const validIds = new Set(criteria.map((c) => c.id));
    const filtered = Array.from(
      new Set(
        selectedCriteriaIds.filter((id) => validIds.has(id)),
      ),
    );
  
    if (filtered.length === selectedCriteriaIds.length) return;
  
    setSelectedCriteriaIds(filtered);
  }, [hydrated, criteria, selectedCriteriaIds]);

  // ── Criteria derived lists ──
  const allCriteria = criteria ?? [];
  const mandatoryCriteria = allCriteria.filter((c) => !c.is_optional);
  const optionalCriteria = allCriteria.filter((c) => c.is_optional);

  const isDefaultSelection = selectionMode === 'default';
  const selectedSet = new Set(selectedCriteriaIds);
  
  const appliedCriteria = isDefaultSelection
    ? optionalCriteria
    : optionalCriteria.filter((c) => selectedSet.has(c.id));
  
  const unappliedCriteria = isDefaultSelection
    ? []
    : optionalCriteria.filter((c) => !selectedSet.has(c.id));

  // Apply/unapply helpers for optional criteria
  const applyCriteria = useCallback((id: string) => {
    setSelectionMode('custom');
    setSelectedCriteriaIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  const unapplyCriteria = useCallback((id: string) => {
    setSelectionMode('custom');
    setSelectedCriteriaIds((prev) => {
      if (selectionMode === 'default') {
        return optionalCriteria
          .map((c) => c.id)
          .filter((x) => x !== id);
      }
      return prev.filter((x) => x !== id);
    });
  }, [optionalCriteria, selectionMode]);

  // Drag & drop handlers
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLButtonElement>, id: string) => {
      event.dataTransfer.setData('text/plain', id);
      event.dataTransfer.effectAllowed = 'move';
    },
    [],
  );

  const handleDropToApplied = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const id = event.dataTransfer.getData('text/plain');
      if (!id) return;
      // Only optional criteria are user‑controllable
      if (!optionalCriteria.some((c) => c.id === id)) return;
      applyCriteria(id);
    },
    [optionalCriteria, applyCriteria],
  );

  const handleDropToAvailable = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const id = event.dataTransfer.getData('text/plain');
      if (!id) return;
      if (!optionalCriteria.some((c) => c.id === id)) return;
      unapplyCriteria(id);
    },
    [optionalCriteria, unapplyCriteria],
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // "Reset" = clear custom optional selection (only mandatory remain applied)
  const handleResetSelection = useCallback(() => {
    setSelectionMode('default');
    setSelectedCriteriaIds([]);
  }, []);

  const cleanedLength = sequence.replace(/\s/g, '').length;

  const isInputDisabled =
  digestStatus === 'loading' || digestStatus === 'polling' || digestStatus === 'fetching';

  const showAnalyze = !newDraft && digestStatus === 'completed';

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
        Enter a protein name, amino acid sequence, and sorting criteria.
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
      </div>

      {/* Criteria selection */}
      <div className="space-y-2">
        <label
          className="flex items-center gap-2 text-sm font-bold"
          style={{ color: 'var(--black)' }}
        >
          <BarChart3 className="w-4 h-4" />
          Sorting Criteria
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <button
                type="button"
                disabled
                className="px-2 py-1 text-[11px] font-medium border"
                style={{
                  backgroundColor: 'var(--orange)',   
                  color: 'var(--black)',
                  borderColor: 'var(--orange)',
                  cursor: 'default',
                  opacity: 1,
                }}
                title="Mandatory criteria are always applied"
              >
                Mandatory
              </button>
              <button
                type="button"
                disabled
                className="px-2 py-1 text-[11px] font-medium border"
                style={{
                  backgroundColor: 'var(--yellow)',        
                  color: 'var(--black)',
                  borderColor: 'var(--yellow)',
                  cursor: 'default',
                  opacity: 1,
                }}
                title="Optional criteria can be toggled on or off"
              >
                Optional
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isInputDisabled}
              onClick={handleResetSelection}
              className="px-2 py-1 text-xs font-medium border rounded cursor-pointer"
              style={{
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
                borderColor: 'var(--dark-gray)',
                opacity: isInputDisabled ? 0.6 : 1,
              }}
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Available / Unapplied optional criteria */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--black)' }}
              >
              UNAPPLIED
              </span>
            </div>
            <div
              className="h-40 border p-2 rounded overflow-y-auto"
              style={{ borderColor: 'var(--dark-gray)', backgroundColor: 'var(--white)' }}
              onDragOver={handleDragOver}
              onDrop={handleDropToAvailable}
            >
              {unappliedCriteria.length === 0 && (
                <p className="text-[11px]" style={{ color: 'var(--gray)' }}>
                  All criteria are applied.
                </p>
              )}
              <div className="flex flex-wrap gap-1">
                {unappliedCriteria.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isInputDisabled}
                    draggable={!isInputDisabled}
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onClick={() => applyCriteria(c.id)} 
                    className="text-[11px] px-2 py-1 border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: 'var(--yellow)',
                      backgroundColor: 'var(--yellow)',
                      color: 'var(--black)',
                      opacity: isInputDisabled ? 0.6 : 1,
                    }}
                  >
                    {formatGoalLabel(c.goal)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Applied criteria (mandatory + applied optional) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: 'var(--black)' }}
              >
                Applied
              </span>
            </div>
            <div
              className="h-40 border p-2 rounded overflow-y-auto"
              style={{ borderColor: 'var(--dark-gray)', backgroundColor: 'var(--white)' }}
              onDragOver={handleDragOver}
              onDrop={handleDropToApplied}
            >
              {/* Mandatory criteria (always applied, not draggable) */}
              <div className="flex flex-wrap gap-1 mb-1">
                {mandatoryCriteria.map((c) => (
                  <span
                    key={c.id}
                    className="text-[11px] px-2 py-1 border"
                    style={{
                      borderColor: 'var(--orange)',
                      backgroundColor: 'var(--orange)',
                      color: 'var(--black)',
                    }}
                    title="Mandatory criterion (always applied)"
                  >
                    {formatGoalLabel(c.goal)}
                  </span>
                ))}
              </div>

              {appliedCriteria.length === 0 && mandatoryCriteria.length === 0 && (
                <p className="text-[11px]" style={{ color: 'var(--gray)' }}>
                  No criteria applied yet.
                </p>
              )}

              <div className="flex flex-wrap gap-1">
                {appliedCriteria.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isInputDisabled}
                    draggable={!isInputDisabled}
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onClick={() => unapplyCriteria(c.id)} // click to remove
                    className="text-[11px] px-2 py-1 border cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{
                      borderColor: 'var(--yellow)',
                      backgroundColor: 'var(--yellow)',
                      color: 'var(--black)',
                      opacity: isInputDisabled ? 0.6 : 1,
                    }}
                  >
                    {formatGoalLabel(c.goal)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs" style={{ color: 'var(--gray)' }}>
        Future versions of QPeptide Finder will support additional proteases beyond Trypsin.
      </p>

      {/* Buttons */}
      <div className="border-t pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3" style={{ borderColor: 'var(--dark-gray)' }}>

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
          onClick={showAnalyze ? () => onOpenAnalysis?.() : handleSubmit}
          disabled={isInputDisabled}
          className="flex-1 px-6 py-3 font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor: 'var(--blue)',
            color: 'var(--white)',
            border: '1px ridge var(--dark-gray)',
            borderBottom: '4px ridge var(--dark-gray)',
            opacity: (digestStatus === 'loading' || digestStatus === 'polling') ? 0.7 : 1,
          }}
          onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--dark-blue)'
          }}
          onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--blue)'
          }}
        >
          {newDraft && (
            <>
              <FlaskConical className="w-5 h-5" />
              Submit Digest
            </>
          )}
          {digestStatus === 'loading' && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting…
            </>
          )}
          {(digestStatus === 'polling' || digestStatus === 'fetching') && (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Digesting…
            </>
          )}
          {showAnalyze && (
            <>
              <BarChart3 className="w-5 h-5" />
              Analyze Digest
            </>
          )}
        </button>
      </div>
    </div>
  );
}