// Opponent rosters — Pokemon-style stat blocks for match resolutions.
//
// Jobber has 3 opponents (one per match arc).
// Other archetypes currently have a single championship opponent (TODO: expand
// to 3-arc structure once jobber prototype lands).
//
// TYPE — face / heel / tweener. Drives crowd-lean advantage:
//   your face momentum beats heel types; heel momentum beats face types.
//
// HP — match equity threshold. Compared against your lean + push (+ climax bonus).
//
// POW / DEF / CHA — flavor stats. POW = output, DEF = resilience, CHA = crowd pull.

const JOBBER_OPPONENTS = [
  {
    arc: 'return',
    arcTitle: 'The Return',
    chapter: 3,
    id: 'the_squash',
    name: 'Chad Excellence',
    role: 'House Show Killer',
    type: 'face',
    hp: 50,
    stats: { pow: 22, def: 18, cha: 30 },
    signature: 'Standing Dropkick',
    finisher: 'Excellence Driver',
    blurb: "Your return match. Booked to squash you in three minutes. He doesn't even know your name.",
    weakness: 'Underestimation — he\'s phoning it in.'
  },
  {
    arc: 'screwjob',
    arcTitle: 'The Rookie Screwjob',
    chapter: 6,
    id: 'the_rookie',
    name: 'Tyler "Future" Knox',
    role: 'Booker\'s New Project',
    type: 'face',
    hp: 75,
    stats: { pow: 45, def: 40, cha: 70 },
    signature: 'Springboard Cutter',
    finisher: 'Future Shock',
    blurb: "Three months in. Already on TV. The booker told you to lay down clean. He's watching from gorilla.",
    weakness: 'Inexperience — improvises badly when the script breaks.'
  },
  {
    arc: 'championship',
    arcTitle: 'The Championship',
    chapter: 9,
    id: 'the_chosen_one',
    name: 'The Chosen One',
    role: 'Anointed Heir',
    type: 'face',
    hp: 100,
    stats: { pow: 65, def: 60, cha: 85 },
    signature: 'Babyface Fire',
    finisher: 'The Anointing',
    blurb: "The kid the company built the year around. You're not supposed to be in this match at all.",
    weakness: 'Sympathy upset — ten years of jobs cashing in for one night.'
  }
];

export const OPPONENTS = {
  jobber: JOBBER_OPPONENTS,
  nepo: [{
    arc: 'championship', arcTitle: 'The Championship', chapter: 8,
    id: 'mr_company', name: 'Mr. Company', role: 'Reigning Champion',
    type: 'face', hp: 95, stats: { pow: 78, def: 88, cha: 92 },
    signature: 'The Handshake', finisher: 'Company Man Driver',
    blurb: "Your dad's hand-picked heir. Twenty-year veteran.",
    weakness: 'Heel heat — fans will boo a coronation.'
  }],
  outlaw: [{
    arc: 'championship', arcTitle: 'The Championship', chapter: 8,
    id: 'the_suit', name: 'The Suit', role: 'Authority Figure',
    type: 'heel', hp: 100, stats: { pow: 60, def: 95, cha: 70 },
    signature: 'Corporate Edict', finisher: 'Pink Slip',
    blurb: "Booker who wears a tie and never bumps.",
    weakness: 'Face pop — the people revolt if he cheats.'
  }],
  cult: [{
    arc: 'championship', arcTitle: 'The Championship', chapter: 8,
    id: 'house_favorite', name: 'The House Favorite', role: "Booker's Golden Boy",
    type: 'face', hp: 105, stats: { pow: 85, def: 80, cha: 65 },
    signature: 'Scripted Comeback', finisher: 'Booked Strong',
    blurb: "Protected. Pushed. Never lost clean.",
    weakness: 'Crowd hijack — chants he can\'t script out.'
  }],
  clown: [{
    arc: 'championship', arcTitle: 'The Championship', chapter: 8,
    id: 'the_serious_one', name: 'The Serious One', role: 'Workrate Darling',
    type: 'tweener', hp: 90, stats: { pow: 90, def: 75, cha: 80 },
    signature: 'Five-Star Sequence', finisher: 'Smark Special',
    blurb: "Won't sell your offense because he thinks the gimmick is beneath him.",
    weakness: 'Belief — if the live crowd buys the gimmick, his cred cracks.'
  }]
};

