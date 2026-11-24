'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { PromptRef } from '@/lib/mirror-state';

/** The few editable values that client components need (booking embed, contact form, Mirror prefill). */
export interface SiteSettingsValue {
  calendlyUrl: string;
  email: string;
  phone: string;
  phoneTel: string;
  prompts: PromptRef[];
}

const SiteSettingsContext = createContext<SiteSettingsValue | null>(null);

export function SiteSettingsProvider({ value, children }: { value: SiteSettingsValue; children: ReactNode }) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings(): SiteSettingsValue {
  const value = useContext(SiteSettingsContext);
  if (!value) throw new Error('useSiteSettings must be used inside <SiteSettingsProvider> (see SiteChrome).');
  return value;
}
