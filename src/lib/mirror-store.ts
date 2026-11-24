import { useSyncExternalStore } from 'react';
import { clearSelection, readSelection, sanitizeIndices, saveSelection } from '@/lib/mirror-state';

// A tiny external store over sessionStorage so every client component (the Mirror, the booking panel, the
// booking dialog) sees the same selection without prop drilling, and hydration never mismatches
// (the server snapshot is always "nothing selected").

const EMPTY: readonly number[] = Object.freeze([]);
let current: readonly number[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function getSnapshot(): readonly number[] {
  if (!loaded && typeof window !== 'undefined') {
    current = readSelection();
    loaded = true;
  }
  return current;
}

function getServerSnapshot(): readonly number[] {
  return EMPTY;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setMirrorSelection(next: readonly number[]): void {
  current = sanitizeIndices([...next]);
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

export function useMirrorSelection(): readonly number[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
