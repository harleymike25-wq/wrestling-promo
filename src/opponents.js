// src/opponents.js
//
// Move damage formula (both sides):
//   dmg = max(1, round( power + (atk - def) / 10 ))
//
// Player alignment: 'face' (pop > heat) | 'heel' (heat >= pop)
//   Heel moves have higher average power → better dmgOut in rounds 1-2.
//
// Finisher tier gated by pop:
//   pop >= 50 → tier 3 (power 14) · pop >= 25 → tier 2 (power 10) · else tier 1 (power 7)
//
// Kickout odds: push is primary driver — 15% at push=0, 75% at push=100.
// Counter odds: lean (max pop/heat) is primary driver.

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
    // heel — dirty and deliberate, higher average power (+1-2 over face equivalent)
    { name: 'Dirty Stomp',      power: 5, stat: 'pow', rarity: 'common', alignment: 'heel' },
    { name: 'Eye Rake',         power: 5, stat: 'cha', rarity: 'common', alignment: 'heel' },
    { name: 'Rope Choke',       power: 6, stat: 'pow', rarity: 'common', alignment: 'heel' },
    { name: 'Low Blow Setup',   power: 6, stat: 'pow', rarity: 'rare',   alignment: 'heel' },
    { name: 'Back Rake',        power: 7, stat: 'pow', rarity: 'rare',   alignment: 'heel' },
    { name: 'Thumb to the Eye', power: 7, stat: 'cha', rarity: 'rare',   alignment: 'heel' },
  ],
  finishers: [
    { name: 'Desperation Slam',    power: 7,  stat: 'pow', rarity: 'finisher', alignment: 'any', tier: 1 },
    { name: 'Grind-It-Out Driver', power: 10, stat: 'pow', rarity: 'finisher', alignment: 'any', tier: 2 },
    { name: 'The Ten-Year Bomb',   power: 14, stat: 'cha', rarity: 'finisher', alignment: 'any', tier: 3 },
  ]
};

// ─── OPPONENTS ───────────────────────────────────────────────────────────────

export const OPPONENTS = {
  jobber: [
    {
      id: 'the_squash',
      name: 'Chad Excellence',
      finisher: 'The Excellence Cutter',
      hp: 80,
      stats: { pow: 45, cha: 35, def: 20 },
      moves: [
        { name: 'Shoulder Block',      power: 4, stat: 'pow', rarity: 'common'    },
        { name: 'Running Clothesline', power: 5, stat: 'pow', rarity: 'common'    },
        { name: 'Arm Drag',            power: 3, stat: 'cha', rarity: 'common'    },
        { name: 'Snap DDT',            power: 6, stat: 'pow', rarity: 'rare'      },
        { name: 'Neckbreaker',         power: 6, stat: 'pow', rarity: 'signature' },
      ],
      finisherMove: { name: 'The Excellence Cutter', power: 10, stat: 'pow', rarity: 'finisher', tier: 2 }
    },
    {
      id: 'the_rookie',
      name: 'Tyler Knox',
      finisher: 'Knox Out',
      hp: 70,
      stats: { pow: 35, cha: 40, def: 15 },
      moves: [
        { name: 'Running Splash',   power: 4, stat: 'cha', rarity: 'common'    },
        { name: 'Forearm Smash',    power: 5, stat: 'pow', rarity: 'common'    },
        { name: 'Crossbody',        power: 4, stat: 'cha', rarity: 'common'    },
        { name: 'Springboard DDT',  power: 6, stat: 'cha', rarity: 'rare'      },
        { name: 'Running Knee',     power: 7, stat: 'cha', rarity: 'signature' },
      ],
      finisherMove: { name: 'Knox Out', power: 8, stat: 'cha', rarity: 'finisher', tier: 1 }
    }
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

// pop >= 50 → tier 3 (power 14), pop >= 25 → tier 2 (power 10), else tier 1 (power 7).
function pickPlayerFinisher(game) {
  const tier = game.pop >= 50 ? 3 : game.pop >= 25 ? 2 : 1;
  return JOBBER_MOVES.finishers.find(f => f.tier === tier) || JOBBER_MOVES.finishers[0];
}

// ─── EXCHANGE ENGINE ─────────────────────────────────────────────────────────

// Generates all 3 rounds of move-exchange data.
// Rounds 1-2: alignment-matched moves (heel pool has higher power).
// Round 3:    player fires their pop-gated finisher; opponent uses a signature/rare.
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

// Push is the primary driver: 15% at push=0, 75% at push=100.
function kickOutOdds(game, opponent, midBonus) {
  const base = 0.15 + (game.push / 100) * 0.60;
  return Math.min(0.95, Math.max(0.05, base + (midBonus.kickOut || 0)));
}

// Lean (max pop/heat) drives counter odds: 0% at lean=0, 70% at lean=100.
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
