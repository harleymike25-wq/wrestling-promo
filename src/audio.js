// audio.js — multi-channel audio engine.
//
// Channels: 'theme' | 'crowd' | 'sfx'  (add more as needed)
// Global mute silences all channels but remembers what should be playing,
// so unmuting resumes everything that was active.

import { Audio } from 'expo-av';

function safeRequire(loader) {
  try { return loader(); } catch { return null; }
}

export const THEMES = {
  ALL_AMERICAN: {
    id:    'ALL_AMERICAN',
    label: 'ALL AMERICAN',
    blurb: 'Heroic, crowd pops hard.',
    bpm:   140,
    asset: safeRequire(() => require('../assets/audio/all_american.wav'))
  },
  DEAD_SERIOUS: {
    id:    'DEAD_SERIOUS',
    label: 'DEAD SERIOUS',
    blurb: 'Menacing. Pure heat.',
    bpm:   108,
    asset: safeRequire(() => require('../assets/audio/dead_serious.wav'))
  },
  QUESTION_MARK: {
    id:    'QUESTION_MARK',
    label: 'QUESTION MARK',
    blurb: "Mysterious. Nobody knows you yet.",
    bpm:   120,
    asset: safeRequire(() => require('../assets/audio/question_mark.wav'))
  },
  LAST_LAUGH: {
    id:    'LAST_LAUGH',
    label: 'LAST LAUGH',
    blurb: 'Circus energy. Laugh now, cry later.',
    bpm:   162,
    asset: safeRequire(() => require('../assets/audio/last_laugh.wav'))
  }
};

export const THEME_ORDER = ['ALL_AMERICAN', 'DEAD_SERIOUS', 'QUESTION_MARK', 'LAST_LAUGH'];

// ─── Channel state ────────────────────────────────────────────────────────────

// What *should* be playing on each channel (intent, survives mute).
const pending  = {};   // channel → { asset, loop, volume }
// What IS currently playing.
const playing  = {};   // channel → expo-av Sound object

let muted = false;
let previewTimer = null;

// ─── Internal ─────────────────────────────────────────────────────────────────

async function _start(channel) {
  const intent = pending[channel];
  if (!intent || !intent.asset) {
    if (intent) console.log(`[audio] ${channel} would play (asset not bundled yet)`);
    return;
  }
  try {
    const { sound } = await Audio.Sound.createAsync(intent.asset, {
      isLooping: intent.loop,
      volume:    intent.volume,
      shouldPlay: true
    });
    playing[channel] = sound;
  } catch (e) {
    console.warn(`[audio] ${channel} play failed:`, e?.message);
  }
}

async function _stop(channel) {
  const s = playing[channel];
  if (!s) return;
  try {
    await s.stopAsync();
    await s.unloadAsync();
  } catch {}
  delete playing[channel];
}

// ─── Public channel API ───────────────────────────────────────────────────────

export async function playChannel(channel, asset, { loop = false, volume = 0.7 } = {}) {
  await _stop(channel);
  pending[channel] = { asset, loop, volume };
  if (!muted) await _start(channel);
}

export async function stopChannel(channel) {
  delete pending[channel];
  await _stop(channel);
}

export function isChannelPlaying(channel) {
  return !!playing[channel];
}

// ─── Global mute ─────────────────────────────────────────────────────────────

export function isMuted() { return muted; }

export async function toggleMute() {
  muted = !muted;
  if (muted) {
    for (const ch of Object.keys(playing)) await _stop(ch);
  } else {
    for (const ch of Object.keys(pending)) await _start(ch);
  }
  return muted;
}

// ─── Theme helpers ────────────────────────────────────────────────────────────

export async function configureAudio() {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true
    });
  } catch (e) {
    console.warn('[audio] setAudioMode failed:', e?.message);
  }
}

export async function playTheme(themeId, { loop = true, volume = 0.6 } = {}) {
  const theme = THEMES[themeId];
  if (!theme) return;
  await playChannel('theme', theme.asset, { loop, volume });
}

export async function stopTheme() {
  if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
  await stopChannel('theme');
}

export async function previewTheme(themeId) {
  if (previewTimer) { clearTimeout(previewTimer); previewTimer = null; }
  await playTheme(themeId, { loop: false, volume: 0.55 });
  previewTimer = setTimeout(async () => {
    await stopTheme();
    previewTimer = null;
  }, 4000);
}
