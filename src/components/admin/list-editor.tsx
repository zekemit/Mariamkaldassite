'use client';

import { useState, type ReactNode } from 'react';
import { DeleteButton } from '@/components/admin/fields';

export interface ListEditorProps<T extends { id?: string }> {
  items: readonly T[];
  /** Short name for one item in buttons and labels, e.g. "testimonial". */
  noun: string;
  /** The collapsed card's headline and optional detail line. */
  title: (item: T, index: number) => string;
  summary?: (item: T, index: number) => ReactNode;
  badge?: (item: T) => string | null;
  renderFields: (item: T, index: number) => ReactNode;
  onMove: (from: number, to: number) => void;
  /** Omit to make the list a fixed size (no Add / Delete). */
  onAdd?: () => string | void;
  onRemove?: (index: number) => void;
  addLabel?: string;
  /** Item indexes that currently have a validation error, so their cards open and are marked. */
  errorIndexes?: ReadonlySet<number>;
  /** Start with every card open (short lists). */
  defaultOpen?: boolean;
  minItems?: number;
  maxItems?: number;
}

/**
 * A reorderable list of editable cards: Move up / Move down / Delete / Add. Cards start collapsed to a one-line
 * summary (long lists stay scannable) and the one you just added opens for you.
 */
export function ListEditor<T extends { id?: string }>({
  items,
  noun,
  title,
  summary,
  badge,
  renderFields,
  onMove,
  onAdd,
  onRemove,
  addLabel,
  errorIndexes,
  defaultOpen = false,
  minItems = 0,
  maxItems = Infinity,
}: ListEditorProps<T>) {
  const [openKeys, setOpenKeys] = useState<Set<string>>(new Set());
  const keyOf = (item: T, index: number) => item.id ?? String(index);

  const toggle = (key: string) =>
    setOpenKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const canAdd = Boolean(onAdd) && items.length < maxItems;
  const canRemove = Boolean(onRemove) && items.length > minItems;

  return (
    <div className="a-list">
      <ol className="a-list__items">
        {items.map((item, index) => {
          const key = keyOf(item, index);
          const hasError = errorIndexes?.has(index) ?? false;
          const open = defaultOpen || openKeys.has(key) || hasError;
          const headline = title(item, index).trim() || `Untitled ${noun}`;
          const panelId = `list-${noun}-${key}`;
          const tag = badge?.(item);
          return (
            <li key={key} className={`a-item${hasError ? ' has-error' : ''}`}>
              <div className="a-item__head">
                <button
                  type="button"
                  className="a-item__toggle"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => toggle(key)}
                  disabled={defaultOpen && !hasError}
                >
                  <span className="a-item__num" aria-hidden="true">
                    {index + 1}
                  </span>
                  <span className="a-item__titles">
                    <span className="a-item__title">{headline}</span>
                    {!open && summary ? <span className="a-item__summary">{summary(item, index)}</span> : null}
                  </span>
                  {tag ? <span className="a-badge">{tag}</span> : null}
                  {hasError ? <span className="a-badge a-badge--error">Needs attention</span> : null}
                </button>
                <div className="a-item__actions">
                  <button
                    type="button"
                    className="a-btn a-btn--ghost"
                    onClick={() => onMove(index, index - 1)}
                    disabled={index === 0}
                  >
                    Move up<span className="sr-only"> ({noun} {index + 1})</span>
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--ghost"
                    onClick={() => onMove(index, index + 1)}
                    disabled={index === items.length - 1}
                  >
                    Move down<span className="sr-only"> ({noun} {index + 1})</span>
                  </button>
                  {canRemove ? <DeleteButton what={`${noun} ${index + 1}`} onConfirm={() => onRemove?.(index)} /> : null}
                </div>
              </div>
              {open ? (
                <div id={panelId} className="a-item__body a-stack">
                  {renderFields(item, index)}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {canAdd ? (
        <button
          type="button"
          className="a-btn a-btn--add"
          onClick={() => {
            const newKey = onAdd?.();
            if (typeof newKey === 'string') setOpenKeys((current) => new Set(current).add(newKey));
          }}
        >
          + {addLabel ?? `Add a ${noun}`}
        </button>
      ) : null}
    </div>
  );
}

/** Immutable move helper for the editor's recipes. */
export function moveItem<T>(list: T[], from: number, to: number): void {
  if (to < 0 || to >= list.length || from === to) return;
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
}
