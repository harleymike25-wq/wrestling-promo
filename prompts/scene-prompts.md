# AWF Scene Art — Copilot / DALL-E 3 Prompts

Two-pass workflow:
1. **Portraits first** (6 images) — establish how every recurring character looks.
2. **Hero scenes second** (8 images) — the moments that really benefit from art. The other 16 mini-scenes stay on the neon placeholder; the text carries them.

DALL-E does best with **one clear subject + clean composition**. Long lists of details get ignored or jumbled. Each prompt below is deliberately tight.

---

## How to use a prompt

1. Open Copilot's image creator.
2. Copy a prompt below, paste it whole.
3. If the first generation is off, regenerate (Copilot gives 4 per request).
4. Pick the best, download.
5. Save as `assets/scenes/<id>.png` (e.g. `portrait_jobber.png` or `jobber_1c.png`).
6. For scene images, uncomment the matching line in `src/sceneImages.js`. (Portraits aren't wired into the UI yet — we'll add a character roster screen for them later, or use them as scene panels for moments where one character carries the shot.)

---

## PORTRAITS (6)

These establish what each recurring character looks like. Generate these first, save them, then reference them by description when you do scene prompts.

### portrait_jobber
> Pixel art character portrait, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanline overlay. Head-and-shoulders portrait of a single late-30s male professional wrestler. Lean wiry build. Weathered face with day-old stubble. Short dark hair. Wearing a plain faded deep-purple-black singlet with tape around the wrists. Exhausted but determined expression. Solid deep purple-black background. Dramatic hot pink side lighting from the left. No text, no logos, no UI elements. Square 1:1 composition.

### portrait_agent
> Pixel art character portrait, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanline overlay. Head-and-shoulders portrait of a single 50-year-old male wrestling match coordinator. Salt-and-pepper hair. Wireframe glasses. Dark blazer over a t-shirt. Holding a clipboard against his chest. Slight stoop. Measured authoritative expression. Looking down at his clipboard, not at the camera. Solid deep purple-black background. Cyan side lighting. No text, no logos. Square 1:1.

### portrait_booker
> Pixel art character portrait, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanlines. Head-and-shoulders portrait of a single early-60s male wrestling promoter. Balding with gray fringe. Heavyset. Gruff weathered face. Looking down and slightly to the side, never at camera. Wearing a polo shirt. Solid deep purple-black background. Neon yellow side lighting. No text, no logos. Square 1:1.

### portrait_rookie
> Pixel art character portrait, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanlines. Head-and-shoulders portrait of a single early-20s male pro wrestler. Athletic build. Blonde hair. Fresh-faced. Nervous wide-eyed expression. Wearing a brand-new shiny cyan wrestling singlet. Solid deep purple-black background. Hot pink side lighting. No text, no logos. Square 1:1.

### portrait_vet
> Pixel art character portrait, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanlines. Head-and-shoulders portrait of a single 50-year-old retired male pro wrestler. Broad-shouldered. Long gray ponytail. Deadpan watchful expression. Wearing a faded gray AWF wrestling promotion t-shirt. Solid deep purple-black background. Cyan side lighting. No text, no logos. Square 1:1.

### portrait_rival
> Pixel art character portrait, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanlines. Head-and-shoulders portrait of a single late-30s male pro wrestler. Muscular and cocky. Slicked-back dark hair. Smug expression with slight smile. Gold chain around his neck. Wearing designer hot-pink wrestling trunks. Solid deep purple-black background. Neon yellow side lighting. No text, no logos. Square 1:1.

---

## HERO SCENES (8)

These are the moments where art carries emotional weight. The other 16 mini-scenes use the neon placeholder — the text does the work there.

Each prompt is deliberately simpler than my first pass: clear single focal point, less character description (since portraits established the look), one strong composition.

### jobber_1c — First promo on the mic
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. Wide shot of one male wrestler standing alone in the center of a wrestling ring, holding a black microphone close to his mouth. Late 30s. Lean. Faded deep-purple-black singlet. Weathered face. Single dramatic top spotlight on him. Ring ropes in foreground. Distant pixelated crowd silhouettes in neon pink-and-cyan wash behind him. He is the only person in clear focus. Square 1:1. No text.

