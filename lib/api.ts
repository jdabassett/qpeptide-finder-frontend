/**
 * Extract a human-readable error message from a FastAPI error response body.
 * Handles both string and array formats for the `detail` field.
 */
export function parseErrorDetail(body: any, fallback: string): string {
  if (!body?.detail) return fallback;
  if (typeof body.detail === 'string') return body.detail;
  if (Array.isArray(body.detail)) {
    const messages = body.detail.map((e: any) => {
      const msg = e.msg ?? '';
      return msg.startsWith('Value error, ') ? msg.slice(12) : msg;
    });
    return messages.join('; ');
  }
  return fallback;
}