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
const files = ['story.js', 'characters.js', 'constants.js'];
for (const f of files) {
  let txt = fs.readFileSync(path.join(SRC, f), 'utf8');
  txt = txt.replace(/from\s+'\.\/([a-zA-Z0-9_-]+)'/g, "from './$1.mjs'");
  fs.writeFileSync(path.join(TMP, f.replace(/\.js$/, '.mjs')), txt);
}

const { SCENES, ENDINGS } = await import(pathToFileURL(path.join(TMP, 'story.mjs')).href);
const { CHARACTERS, CHAPTER_FLOW, CHAPTER_TITLES } = await import(
  pathToFileURL(path.join(TMP, 'characters.mjs')).href
);

const data = {
  characters: CHARACTERS,
  chapterFlow: CHAPTER_FLOW,
  chapterTitles: CHAPTER_TITLES,
  scenes: SCENES,
  endings: ENDINGS,
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
  .setup { margin: 6px 0 10px; color: #cdd3df; white-space: pre-wrap; }
  .tagsetup { color: var(--dim); font-style: italic; }
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

function renderChoice(c) {
  const effs = [];
  if (c.effects) {
    for (const [k, v] of Object.entries(c.effects)) effs.push(effChip(k, v));
  }
  if (c.conditional) effs.push('<span class="eff cond">conditional()</span>');
  if (c.flag) {
    for (const [k, v] of Object.entries(c.flag)) {
      effs.push(\`<span class="eff flag">\${k}=\${esc(JSON.stringify(v))}</span>\`);
    }
  }
  return \`
    <div class="choice">
      <div class="text">\${esc(c.text)}</div>
      <div class="effects">\${effs.join('')}</div>
      <div class="outcome">\${esc(c.outcome)}</div>
    </div>\`;
}

function renderScene(scene, idx, charId) {
  const title = (DATA.chapterTitles[idx] || \`Scene \${idx+1}\`);
  return \`
    <div class="chapter">
      <h3>Ch \${idx+1} · \${esc(title)}
        <span class="type">\${esc(scene.type)}</span>
        <span class="id">\${esc(scene.id)}</span>
      </h3>
      <div class="setup">\${esc(scene.setup)}\${scene.tagSetup ? '<div class="tagsetup">[tag] '+esc(scene.tagSetup)+'</div>' : ''}</div>
      <div class="choices">\${scene.choices.map(renderChoice).join('')}</div>
    </div>\`;
}

function renderCharacter(charId) {
  const c = DATA.characters[charId];
  const scenes = DATA.scenes[charId] || [];
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