// ─── MATCH BEAT — Pokemon-style turn-based ──────────────────────────────────
//
// Flow:
//   1. Round 1: opponent attacks you → you attack opponent  (HP ticks both ways)
//   2. Round 2: same
//   3. Round 3: same
//   4. Climax choice:
//        - STAY DOWN  → automatic loss. No roll. The crowd boos. You go home.
//        - KICK OUT   → odds roll. Success = you survive the finisher and pin
//                       them on the next exchange. Failure = pinned, lose.
//        - COUNTER    → odds roll. Success = you reverse the finisher into your
//                       finisher and win. Failure = caught mid-counter, lose
//                       decisively (worst ending flavor).
//
// Player HP = (your lean) + push.  Lean = max(pop, heat).
// Opponent HP = opponent.hp (from card).
//
// Each round, both sides throw a move from their move list. Damage formula:
//   dmg = move.power + (attacker stat - defender stat) / 4   (floor 1)
//   - Attacker stat = pow for striking moves, cha for "crowd" moves
//   - Defender stat = def
//
// Climax odds (chance to succeed):
//   KICK OUT: yourPush / (yourPush + opponent.stats.def)   — gritty survival
//   COUNTER:  yourLean / (yourLean + opponent.stats.pow)   — crowd-fueled reversal
//
// Both odds are scaled by remaining-HP ratio so if you got pummeled in the
// exchanges, the climax is harder:
//   adjustedOdds = baseOdds * (yourHpRemaining / yourHpStart)

// ─── ROUND-TIERED MOVE POOLS ────────────────────────────────────────────────
//
// Each round draws from its own pool. Within a pool, moves have a rarity that
// weights the random draw. Better moves are rarer.
//
// Rarity is the GATE — it sets the minimum stat needed to hit this move.
// You don't draw moves; you earn them through stats. See RARITY_MIN_STAT below.

