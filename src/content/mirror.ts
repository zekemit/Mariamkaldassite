// Static strings around "The Mirror". The statements themselves (and their replies) are editable at /admin and
// live in the CMS content (src/content/defaults.ts holds the originals).

export const mirrorStatus = {
  none: 'Tap the ones that sound like you.',
  some: 'That’s a start. Here’s what a chemistry session is like.',
  many: 'You’re in good company. Let’s talk.',
} as const;

export const mirrorNotForYou =
  'Coaching isn’t for everyone. It works when you’re ready, willing, and committed to making changes.';
