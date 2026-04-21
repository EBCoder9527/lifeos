/**
 * Data normalization utilities.
 * Guard against null / undefined / wrong types from old data or storage corruption.
 */

/** Normalize a tags field into a clean string[] */
export function normalizeTags(raw: unknown): string[] {
  if (!raw) return []
  if (typeof raw === 'string') return raw ? [raw.trim()] : []
  if (Array.isArray(raw)) return raw.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim())
  return []
}

/** Deduplicate tags (case-insensitive, whitespace-trimmed) */
export function deduplicateTags(tags: string[]): string[] {
  const seen = new Set<string>()
  return tags.filter((t) => {
    const key = t.toLowerCase().trim()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Ensure a string field, returning fallback if null/undefined */
export function ensureString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

/** Ensure a number field */
export function ensureNumber(v: unknown, fallback = 0): number {
  return typeof v === 'number' && !Number.isNaN(v) ? v : fallback
}

/** Ensure a date string field is in YYYY-MM-DD format */
export function ensureDateStr(v: unknown, fallback?: string): string {
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  return fallback ?? new Date().toISOString().slice(0, 10)
}
