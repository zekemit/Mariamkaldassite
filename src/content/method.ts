// "How we'll work together". Pillars are proposed from Mariam's own materials and testimonials.
// Sample questions are illustrative drafts for Mariam to replace with her own.

export interface Pillar {
  id: string;
  title: string;
  body: string;
  sampleQuestion: string;
  proof: { quote: string; by: string };
}

export const methodIntro = {
  heading: 'How we’ll work together',
  contrast:
    'Most coaching helps you get what you want. I help you find out what you actually want, and then hold you to it.',
  investment:
    'Every engagement is tailored. We’ll talk about the investment in our chemistry session.',
  where:
    'Over Zoom or by phone, wherever you are in the world. In person around Charleston, South Carolina, and yes, sometimes on the beach.',
};

export const pillars: readonly Pillar[] = [
  {
    id: 'co-active',
    title: 'Co-Active, whole-person coaching',
    body: 'The model I trained in starts from one belief: you are naturally creative, resourceful, and whole. My job isn’t to fix you. It’s to ask what you haven’t been asked.',
    sampleQuestion: 'What do you already know that you haven’t said out loud?',
    proof: { quote: 'to view myself as I am and acknowledge all the parts of myself', by: 'Kevin C.' },
  },
  {
    id: 'type',
    title: 'Know your type',
    body: 'As a certified MBTI practitioner, I give you language for how you lead, decide and get stuck, and, if you want, how your team does too.',
    sampleQuestion: 'Where does your natural style help the people around you, and where does it get in the way?',
    proof: {
      quote: 'Increased awareness of strengths, challenges, and blind spots',
      by: 'What a team workshop is designed to deliver',
    },
  },
  {
    id: 'accountability',
    title: 'Accountability with heart',
    body: 'You leave each session with commitments you chose. We check in on them, kindly, without letting you off the hook.',
    sampleQuestion: 'What will you do this week, and how will we know you did it?',
    proof: { quote: 'taking a holistic approach to caring for me as a person', by: 'Monica' },
  },
  {
    id: 'strengths',
    title: 'Strengths first, growth edges next',
    body: 'Real change uses what’s already strong while working the edge. We do both.',
    sampleQuestion: 'Which of your strengths are you underusing right now?',
    proof: { quote: 'focusing on both strengths and areas of growth', by: 'Indy' },
  },
];

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