export const PLAYER_MOVE_POOL = {
  jobber: {
    1: [ // Round 1 — strikes & taunts
      { name: 'Chest Chop',         power: 8,  stat: 'pow', rarity: 'common',   alignment: 'face', flavor: 'WOO from the front row.' },
      { name: 'Right Hand',         power: 9,  stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'Closed fist. Hard.' },
      { name: 'Boot Scrape',        power: 5,  stat: 'pow', rarity: 'common',   alignment: 'heel', flavor: 'Toe of the boot across his forehead.' },
      { name: 'Knife-Edge',         power: 7,  stat: 'pow', rarity: 'common',   alignment: 'face', flavor: 'Skin turns red. Crowd whoops.' },
      { name: 'Headlock Takedown',  power: 6,  stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'Old-school. Slow. Effective.' },
      { name: 'Eye Rake',           power: 11, stat: 'pow', rarity: 'uncommon', alignment: 'heel', flavor: 'Ref turned for half a second.' },
      { name: 'Hard Tag (Slap)',    power: 10, stat: 'cha', rarity: 'uncommon', alignment: 'face', flavor: 'No partner. You slap your own thigh.' },
      { name: 'Choke on Ropes',     power: 12, stat: 'pow', rarity: 'uncommon', alignment: 'heel', flavor: 'Ref counts. You hold for four.' },
      { name: 'Stiff Receipt',      power: 14, stat: 'pow', rarity: 'rare',     alignment: 'heel', flavor: 'He gave you one earlier. You remembered.' },
      { name: 'Crowd-Pleaser Combo',power: 13, stat: 'cha', rarity: 'rare',     alignment: 'face', flavor: 'Three signature strikes. The arena counts along.' }
    ],
    2: [ // Round 2 — power moves
      { name: 'Body Slam',          power: 10, stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'Textbook. Crowd half-pops.' },
      { name: 'Elbow Drop',         power: 9,  stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'Off the second rope. Cover.' },
      { name: 'Leg Drop',           power: 8,  stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'Straight across the throat.' },
      { name: 'Vertical Suplex',    power: 12, stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'Held it for the count.' },
      { name: 'Backbreaker',        power: 11, stat: 'pow', rarity: 'common',   alignment: 'any',  flavor: 'He arches. He stays down a beat.' },
      { name: 'Spinebuster',        power: 14, stat: 'pow', rarity: 'uncommon', alignment: 'face', flavor: 'Picks him up, drives him down.' },
      { name: 'Half-Crab',          power: 13, stat: 'pow', rarity: 'uncommon', alignment: 'heel', flavor: 'Sits back. He claws for the ropes.' },
      { name: 'Camel Clutch',       power: 13, stat: 'pow', rarity: 'uncommon', alignment: 'heel', flavor: 'You yell at the ref. The ref yells back.' },
      { name: 'German Suplex',      power: 16, stat: 'pow', rarity: 'rare',     alignment: 'any',  flavor: 'Bridge. Two count.' },
      { name: 'Powerbomb',          power: 19, stat: 'pow', rarity: 'rare',     alignment: 'face', flavor: 'Up. Long. Down. The mat shakes.' },
      { name: 'Brainbuster',        power: 22, stat: 'pow', rarity: 'epic',     alignment: 'heel', flavor: 'On the crown. Ref glares at you.' }
    ],
    3: [ // Round 3 — highspots / finishers
      { name: 'Top-Rope Elbow',     power: 14, stat: 'pow', rarity: 'common',   alignment: 'face', flavor: 'Old reliable. Crowd counts with you.' },
      { name: 'Diving Crossbody',   power: 13, stat: 'cha', rarity: 'common',   alignment: 'face', flavor: 'Off the top. He catches you. You shift weight. Down.' },
      { name: 'Low Blow (Ref Down)',power: 12, stat: 'pow', rarity: 'common',   alignment: 'heel', flavor: 'You time it. Ref never sees.' },
      { name: 'Frog Splash',        power: 18, stat: 'pow', rarity: 'uncommon', alignment: 'face', flavor: 'Legs out, all of you.' },
      { name: 'Suicide Dive',       power: 17, stat: 'cha', rarity: 'uncommon', alignment: 'face', flavor: 'Through the second rope. Bodies in row one.' },
      { name: 'Chair Shot',         power: 15, stat: 'pow', rarity: 'uncommon', alignment: 'heel', flavor: 'DQ doesn\'t scare you anymore.' },
      { name: 'Moonsault',          power: 22, stat: 'pow', rarity: 'rare',     alignment: 'face', flavor: 'Full rotation. Crowd on its feet.' },
      { name: 'Piledriver',         power: 18, stat: 'pow', rarity: 'rare',     alignment: 'heel', flavor: 'Banned in most states. You don\'t care.' },
      { name: 'Shooting Star Press',power: 28, stat: 'cha', rarity: 'epic',     alignment: 'face', flavor: 'You haven\'t hit it in five years. You hit it tonight.' },
      { name: 'Canadian Destroyer', power: 22, stat: 'pow', rarity: 'epic',     alignment: 'heel', flavor: 'Standing flip. He never sees the mat coming.' },
      { name: 'Burning Hammer',     power: 32, stat: 'pow', rarity: 'legendary',alignment: 'any',  flavor: 'You\'ve never called for it before. Tonight you call for it.' }
    ]
  }
};

