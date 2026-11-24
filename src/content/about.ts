// About page: the Co-Active cornerstones stay in code. The heading, bio paragraphs and credentials are editable at
// /admin and live in the CMS content (src/content/defaults.ts holds the originals).

/** The four cornerstones of the Co-Active model (named on coactive.com); titles only, no added claims. */
export const cornerstones = [
  'People are naturally creative, resourceful, and whole',
  'Dance in this moment',
  'Focus on the whole person',
  'Evoke transformation',
] as const;

export const cornerstonesSource = 'https://coactive.com/what-is-co-active/';
