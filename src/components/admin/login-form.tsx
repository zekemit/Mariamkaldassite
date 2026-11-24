'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';

type State = { kind: 'idle' } | { kind: 'busy' } | { kind: 'error'; message: string };

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [state, setState] = useState<State>({ kind: 'idle' });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === 'busy' || password === '') return;
    setState({ kind: 'busy' });
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; retryAfter?: number };
      if (response.ok && body.ok) {
        router.replace('/admin');
        router.refresh();
        return;
      }
      if (response.status === 429) {
        const minutes = Math.max(1, Math.ceil((body.retryAfter ?? 900) / 60));
        setState({ kind: 'error', message: `Too many attempts. Please wait about ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} and try again.` });
      } else if (body.error === 'not_configured') {
        setState({ kind: 'error', message: 'The editor hasn’t been switched on yet (no admin password is set).' });
      } else if (response.status === 401) {
        setState({ kind: 'error', message: 'That password didn’t match. Please check it and try again.' });
      } else {
        setState({ kind: 'error', message: 'Something went wrong. Please try again in a moment.' });
      }
    } catch {
      setState({ kind: 'error', message: 'Couldn’t reach the server. Check your connection and try again.' });
    }
  }

  const error = state.kind === 'error' ? state.message : null;

  return (
    <form onSubmit={onSubmit} className="a-login__form" noValidate>
      <div className={`a-field${error ? ' has-error' : ''}`}>
        <label htmlFor={inputId} className="a-label">
          Password
        </label>
        <input
          id={inputId}
          className="a-input"
          type={reveal ? 'text' : 'password'}
          name="password"
          autoComplete="current-password"
          autoFocus
          required
          disabled={!configured}
          value={password}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => setPassword(event.target.value)}
        />
        {error ? (
          <p id={errorId} className="a-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <label className="a-check">
        <input type="checkbox" checked={reveal} onChange={(event) => setReveal(event.target.checked)} />
        <span>Show the password</span>
      </label>
      <button type="submit" className="a-btn a-btn--save a-btn--block" disabled={!configured || state.kind === 'busy' || password === ''}>
        {state.kind === 'busy' ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