// Opponent move pools — round-tiered like the player\'s.
export const OPPONENT_MOVE_POOL = {
  the_squash: {
    1: [
      { name: 'Lockup',         power: 5,  stat: 'pow', rarity: 'common' },
      { name: 'Shoulder Tackle',power: 8,  stat: 'pow', rarity: 'common' },
      { name: 'Pose',           power: 2,  stat: 'cha', rarity: 'common' },
      { name: 'Cheap Slap',     power: 7,  stat: 'pow', rarity: 'uncommon' }
    ],
    2: [
      { name: 'Stalling Suplex',  power: 9,  stat: 'pow', rarity: 'common' },
      { name: 'Bodyslam',         power: 10, stat: 'pow', rarity: 'common' },
      { name: 'Standing Dropkick',power: 11, stat: 'pow', rarity: 'uncommon' }
    ],
    3: [
      { name: 'Top-Rope Splash', power: 14, stat: 'pow', rarity: 'common' },
      { name: 'Excellence Driver',power: 16, stat: 'pow', rarity: 'rare' }
    ]
  },
  the_rookie: {
    1: [
      { name: 'Quick Jabs',     power: 7,  stat: 'pow', rarity: 'common' },
      { name: 'Dropkick',       power: 9,  stat: 'pow', rarity: 'common' },
      { name: 'Crowd Point',    power: 3,  stat: 'cha', rarity: 'common' },
      { name: 'Hurricanrana',   power: 11, stat: 'cha', rarity: 'uncommon' }
    ],
    2: [
      { name: 'Northern Lights',  power: 12, stat: 'pow', rarity: 'common' },
      { name: 'Standing Moonsault',power: 14,stat: 'pow', rarity: 'uncommon' },
      { name: 'Springboard Cutter',power:16, stat: 'pow', rarity: 'rare' }
    ],
    3: [
      { name: 'Tope Suicida',     power: 15, stat: 'cha', rarity: 'common' },
      { name: '450 Splash',       power: 18, stat: 'pow', rarity: 'rare' },
      { name: 'Future Shock',     power: 20, stat: 'pow', rarity: 'epic' }
    ]
  },
  the_chosen_one: {
    1: [
      { name: 'Crowd Salute',   power: 4,  stat: 'cha', rarity: 'common' },
      { name: 'Right Hands',    power: 9,  stat: 'pow', rarity: 'common' },
      { name: 'Atomic Drop',    power: 10, stat: 'pow', rarity: 'uncommon' }
    ],
    2: [
      { name: 'Powerslam',      power: 13, stat: 'pow', rarity: 'common' },
      { name: 'Sit-Out Slam',   power: 15, stat: 'pow', rarity: 'uncommon' },
      { name: 'Babyface Fire',  power: 14, stat: 'cha', rarity: 'rare' }
    ],
    3: [
      { name: 'Top-Rope Splash',power: 16, stat: 'pow', rarity: 'common' },
      { name: 'Spear',          power: 18, stat: 'pow', rarity: 'rare' },
      { name: 'The Anointing',  power: 24, stat: 'pow', rarity: 'epic' }
    ]
  },
  mr_company: {
    1: [{ name: 'Headlock', power: 6, stat: 'pow', rarity: 'common' }, { name: 'Crowd Work', power: 4, stat: 'cha', rarity: 'common' }],
    2: [{ name: 'Vertical Suplex', power: 12, stat: 'pow', rarity: 'common' }, { name: 'Backdrop', power: 13, stat: 'pow', rarity: 'uncommon' }],
    3: [{ name: 'Lariat', power: 16, stat: 'pow', rarity: 'common' }, { name: 'Company Man Driver', power: 22, stat: 'pow', rarity: 'epic' }]
  },
  the_suit: {
    1: [{ name: 'Cheap Shot', power: 8, stat: 'pow', rarity: 'common' }, { name: 'Bark Orders', power: 3, stat: 'cha', rarity: 'common' }],
    2: [{ name: 'Brass Knux', power: 14, stat: 'pow', rarity: 'uncommon' }, { name: 'Henchman Beatdown', power: 12, stat: 'cha', rarity: 'common' }],
    3: [{ name: 'Pink Slip', power: 18, stat: 'pow', rarity: 'rare' }]
  },
  house_favorite: {
    1: [{ name: 'Scripted Strikes', power: 9, stat: 'pow', rarity: 'common' }, { name: 'Posing', power: 3, stat: 'cha', rarity: 'common' }],
    2: [{ name: 'Booked Lariat', power: 13, stat: 'pow', rarity: 'common' }, { name: 'Scripted Comeback', power: 15, stat: 'cha', rarity: 'uncommon' }],
    3: [{ name: 'Booked Strong', power: 20, stat: 'pow', rarity: 'rare' }]
  },
  the_serious_one: {
    1: [{ name: 'Stiff Strikes', power: 11, stat: 'pow', rarity: 'common' }, { name: 'Refuse to Sell', power: 5, stat: 'cha', rarity: 'uncommon' }],
    2: [{ name: 'Five-Star Sequence', power: 16, stat: 'pow', rarity: 'rare' }, { name: 'Deadlift Suplex', power: 14, stat: 'pow', rarity: 'common' }],
    3: [{ name: 'Smark Special', power: 19, stat: 'pow', rarity: 'rare' }]
  }
};

