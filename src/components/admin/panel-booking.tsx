'use client';

import { Section, TextInput } from '@/components/admin/fields';
import type { PanelProps } from '@/components/admin/types';

export function BookingPanel({ content, update, errors }: PanelProps) {
  const s = content.settings;
  return (
    <div className="a-stack a-stack--lg">
      <Section
        title="Booking"
        intro="Every “Book a session” button and the scheduler on the booking page use this one link."
      >
        <TextInput
          label="Calendly link"
          type="url"
          inputMode="url"
          value={s.calendlyUrl}
          placeholder="https://calendly.com/your-name/event"
          hint="Open your Calendly event and copy its address. It starts with https://calendly.com/"
          error={errors['settings.calendlyUrl']}
          onChange={(v) => update((d) => void (d.settings.calendlyUrl = v))}
        />
        {s.calendlyUrl && !errors['settings.calendlyUrl'] ? (
          <p className="a-known">
            <a className="a-linkbtn" href={s.calendlyUrl} target="_blank" rel="noopener noreferrer">
              Test this link in a new tab
            </a>
          </p>
        ) : null}
      </Section>

      <Section title="Contact details" intro="Shown in the footer, on the booking page, in the FAQ, and in search-engine data.">
        <div className="a-grid-2">
          <TextInput
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="off"
            value={s.email}
            error={errors['settings.email']}
            onChange={(v) => update((d) => void (d.settings.email = v))}
          />
          <TextInput
            label="Phone number"
            type="tel"
            inputMode="tel"
            value={s.phone}
            placeholder="(843) 936-1601"
            error={errors['settings.phone']}
            onChange={(v) => update((d) => void (d.settings.phone = v))}
          />
        </div>
        <TextInput
          label="Location line"
          value={s.location}
          maxLength={100}
          placeholder="Charleston, SC & Worldwide via Zoom"
          error={errors['settings.location']}
          onChange={(v) => update((d) => void (d.settings.location = v))}
        />
        <p className="a-hint">
          Messages from the contact form are delivered to the address set in the site’s hosting settings
          (CONTACT_TO_EMAIL), not to the address above.
        </p>
      </Section>

      <Section title="Social profiles" intro="Leave a box empty to hide that link. Use the full address of your profile.">
        <TextInput
          label="LinkedIn"
          type="url"
          inputMode="url"
          value={s.linkedin}
          placeholder="https://www.linkedin.com/in/…"
          error={errors['settings.linkedin']}
          onChange={(v) => update((d) => void (d.settings.linkedin = v))}
        />
        <TextInput
          label="Instagram"
          type="url"
          inputMode="url"
          value={s.instagram}
          placeholder="https://www.instagram.com/…"
          error={errors['settings.instagram']}
          onChange={(v) => update((d) => void (d.settings.instagram = v))}
        />
        <TextInput
          label="Facebook"
          type="url"
          inputMode="url"
          value={s.facebook}
          placeholder="https://www.facebook.com/…"
          error={errors['settings.facebook']}
          onChange={(v) => update((d) => void (d.settings.facebook = v))}
        />
      </Section>
    </div>
  );
}
