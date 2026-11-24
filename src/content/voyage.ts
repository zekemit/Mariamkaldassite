// "The Voyage": Mariam's path to coaching, from her own bio. Each chapter's body is her wording
// (typos fixed; "30 different countries" becomes "30+" per the verified-facts decision).
// "So what" lines are draft copy for Mariam to rewrite in her own voice.
import stopsData from './voyage-stops.json';

export interface Chapter {
  id: string;
  place: string;
  title: string;
  body: readonly string[];
  soWhat: string;
  /** Mono label. Only years with a public source are shown (2007 voyage, 2008 Zambia). */
  coords: string;
  year?: string;
}

export const voyageIntro = {
  title: 'The long way around',
  lede: 'A short tour of the road that led me to coaching.',
  skip: 'Skip the journey',
};

export const chapters: readonly Chapter[] = [
  {
    id: 'charlottesville',
    place: 'Charlottesville, Virginia',
    title: 'I ditched the business major.',
    body: [
      'I knew I was ready for a non-conformist journey when I ditched my business major at the University of Virginia and pursued a double major in Religious Studies and Sociology.',
    ],
    soWhat: 'Changing the plan isn’t failing the plan.',
    coords: '38.03°N 78.48°W',
  },
  {
    id: 'thessaloniki',
    place: 'Thessaloniki, Greece',
    title: 'I turned down the tutoring center.',
    body: [
      'When it came time to find a job after graduation, I turned down an offer to manage my own tutoring center, and instead took a job as the Director of Student Life at an agricultural college in Thessaloniki, Greece.',
      'Knowing that I loved working with people from a developmental perspective, I went on to the University of Maryland to study Higher Education and Student Affairs.',
    ],
    soWhat: 'The right next step doesn’t always look like the biggest one.',
    coords: '40.64°N 22.94°E',
  },
  {
    id: 'sea',
    place: 'At sea, The Scholar Ship',
    title: 'And yes, I did sail around the world.',
    body: [
      'During my graduate studies, I was longing to work at the intersection of intercultural communication and student affairs. I also loved travel and being on the water, so after graduating with my M.Ed., I helped to design and establish a university-at-sea program called The Scholar Ship.',
      'We had students from 30+ countries on our inaugural voyage. And yes, I did sail around the world. And yes, it was epic.',
    ],
    soWhat: 'Thirty-plus nationalities in one place teach you fast that there is no single way to lead.',
    coords: 'Route illustrative',
    year: '2007',
  },
  {
    id: 'zambia',
    place: 'Zambia',
    title: 'Then I left the ship for Zambia.',
    body: [
      'I then left the ship to volunteer in Zambia as the Public Relations Manager for the Coptic Orthodox Church.',
    ],
    soWhat: 'You can say yes to the next stretch before you can see the whole road.',
    coords: '13°S 28°E',
    year: '2008',
  },
  {
    id: 'washington',
    place: 'Washington, D.C.',
    title: 'Service first, then strategy.',
    body: [
      'After returning to the United States, I became the Associate Director of Franciscan Mission Service, where I supported volunteers serving with impoverished and marginalized communities across the globe.',
      'Most recently, I was the External Engagement Advisor in the Office of Religion and Global Affairs at the U.S. Department of State, where I worked with religious leaders, academic scholars, and faith-based organizations at the intersection of foreign policy.',
    ],
    soWhat: 'Values and strategy belong in the same conversation.',
    coords: '38.90°N 77.04°W',
  },
  {
    id: 'charleston',
    place: 'Charleston, South Carolina',
    title: 'Now: coaching, from Charleston.',
    body: [
      'I have now found joy in coaching, being a mother of two incredible little ones, and as a wife to an amazing husband. We are living out our dream in Charleston, SC.',
    ],
    soWhat: 'Now the work is yours. Let’s find out what you came here to do.',
    coords: '32.78°N 79.93°W',
  },
];

export const stopCoordinates = stopsData.stops;
