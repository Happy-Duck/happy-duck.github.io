# CLAUDE.md — working on this site

Rishi Garhyan's deep-sea portfolio (happy-duck.github.io). React 19 + Vite 8
+ Tailwind v4 + Framer Motion. The page is a side-on cross-section of the
ocean: scrolling = diving 0–6,000 m. Read this whole file before touching
the ocean systems; `docs/FEATURE_PLAN.md` (wave 1) and
`docs/GRAPHICS_PLAN.md` (wave 2: WebGPU/WebGL/XR features) hold the
feature-by-feature history, specs, and hard-won gotchas.

## Commands

- `npm run dev` — dev server on :5173 (watcher ignores `public/` — OneDrive
  locks freshly-dropped files and crashes fs.watch with EBUSY otherwise)
- `npm run lint` — MUST stay at zero errors/warnings before every commit
- `npm run build` — prod build (bundle ≈ 410 kB / 132 kB gzip; devicons are
  imported per-icon from `devicons-react/lib/icons/*` — never from the
  package index, it's CJS and ships ~3,000 icons)
- `npm run deploy` — build + push `dist/` to the `gh-pages` branch. This is
  the ONLY thing that changes the live site; merging to master does not.

## Core architecture — the depth system

- `src/context/OceanDepthContext.jsx` owns a single rAF loop. Scroll maps
  to a 0–1 depth fraction; per-frame it writes CSS vars on `:root`
  (`--ocean-depth-progress`, `--ocean-bg-color`, `--beach-op`,
  `--particle-opacity`, …) and flips `data-theme`
  (shallow-reef ↔ deep-sea, hysteresis at 0.30/0.40).
- Creatures/effects register tick callbacks via `subscribe(fn)` from the
  context — never their own rAF (exceptions: the footer crab, the WebGL
  canvas). Under `prefers-reduced-motion`, subscribers only tick while
  depth changes; pure-CSS loops are stilled by the media-query block in
  `index.css`; Framer respects it via `MotionConfig reducedMotion="user"`.
- **Meters ↔ scroll is PIECEWISE, not linear.** Zone scroll fractions are
  tuned for pacing (sunlit 0–0.20, twilight 0.20–0.50, midnight 0.50–0.72,
  abyssal 0.72–1.0) while meters follow the real ranges (0–200, 200–1,000,
  1,000–4,000, 4,000–6,000). Always convert with `metersAt()` /
  `depthAtMeters()` in `src/constants/depthZones.js`. Never `x * 6000`.

## Creatures

- Simple swimmers use `src/hooks/useCreatureAI.js` (sinusoidal path, mouse
  flee, peer repulsion). Bespoke ones (Anglerfish, Squid, GiantSquid,
  SnailFish, jellies) follow the same skeleton: subscribe → compute
  `creatureOpacity(depth, DEPTH_RANGE)` → early-return when invisible →
  move state in a ref → write `el.style.transform/opacity` directly (no
  React state in the hot path).
- Vertical placement: `depthTraverse(depth, range, vh)` sweeps a creature
  bottom→top across its own enter→exit window (±30 vh around its lane) —
  the diver sinks past it. Each creature LOW-PASS FILTERS the traverse
  (`p.trav += (target - p.trav) * 0.07`, snap when null) or fast scrolling
  teleports them. Jellyfish manage their own bottom-reset drift instead.
- A new creature needs: DEPTH_RANGE fractions consistent with its claimed
  meters (use the helpers), `tickSeen('<id>')` when opacity ≥ 0.5 (dive
  log), `pingImpulse()` scatter reaction (sonar), an entry in
  `src/constants/species.js`, and a real photo cutout in
  `public/creatures/` — the owner strongly prefers real photos over
  drawn/generated art everywhere (whale + shipwreck are graded photos).

## Feature systems (event contracts)

- **Dive log** (`src/lib/diveLog.js`): persistence in localStorage under
  the `ocean.*` namespace, always try/catch (private mode). Discovery
  fires `window` CustomEvent `ocean:discovery`. ~1.5 s cumulative
  visibility (90 ticks) = discovered; `markSeen()` is immediate.
- **Terminal** (`src/components/Terminal.jsx`): opens on typed `cmd` or
  backtick or the `>_` fab. Commands dispatch events other systems listen
  for: `ocean:ping` (sonar), `ocean:summon-whale`, `ocean:set-tod` (live
  palette swap re-patching BG stops + ray uniforms). Debug commands live
  under `debug`: `tod`, `depth <m>`, `reset`. New debug tooling goes HERE,
  not as UI buttons.
- **Sonar** (`src/lib/sonar.js`): clicks outside `a,button,input,
  [data-no-ping]` fire pings. Put `data-no-ping` on any new interactive
  surface.
- **Time of day** (`src/constants/timeOfDay.js` + pre-paint script in
  `index.html` — keep hexes in sync): dawn/dusk tint water stops, waves,
  glow, sky gradient (`--tod-sky-grad`), and god-ray uniforms coherently;
  NIGHT INTENTIONALLY RENDERS AS DAY (dark sea would need light hero text).
- **God rays** (`src/components/Caustics.jsx`): raw WebGL2, buffer-less
  fullscreen triangle, half-res. Caustic webs were rejected — wrong physics
  for a side view. Never call `WEBGL_lose_context.loseContext()` in effect
  cleanup: StrictMode remounts inherit a dead context that paints opaque
  white.

## GPU / advanced-web systems (wave 2)

- **BoidSchool** (`creatures/BoidSchool.jsx`): WebGPU compute boids,
  ~380 fish, band 0.04–0.48. Rendered as textured quads carrying
  `public/creatures/anchovy.png` (real photo cutout, CC BY-SA 4.0
  Ebachiller/Wikimedia — keep the attribution comment); mips are uploaded
  as pre-scaled ImageBitmaps (no auto mipgen in WebGPU); v-flip when
  dir.x<0 or leftward fish swim belly-up. No `navigator.gpu` OR failed
  sprite fetch → transparent canvas, sprites carry the scene.
  Headless-testable with Edge flags `--enable-unsafe-webgpu
  --enable-features=Vulkan --use-webgpu-adapter=swiftshader`; judge
  WebGPU/WebGL canvases via page.screenshot — drawImage readback is
  blank between frames.
- **Water ripples: REMOVED, don't rebuild.** Two attempts died in wave
  2/2.1 (top-down 2D field: wrong physics for a side view; edge-on 1D
  waterline splash: owner tried it live and cut it). The SVG waves own
  the surface; sonar owns ALL open-water clicks. History + wave-sim
  laws (FBO clears, NaN scrub, dimension-dependent c² limits) live in
  docs/GRAPHICS_PLAN.md §2.
- **DeepParticles** (`DeepParticles.jsx`): GPU snow, motion computed in
  the vertex shader from seeds+time; brightens inside the beam; adds
  `:root.gpu-snow` which stands the CSS snow down.
- **Rays worker** (`lib/raysRenderer.js` + `workers/rays.worker.js` +
  `Caustics.jsx`): OffscreenCanvas rendering off-main-thread. NEVER
  re-transfer or terminate: worker is stashed on the canvas element and
  reused across StrictMode remounts; post transitions only.
- **XRDive** (`XRDive.jsx` + `lib/xrScene.js`): three.js via dynamic
  import (own lazy chunk — keep it that way); fab renders only where
  immersive-vr is supported; terminal `vr` command.
- **View Transitions** (`Projects.jsx`): card↔modal morph; the vt name is
  owned by ONE element per snapshot (card when closed, modal when open);
  framer/AnimatePresence stand down when VT is active.
- **Scroll-driven animations** (`index.css` @supports block): depth fades
  on the compositor; keyframe percentages MUST mirror the JS ramps —
  update both together.
- **GyroParallax** (`GyroParallax.jsx`): tilt → `--tilt-x/-y` on coarse
  pointers; CSS consumes under `(pointer: coarse)`.

## z-index map

0 backdrop · 1 caustics+water surface · 2 overlays, whale(reef) ·
3 creatures · 4 snow/plankton · 5 ROV darkness · 6 sonar rings, bio trail ·
10 content · 11 whale(deep, glides OVER content) · 50 sidebar/gauge ·
60 fabs (dive log, console) · 65 floor stamp · 70 toasts · 80 terminal ·
90 case-study modal (PORTALED to body — sections create stacking contexts
that trap fixed children) · 100 skip link.

## Verification workflow (do this before every commit)

No chromium-cli/playwright here. Use system Edge:
`npm i --no-save playwright-core`, then
`chromium.launch({ channel: 'msedge', headless: true })`. Write a throwaway
`smoke.mjs`, screenshot, READ the screenshots (visuals lie in DOM checks),
delete the artifacts, `npm prune`. Scroll depth correctly:
`max = scrollHeight - innerHeight; scrollTo(0, max * fraction)` — and
remember `depth N` in the terminal for meter-accurate jumps. Fake the clock
with `context.addInitScript(() => { Date.prototype.getHours = () => 18 })`.

## React gotchas already paid for (dev runs StrictMode)

- No side effects (timers!) inside setState updaters — they run twice and
  fork exponentially (the Captain's Log typewriter bug).
- No sync setState in effect bodies — subscribe to the depth loop or
  restructure (FloorStamp, useElapsed via useSyncExternalStore).
- No `Math.random()`/`Date.now()` during render — seed in module scope,
  effects, or first tick (lint enforces via react-hooks purity rules).
- GitHub events API strips `payload.commits` for browser-origin requests —
  fall back to ref/head (useGithubActivity).

## Conventions & owner preferences

- Real photos over generated/drawn art, always. Grade them with CSS filters
  (see `.shipwreck-img`, whale theme filters) to sit in the scene.
- Commit per feature/fix with explanatory messages; ALWAYS `git push`
  immediately after committing. Update `docs/FEATURE_PLAN.md` when adding
  features. Never commit `.claude/settings.local.json`.
- PowerShell 5.1: no `&&`, and double quotes inside `git commit -m`
  here-strings get mangled — avoid quotes in commit messages.
- Iterate visually: screenshot → judge → adjust. The owner reviews look and
  feel; expect several rounds on anything visual.