### jobber_3c — Calling the finish mid-match
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. Dynamic action shot inside a wrestling ring. One wrestler on his back on the canvas (lean late-30s man, faded deep-purple-black singlet) selling the impact. Another wrestler charging in mid-motion about to deliver a clothesline (younger athletic blonde man in a cyan singlet). The split-second before contact. Pixel motion lines. Dramatic side spotlight. Square 1:1. No text.

### jobber_4b — The stiff shot
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. Tight medium-shot ring action. A male wrestler (late-30s, lean, faded deep-purple-black singlet) has just been hit in the face by a forearm strike. His head is snapped sideways, mouth open, sweat flying in pixel droplets. The opponent's arm is visible in the follow-through frame-right. Crowd in deep red-pink wash. Dramatic split-second freeze. Square 1:1. No text.

### jobber_6c — The redemption promo
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanlines. Hero close-up of one male wrestler standing in the center of a wrestling ring, holding a microphone, mouth open mid-line, eyes locked on the viewer with quiet intensity. Late 30s. Lean. Faded deep-purple-black singlet. Full pixelated arena crowd visible behind him in dramatic pink-and-cyan wash. Single bright top spotlight. Square 1:1. No text.

### jobber_7a — Booker confrontation in hallway
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. Long shot down an empty concrete backstage hallway. Two men face each other from opposite sides of the frame at mid-distance. On one side: a lean late-30s male wrestler in a faded deep-purple-black singlet. On the other: an older heavyset wrestling promoter, 60s, balding, polo shirt. Both stopped, sizing each other up. Single overhead light casts harsh shadows down the hallway. Tense standoff composition. Square 1:1. No text.

### jobber_7b — Contract signing
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. Wide shot inside a wrestling ring. A large folding table in the center with a contract and pen on top. Two wrestlers seated across from each other at the table — one lean and weathered (late-30s, faded deep-purple-black singlet), the other muscular and cocky (slicked-back dark hair, designer hot-pink trunks). An older heavyset promoter standing at ringside in foreground with hands on hips. Pixelated arena crowd in dramatic pink wash. Square 1:1. No text.

### jobber_8b — PPV entrance
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. CRT scanlines. Heroic wide shot of one male pro wrestler walking down a pay-per-view entrance ramp toward the ring. Late 30s, lean, faded deep-purple-black singlet, but lighting makes him look powerful. Bright neon yellow pyro firing on both sides of the ramp behind him. Full pixelated arena crowd in pink-and-cyan wash on either side. Stadium lights overhead. He is the clear focal point. Square 1:1. No text.

### jobber_8c — Championship final word
> Pixel art, 16-bit Street Fighter II arcade style. Miami Vice neon color palette: hot pink, cyan, deep purple-black, neon yellow. Cinematic tight close-up on one male pro wrestler holding a microphone in the center of a wrestling ring at a championship match. Late 30s. Weathered face. Faded deep-purple-black singlet. Intense focused expression. A title belt is visible hanging on a ring post in soft focus behind him. Maximum dramatic neon side lighting. Title-card energy. Square 1:1. No text.

---

## Sequencing recommendation

Run them in this order. Each batch builds confidence before the next:

1. **portrait_jobber** — the most important single image. Get this right.
2. **portrait_agent**, **portrait_booker** — main supporting cast.
3. **jobber_1c** — first hero scene. Tests scene-with-portrait-style composition.
4. **jobber_8c** — climax shot. Tests the same look at peak drama.
5. **portrait_rival**, **portrait_rookie**, **portrait_vet** — remaining supporting cast.
6. **jobber_6c, 7b, 8b** — large emotional moments.
7. **jobber_3c, 4b, 7a** — the action / tension scenes.

If the early portraits look great, the rest will follow more easily.

## When a scene looks wrong

Common DALL-E failure modes and the fix:

- **Faces too realistic, breaks pixel art feel** → add *"chunky pixel features, no fine facial detail"*
- **Modern realistic wrestling outfits** → add *"vintage 1990s pro wrestling aesthetic, simple singlet"*
- **Adds text/logos despite asking not to** → add *"absolutely no text, no letters, no numbers, no logos anywhere in the image"*
- **Two characters become one merged figure** → simplify to one character or describe distance: *"two distinct separate figures, clearly apart from each other"*
- **Lighting is flat / not neon enough** → emphasize *"strong neon side lighting, dark shadows, high contrast"*
