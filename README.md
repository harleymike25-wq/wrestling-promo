# AWF Wrestling Promos

A visual novel / RPG hybrid where you build a wrestling career through promo decisions and in-ring match mechanics. Built with React Native / Expo.

---

## Game Mechanics

### Stats

| Stat | What It Drives |
|------|----------------|
| **Pop** | Crowd cheers · face move damage · counter odds · finisher tier |
| **Heat** | Crowd heat · heel move damage · counter odds · finisher tier |
| **Push** | Reduces incoming damage · kickout odds |
| **Lean** | `max(pop, heat)` — the dominant crowd stat. Used for counter odds and finisher tier unlock |

---

### Promo Scenes

Each chapter has 2–3 scenes before any match. Choices move one or more stats up or down. Alignment emerges from your running pop/heat totals — no upfront selection.

---

### Match Flow

#### Rounds 1–2 — Exchange

Both sides draw moves. Damage formula:

```
dmgOut = max(1, round( power + (lean − opponent.def) / 10 ))
dmgIn  = max(1, round( power + (opponent.pow − push) / 10 ))
```

**Heel** `(heat ≥ pop)` draws from a higher-power dirty move pool (+1–2 power over face equivalent). Being a heel pays off in the early rounds.

#### THE MOMENT — after round 2

Pick one mid-match adjustment before the finisher exchange:

| Option | Bonus |
|--------|-------|
| GRIND HIM DOWN | +8% kickout odds |
| HIGH RISK | +12% counter odds |
| PLAY DEAD | +5% kickout, +5% counter |

#### Round 3 — Player Finisher

Your finisher tier is gated by **lean**:

| Lean | Finisher | Power |
|------|----------|-------|
| < 20 | Desperation Slam | 7 |
| ≥ 20 | Grind-It-Out Driver | 10 |
| ≥ 40 | The Ten-Year Bomb | 14 |

The tier 3 finisher is achievable by a focused face (high pop) or heel (high heat) build in the late game (ch7–8).

---

### Climax — Repeatable Loop

Opponent sets up their finisher. Three options, available every time:

| Choice | Mechanic |
|--------|----------|
| **STAY DOWN** | Auto-loss |
| **EAT IT** (kickout) | Push odds: `15% + (push / 100 × 60%)` |
| **REVERSE** | Lean odds: `lean / 100 × 70%` |

Odds are shown on the button before you commit. After the roll, the screen shows the exact odds, roll, and result.

**Kick out succeeds → the loop continues:**

#### FIRED UP — post-kickout decision

Pick how you respond before the next exchange:

| Option | Counter | Kickout |
|--------|---------|---------|
| CALL YOUR SHOT | +22% | −5% |
| BRAWL BACK | +15% | +5% |
| SLOW IT DOWN | +10% | +10% |

CALL YOUR SHOT is the highest-upside play but makes a failed kickout more likely. SLOW IT DOWN keeps both options safe. One more exchange fires, then back to the climax — same three options again.

**The only path to a match win is REVERSE succeeding.**

Kickout is repeatable as long as the odds hold. A high-push player can survive multiple finishers but must still go for the reverse to win.

---

### Opponents — Chapter Calibration

Opponent stats scale to match the player's typical stat accumulation at each point in the run.

| Chapter | Opponent | HP | POW | DEF | Finisher Power |
|---------|----------|----|-----|-----|----------------|
| 1 | Chad Excellence | 70 | 35 | 10 | 8 |
| 3 | Tyler Knox | 78 | 42 | 18 | 9 |
| 5 | Rex Havoc | 86 | 50 | 25 | 11 |
| 7 | Vince Colossus | 92 | 58 | 30 | 13 |
| 8 | Marcus Gold | 100 | 65 | 36 | 16 |

Low early `def` means face moves deal real damage even at zero stats. Rising `def` and `pow` ensure the player's accumulated lean and push stay meaningful throughout.

---

### Characters

| Character | Difficulty | Starting Stats | Notes |
|-----------|------------|----------------|-------|
| Disgruntled Jobber | Hardest | 0 / 0 / 0 | Pure business decisions. Rare promos are lifelines. |
| Nepo Son | Easy | 60 pop / 25 heat / 75 push | Promos only. Everything handed to you — earn it. |
| American Outlaw | Medium | 45 / 35 / 40 | Promos + light politics. |
| Cult Hero | Med-Hard | 50 / 30 / 20 | Fighting creative. Crowd vs booker tension. |
| Sad Clown | Hard | 25 / 35 / 25 | Gimmick survival. Repackage threats. |

---

## Project Structure

```
src/
  story.js       — all scenes, choices, endings, and game logic
  opponents.js   — match engine: moves, exchanges, climax, kickout loop
  characters.js  — character definitions and chapter flow
  constants.js   — palette, screens, win thresholds
  audio.js       — entrance music themes
  sceneImages.js — scene art lookup
```
