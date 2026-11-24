// Pure constants shared by the client form and the server validator (kept free of zod so the browser bundle stays small).
export const TOPICS = ['coaching', 'team', 'other'] as const;
export type Topic = (typeof TOPICS)[number];

export const TOPIC_LABELS: Record<Topic, string> = {
  coaching: 'A coaching conversation',
  team: 'Coaching or MBTI for my team',
  other: 'Something else',
};
