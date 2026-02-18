'use client';

import { BarChart3, FileSearch } from 'lucide-react';
import { useDigest } from '@/components/providers/DigestProvider';
import type { PeptideResponse, CriteriaResponse } from '@/components/providers/DigestProvider';

function formatNumber(value: number | null): string {
  if (value === null) return '—';
  return String(value);
}

export default function AnalysisContent() {
  const { peptidesResponse, digestResponse } = useDigest();
  const hasData = peptidesResponse && peptidesResponse.peptides.length > 0;
  const criteria = peptidesResponse?.criteria ?? [];
  const peptides = peptidesResponse?.peptides ?? [];

  if (!hasData) {
    return (
      <div className="space-y-6 p-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: 'var(--dark-orange)' }} />
          <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
            Analysis
          </h2>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-4 py-12 px-6 rounded border-2"
          style={{
            backgroundColor: 'var(--white)',
            borderColor: 'var(--dark-gray)',
            borderStyle: 'ridge',
          }}
        >
          <FileSearch className="w-12 h-12" style={{ color: 'var(--dark-gray)' }} />
          <p className="text-sm text-center max-w-md" style={{ color: 'var(--dark-gray)' }}>
            No digest results to analyze. Select a digest from the <strong>Digests</strong> modal to view peptide analysis here, or run a new digest from <strong>New Digest</strong> and then click <strong>Analyze Digest</strong>.
          </p>
        </div>
      </div>
    );
  }

  const proteinName = digestResponse?.protein_name ?? 'Digest';
  const digestId = peptidesResponse.digest_id;

  return (
    <div className="space-y-4 p-2">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" style={{ color: 'var(--dark-orange)' }} />
        <h2 className="text-lg font-bold" style={{ color: 'var(--black)' }}>
          Analysis
        </h2>
      </div>
      <p className="text-sm" style={{ color: 'var(--dark-gray)' }}>
        Digest Name: {proteinName}
      </p>

      <div
        className="overflow-x-auto border-2"
        style={{
          backgroundColor: 'var(--white)',
          borderColor: 'var(--dark-gray)',
          borderStyle: 'ridge',
          maxHeight: 'calc(90vh - 16rem)',
        }}
      >
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--dark-blue)', color: 'var(--white)' }}>
              <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">#</th>
              <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">POSITION</th>
              <th className="text-left px-3 py-2 border border-black font-bold">SEQUENCE</th>
              <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">pI</th>
              <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">CHARGE</th>
              <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">MAX KD</th>
              <th className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap">RANK</th>
              {criteria.map((c: CriteriaResponse) => (
                <th key={c.code} className="text-left px-3 py-2 border border-black font-bold whitespace-nowrap" title={c.goal}>
                  {c.code.replaceAll("_", " ").toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {peptides.map((p: PeptideResponse, index: number) => (
              <tr
                key={p.id}
                style={{
                  backgroundColor: index % 2 === 0 ? 'var(--cream)' : 'var(--white)',
                }}
              >
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{index + 1}</td>
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{p.position}</td>
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{p.sequence}</td>
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{formatNumber(p.pi)}</td>
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{formatNumber(p.charge_state)}</td>
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{formatNumber(p.max_kd_score)}</td>
                <td className="px-3 py-1.5 border border-gray-400 font-mono" style={{ color: 'var(--black)' }}>{p.rank}</td>
                {criteria.map((c: CriteriaResponse, i: number) => (
                  <td key={c.code} className="px-3 py-1.5 border border-gray-400 font-mono text-center" style={{ color: 'var(--black)' }}>
                    {p.criteria_ranks[i] != null ? 'true' : 'false' }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}