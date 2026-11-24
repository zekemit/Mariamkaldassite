'use client';

import { AnnouncementBar } from '@/components/announcement-bar';
import { ImageField, RadioGroup, Section, TextArea, TextInput, Toggle } from '@/components/admin/fields';
import { KNOWN_IMAGES, type PanelProps } from '@/components/admin/types';

export function BannerPanel({ content, update, errors }: PanelProps) {
  const { announcement: a, popup: p } = content;

  return (
    <div className="a-stack a-stack--lg">
      <Section
        title="Announcement banner"
        intro="A thin bar across the very top of every page. Good for a new opening, an event, or a short notice."
      >
        <Toggle
          label="Show the banner"
          checked={a.enabled}
          onChange={(v) => update((d) => void (d.announcement.enabled = v))}
          hint="Switch it off any time; your wording is kept."
        />
        <TextInput
          label="Banner text"
          value={a.text}
          maxLength={300}
          placeholder="Now booking complimentary chemistry sessions for spring"
          error={errors['announcement.text']}
          onChange={(v) => update((d) => void (d.announcement.text = v))}
        />
        <div className="a-grid-2">
          <TextInput
            label="Link label (optional)"
            value={a.linkLabel}
            maxLength={60}
            placeholder="Book a time"
            error={errors['announcement.linkLabel']}
            onChange={(v) => update((d) => void (d.announcement.linkLabel = v))}
          />
          <TextInput
            label="Link address (optional)"
            value={a.linkUrl}
            inputMode="url"
            placeholder="/book  or  https://…"
            hint="A page on this site such as /book, a full https:// link, mailto:you@example.com, or tel:+1…"
            error={errors['announcement.linkUrl']}
            onChange={(v) => update((d) => void (d.announcement.linkUrl = v))}
          />
        </div>
        {a.text.trim() ? (
          <div className="a-preview-box" aria-label="Banner preview">
            <p className="a-preview-box__label">Preview{a.enabled ? '' : ' (the banner is switched off)'}</p>
            <AnnouncementBar announcement={{ ...a, enabled: true }} />
          </div>
        ) : null}
      </Section>

      <Section
        title="Popup"
        intro="A small window that appears a couple of seconds after someone arrives. Use it sparingly; it never shows on the booking page."
      >
        <Toggle label="Show the popup" checked={p.enabled} onChange={(v) => update((d) => void (d.popup.enabled = v))} />
        <TextInput
          label="Headline"
          value={p.headline}
          maxLength={120}
          error={errors['popup.headline']}
          onChange={(v) => update((d) => void (d.popup.headline = v))}
        />
        <TextArea
          label="Message (optional)"
          value={p.body}
          rows={4}
          maxLength={600}
          error={errors['popup.body']}
          onChange={(v) => update((d) => void (d.popup.body = v))}
        />
        <ImageField
          label="Image (optional)"
          hint="Paste a site path like /images/mariam-about.jpg or a full https:// image link. Leave empty for no image."
          value={p.imageUrl}
          known={KNOWN_IMAGES}
          error={errors['popup.imageUrl']}
          onChange={(v) => update((d) => void (d.popup.imageUrl = v))}
        />
        {p.imageUrl ? (
          <TextInput
            label="Image description (for screen readers)"
            value={p.imageAlt}
            maxLength={160}
            placeholder="Mariam smiling at a stone table"
            error={errors['popup.imageAlt']}
            onChange={(v) => update((d) => void (d.popup.imageAlt = v))}
          />
        ) : null}
        <TextInput
          label="Button text (optional)"
          value={p.ctaLabel}
          maxLength={60}
          error={errors['popup.ctaLabel']}
          onChange={(v) => update((d) => void (d.popup.ctaLabel = v))}
        />
        <RadioGroup
          label="Where the button goes"
          value={p.ctaMode}
          options={[
            { value: 'booking', label: 'Open the booking page' },
            { value: 'url', label: 'Go to a link I choose' },
          ]}
          onChange={(v) => update((d) => void (d.popup.ctaMode = v))}
        />
        {p.ctaMode === 'url' ? (
          <TextInput
            label="Button link address"
            value={p.ctaUrl}
            inputMode="url"
            placeholder="https://…"
            error={errors['popup.ctaUrl']}
            onChange={(v) => update((d) => void (d.popup.ctaUrl = v))}
          />
        ) : null}
        <RadioGroup
          label="How often it appears"
          value={p.frequency}
          options={[
            { value: 'session', label: 'Once per session (then not again until they come back another day)' },
            { value: 'visit', label: 'Every visit (each time the site is opened or reloaded)' },
          ]}
          onChange={(v) => update((d) => void (d.popup.frequency = v))}
        />
        {p.headline.trim() ? (
          <div className="a-preview-box" aria-label="Popup preview">
            <p className="a-preview-box__label">Preview{p.enabled ? '' : ' (the popup is switched off)'}</p>
            <div className="a-popup-sample">
              <p className="display-3">{p.headline}</p>
              {p.body ? <p className="mt-3 whitespace-pre-line">{p.body}</p> : null}
              {p.ctaLabel ? <span className="btn-book mt-5">{p.ctaLabel}</span> : null}
            </div>
          </div>
        ) : null}
      </Section>
    </div>
  );
}
