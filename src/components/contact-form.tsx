'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSiteSettings } from '@/components/site-settings-provider';
import { track } from '@/lib/analytics';
import { TOPICS, TOPIC_LABELS } from '@/lib/contact-topics';

type State =
  | { status: 'idle' }
  | { status: 'sending' }
  | { status: 'sent' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string> };

/** Inquiry fallback: posts to /api/contact (validated, rate-limited, honeypot-protected, delivered by email). */
export function ContactForm() {
  const { email: contactEmail } = useSiteSettings();
  const genericError = `That didn’t send. Check the details, or write to ${contactEmail} directly.`;
  const [state, setState] = useState<State>({ status: 'idle' });
  const startedAt = useRef(0);

  // Recorded after mount (not during render) so the server can reject instant, scripted submissions.
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const topic = String(data.get('topic') ?? '');
    setState({ status: 'sending' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.get('name') ?? ''),
          email: String(data.get('email') ?? ''),
          topic,
          message: String(data.get('message') ?? ''),
          company: String(data.get('company') ?? ''),
          startedAt: startedAt.current,
        }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (response.ok && result.ok) {
        form.reset();
        setState({ status: 'sent' });
        track('contact_submit', { topic });
      } else if (result.error === 'validation') {
        setState({ status: 'error', message: 'Please fix the highlighted fields.', fieldErrors: result.fieldErrors });
      } else if (response.status === 429) {
        setState({
          status: 'error',
          message: `You’ve sent a few messages in a short time. Please wait a few minutes, or email ${contactEmail} directly.`,
        });
      } else if (response.status === 503) {
        setState({
          status: 'error',
          message: `The message form isn’t available right now. Please write to ${contactEmail} directly.`,
        });
      } else {
        setState({ status: 'error', message: genericError });
      }
    } catch {
      setState({ status: 'error', message: genericError });
    }
  }

  const errors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};
  const sending = state.status === 'sending';

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby="contact-status">
      <div className="field">
        <label htmlFor="cf-name">Your name</label>
        <input
          id="cf-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={100}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'cf-name-error' : undefined}
        />
        {errors.name ? (
          <p id="cf-name-error" className="field-error">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="cf-email">Your email</label>
        <input
          id="cf-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'cf-email-error' : undefined}
        />
        {errors.email ? (
          <p id="cf-email-error" className="field-error">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="cf-topic">What’s this about?</label>
        <select id="cf-topic" name="topic" defaultValue="coaching" aria-invalid={Boolean(errors.topic)}>
          {TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {TOPIC_LABELS[topic]}
            </option>
          ))}
        </select>
        {errors.topic ? <p className="field-error">{errors.topic}</p> : null}
      </div>

      <div className="field">
        <label htmlFor="cf-message">Your message</label>
        <textarea
          id="cf-message"
          name="message"
          required
          maxLength={5000}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? 'cf-message-error' : undefined}
        />
        {errors.message ? (
          <p id="cf-message-error" className="field-error">
            {errors.message}
          </p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="cf-company">Company</label>
        <input id="cf-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-quiet" disabled={sending}>
          {sending ? 'Sending…' : 'Send message'}
        </button>
        <p id="contact-status" role="status" className="m-0 text-[1.0625rem]">
          {state.status === 'sent' ? 'Sent. I read every message and will reply personally.' : null}
          {state.status === 'error' ? <span className="text-brick">{state.message}</span> : null}
        </p>
      </div>
    </form>
  );
}
