// sceneImages.js
//
// Static map of scene id → image asset. Metro requires `require()` calls to be
// statically analyzable, so we list every scene's asset path here. When a file
// doesn't exist yet, leave it commented out — getSceneImage() returns null and
// GameScreen falls back to the neon placeholder panel.
//
// Workflow:
//   1. Generate the image in Midjourney (prompts in prompts/scene-prompts.md)
//   2. Drop the file into assets/scenes/<scene_id>.png (or .gif)
//   3. Uncomment the matching line below
//   4. Reload Expo Go — the scene now shows the art

export const SCENE_IMAGES = {
  // ─── CH 1 — DEBUT ───
  // jobber_1a: require('../assets/scenes/jobber_1a.png'),
  // jobber_1b: require('../assets/scenes/jobber_1b.png'),
  // jobber_1c: require('../assets/scenes/jobber_1c.png'),

  // ─── CH 2 — RIVAL INTRODUCED ───
  // jobber_2a: require('../assets/scenes/jobber_2a.png'),
  // jobber_2b: require('../assets/scenes/jobber_2b.png'),
  // jobber_2c: require('../assets/scenes/jobber_2c.png'),

  // ─── CH 3 — FIRST BUSINESS DECISION ───
  // jobber_3a: require('../assets/scenes/jobber_3a.png'),
  // jobber_3b: require('../assets/scenes/jobber_3b.png'),
  // jobber_3c: require('../assets/scenes/jobber_3c.png'),

  // ─── CH 4 — IT GETS PERSONAL ───
  // jobber_4a: require('../assets/scenes/jobber_4a.png'),
  // jobber_4b: require('../assets/scenes/jobber_4b.png'),
  // jobber_4c: require('../assets/scenes/jobber_4c.png'),

  // ─── CH 5 — THE TURN ───
  // jobber_5a: require('../assets/scenes/jobber_5a.png'),
  // jobber_5b: require('../assets/scenes/jobber_5b.png'),
  // jobber_5c: require('../assets/scenes/jobber_5c.png'),

  // ─── CH 6 — PROMO WAR ───
  // jobber_6a: require('../assets/scenes/jobber_6a.png'),
  // jobber_6b: require('../assets/scenes/jobber_6b.png'),
  // jobber_6c: require('../assets/scenes/jobber_6c.png'),

  // ─── CH 7 — CONTRACT SIGNING ───
  // jobber_7a: require('../assets/scenes/jobber_7a.png'),
  // jobber_7b: require('../assets/scenes/jobber_7b.png'),
  // jobber_7c: require('../assets/scenes/jobber_7c.png'),

  // ─── CH 8 — CHAMPIONSHIP ───
  // jobber_8a: require('../assets/scenes/jobber_8a.png'),
  // jobber_8b: require('../assets/scenes/jobber_8b.png'),
  // jobber_8c: require('../assets/scenes/jobber_8c.png'),
};

export function getSceneImage(sceneId) {
  return SCENE_IMAGES[sceneId] || null;
}
