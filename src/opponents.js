// src/opponents.js
//
// Move damage formula (both sides):
//   dmg = max(1, round( power + (atk - def) / 10 ))
//
// Player alignment: 'face' (pop > heat) | 'heel' (heat >= pop)
//   Heel moves have higher average power → better dmgOut in rounds 1-2.
//
// Finisher tier gated by lean = max(pop, heat) — both face and heel builds
// can reach higher tiers by building their primary crowd stat:
//   lean < 20  → tier 1 (power  7)   early game, ch1-2
//   lean >= 20 → tier 2 (power 10)   mid game,   ch3-5
//   lean >= 40 → tier 3 (power 14)   late game,  ch7-8
//
// Opponent stats are calibrated to the chapter they appear in. As the
// player's pop/heat/push accumulate, later opponents have higher def and
// pow so the match stays challenging throughout the run.
//
// Kickout odds: 15% + (push / 100) × 60% → 15% at push=0, 75% at push=100.
// The jobber's max push is ~32 by ch8, giving ~34% base. Grind mid-match
// bonus (+8%) can bring it to ~42% at peak — hard but earnable.

// ─── PLAYER MOVE POOLS ───────────────────────────────────────────────────────

const JOBBER_MOVES = {
  rounds: [
    // any alignment
    { name: 'Lariat',           power: 4, stat: 'pow', rarity: 'common', alignment: 'any'  },
    { name: 'Snap Suplex',      power: 4, stat: 'pow', rarity: 'common', alignment: 'any'  },
    { name: 'Headlock',         power: 3, stat: 'pow', rarity: 'common', alignment: 'any'  },
    { name: 'Atomic Drop',      power: 3, stat: 'pow', rarity: 'common', alignment: 'any'  },
    { name: 'Running Elbow',    power: 6, stat: 'pow', rarity: 'rare',   alignment: 'any'  },
    { name: 'Spinebuster',      power: 6, stat: 'pow', rarity: 'rare',   alignment: 'any'  },
    // face — crowd-energy moves, slightly lower power ceiling
    { name: 'Hip Toss',         power: 4, stat: 'cha', rarity: 'common', alignment: 'face' },
    { name: 'Dropkick',         power: 4, stat: 'cha', rarity: 'common', alignment: 'face' },
    { name: 'Comeback Punch',   power: 5, stat: 'cha', rarity: 'rare',   alignment: 'face' },
    { name: 'Fighting Spirit',  power: 6, stat: 'cha', rarity: 'rare',   alignment: 'face' },
    // heel — dirty and deliberate, +1-2 power over face equivalent
    { name: 'Dirty Stomp',      power: 5, stat: 'pow', rarity: 'common', alignment: 'heel' },
    { name: 'Eye Rake',         power: 5, stat: 'cha', rarity: 'common', alignment: 'heel' },
    { name: 'Rope Choke',       power: 6, stat: 'pow', rarity: 'common', alignment: 'heel' },
    { name: 'Low Blow Setup',   power: 6, stat: 'pow', rarity: 'rare',   alignment: 'heel' },
    { name: 'Back Rake',        power: 7, stat: 'pow', rarity: 'rare',   alignment: 'heel' },
    { name: 'Thumb to the Eye', power: 7, stat: 'cha', rarity: 'rare',   alignment: 'heel' },
  ],
  // tier = lean tier required. power gap is intentional — tier 3 at lean≥40
  // is nearly double tier 1 before the atk/def modifier kicks in.
  finishers: [
    { name: 'Desperation Slam',    power: 7,  stat: 'pow', rarity: 'finisher', alignment: 'any', tier: 1 },
    { name: 'Grind-It-Out Driver', power: 10, stat: 'pow', rarity: 'finisher', alignment: 'any', tier: 2 },
    { name: 'The Ten-Year Bomb',   power: 14, stat: 'cha', rarity: 'finisher', alignment: 'any', tier: 3 },
  ]
};

