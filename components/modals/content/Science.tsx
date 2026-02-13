'use client';

import { Microscope, FlaskConical, Target, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import Image from 'next/image';

const criteria = [
  {
    name: 'Uniqueness',
    code: 'not_unique',
    summary: 'The peptide must be unique within the target protein.',
    detail: 'Ensures the measured signal reflects only one site from the protein of interest.',
    icon: Target,
  },
  {
    name: 'Flanking Cut Sites',
    code: 'has_flanking_cut_sites',
    summary: 'Avoid peptides immediately adjacent to cleavage motifs (K, R, KP, RP).',
    detail: 'Proximity to other cut sites can reduce digestion efficiency, leading to missed cleavages or semi-tryptic peptides.',
    icon: AlertTriangle,
  },
  {
    name: 'Missed Cleavages',
    code: 'contains_missed_cleavages',
    summary: 'Ensure complete digestion.',
    detail: 'Missed cleavage sites (e.g., Lys-Pro, Arg-Pro) produce heterogeneous peptide populations, reducing reproducibility.',
    icon: AlertTriangle,
  },
  {
    name: 'N-Terminal Glutamine',
    code: 'contains_n_terminal_glutamine_motif',
    summary: 'Exclude peptides starting with glutamine (Q).',
    detail: 'N-terminal glutamine cyclizes to pyroglutamate post-digestion, producing multiple forms that complicate quantification.',
    icon: AlertTriangle,
  },
  {
    name: 'Asparagine–Glycine Motif',
    code: 'contains_asparagine_glycine_motif',
    summary: 'Exclude N–G motif.',
    detail: 'N–G motifs deamidate rapidly post-digestion, producing mixed modified/unmodified peptides.',
    icon: AlertTriangle,
  },
  {
    name: 'Aspartic–Proline Motif',
    code: 'contains_aspartic_proline_motif',
    summary: 'Exclude D–P motif.',
    detail: 'Aspartic acid followed by proline motif causes preferential gas-phase cleavage, producing non-informative fragmentation spectra.',
    icon: AlertTriangle,
  },
  {
    name: 'Methionine',
    code: 'contains_methionine',
    summary: 'Avoid methionine-containing peptides.',
    detail: 'Methionine oxidizes readily during sample handling, generating multiple peptide species with different masses and retention times.',
    icon: AlertTriangle,
  },
  {
    name: 'Peptide Length',
    code: 'outlier_length',
    summary: 'Optimal range: 7–30 amino acids.',
    detail: 'Shorter peptides are often non-unique and fragment poorly. Longer peptides ionize inefficiently. This range provides optimal MS detectability.',
    icon: Info,
  },
  {
    name: 'Hydrophobicity',
    code: 'outlier_hydrophobicity',
    summary: 'Kyte-Doolittle score must be between 0.5 and 2.0 (9-residue window).',
    detail: 'Very hydrophobic peptides adhere to columns and ionize inefficiently. Highly hydrophilic peptides elute too quickly, reducing detectability.',
    icon: Info,
  },
  {
    name: 'Charge State',
    code: 'outlier_charge_state',
    summary: 'Favor 2+ or 3+ ions.',
    detail: 'Other charge states often fragment less predictably, decreasing identification reliability.',
    icon: Info,
  },
  {
    name: 'Isoelectric Point (pI)',
    code: 'outlier_pi',
    summary: 'Select peptides with pI between 4.0 and 9.0.',
    detail: 'Peptides in this range reliably produce clean LC peaks, stable charge states, and informative MS/MS spectra under acidic RP-LC-ESI conditions.',
    icon: Info,
  },
  {
    name: 'Homopolymeric Stretches',
    code: 'contains_long_homopolymeric_stretch',
    summary: 'Avoid sequences with 3+ consecutive identical residues.',
    detail: 'Homopolymeric sequences produce weak, uninformative fragmentation spectra, reducing identification confidence.',
    icon: AlertTriangle,
  },
  {
    name: 'Flanking Amino Acids',
    code: 'lacking_flanking_amino_acids',
    summary: 'Require at least 6 residues on both sides of the cleavage site.',
    detail: 'Improves trypsin accessibility and digestion efficiency, producing more consistent peptide generation.',
    icon: CheckCircle,
  },
  {
    name: 'Cysteine',
    code: 'contains_cysteine',
    summary: 'Avoid cysteine-containing peptides.',
    detail: 'Cysteine requires alkylation; incomplete or over-alkylation creates heterogeneous populations, reducing quantitative reliability.',
    icon: AlertTriangle,
  },
];

export default function ScienceContent() {
  return (
    <div className="space-y-8 p-2 overflow-y-auto">

      {/* Section 1: What is a QPeptide? */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Microscope className="w-5 h-5" style={{ color: 'var(--light-red)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
            What is a QPeptide?
          </h2>
        </div>
        <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--dark-gray)' }}>
          <p>
            A <strong>Quantitative Peptide (QPeptide)</strong> is a carefully selected proteotypic 
            peptide used as a surrogate to measure the abundance of a specific protein in a biological 
            sample. In quantitative proteomics, proteins are enzymatically digested into peptides, and 
            the QPeptide serves as the representative fragment whose signal intensity in a mass 
            spectrometer directly reflects the amount of the parent protein.
          </p>
          <p>
            Not every peptide from a protein makes a good QPeptide. The ideal candidate must be 
            <strong> unique</strong> to the target protein, <strong>reproducibly generated</strong> during digestion, and <strong>well-behaved</strong> in the LC-MS/MS instrument — meaning it 
            ionizes efficiently, fragments predictably, and produces a strong, clean signal.
          </p>
        </div>
      </section>

      {/* Divider */}
      <hr style={{ borderColor: 'var(--dark-gray)', opacity: 0.3 }} />

      {/* Section 2: How is it used? */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical className="w-5 h-5" style={{ color: 'var(--light-red)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
            How is a QPeptide used in an experiment?
          </h2>
        </div>
        <div className="text-sm leading-relaxed space-y-3" style={{ color: 'var(--dark-gray)' }}>
          <p>
            In a typical quantitative proteomics workflow, biological samples are processed through 
            several stages. First, proteins are extracted from the sample and digested with a protease 
            such as <strong>trypsin</strong>, which cleaves at lysine (K) and arginine (R) residues. 
            This produces a complex mixture of peptides.
          </p>
          <p>
            A known quantity of <strong>isotopically-labeled QPeptide</strong> (the internal standard) 
            is then spiked into the peptide mixture. Because it has the same sequence as the endogenous 
            peptide but a different mass, the two co-elute during liquid chromatography but appear as 
            distinct peaks in the mass spectrum. The ratio of their signals gives the absolute abundance of the target protein.
          </p>

          {/* Diagram */}
          <div className="my-4 overflow-hidden border" style={{ borderColor: 'var(--dark-gray)' }}>
            <Image
              src="/images/quantitative_protemics_diagram.png"
              alt="Quantitative proteomics workflow: sample preparation, trypsin digestion, QPeptide addition, LC-MS/MS analysis, and relative quantification"
              width={900}
              height={500}
              className="w-full h-auto"
              priority
            />
            <div className="px-3 py-2 text-xs text-center" style={{ 
              backgroundColor: 'var(--cream)', 
              color: 'var(--dark-gray)',
              borderTop: '1px solid var(--dark-gray)'
            }}>
              <strong>Figure 1.</strong> Quantitative proteomics workflow showing protein extraction, 
              trypsin digestion, QPeptide spiking, and LC-MS/MS analysis for relative quantification.
            </div>
          </div>

          <p>
            The success of this entire workflow depends on choosing the right QPeptide — one that is 
            efficiently and reproducibly generated during digestion, and that produces a reliable signal in the mass spectrometer. That's what QPeptide Finder helps you do.
          </p>
        </div>
      </section>

      {/* Divider */}
      <hr style={{ borderColor: 'var(--dark-gray)', opacity: 0.3 }} />

      {/* Section 3: Criteria */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5" style={{ color: 'var(--light-red)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
            What makes a good QPeptide?
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--dark-gray)' }}>
          QPeptide Finder evaluates each candidate peptide against <strong>{criteria.length} criteria</strong>, ranked from most to least important. Peptides that pass more criteria are better candidates.
        </p>

        <div className="space-y-3">
          {criteria.map((criterion, index) => {
            const Icon = criterion.icon;
            return (
              <details
                key={criterion.code}
                className="border overflow-hidden"
                style={{ borderColor: 'var(--dark-gray)', backgroundColor: 'var(--white)' }}
              >
                <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--dark-gray)' }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm" style={{ color: 'var(--black)' }}>
                      {criterion.name}
                    </span>
                    <span className="text-xs ml-2" style={{ color: 'var(--dark-gray)' }}>
                      — {criterion.summary}
                    </span>
                  </div>
                </summary>
                <div 
                  className="px-4 py-3 text-sm border-t"
                  style={{ 
                    color: 'var(--dark-gray)', 
                    borderColor: 'var(--dark-gray)',
                    backgroundColor: 'var(--cream)' 
                  }}
                >
                  {criterion.detail}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}