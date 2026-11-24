// URL safety for everything an editor can type into the admin portal. A rendered `href`/`src` is the one place
// admin-supplied text can become code (`javascript:`, `data:`, `vbscript:`), so every editable link and image
// URL passes through this allow-list, on save (cms-schema) and again when content is read back from storage.
//
// Allowed:  https://  http://  mailto:  tel:  and site paths that start with a single "/".
// Images:   https://  http://  and site paths only (mailto:/tel: make no sense for an <img>).

export type UrlKind = 'link' | 'image';

export const URL_RULE_MESSAGE = 'Use a link that starts with https://, http://, mailto:, tel:, or /';
export const IMAGE_RULE_MESSAGE = 'Use an image address that starts with https://, http://, or /';

/** Whitespace, control characters, and backslashes (`/\evil.com` is read by browsers as `//evil.com`). */
const FORBIDDEN = /[\x00-\x20\x7f-\x9f\s\\]/;

const MAILTO = /^mailto:[^\s?#@]+@[^\s?#@]+(\?[^\s#]*)?$/i;
const TEL = /^tel:\+?[0-9().-]{3,32}(?:;(?:ext|phone-context)=[0-9a-z.+-]{1,20})?$/i;

export function isSafeUrl(value: unknown, kind: UrlKind = 'link'): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > 2048) return false;
  if (FORBIDDEN.test(value)) return false;

  // Site-relative path. "//host" is protocol-relative (an off-site URL), so only a single leading slash is allowed.
  if (value.startsWith('/')) return !value.startsWith('//');

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      return (
        (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
        parsed.hostname.length > 0 &&
        // user:pass@host is a classic spoofing trick; there is no legitimate reason to link that way here.
        parsed.username === '' &&
        parsed.password === ''
      );
    } catch {
      return false;
    }
  }

  if (kind === 'link') return MAILTO.test(value) || TEL.test(value);
  return false;
}

/** Defense in depth at render time: a value that somehow bypassed validation never becomes an href/src. */
export function safeHref(value: string, fallback = '#'): string {
  return isSafeUrl(value, 'link') ? value : fallback;
}

export function safeImageSrc(value: string): string | null {
  return isSafeUrl(value, 'image') ? value : null;
}

export function isExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** "(843) 936-1601" -> "+18439361601". Ten digits are US numbers; anything else keeps its own country code. */
export function toTelHref(display: string): string {
  const digits = display.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return digits ? `+${digits}` : '';
}