// ─── OPPONENTS ───────────────────────────────────────────────────────────────
//
// Calibration targets (typical player stats at each chapter, ~65% of max):
//   ch1: lean ≈ 10,  push ≈ 2    ch3: lean ≈ 15,  push ≈ 8
//   ch5: lean ≈ 20,  push ≈ 13   ch7: lean ≈ 28,  push ≈ 18
//   ch8: lean ≈ 32,  push ≈ 21
//
// def rises with chapter so the player's growing lean stays meaningful;
// pow rises so dmgIn stays threatening even as push builds.

export const OPPONENTS = {
  jobber: [
    // ── Chapter 1 ── debut match, player near 0/0/0 ──────────────────────
    {
      id: 'the_squash',
      name: 'Chad Excellence',
      finisher: 'The Excellence Cutter',
      hp: 70,
      // low def so face moves deal 2-3 even at lean=0; pow moderate so push matters
      stats: { pow: 35, cha: 28, def: 10 },
      moves: [
        { name: 'Shoulder Block',      power: 4, stat: 'pow', rarity: 'common'    },
        { name: 'Running Clothesline', power: 5, stat: 'pow', rarity: 'common'    },
        { name: 'Arm Drag',            power: 3, stat: 'cha', rarity: 'common'    },
        { name: 'Snap DDT',            power: 6, stat: 'pow', rarity: 'rare'      },
        { name: 'Neckbreaker',         power: 6, stat: 'pow', rarity: 'signature' },
      ],
      finisherMove: { name: 'The Excellence Cutter', power: 8, stat: 'pow', rarity: 'finisher', tier: 2 }
    },

    // ── Chapter 3 ── screwjob match, player has lean≈15, push≈8 ──────────
    {
      id: 'the_rookie',
      name: 'Tyler Knox',
      finisher: 'Knox Out',
      hp: 78,
      // def=18: lean=15 barely overcomes it; def is a real hurdle until lean≥20
      stats: { pow: 42, cha: 40, def: 18 },
      moves: [
        { name: 'Running Splash',   power: 4, stat: 'cha', rarity: 'common'    },
        { name: 'Forearm Smash',    power: 5, stat: 'pow', rarity: 'common'    },
        { name: 'Crossbody',        power: 4, stat: 'cha', rarity: 'common'    },
        { name: 'Springboard DDT',  power: 6, stat: 'cha', rarity: 'rare'      },
        { name: 'Running Knee',     power: 7, stat: 'cha', rarity: 'signature' },
      ],
      finisherMove: { name: 'Knox Out', power: 9, stat: 'cha', rarity: 'finisher', tier: 1 }
    },

    // ── Chapter 5 ── midcard rival, player has lean≈20, push≈13 ──────────
    {
      id: 'the_midcard',
      name: 'Rex Havoc',
      finisher: 'The Havoc Driver',
      hp: 86,
      // def=25: tier 2 finisher (lean≥20) now meaningful; pow=50 requires push≥20 to soften
      stats: { pow: 50, cha: 44, def: 25 },
      moves: [
        { name: 'Power Slam',       power: 5, stat: 'pow', rarity: 'common'    },
        { name: 'Knee Drop',        power: 4, stat: 'pow', rarity: 'common'    },
        { name: 'Gut Wrench',       power: 5, stat: 'cha', rarity: 'common'    },
        { name: 'Backdrop Driver',  power: 7, stat: 'pow', rarity: 'rare'      },
        { name: 'Running Powerbomb',power: 8, stat: 'pow', rarity: 'signature' },
      ],
      finisherMove: { name: 'The Havoc Driver', power: 11, stat: 'pow', rarity: 'finisher', tier: 2 }
    },

    // ── Chapter 7 ── contract-signing rival, player has lean≈28, push≈18 ─
    {
      id: 'the_contender',
      name: 'Vince Colossus',
      finisher: 'The Last Word',
      hp: 92,
      // def=30: lean≥30 needed to pull ahead; tier 3 finisher (lean≥40) a real weapon here
      stats: { pow: 58, cha: 52, def: 30 },
      moves: [
        { name: 'Clubbing Forearm',  power: 5, stat: 'pow', rarity: 'common'    },
        { name: 'Vertical Suplex',   power: 6, stat: 'pow', rarity: 'common'    },
        { name: 'Cobra Clutch',      power: 5, stat: 'cha', rarity: 'common'    },
        { name: 'Implant DDT',       power: 7, stat: 'cha', rarity: 'rare'      },
        { name: 'Deadlift German',   power: 9, stat: 'pow', rarity: 'signature' },
      ],
      finisherMove: { name: 'The Last Word', power: 13, stat: 'cha', rarity: 'finisher', tier: 3 }
    },

    // ── Chapter 8 ── PPV championship match, player has lean≈32, push≈21 ─
    {
      id: 'the_champion',
      name: 'Marcus Gold',
      finisher: 'The Gold Standard',
      hp: 100,
      // def=36: only a lean≥40 tier-3 finisher makes a dent cleanly;
      // pow=65 keeps dmgIn threatening even at push≈21 (push needs to be 65+ to zero it)
      stats: { pow: 65, cha: 58, def: 36 },
      moves: [
        { name: 'Big Boot',           power: 6, stat: 'pow', rarity: 'common'    },
        { name: 'Snap Powerslam',     power: 6, stat: 'pow', rarity: 'common'    },
        { name: 'Abdominal Stretch',  power: 5, stat: 'cha', rarity: 'common'    },
        { name: 'Piledriver',         power: 8, stat: 'pow', rarity: 'rare'      },
        { name: 'Overhead Press Slam',power: 9, stat: 'pow', rarity: 'signature' },
      ],
      finisherMove: { name: 'The Gold Standard', power: 16, stat: 'pow', rarity: 'finisher', tier: 3 }
    },
  ]
};

