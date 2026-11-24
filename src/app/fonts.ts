import localFont from 'next/font/local';

// Self-hosted, subsetted (Latin) variable fonts. See src/app/fonts/licenses for the OFL texts.
// Newsreader: weight pinned to 400, optical-size axis kept (20-72) so headlines get the
// high-contrast display cut automatically via `font-optical-sizing: auto`.
export const newsreader = localFont({
  src: [{ path: './fonts/newsreader.woff2', weight: '400', style: 'normal' }],
  variable: '--font-newsreader',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

// Italic is only used for pull quotes and replies, so it is not preloaded.
export const newsreaderItalic = localFont({
  src: [{ path: './fonts/newsreader-italic.woff2', weight: '400', style: 'italic' }],
  variable: '--font-newsreader-italic',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

export const sourceSans = localFont({
  src: [{ path: './fonts/source-sans-3.woff2', weight: '400 700', style: 'normal' }],
  variable: '--font-source-sans',
  display: 'swap',
  adjustFontFallback: 'Arial',
  fallback: ['system-ui', 'Segoe UI', 'Arial', 'sans-serif'],
});

// Mono is reserved for credential codes, years and coordinates.
export const dmMono = localFont({
  src: [{ path: './fonts/dm-mono.woff2', weight: '400', style: 'normal' }],
  variable: '--font-dm-mono',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
});
