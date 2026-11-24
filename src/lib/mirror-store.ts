import { useSyncExternalStore } from 'react';
import { clearSelection, readSelection, sanitizeIds, saveSelection } from '@/lib/mirror-state';

// A tiny external store over sessionStorage so every client component (the Mirror, the booking panel, the
// booking dialog) sees the same selection without prop drilling, and hydration never mismatches
// (the server snapshot is always "nothing selected").

const EMPTY: readonly string[] = Object.freeze([]);
let current: readonly string[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function getSnapshot(): readonly string[] {
  if (!loaded && typeof window !== 'undefined') {
    current = readSelection();
    loaded = true;
  }
  return current;
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setMirrorSelection(next: readonly string[]): void {
  current = sanitizeIds([...next]);
  loaded = true;
  saveSelection(current);
  emit();
}

export function clearMirrorSelection(): void {
  current = EMPTY;
  loaded = true;
  clearSelection();
  emit();
}

export function useMirrorSelection(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
