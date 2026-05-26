// audio.js — expo-av wrapper for the 4 entrance themes.
//
// The .wav files live in /assets/audio/ and are pre-rendered offline by a
// one-shot Node + Tone.js script (scripts/render-themes.js, TODO). Until the
// assets are generated, plays are no-ops and log a notice so the rest of the
// app continues to work.

import { Audio } from 'expo-av';

// Asset requires are wrapped so a missing .wav doesn't crash Metro — the
// fallback is a no-op play (logged) until you run `node scripts/render-themes.mjs`.
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

let currentSound  = null;
let currentThemeId = null;
let muted = false;

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
  await stopTheme();
  const theme = THEMES[themeId];
  if (!theme) return;
  currentThemeId = themeId;
  if (muted) return;
  if (!theme.asset) {
    console.log(`[audio] ${themeId} would play (asset not bundled yet)`);
    return;
  }
  try {
    const { sound } = await Audio.Sound.createAsync(theme.asset, {
      isLooping: loop,
      volume,
      shouldPlay: true
    });
    currentSound = sound;
  } catch (e) {
    console.warn(`[audio] play ${themeId} failed:`, e?.message);
  }
}

export function isMuted() { return muted; }

export async function toggleMute() {
  muted = !muted;
  if (muted) {
    await stopTheme();
  } else if (currentThemeId) {
    // resume what was playing
    const t = currentThemeId;
    currentThemeId = null; // reset so playTheme treats this as fresh
    await playTheme(t);
  }
  return muted;
}

export async function stopTheme() {
  if (!currentSound) return;
  try {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
  } catch {}
  currentSound = null;
}

export async function previewTheme(themeId) {
  // shorter, non-looping preview for the music select screen
  return playTheme(themeId, { loop: false, volume: 0.55 });
}
