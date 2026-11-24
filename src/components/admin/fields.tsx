'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

// Form building blocks for the admin editor. Every control has a real <label>, shows its error text right under it
// (linked with aria-describedby), and never relies on colour alone.

interface BaseProps {
  label: string;
  hint?: ReactNode;
  error?: string;
}

function describedBy(id: string, hint: unknown, error: unknown): string | undefined {
  const ids = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
  return ids || undefined;
}

function FieldShell({ id, label, hint, error, children }: BaseProps & { id: string; children: ReactNode }) {
  return (
    <div className={`a-field${error ? ' has-error' : ''}`}>
      <label htmlFor={id} className="a-label">
        {label}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="a-hint">
          {hint}
        </p>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="a-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  maxLength,
  type = 'text',
  inputMode,
  autoComplete,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  type?: 'text' | 'email' | 'tel' | 'url';
  inputMode?: 'text' | 'email' | 'tel' | 'url';
  autoComplete?: string;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className="a-input"
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete ?? 'off'}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        spellCheck={type === 'text'}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder,
  textareaRef,
  footer,
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  footer?: ReactNode;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <textarea
        id={id}
        ref={textareaRef}
        className="a-input a-textarea"
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {footer}
    </FieldShell>
  );
}

/** An on/off switch with a visible "On"/"Off" word, so the state never depends on colour. */
export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="a-toggle">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="a-switch"
        onClick={() => onChange(!checked)}
      >
        <span className="a-switch__track" aria-hidden="true">
          <span className="a-switch__knob" />
        </span>
        <span className="a-switch__text">
          <span className="a-label">{label}</span>
          <span className="a-switch__state">{checked ? 'On' : 'Off'}</span>
        </span>
      </button>
      {hint ? (
        <p id={`${id}-hint`} className="a-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function RadioGroup<T extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="a-fieldset">
      <legend className="a-label">{label}</legend>
      {hint ? <p className="a-hint">{hint}</p> : null}
      <div className="a-radios">
        {options.map((option) => (
          <label key={option.value} className="a-radio">
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export interface KnownImage {
  label: string;
  src: string;
}

/**
 * An image is a plain address (no uploading): a site path like /images/mariam-hero.jpg or a full https:// link.
 * The thumbnail below the box updates as you type, so a wrong address is obvious before publishing.
 */
export function ImageField({
  label,
  hint,
  error,
  value,
  onChange,
  known = [],
  placeholder = '/images/… or https://…',
}: BaseProps & { value: string; onChange: (value: string) => void; known?: KnownImage[]; placeholder?: string }) {
  const id = useId();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = value.trim();
  const showPreview = src !== '' && !error;
  const failed = failedSrc === src;

  return (
    <FieldShell id={id} label={label} hint={hint} error={error}>
      <input
        id={id}
        className="a-input"
        type="text"
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {known.length > 0 ? (
        <p className="a-known">
          Use a site image:{' '}
          {known.map((image) => (
            <button key={image.src} type="button" className="a-linkbtn" onClick={() => onChange(image.src)}>
              {image.label}
            </button>
          ))}
        </p>
      ) : null}
      {showPreview ? (
        <div className="a-preview">
          {failed ? (
            <p className="a-preview__fail">This address didn’t load as an image. Check the spelling, or try another.</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary editor-supplied address
            <img src={src} alt="Preview" referrerPolicy="no-referrer" onError={() => setFailedSrc(src)} onLoad={() => setFailedSrc(null)} />
          )}
        </div>
      ) : null}
    </FieldShell>
  );
}

/** Pick any number of tags from a fixed list. */
export function TagPicker<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: {
  label: string;
  hint?: ReactNode;
  options: readonly T[];
  value: readonly T[];
  onChange: (value: T[]) => void;
}) {
  return (
    <fieldset className="a-fieldset">
      <legend className="a-label">{label}</legend>
      {hint ? <p className="a-hint">{hint}</p> : null}
      <div className="a-tags">
        {options.map((option) => {
          const checked = value.includes(option);
          return (
            <label key={option} className={`a-tag${checked ? ' is-on' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(checked ? value.filter((v) => v !== option) : options.filter((o) => o === option || value.includes(o)))}
              />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Delete needs a second, deliberate click; it disarms itself after a few seconds. */
export function DeleteButton({ onConfirm, label = 'Delete', what }: { onConfirm: () => void; label?: string; what: string }) {
  const [armed, setArmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={`a-btn a-btn--danger${armed ? ' is-armed' : ''}`}
      onClick={() => {
        if (armed) {
          window.clearTimeout(timer.current);
          setArmed(false);
          onConfirm();
        } else {
          setArmed(true);
          timer.current = window.setTimeout(() => setArmed(false), 4000);
        }
      }}
    >
      {armed ? 'Click again to delete' : label}
      <span className="sr-only"> ({what})</span>
    </button>
  );
}

export function Section({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="a-card">
      <h2 id={id} className="a-card__title">
        {title}
      </h2>
      {intro ? <p className="a-card__intro">{intro}</p> : null}
      <div className="a-stack">{children}</div>
    </section>
  );
}
