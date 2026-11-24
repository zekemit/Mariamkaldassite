// "The Mirror": Mariam's seven reflection questions from the old home page, restated in the first person.
// Wording is hers, minimally rephrased. Replies are draft copy for Mariam to rewrite in her voice.

export interface MirrorStatement {
  id: string;
  text: string;
  reply: string;
}

export const mirrorStatements: readonly MirrorStatement[] = [
  {
    id: 'impact',
    text: 'I’m a driven leader and I want my work to make an impact.',
    reply: 'Good. Impact is easier to aim when you know what you’re aiming at. Let’s get specific.',
  },
  {
    id: 'deadlines',
    text: 'I meet every external deadline. The ones I set for myself keep slipping.',
    reply: 'Then your calendar isn’t the problem. Let’s find what is.',
  },
  {
    id: 'humor',
    text: 'I’m playful and I have a great sense of humor.',
    reply: 'Wonderful. You’ll fit right in. Some of our best work happens while we’re laughing.',
  },
  {
    id: 'next-steps',
    text: 'I’ve been dreaming about my next steps and I don’t know how to get there.',
    reply: 'That’s rarely a shortage of ideas. It’s a missing first step you actually believe in. We start there.',
  },
  {
    id: 'talent',
    text: 'Even with everything I’ve accomplished, I struggle to see how talented I really am.',
    reply: 'You’re in good company. I’ll ask the questions that help you see what other people already do.',
  },
  {
    id: 'expertise',
    text: 'I doubt the value of my expertise.',
    reply: 'Doubting your expertise usually means you’ve outgrown how you describe it.',
  },
  {
    id: 'scared',
    text: 'I’m a little scared to go after what I really want for myself.',
    reply: 'A little scared is a good sign. It usually means it matters. We make the first step smaller than the fear.',
  },
];

export const mirrorStatus = {
  none: 'Tap the ones that sound like you.',
  some: 'That’s a start. Here’s what a chemistry session is like.',
  many: 'You’re in good company. Let’s talk.',
} as const;

export const mirrorNotForYou =
  'Coaching isn’t for everyone. It works when you’re ready, willing, and committed to making changes.';
