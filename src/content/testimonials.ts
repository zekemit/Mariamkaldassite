// All seven published client testimonials, verbatim from mariamkaldas.com (typos preserved; a stray closing
// quote mark on Indy's text was dropped because the card adds its own). Tags follow the Phase 1 audit taxonomy
// (MARIAM_SITE_AUDIT.md section 4.8). Names are shown exactly as published: first names only.
// A unit test checks every sentence below against the audit's verbatim record.

export const storyTags = [
  'Mindset shift',
  'Career pivot',
  'Leadership breakthrough',
  'Personal accountability',
] as const;

export type StoryTag = (typeof storyTags)[number];

export interface Story {
  id: string;
  name: string;
  tags: readonly StoryTag[];
  /** A verbatim fragment used as the card's headline quote. */
  pullQuote: string;
  /** The complete testimonial, verbatim. */
  paragraphs: readonly string[];
}

export const stories: readonly Story[] = [
  {
    id: 'kevin-c',
    name: 'Kevin C.',
    tags: ['Mindset shift'],
    pullQuote:
      "I think this is the core of the coaching experience: to view myself as I am and acknowledge all the parts of myself.",
    paragraphs: [
      "Mariam is a sentient person, who can ask me questions that force me to really think about myself, and how I function as a person... I think this is the core of the coaching experience: to view myself as I am and acknowledge all the parts of myself, whether they're good or bad. Mariam was amazing at doing this and getting me to really introspect and figure out exactly what I'm doing right, and what I can improve on.",
    ],
  },
  {
    id: 'indy',
    name: 'Indy',
    tags: ['Career pivot', 'Mindset shift'],
    pullQuote: 'She helped me reframe my point of view to take that experience into my next chapter of life',
    paragraphs: [
      'Mariam is a wonderful career coach. During my career transition from research into programming, I really struggled with the thought of “losing” years of experience in order to pursue what I’m passionate about.',
      'She helped me reframe my point of view to take that experience into my next chapter of life, which ultimately is going to make me happier. Mariam’s methodology of focusing on both strengths and areas of growth has helped me surpass personal obstacles that I’ve worked on my entire life, while reinforcing self-assuring actions. Because of her unwavering support, I’m able to be the best version of myself.',
    ],
  },
  {
    id: 'reuschal',
    name: 'Reuschal',
    tags: ['Leadership breakthrough', 'Mindset shift', 'Career pivot'],
    pullQuote: 'Coaching has been a game changer for my career.',
    paragraphs: [
      "Coaching has been a game changer for my career. Having no success at the two companies I joined after graduating law school, those failures really took their toll on my belief in myself and the work that I was capable of doing. Working with Mariam has allowed me to really dig deep into some of those fears and irrational beliefs that I held about myself and my abilities. Working with her, and working on the projects she assigned to me, helped me identify who I am, who I want to be, and the type of work I want to do. She has pulled the best of out me, and she's help me identify the things that have been holding me back. She's been invaluable. She's changed the way that I work, changed the way I interact with my teammates and I can't thank her enough for the work she's done for me and my career.",
    ],
  },
  {
    id: 'monica',
    name: 'Monica',
    tags: ['Personal accountability', 'Mindset shift'],
    pullQuote: 'She helped me stay on track and make progress with my goals.',
    paragraphs: [
      'I truly enjoyed and appreciated my time working with Mariam. She helped me stay on track and make progress with my goals (accountability and moving forward), while also taking a holistic approach to caring for me as a person (addressing mindset challenges and hurdles). I would wholeheartedly recommend her!',
    ],
  },
  {
    id: 'dan',
    name: 'Dan',
    tags: ['Career pivot'],
    pullQuote: "Mariam's coaching was instrumental to my success in moving on with my new career.",
    paragraphs: [
      "After doing some reflection, it dawned on me that Mariam's coaching was instrumental to my success in moving on with my new career. I think she's an excellent coach.",
    ],
  },
  {
    id: 'josh',
    name: 'Josh',
    tags: ['Leadership breakthrough'],
    pullQuote:
      'Mariam is a master at uncovering areas that need growth, while at the same time highlighting and encouraging strengths.',
    paragraphs: [
      'Mariam is a master at uncovering areas that need growth, while at the same time highlighting and encouraging strengths. She is an extremely valuable asset to have on your team.',
    ],
  },
  {
    id: 'margarita',
    name: 'Margarita',
    tags: ['Leadership breakthrough', 'Mindset shift'],
    pullQuote:
      'I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months.',
    paragraphs: [
      'Professional and personal coaching with Mariam was a unique experience for me. It helped me realise what my strengths are, face my weaknesses, and look at opportunities without fear or hesitation.',
      "In terms of my professional goals, during a relatively short period of time and thanks to Mariam's coaching, I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months. On a personal level, we worked on my relationships with the loved ones, and with Mariam's guidance I discovered things I never imagined I would, and started working on them. There is still lots to be done, but I’m positive these will be solved in due time.",
    ],
  },
];

/** Featured on the home page: one strong story per leading theme. */
export const featuredStoryIds = ['reuschal', 'indy', 'margarita'] as const;

export function countByTag(tag: StoryTag): number {
  return stories.filter((s) => s.tags.includes(tag)).length;
}
