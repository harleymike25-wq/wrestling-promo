// VICE — Miami / Street Fighter arcade palette.
// Deep purple-black base, hot pink + cyan as primary accents,
// yellow for stakes / highlight, cream for body text.
export const VICE = {
  bg:        '#0a0118',  // deep purple-black, the cabinet
  bgLight:   '#160534',  // panel background
  panel:     '#1f0a3a',  // card surface
  panelHi:   '#3a1259',  // card hover/selected fill
  border:    '#ff2e88',  // hot pink — active borders
  borderDim: '#7a1545',  // dim pink — inactive borders
  cyan:      '#00e5ff',  // cyan — secondary accent / labels
  yellow:    '#ffea00',  // yellow — headlines / stakes
  text:      '#ffe5fa',  // cream/pink — body text
  textDim:   '#a98bb5',  // muted lavender — secondary text
  black:     '#000000',
  white:     '#ffffff'
};

// Backwards-compat alias so old import sites keep working until renamed.
export const DMG = VICE;

export const SCREENS = {
  TITLE:      'title',
  RING_NAME:  'ringName',
  CHARACTER:  'character',
  ALIGNMENT:  'alignment',
  FORMAT:     'format',
  TAG_NAME:   'tagName',
  MUSIC:      'music',
  GAME:       'game',
  ENDING:     'ending'
};

export const ALIGNMENTS = {
  FACE: 'face',
  HEEL: 'heel'
};

export const FORMATS = {
  SOLO: 'solo',
  TAG:  'tag'
};

export const STAT_MAX = 100;
export const CHAPTER_COUNT = 8;
export const RING_NAME_MAX = 14;

export const WIN_THRESHOLDS = {
  facePath: 100,
  heelPath: 110,
  jobber:    65
};

export const ENDING_GATES = {
  legend:        65,
  controversial: 65,
  beloved:       48
};

export const GM_TRUST_BONUS = 5;
// legacy alias
export const AGENT_TRUST_BONUS = GM_TRUST_BONUS;
