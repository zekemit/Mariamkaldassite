import type { SiteContent } from '@/lib/cms-schema';

/** Credentials as real text, directly under the hero (the old site only showed two small images on /about). */
export function CredentialStrip({ items }: { items: SiteContent['about']['strip'] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Credentials and background" className="wrap">
      <ul className="cred-strip">
        {items.map((item) => (
          <li key={item.id}>
            <span className="cred-code">{item.code}</span>
            <span className="cred-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
