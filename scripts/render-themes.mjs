// scripts/render-themes.mjs
//
// Pure-Node chiptune renderer for the 4 AWF entrance themes. No Tone.js,
// no Web Audio shim — just oscillator math + wavefile output.
//
// Run:
//   npm install --save-dev wavefile
//   node scripts/render-themes.mjs
//
// Output: assets/audio/{all_american,dead_serious,question_mark,last_laugh}.wav

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pkg from 'wavefile';
const { WaveFile } = pkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR   = path.join(__dirname, '..', 'assets', 'audio');
const SR        = 22050;
const LOOP_SECS = 12;

fs.mkdirSync(OUT_DIR, { recursive: true });

// ─── note name → frequency ────────────────────────────────────────────────────
const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function noteFreq(name) {
  const m = /^([A-G])(#|b)?(-?\d+)$/.exec(name);
  if (!m) throw new Error(`Bad note: ${name}`);
  let s = SEMITONE[m[1]];
  if (m[2] === '#') s++;
  if (m[2] === 'b') s--;
  const octave = parseInt(m[3], 10);
  const midi = 12 * (octave + 1) + s;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// ─── single-voice oscillator with attack/release ──────────────────────────────
function synth(freq, durSec, wave = 'square', velocity = 0.4) {
  const n = Math.max(1, Math.floor(durSec * SR));
  const out = new Float32Array(n);
  const attack  = Math.min(0.005 * SR, n * 0.1);
  const release = Math.min(0.05  * SR, n * 0.3);

  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const phase = (t * freq) - Math.floor(t * freq);
    let s;
    switch (wave) {
      case 'square':   s = phase < 0.5 ? 1 : -1; break;
      case 'sawtooth': s = 2 * phase - 1; break;
      case 'triangle': s = 4 * Math.abs(phase - 0.5) - 1; break;
      default:         s = Math.sin(2 * Math.PI * phase);
    }
    let env = velocity;
    if (i < attack)       env *= i / attack;
    else if (i > n - release) env *= (n - i) / release;
    out[i] = s * env;
  }
  return out;
}

function silence(durSec) {
  return new Float32Array(Math.max(1, Math.floor(durSec * SR)));
}

// ─── theme definitions: [note|null, durationCode][] ───────────────────────────
const DUR_BEATS = { '16n': 0.25, '8n': 0.5, '4n': 1, '2n': 2, '1n': 4 };

const THEMES = {
  all_american: {
    bpm: 140,
    waveform: 'square',
    velocity: 0.4,
    notes: [
      ['C5','8n'],['E5','8n'],['G5','8n'],['C6','4n'],
      ['B5','8n'],['G5','8n'],['E5','4n'],
      ['F5','8n'],['A5','8n'],['C6','8n'],['F6','4n'],
      ['E6','8n'],['C6','8n'],['G5','4n'],
      ['C5','8n'],['E5','8n'],['G5','8n'],['C6','8n'],['G5','8n'],['E5','8n'],['C5','2n']
    ]
  },
  dead_serious: {
    bpm: 108,
    waveform: 'sawtooth',
    velocity: 0.35,
    notes: [
      ['E3','4n'],['E3','8n'],['G3','8n'],['B3','4n'],
      ['A3','4n'],['E3','4n'],
      ['F3','4n'],['F3','8n'],['A3','8n'],['C4','4n'],
      ['B3','4n'],['E3','4n'],
      ['E3','8n'],['F3','8n'],['G3','8n'],['A3','8n'],['B3','2n']
    ]
  },
  question_mark: {
    bpm: 120,
    waveform: 'triangle',
    velocity: 0.45,
    notes: [
      ['A4','8n'],['C5','8n'],['E5','4n'],
      [null,'8n'],
      ['D5','8n'],['B4','8n'],['A4','4n'],
      ['G4','8n'],['B4','8n'],['D5','4n'],
      [null,'8n'],
      ['F5','8n'],['E5','8n'],['C5','4n'],
      ['A4','8n'],['G4','8n'],['E4','8n'],['A4','2n']
    ]
  },
  last_laugh: {
    bpm: 162,
    waveform: 'square',
    velocity: 0.38,
    notes: [
      ['G4','16n'],['A4','16n'],['B4','16n'],['C5','8n'],['E5','8n'],
      ['D5','16n'],['C5','16n'],['B4','8n'],['G4','4n'],
      ['A4','16n'],['B4','16n'],['C5','16n'],['D5','8n'],['F5','8n'],
      ['E5','16n'],['D5','16n'],['C5','8n'],['A4','4n'],
      ['C5','8n'],['E5','8n'],['G5','8n'],['E5','8n'],['C5','4n']
    ]
  }
};

// ─── render one theme to a fixed-length looped buffer ─────────────────────────
function renderTheme(theme) {
  const beatSec = 60 / theme.bpm;
  const segments = theme.notes.map(([note, dur]) => {
    const sec = (DUR_BEATS[dur] || 1) * beatSec;
    return note === null
      ? silence(sec)
      : synth(noteFreq(note), sec, theme.waveform, theme.velocity);
  });

  const total = LOOP_SECS * SR;
  const buf = new Float32Array(total);
  let cursor = 0;
  while (cursor < total) {
    for (const seg of segments) {
      const room = total - cursor;
      const take = Math.min(seg.length, room);
      buf.set(seg.subarray(0, take), cursor);
      cursor += take;
      if (cursor >= total) break;
    }
  }
  return buf;
}

function toInt16(f32) {
  const out = new Int16Array(f32.length);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function writeWav(name, buffer) {
  const wav = new WaveFile();
  wav.fromScratch(1, SR, '16', toInt16(buffer));
  const file = path.join(OUT_DIR, `${name}.wav`);
  fs.writeFileSync(file, wav.toBuffer());
  console.log(`  ✓ ${name}.wav  (${LOOP_SECS}s @ ${SR}Hz)`);
}

console.log('Rendering AWF entrance themes…');
for (const [name, theme] of Object.entries(THEMES)) {
  writeWav(name, renderTheme(theme));
}
console.log(`Done. ${Object.keys(THEMES).length} files in ${OUT_DIR}`);
