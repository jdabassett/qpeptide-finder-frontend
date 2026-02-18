/**
 * Extract a human-readable error message from a FastAPI error response body.
 * Handles both string and array formats for the `detail` field.
 */
export function parseErrorDetail(body: any, fallback: string): string {
  if (!body?.detail) return fallback;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    return body.detail.map((e: any) => e.msg).join('; ');
  }
  return fallback;
}