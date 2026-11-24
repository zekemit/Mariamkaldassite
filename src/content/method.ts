// "How we'll work together": the intro lines and the engagement path. The four coaching pillars are editable at
// /admin and live in the CMS content (src/content/defaults.ts holds the originals).

export const methodIntro = {
  heading: 'How we’ll work together',
  contrast:
    'Most coaching helps you get what you want. I help you find out what you actually want, and then hold you to it.',
  investment:
    'Every engagement is tailored. We’ll talk about the investment in our chemistry session.',
  where:
    'Over Zoom or by phone, wherever you are in the world. In person around Charleston, South Carolina, and yes, sometimes on the beach.',
};

export interface PathStep {
  title: string;
  body: string;
}

export const engagementPath: readonly PathStep[] = [
  {
    title: 'A chemistry session',
    body: 'One hour. You bring the topic and we go from there. At the end, we both decide whether this is a fit.',
  },
  {
    title: 'A kickoff',
    body: 'We name what you actually want and, if it helps, look at your MBTI type together.',
  },
  {
    title: 'A coaching rhythm',
    body: 'We meet on a schedule that fits your goals. Between sessions, you work on commitments you chose.',
  },
  {
    title: 'A review',
    body: 'We look at what has changed and decide together what comes next.',
  },
];
