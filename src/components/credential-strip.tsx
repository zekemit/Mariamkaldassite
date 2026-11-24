import { credentialStrip } from '@/content/credentials';

/** Credentials as real text, directly under the hero (the old site only showed two small images on /about). */
export function CredentialStrip() {
  return (
    <section aria-label="Credentials and background" className="wrap">
      <ul className="cred-strip">
        {credentialStrip.map((item) => (
          <li key={item.code}>
            <span className="cred-code">{item.code}</span>
            <span className="cred-text">{item.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
