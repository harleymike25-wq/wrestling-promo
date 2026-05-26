export const CHARACTERS = {
  jobber: {
    id: 'jobber',
    name: 'Disgruntled Jobber',
    difficulty: 'HARDEST',
    difficultyBar: 5,
    blurb: 'Ten years of jobs. Zero respect. Done.',
    primary: 'Pure business decisions',
    secondary: 'Rare promos are lifelines',
    startStats: { pop: 15, heat: 15, push: 8 },
    gain: 5,
    comingSoon: false
  },
  nepo: {
    id: 'nepo',
    name: 'Nepo Son',
    difficulty: 'EASY',
    difficultyBar: 1,
    blurb: 'Everything handed to you. Earn it.',
    primary: 'Promos only',
    secondary: 'None — daddy handled it',
    startStats: { pop: 60, heat: 25, push: 75 },
    gain: 15,
    comingSoon: true
  },
  outlaw: {
    id: 'outlaw',
    name: 'American Outlaw',
    difficulty: 'MEDIUM',
    difficultyBar: 2,
    blurb: 'Respected. Ceiling unknown.',
    primary: 'Promos + light politics',
    secondary: 'Occasional locker room moments',
    startStats: { pop: 45, heat: 35, push: 40 },
    gain: 12,
    comingSoon: true
  },
  cult: {
    id: 'cult',
    name: 'Cult Hero',
    difficulty: 'MED-HARD',
    difficultyBar: 3,
    blurb: 'Over without a push. They bury you anyway.',
    primary: 'Fighting creative',
    secondary: 'Booking meetings, crowd vs booker tension',
    startStats: { pop: 50, heat: 30, push: 20 },
    gain: 10,
    comingSoon: true
  },
  clown: {
    id: 'clown',
    name: 'Sad Clown',
    difficulty: 'HARD',
    difficultyBar: 4,
    blurb: "Nobody believes in you. That's the point.",
    primary: 'Gimmick survival',
    secondary: 'War room pressure, repackage threats',
    startStats: { pop: 25, heat: 35, push: 25 },
    gain: 8,
    comingSoon: true
  }
};

export const CHARACTER_ORDER = ['jobber', 'nepo', 'outlaw', 'cult', 'clown'];

export function startingStatsFor(characterId, alignment) {
  const base = CHARACTERS[characterId].startStats;
  if (alignment === 'heel') {
    return { pop: base.heat, heat: base.pop, push: base.push };
  }
  return { ...base };
}

export const CHAPTER_TYPES = {
  PROMO:     'promo',
  WAR_ROOM:  'warRoom',
  LIGHT_POL: 'lightPolitics',
  BUSINESS:  'business',
  CURTAIN:   'curtain',
  CONTRACT:  'curtainPromo'
};

export const CHAPTER_FLOW = {
  nepo:   ['promo', 'promo', 'promo',         'promo',   'promo',         'promo', 'promo',        'promo'],
  outlaw: ['promo', 'promo', 'lightPolitics', 'promo',   'lightPolitics', 'promo', 'curtainPromo', 'promo'],
  cult:   ['promo', 'promo', 'warRoom',       'curtain', 'warRoom',       'promo', 'curtainPromo', 'promo'],
  clown:  ['promo', 'promo', 'warRoom',       'curtain', 'warRoom',       'promo', 'curtainPromo', 'promo'],
  jobber: ['promo', 'warRoom','business',     'curtain', 'business',      'promo', 'business',     'promo']
};

export const CHAPTER_TITLES = [
  'Debut Promo',
  'Rival Introduced',
  'Booking Decision',
  'Program Gets Personal',
  'Booking Decision',
  'Promo War',
  'Contract Signing',
  'Championship Showdown'
];