// ─── MOVE SELECTION ──────────────────────────────────────────────────────────

function pickOppMove(moves) {
  const pool = moves.filter(m => m.rarity === 'common' || m.rarity === 'rare');
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickOppSignatureOrRare(moves) {
  const pool = moves.filter(m => m.rarity === 'signature' || m.rarity === 'rare');
  return (pool.length ? pool : moves)[Math.floor(Math.random() * (pool.length || moves.length))];
}

function pickPlayerMove(game) {
  const alignment = game.heat >= game.pop ? 'heel' : 'face';
  const pool = JOBBER_MOVES.rounds.filter(m =>
    m.alignment === 'any' || m.alignment === alignment
  );
  return pool[Math.floor(Math.random() * pool.length)];
}

// lean = max(pop, heat). Both face (pop) and heel (heat) builds can reach tier 3
// by investing in their primary crowd stat. Tier 3 (lean≥40) is achievable
// only in the late game (ch7-8) with a focused build.
function pickPlayerFinisher(game) {
  const lean = Math.max(game.pop, game.heat);
  const tier = lean >= 40 ? 3 : lean >= 20 ? 2 : 1;
  return JOBBER_MOVES.finishers.find(f => f.tier === tier) || JOBBER_MOVES.finishers[0];
}

// ─── EXCHANGE ENGINE ─────────────────────────────────────────────────────────

// Generates all 3 rounds of move-exchange data.
// Rounds 1-2: alignment-matched moves (heel pool has higher power).
// Round 3:    player fires their lean-gated finisher; opponent uses a signature/rare.
export function playExchanges(game, opponent) {
  const yourHpStart = 100;
  let oppHp  = opponent.hp;
  let yourHp = yourHpStart;
  const exchanges = [];

  for (let round = 1; round <= 3; round++) {
    const isFinisherRound = round === 3;

    const oppMove  = isFinisherRound ? pickOppSignatureOrRare(opponent.moves) : pickOppMove(opponent.moves);
    const yourMove = isFinisherRound ? pickPlayerFinisher(game) : pickPlayerMove(game);

    const lean    = Math.max(game.pop, game.heat);
    const oppAtk  = oppMove.stat  === 'pow' ? opponent.stats.pow : opponent.stats.cha;
    const yourAtk = yourMove.stat === 'pow' ? lean : (game.pop + game.heat);

    const dmgIn  = Math.max(1, Math.round(oppMove.power  + (oppAtk  - game.push)          / 10));
    const dmgOut = Math.max(1, Math.round(yourMove.power + (yourAtk - opponent.stats.def) / 10));

    oppHp  = Math.max(0, oppHp  - dmgOut);
    yourHp = Math.max(0, yourHp - dmgIn);

    exchanges.push({ round, oppMove, yourMove, dmgIn, dmgOut, oppHp, yourHp });
  }

  return { exchanges, yourHpStart, oppHp, yourHp };
}

// ─── CLIMAX ──────────────────────────────────────────────────────────────────

// Kickout: push is the primary driver.
// 15% at push=0 → 75% at push=100. Jobber tops out ~34% base at push=32 (ch8 max),
// reaching ~42% with the grind mid-match bonus — hard but earnable.
function kickOutOdds(game, opponent, midBonus) {
  const base = 0.15 + (game.push / 100) * 0.60;
  return Math.min(0.95, Math.max(0.05, base + (midBonus.kickOut || 0)));
}

// Counter: lean (max pop/heat) is the primary driver — the crowd's investment
// in you is what lets you reverse the finisher. 0% at lean=0, 70% at lean=100.
function counterOdds(game, opponent, midBonus) {
  const lean = Math.max(game.pop, game.heat);
  const base = (lean / 100) * 0.70;
  return Math.min(0.90, Math.max(0.05, base + (midBonus.counter || 0)));
}

// Returns preview data for the climax UI display.
export function climaxPreview(game, opponent, midBonus = {}) {
  const lean = Math.max(game.pop, game.heat);
  return {
    kickOut: {
      odds:      kickOutOdds(game, opponent, midBonus),
      your:      game.push,
      threshold: opponent.stats.pow,
    },
    counter: {
      odds:      counterOdds(game, opponent, midBonus),
      statName:  'LEAN',
      your:      lean,
      threshold: opponent.finisherMove?.power || 8,
    }
  };
}

// Resolves the climax and returns a result object.
export function resolveClimax(game, opponent, kind, midBonus = {}) {
  if (kind === 'stayDown') {
    return { kind, success: false, odds: 0, roll: 0, your: 0, threshold: 0, statName: '' };
  }

  if (kind === 'kickOut') {
    const odds = kickOutOdds(game, opponent, midBonus);
    const roll = Math.random();
    return {
      kind, success: roll < odds, odds, roll,
      your: game.push, threshold: opponent.stats.pow, statName: 'PUSH'
    };
  }

  if (kind === 'counter') {
    const odds = counterOdds(game, opponent, midBonus);
    const roll = Math.random();
    const lean = Math.max(game.pop, game.heat);
    return {
      kind, success: roll < odds, odds, roll,
      your: lean, threshold: opponent.finisherMove?.power || 8, statName: 'LEAN'
    };
  }

  return null;
}

// ─── MID-MATCH OPTIONS ───────────────────────────────────────────────────────

export const MID_MATCH_OPTIONS = [
  {
    key:     'grind',
    label:   'GRIND HIM DOWN',
    tagline: 'Work the body. Slow the pace.',
    flavor:  "You spent round two grinding. He's breathing heavy going into the finish.",
    bonus:   { kickOut: 0.08 }
  },
  {
    key:     'highRisk',
    label:   'HIGH RISK',
    tagline: 'Top rope. All or nothing.',
    flavor:  'You went high risk. He had to respect it.',
    bonus:   { counter: 0.12 }
  },
  {
    key:     'playPossum',
    label:   'PLAY DEAD',
    tagline: 'Let him think he has you.',
    flavor:  'You baited him into his finisher setup. He took it.',
    bonus:   { kickOut: 0.05, counter: 0.05 }
  }
];
