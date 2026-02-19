// Convert DRF-style error response to readable message
export function prettifyApiError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  // Try parse JSON string like: {"job_url":["Enter a valid URL."]}
  try {
    const obj = JSON.parse(msg);
    if (obj && typeof obj === "object") {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) {
          parts.push(`${k}: ${v.join(", ")}`);
        } else if (typeof v === "string") {
          parts.push(`${k}: ${v}`);
        } else {
          parts.push(`${k}: ${JSON.stringify(v)}`);
        }
      }
      if (parts.length) return parts.join(" | ");
    }
  } catch {
    // not json
  }

  // Fallback
  return msg || "Something went wrong";
}
