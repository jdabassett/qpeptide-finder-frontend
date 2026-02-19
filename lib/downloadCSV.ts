import type {
  DigestPeptidesResponse,
  DigestResponse,
  PeptideResponse,
  CriteriaResponse,
} from '@/components/providers/DigestProvider';

/** Escape a CSV field: wrap in quotes and double internal quotes if needed. */
function escapeCsvField(value: string): string {
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Format a scalar for CSV (number, null, or string). */
function formatCell(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/** Build CSV string from peptides and criteria. */
function buildCsv(data: DigestPeptidesResponse): string {
  const { peptides, criteria } = data;
  const headers = [
    '#',
    'POSITION',
    'SEQUENCE',
    'PI',
    'CHARGE',
    'MAX KD',
    'RANK',
    ...criteria.map((c: CriteriaResponse) => c.code.replaceAll('_', ' ').toUpperCase()),
  ];
  const headerLine = headers.map(escapeCsvField).join(',');

  const rows = peptides.map((p: PeptideResponse, index: number) => {
    const cells = [
      index + 1,
      p.position,
      p.sequence,
      formatCell(p.pi),
      formatCell(p.charge_state),
      formatCell(p.max_kd_score),
      p.rank,
      ...criteria.map((c: CriteriaResponse) =>
        p.criteria_ranks.includes(c.rank) ? 'true' : 'false'
      ),
    ];
    return cells.map((cell) => escapeCsvField(String(cell))).join(',');
  });

  return [headerLine, ...rows].join('\n');
}

/** Turn created_at (ISO string) into a filename-safe segment. */
function formatCreatedAtForFilename(createdAt: string): string {
  try {
    const date = new Date(createdAt);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d}-${h}-${min}`; 
  } catch {
    return createdAt.replace(/[:.]/g, '-').slice(0, 19);
  }
}

/** Sanitize a string for use in a filename (remove or replace unsafe chars). */
function sanitizeFilenameSegment(s: string, maxLength = 40): string {
  const trimmed = s.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').trim();
  return trimmed.slice(0, maxLength) || 'digest';
}

/**
 * Build a CSV from digest peptide data and trigger a download.
 * Uses a Blob + object URL + temporary <a download>; no server round-trip.
 */
export function downloadDigestCsv(
  peptidesResponse: DigestPeptidesResponse,
  digestResponse: DigestResponse | null
): void {
  // TODO: remove console log
  console.log('peptidesResponse', peptidesResponse);
  const csv = buildCsv(peptidesResponse);

  const proteinName = digestResponse?.protein_name
    ? sanitizeFilenameSegment(digestResponse.protein_name)
    : 'digest';

  const dateSegment = digestResponse?.created_at
    ? formatCreatedAtForFilename(digestResponse.created_at)
    : peptidesResponse.digest_id.slice(0, 8);
  const filename = `${proteinName}-${dateSegment}.csv`;

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}