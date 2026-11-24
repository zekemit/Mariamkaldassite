// FAQ copy. Answers 1, 3, 4 and the team answer come from Mariam's published FAQ and service pages;
// "free sample session" is renamed to "complimentary chemistry session" (approved decision D7).
// Tokens {{email}}, {{phone}} and {{book}} are rendered as links.

export type FaqBlock = { p: string } | { ul: string[] };

export interface FaqItem {
  id: string;
  q: string;
  a: FaqBlock[];
}

export const faqItems: readonly FaqItem[] = [
  {
    id: 'hour',
    q: 'What happens in the chemistry session?',
    a: [
      {
        p: 'You bring the topic and we’ll go from there! It’s one hour, there’s no obligation, and by the end we’ll both know whether coaching is a good fit.',
      },
      { p: '{{book}}' },
    ],
  },
  {
    id: 'who',
    q: 'Who do you typically coach?',
    a: [
      {
        p: 'I typically coach passionate, vibrant people who are thoughtful, reflective and willing to take risks. Generally, they aren’t looking to “settle” and show this through desiring and pursuing a path that feeds their spirit, mind, and soul. If you resonate with some (or all!) of the following statements, then we might just be a great coach-client fit:',
      },
      {
        ul: [
          'When you think about where you work or what you want to do, you want to be passionate about the mission of the organization, your role, and your colleagues.',
          'You want deep joy and fulfillment out of what you do.',
          'You believe that each person has what the Japanese call Ikigai, or a “reason for being,” and you’re either trying to figure yours out, or you have some sense of it and you’re trying to figure out how to align it with making a living.',
          'You are committed to seeking and pursuing your dreams and goals, even if right now you’re not quite sure how to make them happen.',
          'You are mesmerized by the growth and evolution of us as human beings, and are committed to learning new things about yourself and the world around you.',
          'Your spiritual beliefs are important to you and integral to your identity.',
          'You consider yourself to be a genuine individual, and are committed to personal growth.',
        ],
      },
    ],
  },
  {
    id: 'rates',
    q: 'What are your rates?',
    a: [
      {
        p: 'I know, it’s the burning question. But seriously, let’s set up a complimentary chemistry session to see if we have a good client-coach fit, and I’d be happy to chat rates with you!',
      },
      { p: 'Email: {{email}}  Phone: {{phone}}' },
    ],
  },
  {
    id: 'where',
    q: 'Where do you coach?',
    a: [
      {
        p: 'I typically coach over the phone or via Zoom, as it allows me to work with you no matter where you are in the world. That said, local clients (I’m in Charleston, South Carolina) are always welcome to contact me about doing in-person (did someone say, on the beach?!) sessions!',
      },
      {
        p: 'Book a complimentary chemistry session to see what it would be like to work together as coach and client, or call me at {{phone}} or email {{email}}.',
      },
      { p: 'I look forward to talking with you!' },
    ],
  },
  {
    id: 'why',
    q: 'Why should I hire a coach?',
    a: [
      { p: 'To be honest, you shouldn’t.' },
      {
        p: 'Not unless, of course, you’re ready, willing, and committed to making changes in your life. Ask yourself:',
      },
      {
        ul: [
          'Am I ready to take on challenges, set goals, and commit to following through?',
          'Am I ready to be stretched and grown over the coming months?',
          'Am I ready to find and transform my life passion into my daily reality?',
        ],
      },
      {
        p: 'If you’re ready to live a life you’re passionate about, then working with a coach may be the next best step for you.',
      },
      {
        p: 'I’m real with you from the start, which is why I offer a complimentary chemistry session with anyone who is interested in finding out more. By the end of the session, I will be honest about whether I think coaching is a good fit for you, and we both get to decide if we’d be a good coach-client match.',
      },
      {
        p: 'If you’d like to book a chemistry session, or if you have any questions, feel free to email {{email}} or give me a call at {{phone}}.',
      },
    ],
  },
  {
    id: 'teams',
    q: 'Do you work with teams?',
    a: [
      {
        p: 'Yes. I facilitate Myers-Briggs (MBTI) sessions for teams: a three-hour session at your place, designed to leverage personality differences to make your team more effective.',
      },
      { p: 'As a result of this session, individuals and teams will have:' },
      {
        ul: [
          'Increased awareness of strengths, challenges, and blind spots',
          'Increased tolerance of differences that are innate while recognizing that behavior can be changed or modified',
          'Action planning to enhance performance as an individual, manager and leadership team member',
        ],
      },
      { p: 'Pricing varies with the size and needs of your team. {{contact}}' },
    ],
  },
];

/** The four questions shown on the home page (full list lives on /faq). */
export const homeFaqIds = ['hour', 'who', 'why', 'where'] as const;