// Rarity gates — the minimum relevant stat needed to "deserve" a move.
// You don't draw moves; you earn them. High pop/heat/push unlocks the rare stuff.
export const RARITY_MIN_STAT = {
  common: 0, uncommon: 30, rare: 55, epic: 75, legendary: 90
};

// Round → which stat gates the move pool for that round.
//   R1 strikes — driven by crowd presence (lean = max(pop,heat))
//   R2 power   — driven by booker belief (push)
//   R3 highspots — driven by crowd (lean)
const ROUND_STAT = { 1: 'lean', 2: 'push', 3: 'lean' };

const leanOf = state => Math.max(state.pop, state.heat);
const statByKey = (state, key) => key === 'push' ? state.push : leanOf(state);

// Damage formula. Floor at 2 so even mismatched fights still chip HP.
// stat delta has 1/10 weight so a 50-point gap = ±5 damage swing, not ±12.
// pushBonus adds a flat +push/15 to player damage — high-push wrestlers hit
// harder because the booker has called the spots and they know what works.
const moveDamage = (move, attackerStat, defenderStat, pushBonus = 0) =>
  Math.max(2, Math.round(move.power + (attackerStat - defenderStat) / 10 + pushBonus / 15));

// Player HP — baseline 60 so a 0/0/0 jobber still has stamina.
// Scales with both stats: high lean (over crowd) + high push (booker belief).
const playerHpStart = state => 60 + Math.max(state.pop, state.heat) + state.push;

// Pick the highest-power move that (a) the given stat clears the rarity gate
// for and (b) matches the alignment ('face' if pop ≥ heat, else 'heel').
// 'any'-aligned moves are always eligible.
export function pickBestMove(pool, statValue, alignment) {
  const eligible = pool.filter(m =>
    statValue >= (RARITY_MIN_STAT[m.rarity] || 0) &&
    (!m.alignment || m.alignment === 'any' || m.alignment === alignment)
  );
  if (!eligible.length) {
    // fall back to any common 'any'-aligned move so the match doesn\'t crash
    return pool.find(m => (m.alignment || 'any') === 'any') || pool[0];
  }
  return eligible.reduce((best, m) => m.power > best.power ? m : best, eligible[0]);
}

const alignmentOf = state => state.pop >= state.heat ? 'face' : 'heel';

// For opponents: gated by their own pow stat, aligned to their card's alignment.
const pickOppMove = (pool, opponent) =>
  pickBestMove(pool, opponent.stats.pow, opponent.alignment || 'face');

// Play the 3 exchanges deterministically. Both sides pick the best move their
// stats allow each round. No RNG.
export function playExchanges(state, opponent) {
  const yourHpStart = playerHpStart(state);
  let yourHp = yourHpStart;
  let oppHp = opponent.hp;

  const playerPool = PLAYER_MOVE_POOL[state.character] || PLAYER_MOVE_POOL.jobber;
  const oppPool = OPPONENT_MOVE_POOL[opponent.id] || PLAYER_MOVE_POOL.jobber;
  const exchanges = [];

  for (let r = 1; r <= 3; r++) {
    const om = pickOppMove(oppPool[r] || oppPool[1], opponent);
    const omAttack = om.stat === 'pow' ? opponent.stats.pow : opponent.stats.cha;
    const dmgIn = moveDamage(om, omAttack, state.push);
    yourHp = Math.max(0, yourHp - dmgIn);

    const playerStat = statByKey(state, ROUND_STAT[r]);
    const ym = pickBestMove(playerPool[r] || playerPool[1], playerStat, alignmentOf(state));
    const ymAttack = ym.stat === 'pow' ? leanOf(state) : (state.pop + state.heat);
    const dmgOut = moveDamage(ym, ymAttack, opponent.stats.def, state.push);
    oppHp = Math.max(0, oppHp - dmgOut);

    exchanges.push({ round: r, oppMove: om, dmgIn, yourHp, yourMove: ym, dmgOut, oppHp });
  }

  return { yourHpStart, yourHp, oppHp, exchanges };
}

