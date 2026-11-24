'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AboutPanel } from '@/components/admin/panel-about';
import { BannerPanel } from '@/components/admin/panel-banner';
import { BookingPanel } from '@/components/admin/panel-booking';
import { HomePanel } from '@/components/admin/panel-home';
import { TestimonialsPanel } from '@/components/admin/panel-testimonials';
import { TAB_OF_SECTION, type Recipe } from '@/components/admin/types';
import { issuesToFieldErrors, siteContentSchema, type SiteContent } from '@/lib/cms-schema';
import type { StorageStatus } from '@/lib/cms-storage';

const TABS = [
  { label: 'Banner & Popup', Panel: BannerPanel },
  { label: 'Home Page', Panel: HomePanel },
  { label: 'Testimonials', Panel: TestimonialsPanel },
  { label: 'About & FAQ', Panel: AboutPanel },
  { label: 'Booking & Contact', Panel: BookingPanel },
] as const;

interface Toast {
  id: number;
  kind: 'success' | 'error';
  message: string;
  liveLink?: boolean;
}

type Busy = 'idle' | 'save' | 'reset' | 'logout';

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AdminEditor({
  initialContent,
  updatedAt,
  storage,
}: {
  initialContent: SiteContent;
  updatedAt: string | null;
  storage: StorageStatus;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<SiteContent>(initialContent);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initialContent));
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState<Busy>('idle');
  const [lastSaved, setLastSaved] = useState<string | null>(updatedAt);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const resetTitle = useId();
  const nextToast = useRef(1);

  const dirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);
  const validation = useMemo(() => siteContentSchema.safeParse(draft), [draft]);
  const errors = useMemo(
    () => ({ ...serverErrors, ...(validation.success ? {} : issuesToFieldErrors(validation.error.issues)) }),
    [serverErrors, validation],
  );
  const errorCount = Object.keys(errors).length;

  const errorsByTab = useMemo(() => {
    const counts = TABS.map(() => 0);
    for (const path of Object.keys(errors)) {
      const index = TAB_OF_SECTION[path.split('.')[0]];
      if (index !== undefined) counts[index] += 1;
    }
    return counts;
  }, [errors]);

  const update = useCallback((recipe: Recipe) => {
    setServerErrors({});
    setDraft((current) => {
      const next = structuredClone(current);
      recipe(next);
      return next;
    });
  }, []);

  const toast = useCallback((kind: Toast['kind'], message: string, liveLink = false) => {
    const id = nextToast.current++;
    setToasts((current) => [...current, { id, kind, message, liveLink }]);
    window.setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), kind === 'success' ? 8000 : 12000);
  }, []);

  const goToLogin = useCallback(() => {
    router.replace('/admin/login');
    router.refresh();
  }, [router]);

  const apply = (content: SiteContent, savedAt: string) => {
    setDraft(content);
    setBaseline(JSON.stringify(content));
    setLastSaved(savedAt);
    setServerErrors({});
  };

  async function request(method: 'PUT' | 'DELETE') {
    const response = await fetch('/api/admin/content', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'PUT' ? JSON.stringify(draft) : undefined,
    });
    const body = (await response.json().catch(() => ({}))) as {
      ok?: boolean;
      error?: string;
      message?: string;
      content?: SiteContent;
      updatedAt?: string;
      fieldErrors?: Record<string, string>;
    };
    return { response, body };
  }

  function failure(response: Response, body: { error?: string; message?: string; fieldErrors?: Record<string, string> }) {
    if (response.status === 401) {
      toast('error', 'Your session has ended. Please sign in again; your edits on this page are not lost until you leave it.');
      goToLogin();
    } else if (response.status === 422) {
      setServerErrors(body.fieldErrors ?? {});
      toast('error', 'Some fields need attention before this can be published. They are highlighted.');
    } else if (body.error === 'storage_not_configured' || body.error === 'storage_failed') {
      toast('error', body.message ?? 'The changes could not be saved.');
    } else {
      toast('error', 'Something went wrong and the changes were not published. Please try again.');
    }
  }

  async function save() {
    if (busy !== 'idle' || !dirty || !storage.writable) return;
    if (!validation.success) {
      const first = errorsByTab.findIndex((count) => count > 0);
      if (first >= 0) setTab(first);
      toast('error', `Please fix the ${errorCount} highlighted ${errorCount === 1 ? 'field' : 'fields'} before publishing.`);
      return;
    }
    setBusy('save');
    try {
      const { response, body } = await request('PUT');
      if (response.ok && body.ok && body.content && body.updatedAt) {
        apply(body.content, body.updatedAt);
        toast('success', 'Changes saved & published live!', true);
      } else {
        failure(response, body);
      }
    } catch {
      toast('error', 'Couldn’t reach the server. Check your connection and try again.');
    } finally {
      setBusy('idle');
    }
  }

  async function reset() {
    resetDialog.current?.close();
    setBusy('reset');
    try {
      const { response, body } = await request('DELETE');
      if (response.ok && body.ok && body.content && body.updatedAt) {
        apply(body.content, body.updatedAt);
        toast('success', 'Everything is back to the original text, and it is live.', true);
      } else {
        failure(response, body);
      }
    } catch {
      toast('error', 'Couldn’t reach the server. Nothing was changed.');
    } finally {
      setBusy('idle');
    }
  }

  async function logout() {
    setBusy('logout');
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      goToLogin();
    }
  }

  // Ctrl/Cmd+S publishes. Registered every render so it always sees the latest draft.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Leaving with unpublished edits asks first.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TABS.length - 1;
    const target =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1) : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? last : null;
    if (target === null) return;
    event.preventDefault();
    setTab(target);
    document.getElementById(`admin-tab-${target}`)?.focus();
  };

  const Active = TABS[tab].Panel;
  const canSave = dirty && busy === 'idle' && storage.writable;

  return (
    <div className="a-shell">
      <header className="a-top">
        <div className="a-top__inner">
          <p className="a-brand">
            <span className="a-brand__name">Site editor</span>
            <span className="a-brand__for">Mariam Kaldas</span>
          </p>
          <div className="a-top__actions">
            <span className={`a-chip${storage.writable ? ' a-chip--ok' : ' a-chip--warn'}`} title={storage.detail}>
              Storage: {storage.label}
            </span>
            <a className="a-btn a-btn--onnavy" href="/" target="_blank" rel="noopener noreferrer">
              View live site <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" className="a-btn a-btn--onnavy" onClick={logout} disabled={busy === 'logout'}>
              Log out
            </button>
          </div>
        </div>
        <div className="a-tabs-wrap">
          <div role="tablist" aria-label="Sections of the site" className="a-tabs">
            {TABS.map((item, index) => (
              <button
                key={item.label}
                id={`admin-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={tab === index}
                aria-controls={`admin-panel-${index}`}
                tabIndex={tab === index ? 0 : -1}
                className="a-tab"
                onClick={() => setTab(index)}
                onKeyDown={(event) => onTabKey(event, index)}
              >
                {item.label}
                {errorsByTab[index] > 0 ? (
                  <span className="a-tab__errors">
                    {errorsByTab[index]}
                    <span className="sr-only"> {errorsByTab[index] === 1 ? 'field needs' : 'fields need'} attention</span>
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="admin-main" className="a-main">
        <h1 className="sr-only">Site editor: {TABS[tab].label}</h1>
        {!storage.writable ? (
          <div className="a-callout" role="note">
            <p className="a-callout__title">Saving is switched off</p>
            <p>{storage.detail}</p>
          </div>
        ) : null}
        <div id={`admin-panel-${tab}`} role="tabpanel" aria-labelledby={`admin-tab-${tab}`} tabIndex={-1}>
          <Active content={draft} update={update} errors={errors} />
        </div>
      </main>

      <div className="a-savebar" role="region" aria-label="Publish changes">
        <div className="a-savebar__inner">
          <p className="a-savebar__status" aria-live="polite">
            {dirty ? (
              <>
                <span className="a-dot a-dot--dirty" aria-hidden="true" />
                You have changes that aren’t live yet
                {errorCount > 0 ? ` · ${errorCount} to fix` : ''}
              </>
            ) : (
              <>
                <span className="a-dot" aria-hidden="true" />
                {lastSaved ? (
                  <>
                    Everything is live · last published{' '}
                    <time dateTime={lastSaved} suppressHydrationWarning>
                      {formatTime(lastSaved)}
                    </time>
                  </>
                ) : (
                  'Everything is live · no edits published yet'
                )}
              </>
            )}
          </p>
          <div className="a-savebar__actions">
            <button type="button" className="a-btn a-btn--reset" onClick={() => resetDialog.current?.showModal()} disabled={busy !== 'idle' || !storage.writable}>
              Reset to Defaults
            </button>
            <button type="button" className="a-btn a-btn--save" onClick={save} disabled={!canSave}>
              {busy === 'save' ? 'Publishing…' : 'Save & Publish Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="a-toasts" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`a-toast a-toast--${item.kind}`} role={item.kind === 'error' ? 'alert' : 'status'}>
            <p>{item.message}</p>
            {item.liveLink ? (
              <a href="/" target="_blank" rel="noopener noreferrer" className="a-toast__link">
                View live site <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : null}
            <button type="button" className="a-toast__close" aria-label="Dismiss message" onClick={() => setToasts((c) => c.filter((t) => t.id !== item.id))}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        ))}
      </div>

      <dialog ref={resetDialog} className="a-dialog" aria-labelledby={resetTitle}>
        <h2 id={resetTitle} className="a-dialog__title">
          Reset everything to the original text?
        </h2>
        <p>
          This replaces <strong>all</strong> of your edits (banner, popup, headline, testimonials, FAQ, contact details,
          everything) with the original copy, and the live site changes straight away. This can’t be undone.
        </p>
        <div className="a-dialog__actions">
          <button type="button" className="a-btn a-btn--ghost" onClick={() => resetDialog.current?.close()}>
            Cancel, keep my edits
          </button>
          <button type="button" className="a-btn a-btn--danger is-armed" onClick={reset}>
            Yes, reset everything
          </button>
        </div>
      </dialog>
    </div>
  );
}
