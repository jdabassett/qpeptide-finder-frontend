/**
 * Parse an ISO 8601 date string (e.g. from the API) and format it in the user's
 * local timezone. Use for table display or filename-safe segments.
 *
 * @param iso - ISO date string (e.g. "2026-02-26T12:56:00Z" or with offset)
 * @param format - 'display' for UI (locale short date/time), 'filename' for download filenames
 * @returns Formatted string in local time, or the original string if parsing fails
 */

/**
 * If the string looks like an ISO 8601 datetime with no timezone (e.g. from API),
 * append 'Z' so it is parsed as UTC and then converts correctly to local time.
 */
function parseAsUtcIfNeeded(iso: string): string {
  const trimmed = iso.trim();
  // Match YYYY-MM-DDTHH:mm:ss or YYYY-MM-DDTHH:mm:ss.sss, no Z or ±offset
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/i.test(trimmed)) {
    return trimmed + 'Z';
  }
  return trimmed;
}

export function formatDigestDate(iso: string, format: 'display' | 'filename'): string {
  try {
    const d = new Date(parseAsUtcIfNeeded(iso));
    if (Number.isNaN(d.getTime())) return iso;

    if (format === 'display') {
      return d.toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });
    }

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}-${h}-${min}`;
  } catch {
    return format === 'filename'
      ? iso.replace(/[:.]/g, '-').slice(0, 19)
      : iso;
  }
}