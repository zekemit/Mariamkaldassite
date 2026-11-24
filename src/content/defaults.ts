// The original, verified site copy: what "Reset to Defaults" restores, what the site shows before anything has been
// saved, and what data/site-content.json is seeded from (npm run seed:cms). Testimonials are verbatim from
// mariamkaldas.com (typos preserved) and are checked against the Phase 1 audit by a unit test. Edit live copy at
// /admin, not here; change this file only to change what "default" means.
import { BOOK_LABEL, SITE } from '@/content/site';
import type { SiteContent } from '@/lib/cms-schema';

export const defaultSiteContent: SiteContent = {
  announcement: {
    enabled: false,
    text: '',
    linkLabel: '',
    linkUrl: '',
  },
  popup: {
    enabled: false,
    headline: '',
    body: '',
    imageUrl: '',
    imageAlt: '',
    ctaLabel: BOOK_LABEL,
    ctaMode: 'booking',
    ctaUrl: '',
    frequency: 'session',
  },
  hero: {
    headline: 'You meet every deadline except your own.',
    subheadline: 'Co-Active (CPCC), ICF (PCC) and MBTI coaching for driven leaders and professionals at a turning point. Honest straight talk, in Charleston and over Zoom, wherever you are.',
    ctaLabel: BOOK_LABEL,
    portraitSrc: '/images/mariam-hero.jpg',
    portraitAlt: 'Mariam Kaldas smiling over a cup of tea at a stone table above a wide blue lake',
  },
  mirror: {
    prompts: [
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
    ],
  },
  testimonials: [
    {
      id: 'kevin-c',
      name: 'Kevin C.',
      role: '',
      pullQuote: 'I think this is the core of the coaching experience: to view myself as I am and acknowledge all the parts of myself.',
      text: 'Mariam is a sentient person, who can ask me questions that force me to really think about myself, and how I function as a person... I think this is the core of the coaching experience: to view myself as I am and acknowledge all the parts of myself, whether they\'re good or bad. Mariam was amazing at doing this and getting me to really introspect and figure out exactly what I\'m doing right, and what I can improve on.',
      tags: [
        'Mindset Shift',
      ],
      featured: false,
    },
    {
      id: 'reuschal',
      name: 'Reuschal',
      role: '',
      pullQuote: 'Coaching has been a game changer for my career.',
      text: 'Coaching has been a game changer for my career. Having no success at the two companies I joined after graduating law school, those failures really took their toll on my belief in myself and the work that I was capable of doing. Working with Mariam has allowed me to really dig deep into some of those fears and irrational beliefs that I held about myself and my abilities. Working with her, and working on the projects she assigned to me, helped me identify who I am, who I want to be, and the type of work I want to do. She has pulled the best of out me, and she\'s help me identify the things that have been holding me back. She\'s been invaluable. She\'s changed the way that I work, changed the way I interact with my teammates and I can\'t thank her enough for the work she\'s done for me and my career.',
      tags: [
        'Leadership & Confidence',
        'Mindset Shift',
        'Career Pivot',
      ],
      featured: true,
    },
    {
      id: 'indy',
      name: 'Indy',
      role: '',
      pullQuote: 'She helped me reframe my point of view to take that experience into my next chapter of life',
      text: 'Mariam is a wonderful career coach. During my career transition from research into programming, I really struggled with the thought of “losing” years of experience in order to pursue what I’m passionate about.\n\nShe helped me reframe my point of view to take that experience into my next chapter of life, which ultimately is going to make me happier. Mariam’s methodology of focusing on both strengths and areas of growth has helped me surpass personal obstacles that I’ve worked on my entire life, while reinforcing self-assuring actions. Because of her unwavering support, I’m able to be the best version of myself.',
      tags: [
        'Career Pivot',
        'Mindset Shift',
      ],
      featured: true,
    },
    {
      id: 'monica',
      name: 'Monica',
      role: '',
      pullQuote: 'She helped me stay on track and make progress with my goals.',
      text: 'I truly enjoyed and appreciated my time working with Mariam. She helped me stay on track and make progress with my goals (accountability and moving forward), while also taking a holistic approach to caring for me as a person (addressing mindset challenges and hurdles). I would wholeheartedly recommend her!',
      tags: [
        'Accountability & Action',
        'Mindset Shift',
      ],
      featured: false,
    },
    {
      id: 'margarita',
      name: 'Margarita',
      role: '',
      pullQuote: 'I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months.',
      text: 'Professional and personal coaching with Mariam was a unique experience for me. It helped me realise what my strengths are, face my weaknesses, and look at opportunities without fear or hesitation.\n\nIn terms of my professional goals, during a relatively short period of time and thanks to Mariam\'s coaching, I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months. On a personal level, we worked on my relationships with the loved ones, and with Mariam\'s guidance I discovered things I never imagined I would, and started working on them. There is still lots to be done, but I’m positive these will be solved in due time.',
      tags: [
        'Leadership & Confidence',
        'Mindset Shift',
      ],
      featured: true,
    },
    {
      id: 'dan',
      name: 'Dan',
      role: '',
      pullQuote: 'Mariam\'s coaching was instrumental to my success in moving on with my new career.',
      text: 'After doing some reflection, it dawned on me that Mariam\'s coaching was instrumental to my success in moving on with my new career. I think she\'s an excellent coach.',
      tags: [
        'Career Pivot',
      ],
      featured: false,
    },
    {
      id: 'josh',
      name: 'Josh',
      role: '',
      pullQuote: 'Mariam is a master at uncovering areas that need growth, while at the same time highlighting and encouraging strengths.',
      text: 'Mariam is a master at uncovering areas that need growth, while at the same time highlighting and encouraging strengths. She is an extremely valuable asset to have on your team.',
      tags: [
        'Leadership & Confidence',
      ],
      featured: false,
    },
  ],
  pillars: [
    {
      id: 'co-active',
      title: 'Co-Active, whole-person coaching',
      body: 'The model I trained in starts from one belief: you are naturally creative, resourceful, and whole. My job isn’t to fix you. It’s to ask what you haven’t been asked.',
      sampleQuestion: 'What do you already know that you haven’t said out loud?',
      proofQuote: 'to view myself as I am and acknowledge all the parts of myself',
      proofBy: 'Kevin C.',
    },
    {
      id: 'type',
      title: 'Know your type',
      body: 'As a certified MBTI practitioner, I give you language for how you lead, decide and get stuck, and, if you want, how your team does too.',
      sampleQuestion: 'Where does your natural style help the people around you, and where does it get in the way?',
      proofQuote: 'Increased awareness of strengths, challenges, and blind spots',
      proofBy: 'What a team workshop is designed to deliver',
    },
    {
      id: 'accountability',
      title: 'Accountability with heart',
      body: 'You leave each session with commitments you chose. We check in on them, kindly, without letting you off the hook.',
      sampleQuestion: 'What will you do this week, and how will we know you did it?',
      proofQuote: 'taking a holistic approach to caring for me as a person',
      proofBy: 'Monica',
    },
    {
      id: 'strengths',
      title: 'Strengths first, growth edges next',
      body: 'Real change uses what’s already strong while working the edge. We do both.',
      sampleQuestion: 'Which of your strengths are you underusing right now?',
      proofQuote: 'focusing on both strengths and areas of growth',
      proofBy: 'Indy',
    },
  ],
  about: {
    heading: 'Passionate about empowering you to make an impact',
    paragraphs: [
      'Wanting to know more about me? I truly am passionate about facilitating transformative experiences for my clients. This passion has been cultivated through my own journey as a professional, wife, mother, and friend.',
      'I knew I was ready for a non-conformist journey when I ditched my business major at the University of Virginia and pursued a double major in Religious Studies and Sociology. When it came time to find a job after graduation, I turned down an offer to manage my own tutoring center, and instead took a job as the Director of Student Life at an agricultural college in Thessaloniki, Greece. Knowing that I loved working with people from a developmental perspective, I went on to the University of Maryland to study Higher Education and Student Affairs.',
      'During my graduate studies, I was longing to work at the intersection of intercultural communication and student affairs. I also loved travel and being on the water, so after graduating with my M.Ed., I helped to design and establish a university-at-sea program called The Scholar Ship. We had students from 30+ countries on our inaugural voyage. And yes, I did sail around the world. And yes, it was epic.',
      'I then left the ship to volunteer in Zambia as the Public Relations Manager for the Coptic Orthodox Church. After returning to the United States, I became the Associate Director of Franciscan Mission Service, where I supported volunteers serving with impoverished and marginalized communities across the globe.',
      'Most recently, I was the External Engagement Advisor in the Office of Religion and Global Affairs at the U.S. Department of State, where I worked with religious leaders, academic scholars, and faith-based organizations at the intersection of foreign policy. I have now found joy in coaching, being a mother of two incredible little ones, and as a wife to an amazing husband. We are living out our dream in Charleston, SC.',
    ],
    credentials: [
      {
        id: 'cpcc',
        code: 'CPCC',
        title: 'Certified Co-Active® Professional Coach',
        issuer: 'Coaches Training Institute (CTI)',
        href: 'https://coactive.com/',
        badgeSrc: '/images/badge-cpcc.png',
        badgeAlt: 'CPCC badge, Certified Co-Active Professional Coach',
      },
      {
        id: 'pcc',
        code: 'PCC',
        title: 'Professional Certified Coach',
        issuer: 'International Coaching Federation (ICF)',
        href: 'https://coachingfederation.org/',
        badgeSrc: '/images/badge-pcc.jpg',
        badgeAlt: 'PCC badge, Professional Certified Coach, International Coaching Federation',
      },
      {
        id: 'mbti',
        code: 'MBTI®',
        title: 'Certified Myers-Briggs Type Indicator® Practitioner',
        issuer: 'Myers-Briggs Type Indicator (MBTI)',
        href: 'https://www.myersbriggs.org/',
        badgeSrc: '',
        badgeAlt: '',
      },
    ],
    strip: [
      {
        id: 'cpcc',
        code: 'CPCC',
        text: 'Certified Co-Active® Professional Coach',
      },
      {
        id: 'pcc',
        code: 'PCC',
        text: 'ICF Professional Certified Coach',
      },
      {
        id: 'mbti',
        code: 'MBTI®',
        text: 'Certified Practitioner',
      },
      {
        id: 'countries',
        code: '45+',
        text: 'countries worked, lived and traveled',
      },
      {
        id: 'state',
        code: 'Formerly',
        text: 'U.S. Department of State',
      },
    ],
  },
  faq: [
    {
      id: 'hour',
      question: 'What happens in the chemistry session?',
      answer: 'You bring the topic and we’ll go from there! It’s one hour, there’s no obligation, and by the end we’ll both know whether coaching is a good fit.\n\n{{book}}',
      showOnHome: true,
    },
    {
      id: 'who',
      question: 'Who do you typically coach?',
      answer: 'I typically coach passionate, vibrant people who are thoughtful, reflective and willing to take risks. Generally, they aren’t looking to “settle” and show this through desiring and pursuing a path that feeds their spirit, mind, and soul. If you resonate with some (or all!) of the following statements, then we might just be a great coach-client fit:\n\n- When you think about where you work or what you want to do, you want to be passionate about the mission of the organization, your role, and your colleagues.\n- You want deep joy and fulfillment out of what you do.\n- You believe that each person has what the Japanese call Ikigai, or a “reason for being,” and you’re either trying to figure yours out, or you have some sense of it and you’re trying to figure out how to align it with making a living.\n- You are committed to seeking and pursuing your dreams and goals, even if right now you’re not quite sure how to make them happen.\n- You are mesmerized by the growth and evolution of us as human beings, and are committed to learning new things about yourself and the world around you.\n- Your spiritual beliefs are important to you and integral to your identity.\n- You consider yourself to be a genuine individual, and are committed to personal growth.',
      showOnHome: true,
    },
    {
      id: 'rates',
      question: 'What are your rates?',
      answer: 'I know, it’s the burning question. But seriously, let’s set up a complimentary chemistry session to see if we have a good client-coach fit, and I’d be happy to chat rates with you!\n\nEmail: {{email}}  Phone: {{phone}}',
      showOnHome: false,
    },
    {
      id: 'where',
      question: 'Where do you coach?',
      answer: 'I typically coach over the phone or via Zoom, as it allows me to work with you no matter where you are in the world. That said, local clients (I’m in Charleston, South Carolina) are always welcome to contact me about doing in-person (did someone say, on the beach?!) sessions!\n\nBook a complimentary chemistry session to see what it would be like to work together as coach and client, or call me at {{phone}} or email {{email}}.\n\nI look forward to talking with you!',
      showOnHome: true,
    },
    {
      id: 'why',
      question: 'Why should I hire a coach?',
      answer: 'To be honest, you shouldn’t.\n\nNot unless, of course, you’re ready, willing, and committed to making changes in your life. Ask yourself:\n\n- Am I ready to take on challenges, set goals, and commit to following through?\n- Am I ready to be stretched and grown over the coming months?\n- Am I ready to find and transform my life passion into my daily reality?\n\nIf you’re ready to live a life you’re passionate about, then working with a coach may be the next best step for you.\n\nI’m real with you from the start, which is why I offer a complimentary chemistry session with anyone who is interested in finding out more. By the end of the session, I will be honest about whether I think coaching is a good fit for you, and we both get to decide if we’d be a good coach-client match.\n\nIf you’d like to book a chemistry session, or if you have any questions, feel free to email {{email}} or give me a call at {{phone}}.',
      showOnHome: true,
    },
    {
      id: 'teams',
      question: 'Do you work with teams?',
      answer: 'Yes. I facilitate Myers-Briggs (MBTI) sessions for teams: a three-hour session at your place, designed to leverage personality differences to make your team more effective.\n\nAs a result of this session, individuals and teams will have:\n\n- Increased awareness of strengths, challenges, and blind spots\n- Increased tolerance of differences that are innate while recognizing that behavior can be changed or modified\n- Action planning to enhance performance as an individual, manager and leadership team member\n\nPricing varies with the size and needs of your team. {{contact}}',
      showOnHome: false,
    },
  ],
  settings: {
    calendlyUrl: SITE.calendlyUrl,
    email: SITE.email,
    phone: SITE.phoneDisplay,
    location: 'Charleston, SC & Worldwide via Zoom',
    linkedin: '',
    instagram: '',
    facebook: '',
  },
};
