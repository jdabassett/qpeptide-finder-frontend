/**
 * Extract a human-readable error message from a FastAPI error response body.
 * Handles both string and array formats for the `detail` field.
 */
interface FastAPIValidationItem {
  msg?: string;
}
interface FastAPIErrorBody {
  detail?: string | FastAPIValidationItem[];
}
export function parseErrorDetail(body: FastAPIErrorBody | null | undefined, fallback: string): string {
  if (!body?.detail) return fallback;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    const messages = body.detail.map((e) => {
      const msg = e.msg ?? '';
      return msg.startsWith('Value error, ') ? msg.slice(12) : msg;
    });
    return messages.join('; ');
  }
  return fallback;
}