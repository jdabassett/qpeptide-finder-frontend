'use client';

import { useState, useCallback } from 'react';
import { FileText, FlaskConical, Type, AlignLeft, BarChart3, ChevronRight, Copy, LucideIcon, LogIn } from 'lucide-react';

const HUMAN_ALBUMIN_NAME = 'Human Albumin';
const HUMAN_ALBUMIN_EXAMPLE = [
  'MKWVTFISLLFLFSSAYSRGVFRRDAHKSEVAHRFKDLGEENFKALVLIAFAQYLQQCPFEDHVKLVNEVTEFAKTCVADESAENCDKSLHTLFGDKLCTVATLRETYGEMADCCAKQEPERNECFLQHKDDNPNLPRLVRPEVDVMCTAFHDNEETFLKKYLYEIARRHPYFYAPELLFFAKRYKAAFTECCQAADKAACLLPKLDELRDEGKASSAKQRLKCASLQKFGERAFKAWAVARLSQRFPKAEFAEVSKLVTDLTKVHTECCHGDLLECADDRADLAKYICENQDSISSKLKECCEKPLLEKSHCIAEVENDEMPADLPSLAADFVESKDVCKNYAEAKDVFLGMFLYEYARRHPDYSVVLLLRLAKTYETTLEKCCAAADPHECYAKVFDEFKPLVEEPQNLIKQNCELFEQLGEYKFQNALLVRYTKKVPQVSTPTLVEVSRNLGKVGSKCCKHPEAKRMPCAEDYLSVVLNQLCVLHEKTPVSDRVTKCCTESLVNRRPCFSALEVDETYVPKEFNAETFTFHADICTLSEKERQIKKQTALVELVKHKPKATKEQLKAVMDDFAAFVEKCCKADDKETCFAEEGKKLVAASQAALGL',
].join('');

type StepItem = {
  title: string;
  icon: LucideIcon;
  body: string;
  example?: string;
  exampleLabel?: string;
};

const STEPS: StepItem[]= [
  {
    title: 'Log in',
    icon: LogIn,
    body: 'You must be signed in first.',
  },
  {
    title: 'Open New Digest',
    icon: FlaskConical,
    body: 'Click **New Digest**. This opens the window where you enter your protein and run a digest.',
  },
  {
    title: 'Enter the protein name',
    icon: Type,
    body: 'Paste following protein name in the **Protein Name** box.',
    example: HUMAN_ALBUMIN_NAME,
  },
  {
    title: 'Paste the amino acid sequence',
    icon: AlignLeft,
    body: 'Paste following sequence in the **Protein Sequence** box.',
    example: HUMAN_ALBUMIN_EXAMPLE,
  },
  {
    title: 'Choose sorting criteria',
    icon: BarChart3,
    body: 'Use **Sorting Criteria** to decide how peptides are ranked. Mandatory criteria are always applied and displayed to inform about all the criteria that goes into ranking each qpeptide. You can add or remove optional criteria by dragging between **Unapplied** and **Applied**.',
  },
  {
    title: 'Submit and wait',
    icon: FlaskConical,
    body: 'Click **Submit Digest**. The app will digest the protein with trypsin and rank each qpeptides. When the status shows completion, the **Review Digest** button appears.',
  },
  {
    title: 'View results',
    icon: BarChart3,
    body: 'Click **Review Digest** to open the Review window. There you can see the ranked peptides, their properties (pI, charge, sequence), and which criteria contributed to each score. You can also open **Digests** from the sidebar to pick a previous digest and review it. Click the **Download** button to save your results in a CSV file.',
  },
];

export default function DirectionsContent() {
  const [copiedWhich, setCopiedWhich] = useState<'name' | 'sequence' | null>(null);

  const handleCopyName = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(HUMAN_ALBUMIN_NAME);
      setCopiedWhich('name');
      setTimeout(() => setCopiedWhich(null), 2000);
    } catch {
      // clipboard not available
    }
  }, []);
  
  const handleCopySequence = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(HUMAN_ALBUMIN_EXAMPLE);
      setCopiedWhich('sequence');
      setTimeout(() => setCopiedWhich(null), 2000);
    } catch {
      // clipboard not available
    }
  }, []);

  return (
    <div className="space-y-8 p-2 overflow-y-auto">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5" style={{ color: 'var(--blue)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
            How to use QPeptide Finder
          </h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--dark-gray)' }}>
          This guide walks you through the app step by step using <strong>Human Albumin</strong> as an example. Follow these steps to run your first digest and view the results.
        </p>
      </section>

      <hr style={{ borderColor: 'var(--dark-gray)', opacity: 0.3 }} />

      {STEPS.map((step, index) => {
        const Icon = step.icon;
        return (
          <section key={index}>
            <div className="flex items-start gap-3">
              <div
                className="flex items-center justify-center w-8 h-8 flex-shrink-0 border"
                style={{
                  backgroundColor: 'var(--cream)',
                  borderColor: 'var(--dark-gray)',
                  color: 'var(--blue)',
                }}
              >
                <span className="text-sm font-bold">{index + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--dark-orange)' }} />
                  <h3 className="text-base font-bold" style={{ color: 'var(--black)' }}>
                    {step.title}
                  </h3>
                </div>
                <p
                  className="text-sm leading-relaxed mb-2"
                  style={{ color: 'var(--dark-gray)' }}
                  dangerouslySetInnerHTML={{
                    __html: step.body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                  }}
                />
                {step.example != null && (
                  <div
                    className="mt-2 px-3 py-2 font-mono text-xs overflow-x-auto border"
                    style={{
                      backgroundColor: 'var(--white)',
                      borderColor: 'var(--dark-gray)',
                      color: 'var(--black)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      {step.exampleLabel && (
                        <span className="text-[11px] font-normal" style={{ color: 'var(--gray)' }}>
                          {step.exampleLabel}
                        </span>
                      )}
                      {index === 2 && (
                        <button
                          type="button"
                          onClick={handleCopyName}
                          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium border shrink-0 cursor-pointer"
                          style={{
                            backgroundColor: copiedWhich === 'name' ? 'var(--rainbow-green)' : 'var(--cream)',
                            color: 'var(--black)',
                            borderColor: 'var(--dark-gray)',
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedWhich === 'name' ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                      {index === 3 && (
                        <button
                          type="button"
                          onClick={handleCopySequence}
                          className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium border shrink-0 cursor-pointer"
                          style={{
                            backgroundColor: copiedWhich === 'sequence' ? 'var(--rainbow-green)' : 'var(--cream)',
                            color: 'var(--black)',
                            borderColor: 'var(--dark-gray)',
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                          {copiedWhich === 'sequence' ? 'Copied!' : 'Copy'}
                        </button>
                      )}
                    </div>
                    <pre className="whitespace-pre-wrap break-all">{step.example}</pre>
                  </div>
                )}
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight
                  className="w-5 h-5 flex-shrink-0 mt-1"
                  style={{ color: 'var(--gray)' }}
                  aria-hidden
                />
              )}
            </div>
          </section>
        );
      })}

    </div>
  );
}