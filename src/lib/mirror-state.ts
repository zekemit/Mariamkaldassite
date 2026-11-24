import { mirrorStatements } from '@/content/mirror';

// The Mirror stores which statements a visitor tapped. It lives in sessionStorage (cleared when the tab
// closes) and travels to /book as indices only (?m=0,3), never as text, so nothing personal is logged in a URL.

const KEY = 'mk:mirror:v1';

export function sanitizeIndices(input: unknown, max: number = mirrorStatements.length): number[] {
  if (!Array.isArray(input)) return [];
  const out = new Set<number>();
  for (const value of input) {
    const n = typeof value === 'number' ? value : Number(value);
    if (Number.isInteger(n) && n >= 0 && n < max) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

/** Parses "?m=0,3" into valid indices; null when the parameter is absent. */
export function parseQuery(search: string): number[] | null {
  const raw = new URLSearchParams(search).get('m');
  if (raw === null) return null;
  return sanitizeIndices(raw.split(',').filter((part) => part.trim() !== ''));
}

export function toQuery(indices: readonly number[]): string {
  const valid = sanitizeIndices([...indices]);
  return valid.length ? `m=${valid.join(',')}` : '';
}

export function bookHref(indices: readonly number[]): string {
  const query = toQuery(indices);
  return query ? `/book?${query}` : '/book';
}

export function readSelection(): number[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return sanitizeIndices(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

export function saveSelection(indices: readonly number[]): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(sanitizeIndices([...indices])));
  } catch {
    // Storage can be unavailable (private mode, blocked). The Mirror still works; it just won't carry over.
  }
}

export function clearSelection(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
