// The Mirror stores which statements a visitor tapped, by each statement's stable id (not its position), so editing,
// reordering or deleting statements at /admin can never make a stored selection or an old link point at the wrong
// text. The selection lives in sessionStorage (cleared when the tab closes) and travels to /book as ids only
// (?m=deadlines,talent), never as text, so nothing personal is logged in a URL.

const KEY = 'mk:mirror:v2';
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,39}$/;
export const MAX_SELECTED = 12;

export interface PromptRef {
  id: string;
  text: string;
}

/** Keeps unique, well-formed ids in the order given; when `valid` is supplied, drops ids that no longer exist. */
export function sanitizeIds(input: unknown, valid?: readonly string[]): string[] {
  if (!Array.isArray(input)) return [];
  const allowed = valid ? new Set(valid) : null;
  const out: string[] = [];
  for (const value of input) {
    if (typeof value !== 'string' || !ID_PATTERN.test(value) || out.includes(value)) continue;
    if (allowed && !allowed.has(value)) continue;
    out.push(value);
    if (out.length >= MAX_SELECTED) break;
  }
  return out;
}

/** Parses "?m=deadlines,talent" into well-formed ids; null when the parameter is absent. */
export function parseQuery(search: string): string[] | null {
  const raw = new URLSearchParams(search).get('m');
  if (raw === null) return null;
  return sanitizeIds(raw.split(',').map((part) => part.trim()).filter(Boolean));
}

export function toQuery(ids: readonly string[]): string {
  const valid = sanitizeIds([...ids]);
  return valid.length ? `m=${valid.join(',')}` : '';
}

export function bookHref(ids: readonly string[]): string {
  const query = toQuery(ids);
  return query ? `/book?${query}` : '/book';
}

/** The prompts a selection refers to, in the order they appear on the page; ids that no longer exist are dropped. */
export function resolveSelection<T extends PromptRef>(ids: readonly string[], prompts: readonly T[]): T[] {
  const chosen = new Set(ids);
  return prompts.filter((prompt) => chosen.has(prompt.id));
}

export function readSelection(): string[] {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return sanitizeIds(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

export function saveSelection(ids: readonly string[]): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(sanitizeIds([...ids])));
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
