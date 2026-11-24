import { singleLine, type ContactData } from '@/lib/contact-schema';
import { TOPIC_LABELS } from '@/lib/contact-topics';

export type ProviderName = 'resend' | 'smtp' | 'dry-run' | 'none';

type Env = Record<string, string | undefined>;

/**
 * Resend when RESEND_API_KEY is set; otherwise Nodemailer over SMTP when SMTP_* is set.
 * With neither, development (and CONTACT_DRY_RUN=1) logs the message; production reports "not configured".
 */
export function selectProvider(env: Env, nodeEnv: string | undefined): ProviderName {
  if (env.RESEND_API_KEY) return 'resend';
  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) return 'smtp';
  if (env.CONTACT_DRY_RUN === '1' || nodeEnv !== 'production') return 'dry-run';
  return 'none';
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface OutgoingMessage {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}

export function buildMessage(
  data: Pick<ContactData, 'name' | 'email' | 'topic' | 'message'>,
  provider: ProviderName,
  env: Env,
  sentAt: Date = new Date(),
): OutgoingMessage {
  const to = env.CONTACT_TO_EMAIL || 'me@mariamkaldas.com';
  const from =
    env.CONTACT_FROM_EMAIL ||
    (provider === 'smtp' ? env.SMTP_FROM || env.SMTP_USER || to : 'Mariam Kaldas Website <onboarding@resend.dev>');
  const topic = TOPIC_LABELS[data.topic];
  const subject = singleLine(`[mariamkaldas.com] ${topic}: ${data.name}`).slice(0, 150);

  const text = [
    'New message from mariamkaldas.com',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Topic: ${topic}`,
    '',
    data.message,
    '',
    `Sent ${sentAt.toISOString()}. Reply to this email to answer ${data.name} directly.`,
  ].join('\n');

  const html = `<div style="font-family:system-ui,sans-serif;font-size:16px;line-height:1.55;color:#11263c">
<p><strong>New message from mariamkaldas.com</strong></p>
<p>Name: ${escapeHtml(data.name)}<br>Email: ${escapeHtml(data.email)}<br>Topic: ${escapeHtml(topic)}</p>
<p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
<p style="color:#555">Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
</div>`;

  return { from, to, replyTo: data.email, subject, text, html };
}

export type SendResult = { ok: true; provider: ProviderName } | { ok: false; reason: 'not-configured' | 'send-failed' };

export async function sendContactEmail(
  data: ContactData,
  env: Env = process.env,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): Promise<SendResult> {
  const provider = selectProvider(env, nodeEnv);
  if (provider === 'none') return { ok: false, reason: 'not-configured' };

  const message = buildMessage(data, provider, env);

  try {
    if (provider === 'dry-run') {
      console.info('[contact:dry-run]', JSON.stringify({ to: message.to, subject: message.subject }));
      return { ok: true, provider };
    }

    if (provider === 'resend') {
      const { Resend } = await import('resend');
      const resend = new Resend(env.RESEND_API_KEY);
      const { error } = await resend.emails.send({
        from: message.from,
        to: [message.to],
        replyTo: [message.replyTo],
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      if (error) throw new Error(`Resend error: ${error.name}`);
      return { ok: true, provider };
    }

    const mod = await import('nodemailer');
    const nodemailer = mod.default ?? mod;
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? 587),
      secure: env.SMTP_SECURE === 'true',
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
    await transport.sendMail(message);
    return { ok: true, provider };
  } catch (err) {
    // Log the failure class only: never the visitor's message or address.
    console.error('[contact] delivery failed via', provider, err instanceof Error ? err.message : 'unknown error');
    return { ok: false, reason: 'send-failed' };
  }
}