// Climax — stat-driven odds roll. Floor 15% so a 0-stat jobber still has hope;
// cap 85% so a stacked stat block isn't a coin-flip away from a sure thing.
//
//   STAY DOWN: auto-lose (keeps the BELOVED LOSER path viable).
//   KICK OUT:  odds = push / (push + opp.def)
//   COUNTER:   odds = lean / (lean + opp.pow)
const FLOOR = 0.15, CAP = 0.85;
const clampOdds = p => Math.max(FLOOR, Math.min(CAP, p));

// Mid-match decision: a single choice between R2 and R3 that swings the climax
// odds without touching pop/heat/push. Keeps the stat economy clean — match
// internals stay inside the match.
export const MID_MATCH_OPTIONS = [
  { key: 'chair',
    label: 'GRAB THE CHAIR',
    tagline: 'Ref distracted. You go for it. Crowd loses their mind.',
    bonus: { counter: 0.15, kickOut: -0.05 },
    flavor: 'You crack the chair across his back. Ref turns just as you toss it.'
  },
  { key: 'crowd',
    label: 'PLAY THE CROWD',
    tagline: 'You sell death. They start chanting your name.',
    bonus: { kickOut: 0.15, counter: -0.05 },
    flavor: 'You crawl to the corner. Eyes up. The "let\'s go" chant builds.'
  },
  { key: 'gamble',
    label: 'GO FOR THE FINISHER NOW',
    tagline: 'No setup. Just hit it. Risk everything.',
    bonus: { counter: 0.10, kickOut: 0.10 },
    flavor: 'You explode off the mat. He didn\'t see it coming. Neither did the crowd.'
  }
];

function climaxOddsFor(state, opponent, kind, midBonus = {}) {
  let base = 0;
  if (kind === 'kickOut') {
    const denom = state.push + opponent.stats.def;
    base = denom ? state.push / denom : FLOOR;
  } else if (kind === 'counter') {
    const lean = leanOf(state);
    const denom = lean + opponent.stats.pow;
    base = denom ? lean / denom : FLOOR;
  } else {
    return 0;
  }
  return clampOdds(base + (midBonus[kind] || 0));
}

export function resolveClimax(state, opponent, climaxKind, midBonus = {}, rng = Math.random) {
  if (climaxKind === 'stayDown') {
    return { kind: 'stayDown', success: false, auto: true };
  }
  const odds = climaxOddsFor(state, opponent, climaxKind, midBonus);
  const roll = rng();
  const success = roll < odds;
  const lean = leanOf(state);
  if (climaxKind === 'kickOut') {
    return { kind: 'kickOut', success, odds, roll,
             your: state.push, threshold: opponent.stats.def, statName: 'PUSH' };
  }
  if (climaxKind === 'counter') {
    return { kind: 'counter', success, odds, roll,
             your: lean, threshold: opponent.stats.pow,
             statName: state.pop >= state.heat ? 'POP' : 'HEAT' };
  }
  return { kind: climaxKind, success: false };
}

// Pre-decision preview — what the odds *would* be, no roll consumed.
export function climaxPreview(state, opponent, midBonus = {}) {
  const lean = leanOf(state);
  return {
    stayDown: { success: false, auto: true },
    kickOut:  { odds: climaxOddsFor(state, opponent, 'kickOut', midBonus),
                your: state.push, threshold: opponent.stats.def, statName: 'PUSH' },
    counter:  { odds: climaxOddsFor(state, opponent, 'counter', midBonus),
                your: lean, threshold: opponent.stats.pow,
                statName: state.pop >= state.heat ? 'POP' : 'HEAT' }
  };
}

// Full playthrough — exchanges + climax. Used by the story-map preview.
export function playMatch(state, opponent, climaxKind) {
  const ex = playExchanges(state, opponent);
  const climax = resolveClimax(state, opponent, climaxKind);
  return { ...ex, climax, won: climax.success, opponent };
}
