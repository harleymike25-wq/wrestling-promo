// scripts/build-story-map.mjs
//
// Extracts SCENES + ENDINGS from src/story.js and writes a self-contained
// HTML decision-tree viewer to story-map.html in the project root.
//
// Run: node scripts/build-story-map.mjs
// Then open story-map.html in a browser.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const TMP = path.join(__dirname, '.tmp-story-map');

// 1. Copy src/*.js to a tmp dir as .mjs and rewrite relative imports so Node
//    can load them as ESM without affecting the real project.
fs.mkdirSync(TMP, { recursive: true });
const files = ['story.js', 'characters.js', 'constants.js', 'opponents.js'];
for (const f of files) {
  let txt = fs.readFileSync(path.join(SRC, f), 'utf8');
  txt = txt.replace(/from\s+'\.\/([a-zA-Z0-9_-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(path.join(TMP, f.replace(/\.js$/, '.mjs')), txt);
}

const { SCENES, ENDINGS, legacyToBeats } = await import(pathToFileURL(path.join(TMP, 'story.mjs')).href);

// Normalize every scene to the `beats` shape so the renderer has one schema.
// Match-type scenes carry their own shape (opponent + intro + aftermath) and
// pass through untouched.
const normalizedScenes = {};
for (const [charId, list] of Object.entries(SCENES)) {
  normalizedScenes[charId] = list.map(s => {
    const base = {
      id: s.id,
      chapter: s.chapter,
      part: s.part || null,
      chapterTitle: s.chapterTitle || null,
      location: s.location || null,
      type: s.type || null,
    };
    if (s.type === 'match') {
      return { ...base, opponentId: s.opponentId, intro: s.intro || [], afterWin: s.afterWin || [], afterLoss: s.afterLoss || [] };
    }
    return { ...base, beats: legacyToBeats(s) };
  });
}
const { CHARACTERS, CHAPTER_FLOW, CHAPTER_TITLES } = await import(
  pathToFileURL(path.join(TMP, 'characters.mjs')).href
);
const { OPPONENTS, PLAYER_MOVE_POOL, OPPONENT_MOVE_POOL, playMatch, climaxPreview, RARITY_MIN_STAT } = await import(
  pathToFileURL(path.join(TMP, 'opponents.mjs')).href
);

// Simulate a sample match per opponent using a *median* state for that archetype
// at the point in the story they'd meet that opponent. This gives the user a
// preview of "what the math looks like if the player has been making OK picks."
function sampleStateAt(charId, chapter) {
  const ch = chapter || 8;
  // Crude: assume the player gained ~half the available stats by that chapter.
  // (Per-archetype gain table from CHARACTERS.)
  const c = CHARACTERS[charId];
  const startStat = c.startStats;
  const gainPerScene = c.gain;
  const scenesSoFar = ch - 1;
  // Assume an equal split between pop and heat with a slight face lean.
  const accrued = (gainPerScene * scenesSoFar) / 2;
  return {
    character: charId,
    pop:  startStat.pop  + Math.round(accrued * 0.6),
    heat: startStat.heat + Math.round(accrued * 0.4),
    push: startStat.push + Math.round(accrued * 0.3),
    flags: {}
  };
}

const matchPreviews = {};
for (const [charId, oppList] of Object.entries(OPPONENTS)) {
  matchPreviews[charId] = oppList.map(opp => {
    const state = sampleStateAt(charId, opp.chapter);
    return {
      opponent: opp,
      sampleState: state,
      kickOut: playMatch(state, opp, 'kickOut'),
      counter: playMatch(state, opp, 'counter'),
      preview: climaxPreview(state, opp)
    };
  });
}

const data = {
  characters: CHARACTERS,
  chapterFlow: CHAPTER_FLOW,
  chapterTitles: CHAPTER_TITLES,
  scenes: normalizedScenes,
  endings: ENDINGS,
  opponents: OPPONENTS,
  playerMovePool: PLAYER_MOVE_POOL,
  opponentMovePool: OPPONENT_MOVE_POOL,
  rarityMinStat: RARITY_MIN_STAT,
  matchPreviews,
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>AWF Story Map</title>
<style>
  :root {
    --bg: #0f1115; --panel: #161a22; --panel2: #1d2230; --ink: #e7eaf0;
    --dim: #8a94a8; --line: #2a3142; --pop: #4ec9b0; --heat: #f06c6c;
    --push: #f1c40f; --flag: #b48cff;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink);
    font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
  header { position: sticky; top: 0; z-index: 10; background: #0b0d12;
    border-bottom: 1px solid var(--line); padding: 12px 16px; display: flex;
    gap: 12px; align-items: center; flex-wrap: wrap; }
  header h1 { margin: 0; font-size: 16px; font-weight: 600; }
  .tabs { display: flex; gap: 6px; flex-wrap: wrap; }
  .tab { padding: 6px 10px; border: 1px solid var(--line); border-radius: 6px;
    background: var(--panel); color: var(--ink); cursor: pointer; font: inherit; }
  .tab.active { background: var(--panel2); border-color: #4a5570; }
  .tab .meta { color: var(--dim); margin-left: 6px; font-size: 12px; }
  main { padding: 16px; }
  .charhead { display: flex; gap: 16px; align-items: baseline; margin-bottom: 12px;
    padding-bottom: 8px; border-bottom: 1px solid var(--line); }
  .charhead h2 { margin: 0; font-size: 20px; }
  .charhead .blurb { color: var(--dim); }
  .charhead .stats { color: var(--dim); font-size: 12px; margin-left: auto; }
  .chapters { display: flex; flex-direction: column; gap: 14px; }
  .chapter { background: var(--panel); border: 1px solid var(--line);
    border-radius: 8px; padding: 12px 14px; }
  .chapter h3 { margin: 0 0 4px; font-size: 14px; color: var(--dim);
    text-transform: uppercase; letter-spacing: 0.08em; font-weight: 600; }
  .chapter .id { color: var(--dim); font-size: 11px; margin-left: 8px; }
  .chapter .type { display: inline-block; padding: 1px 6px; border-radius: 4px;
    background: #2a3142; color: var(--dim); font-size: 11px; margin-left: 6px; }
  .beat { margin: 4px 0; }
  .beat.narration { color: #cdd3df; }
  .beat.speech { color: #ffe7a8; }
  .beat.speech .speaker { font-weight: 700; color: #f1c40f; margin-right: 4px; }
  .response { margin-top: 8px; padding-top: 6px; border-top: 1px dashed var(--line); }
  .response .beat { font-size: 13px; }
  .choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 10px; }
  .choice { background: var(--panel2); border: 1px solid var(--line);
    border-left: 3px solid #4a5570; border-radius: 6px; padding: 10px 12px; }
  .choice .text { font-weight: 600; margin-bottom: 6px; }
  .choice .outcome { color: #cdd3df; font-size: 13px; margin-top: 6px; }
  .effects { display: flex; gap: 6px; flex-wrap: wrap; }
  .eff { font-size: 11px; padding: 1px 6px; border-radius: 4px; background: #0f1115;
    border: 1px solid var(--line); }
  .eff.pop  { color: var(--pop); }
  .eff.heat { color: var(--heat); }
  .eff.push { color: var(--push); }
  .eff.flag { color: var(--flag); }
  .eff.cond { color: #6cb6ff; font-style: italic; }
  .opponent { margin: 8px 0 24px; display: flex; gap: 16px; padding: 14px;
    border: 2px solid #f1c40f; border-radius: 12px;
    background: linear-gradient(135deg, #2a1e08 0%, #1d2230 100%); }
  .opp-portrait { width: 100px; flex-shrink: 0; background: #0f1115;
    border: 1px solid var(--line); border-radius: 6px; padding: 6px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    text-align: center; align-self: flex-start; }
  .opp-portrait .silhouette { font-size: 24px; line-height: 1; margin-bottom: 4px; }
  .opp-portrait .type { font-size: 11px; padding: 2px 8px; border-radius: 999px;
    text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em; }
  .opp-portrait .type.face { background: #1b3a4a; color: #4ec9b0; }
  .opp-portrait .type.heel { background: #4a1b1b; color: #f06c6c; }
  .opp-portrait .type.tweener { background: #3a2a4a; color: #b48cff; }
  .opp-body { flex: 1; min-width: 0; }
  .opp-body h3 { margin: 0; font-size: 18px; color: #f1c40f; }
  .opp-body .role { color: var(--dim); font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 8px; }
  .opp-body .blurb { color: #cdd3df; margin: 8px 0; }
  .opp-body .moves { font-size: 12px; color: var(--dim); margin-top: 6px; }
  .opp-body .moves b { color: #ffe7a8; }
  .opp-body .weakness { font-size: 12px; color: #6cb6ff; margin-top: 4px; }
  .opp-stats { display: grid; grid-template-columns: auto 1fr auto; gap: 4px 8px;
    margin-top: 10px; align-items: center; }
  .opp-stats .lbl { font-size: 11px; color: var(--dim); text-transform: uppercase;
    letter-spacing: 0.08em; }
  .opp-stats .val { font-size: 11px; color: var(--ink); font-variant-numeric: tabular-nums; }
  .opp-stats .bar { height: 8px; background: #0f1115; border: 1px solid var(--line);
    border-radius: 4px; overflow: hidden; }
  .opp-stats .bar > i { display: block; height: 100%;
    background: linear-gradient(90deg, #f1c40f, #f06c6c); }
  .opp-stats .bar.hp > i { background: linear-gradient(90deg, #4ec9b0, #f06c6c); }
  .match-sim { margin-top: 10px; padding: 10px; background: #0f1115;
    border: 1px solid var(--line); border-radius: 6px; font-size: 12px; }
  .match-sim h4 { margin: 0 0 6px; font-size: 11px; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--dim); }
  .ex-row { display: grid; grid-template-columns: 30px 1fr 1fr; gap: 6px;
    padding: 4px 0; border-bottom: 1px dashed var(--line); align-items: baseline; }
  .ex-row:last-child { border-bottom: none; }
  .ex-row .rd { color: var(--dim); font-variant-numeric: tabular-nums; }
  .ex-row .opp-side { color: #f06c6c; }
  .ex-row .you-side { color: #4ec9b0; }
  .ex-row .dmg { color: var(--dim); font-size: 10px; margin-left: 4px; }
  .rarity { font-size: 9px; padding: 1px 5px; border-radius: 3px; margin-left: 6px;
    text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
  .rarity.common    { background: #2a3142; color: #8a94a8; }
  .rarity.uncommon  { background: #1b3a4a; color: #4ec9b0; }
  .rarity.rare      { background: #1f2a5a; color: #6cb6ff; }
  .rarity.epic      { background: #3a1259; color: #b48cff; }
  .rarity.legendary { background: #5a3a0a; color: #f1c40f; }
  .hpline { display: flex; gap: 12px; margin: 6px 0; font-variant-numeric: tabular-nums; }
  .hpline span { color: var(--dim); }
  .hpline b { color: var(--ink); }
  .climax-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
    margin-top: 8px; }
  .climax-opt { padding: 6px 8px; background: var(--panel2); border: 1px solid var(--line);
    border-radius: 4px; text-align: center; }
  .climax-opt .name { font-weight: 700; font-size: 11px; }
  .climax-opt .odds { color: #f1c40f; font-size: 13px; font-variant-numeric: tabular-nums; }
  .climax-opt.lose { opacity: 0.5; }
  .climax-opt.lose .odds { color: #f06c6c; }
  .match-chapter { border-color: #f1c40f; border-width: 2px;
    background: linear-gradient(180deg, #1d1808 0%, var(--panel) 50%); }
  .match-scene { margin: 8px 0 0; padding: 12px; background: var(--panel);
    border: 1px solid var(--line); border-radius: 8px; }
  .match-scene > h4 { margin: 0 0 10px; font-size: 13px; color: #f1c40f;
    text-transform: uppercase; letter-spacing: 0.08em; }
  .match-section { margin-bottom: 12px; }
  .section-label { font-size: 11px; color: var(--dim); text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 4px; }
  .mech-note { font-size: 12px; color: #6cb6ff; font-style: italic; padding: 6px 10px;
    background: #0f1115; border-left: 3px solid #6cb6ff; border-radius: 3px; }
  .aftermath-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .aftermath-col { padding: 8px; border-radius: 4px; }
  .aftermath-col.win { background: #0e2a22; border: 1px solid #1f5a47; }
  .aftermath-col.loss { background: #2a0e0e; border: 1px solid #5a1f1f; }
  .aftermath-h { font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
    margin-bottom: 4px; }
  .aftermath-col.win .aftermath-h { color: #4ec9b0; }
  .aftermath-col.loss .aftermath-h { color: #f06c6c; }
  .movepool { margin: 14px 0 24px; padding: 12px; background: var(--panel);
    border: 1px solid var(--line); border-radius: 8px; }
  .movepool > h4 { margin: 0 0 8px; font-size: 12px; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--dim); }
  .pool-round { margin-top: 8px; }
  .pool-round h5 { margin: 0 0 4px; font-size: 12px; color: #f1c40f; }
  .pool-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .pool-table td { padding: 3px 6px; vertical-align: top; border-bottom: 1px dashed var(--line); }
  .pool-table .mv-name { font-weight: 600; }
  .pool-table .mv-pow { color: var(--dim); font-variant-numeric: tabular-nums; }
  .pool-table .mv-flavor { color: var(--dim); font-style: italic; }
  .endings { margin-top: 24px; }
  .endings h2 { font-size: 16px; margin: 0 0 8px; }
  .ending { background: var(--panel); border: 1px solid var(--line);
    border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  .ending .t { font-weight: 700; margin-bottom: 4px; }
  .ending .b { color: #cdd3df; }
  .hide { display: none; }
</style>
</head>
<body>
<header>
  <h1>AWF Story Map</h1>
  <div class="tabs" id="tabs"></div>
</header>
<main id="main"></main>

<script>
const DATA = ${JSON.stringify(data, null, 2)};

const esc = s => String(s ?? '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function effChip(k, v) {
  const sign = v > 0 ? '+' : '';
  return \`<span class="eff \${k}">\${k} \${sign}\${v}</span>\`;
}

function renderOption(o) {
  const effs = [];
  if (o.effects) for (const [k, v] of Object.entries(o.effects)) effs.push(effChip(k, v));
  if (o.conditional) effs.push('<span class="eff cond">conditional()</span>');
  if (o.flag) for (const [k, v] of Object.entries(o.flag)) {
    effs.push(\`<span class="eff flag">\${k}=\${esc(JSON.stringify(v))}</span>\`);
  }
  const response = (o.response || []).map(renderBeat).join('');
  return \`
    <div class="choice">
      <div class="text">\${esc(o.text)}</div>
      <div class="effects">\${effs.join('')}</div>
      \${response ? '<div class="response">'+response+'</div>' : ''}
    </div>\`;
}

function renderBeat(b) {
  if (b.type === 'narration') return \`<div class="beat narration">\${esc(b.text)}</div>\`;
  if (b.type === 'speech') return \`<div class="beat speech"><span class="speaker">\${esc(b.speaker)}:</span> \${esc(b.text)}</div>\`;
  if (b.type === 'choice') return \`<div class="choices">\${(b.options||[]).map(renderOption).join('')}</div>\`;
  return \`<div class="beat other">\${esc(b.type)}: \${esc(JSON.stringify(b))}</div>\`;
}

function renderScene(scene, idx, charId) {
  const title = scene.chapterTitle || DATA.chapterTitles[scene.chapter ? scene.chapter - 1 : idx] || \`Scene \${idx+1}\`;
  const meta = [];
  if (scene.type) meta.push(\`<span class="type">\${esc(scene.type)}</span>\`);
  if (scene.location) meta.push(\`<span class="type">@ \${esc(scene.location)}</span>\`);
  const header = \`<h3>Ch \${scene.chapter || idx+1}\${scene.part ? scene.part : ''} · \${esc(title)}
        \${meta.join('')}
        <span class="id">\${esc(scene.id)}</span>
      </h3>\`;

  if (scene.type === 'match') {
    const opp = (DATA.opponents[charId] || []).find(o => o.id === scene.opponentId);
    const oppIdx = (DATA.opponents[charId] || []).findIndex(o => o.id === scene.opponentId);
    return \`
      <div class="chapter match-chapter">
        \${header}
        <div class="section-label">① Opponent Entrance</div>
        \${scene.intro.map(renderBeat).join('')}
        <div class="mech-note" style="margin:8px 0">▶ INTERFACE SWITCH — match mechanics take over. No prose, no story choices.</div>
        \${opp ? renderOpponent(opp) + renderMatchSim(charId, oppIdx) : '<div class="mech-note">[no opponent linked]</div>'}
        <div class="section-label" style="margin-top:10px">③ Aftermath</div>
        <div class="aftermath-grid">
          <div class="aftermath-col win">
            <div class="aftermath-h">IF WIN</div>
            \${scene.afterWin.map(renderBeat).join('')}
          </div>
          <div class="aftermath-col loss">
            <div class="aftermath-h">IF LOSS</div>
            \${scene.afterLoss.map(renderBeat).join('')}
          </div>
        </div>
      </div>\`;
  }

  return \`
    <div class="chapter">
      \${header}
      \${scene.beats.map(renderBeat).join('')}
    </div>\`;
}

function renderOpponent(o) {
  if (!o) return '';
  const bar = (v, cls) => \`<div class="bar \${cls||''}"><i style="width:\${Math.min(100,v)}%"></i></div>\`;
  return \`
    <div class="opponent">
      <div class="opp-portrait">
        <div class="silhouette">★</div>
        <div class="type \${esc(o.type)}">\${esc(o.type)}</div>
      </div>
      <div class="opp-body">
        \${o.arcTitle ? \`<div style="font-size:11px;color:#f1c40f;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Ch \${o.chapter||''} · \${esc(o.arcTitle)}</div>\` : ''}
        <h3>\${esc(o.name)}</h3>
        <div class="role">\${esc(o.role)}</div>
        <div class="blurb">\${esc(o.blurb)}</div>
        <div class="opp-stats">
          <span class="lbl">HP</span> \${bar(o.hp,'hp')} <span class="val">\${o.hp}</span>
          <span class="lbl">POW</span> \${bar(o.stats.pow)} <span class="val">\${o.stats.pow}</span>
          <span class="lbl">DEF</span> \${bar(o.stats.def)} <span class="val">\${o.stats.def}</span>
          <span class="lbl">CHA</span> \${bar(o.stats.cha)} <span class="val">\${o.stats.cha}</span>
        </div>
        <div class="moves"><b>Signature:</b> \${esc(o.signature)} · <b>Finisher:</b> \${esc(o.finisher)}</div>
        <div class="weakness"><b>Weakness:</b> \${esc(o.weakness)}</div>
      </div>
    </div>\`;
}

function renderMatchScene(charId, idx) {
  const previews = DATA.matchPreviews[charId];
  if (!previews || !previews[idx]) return '';
  const p = previews[idx];
  const o = p.opponent;
  return \`
    <div class="match-scene">
      <h4>Match Scene · Ch \${o.chapter||''} · \${esc(o.arcTitle||'')}</h4>
      <div class="match-section">
        <div class="section-label">① Opponent Entrance (narration beats)</div>
        <div class="beat narration">[TODO] \${esc(o.name)}'s music hits.</div>
        <div class="beat narration">[TODO] He walks to the ring. Crowd reaction beat.</div>
        <div class="beat narration">[TODO] Bell rings. Lockup.</div>
      </div>
      <div class="match-section">
        <div class="section-label">② Match — Game Mechanics (no prose, no choices)</div>
        <div class="mech-note">Three rounds of weighted-random move draws, then climax choice (stay down / kick out / counter). See sample below.</div>
      </div>
      <div class="match-section">
        <div class="section-label">③ Aftermath — branches on result</div>
        <div class="aftermath-grid">
          <div class="aftermath-col win">
            <div class="aftermath-h">IF WIN</div>
            <div class="beat narration">[TODO] You pin him. Three count. Crowd reaction.</div>
            <div class="beat narration">[TODO] Walk back through curtain. Booker reaction.</div>
          </div>
          <div class="aftermath-col loss">
            <div class="aftermath-h">IF LOSS</div>
            <div class="beat narration">[TODO] He pins you. Same as always.</div>
            <div class="beat narration">[TODO] Walk back. Agent\'s line. Cycle continues.</div>
          </div>
        </div>
      </div>
    </div>\` + renderMatchSim(charId, idx);
}

function renderMatchSim(charId, idx) {
  const previews = DATA.matchPreviews[charId];
  if (!previews || !previews[idx]) return '';
  const p = previews[idx];
  const sim = p.kickOut; // exchanges are identical across climax choices
  const moveLabel = (m) => \`\${esc(m.name)}<span class="rarity \${m.rarity||'common'}">\${esc(m.rarity||'common')}</span>\`;
  const exRows = sim.exchanges.map(e => \`
    <div class="ex-row">
      <span class="rd">R\${e.round}</span>
      <span class="opp-side">→ \${moveLabel(e.oppMove)}<span class="dmg">−\${e.dmgIn} HP</span></span>
      <span class="you-side">→ \${moveLabel(e.yourMove)}<span class="dmg">−\${e.dmgOut} HP</span></span>
    </div>\`).join('');
  const pv = p.preview;
  const mark = ok => ok ? '<span style="color:#4ec9b0">✓</span>' : '<span style="color:#f06c6c">✗</span>';
  return \`
    <div class="match-sim">
      <h4>Sample Match — assuming midline play (your stats: pop \${p.sampleState.pop} · heat \${p.sampleState.heat} · push \${p.sampleState.push})</h4>
      <div class="hpline">
        <span>Your HP <b>\${sim.yourHpStart}</b> → <b>\${sim.yourHp}</b></span>
        <span>Opp HP <b>\${p.opponent.hp}</b> → <b>\${sim.oppHp}</b></span>
      </div>
      \${exRows}
      <div class="climax-options">
        <div class="climax-opt lose">
          <div class="name">Stay Down</div>
          <div class="odds">auto-lose</div>
        </div>
        <div class="climax-opt">
          <div class="name">Kick Out \${mark(pv.kickOut.success)}</div>
          <div class="odds">PUSH \${pv.kickOut.your} vs \${pv.kickOut.threshold}</div>
        </div>
        <div class="climax-opt">
          <div class="name">Counter \${mark(pv.counter.success)}</div>
          <div class="odds">\${pv.counter.statName} \${pv.counter.your} vs \${pv.counter.threshold}</div>
        </div>
      </div>
    </div>\`;
}

function renderMovePool(charId) {
  const pool = DATA.playerMovePool[charId];
  if (!pool) return '';
  const round = (n, label) => \`
    <div class="pool-round">
      <h5>R\${n} · \${label}</h5>
      <table class="pool-table"><tbody>
        \${(pool[n] || []).map(m => \`
          <tr>
            <td><span class="rarity \${m.rarity||'common'}">\${esc(m.rarity||'common')}</span></td>
            <td class="mv-name">\${esc(m.name)}</td>
            <td class="mv-pow">P\${m.power}</td>
            <td class="mv-pow">≥\${DATA.rarityMinStat[m.rarity||'common']}</td>
            <td class="mv-flavor">\${esc(m.flavor||'')}</td>
          </tr>\`).join('')}
      </tbody></table>
    </div>\`;
  return \`
    <div class="movepool">
      <h4>Your Move Pool · weighted random per round</h4>
      \${round(1, 'Strikes & Taunts')}
      \${round(2, 'Power Moves')}
      \${round(3, 'Highspots & Finishers')}
    </div>\`;
}

function renderCharacter(charId) {
  const c = DATA.characters[charId];
  const scenes = DATA.scenes[charId] || [];
  const opp = DATA.opponents[charId];
  const s = c.startStats;
  return \`
    <div class="charhead">
      <h2>\${esc(c.name)}</h2>
      <span class="blurb">\${esc(c.blurb)}</span>
      <span class="stats">start: pop \${s.pop} · heat \${s.heat} · push \${s.push} · gain +\${c.gain} · \${esc(c.difficulty)}</span>
    </div>
    <div class="chapters">
      \${scenes.map((sc, i) => renderScene(sc, i, charId)).join('')}
    </div>
    <h3 style="color:var(--dim);text-transform:uppercase;letter-spacing:.08em;font-size:12px;margin:24px 0 4px">Match Card</h3>
    \${(Array.isArray(opp) ? opp : opp ? [opp] : []).map((o, i) => renderOpponent(o) + renderMatchScene(charId, i)).join('')}
    \${renderMovePool(charId)}
    <div class="endings">
      <h2>Endings</h2>
      \${Object.values(DATA.endings).map(e => \`
        <div class="ending">
          <div class="t">\${esc(e.title)}</div>
          <div class="b">\${esc(e.body)}</div>
        </div>\`).join('')}
    </div>\`;
}

const charIds = Object.keys(DATA.scenes);
const tabs = document.getElementById('tabs');
const main = document.getElementById('main');

charIds.forEach((id, i) => {
  const b = document.createElement('button');
  const c = DATA.characters[id];
  b.className = 'tab' + (i === 0 ? ' active' : '');
  b.innerHTML = \`\${esc(c.name)}<span class="meta">\${DATA.scenes[id].length} scenes</span>\`;
  b.onclick = () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    b.classList.add('active');
    main.innerHTML = renderCharacter(id);
    window.scrollTo(0, 0);
  };
  tabs.appendChild(b);
});

main.innerHTML = renderCharacter(charIds[0]);
</script>
</body>
</html>
`;

const outPath = path.join(ROOT, 'story-map.html');
fs.writeFileSync(outPath, html);

// Cleanup tmp
fs.rmSync(TMP, { recursive: true, force: true });

console.log('Wrote', outPath);
console.log('Open it in your browser to review the dialogue map.');
