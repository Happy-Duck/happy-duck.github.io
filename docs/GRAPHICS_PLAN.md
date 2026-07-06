# Graphics Expansion — Wave 2 Feature Plan

Branch: `feature/graphics-expansion`. Eight features, implemented in listed
order (ranked by impressiveness), one commit each, verified in headless
Edge before committing. This doc is the handoff artifact — update statuses
as you go. Conventions from CLAUDE.md apply everywhere: zero lint, reduced
motion, `data-no-ping` on interactive surfaces, real-photo art only,
feature-detect + graceful absence for every new API.

## 1. WebGPU boids — school of fish — [x] DONE (re-skinned in wave 2.1)

Compute-shader flocking (separation/alignment/cohesion) for ~400 fish on
a transparent canvas at the creature layer (z-3). Mouse repels the
school; sonar pings scatter it (read `getPing()` and upload as uniforms).
Depth-gated to the sunlit→twilight band (~0.04–0.48) with
creatureOpacity-style fade on the canvas element. `navigator.gpu` absent
→ render nothing (sprite creatures remain). Reduced motion → skip
entirely. Pause when tab hidden or out of band.
Rendering (wave 2.1, owner feedback: "triangles don't make sense"):
instanced textured quads carrying a real anchovy photo cutout —
`public/creatures/anchovy.png` (192×30, from Engraulis encrasicolus,
arrainak.eus.png, Ebachiller / Wikimedia Commons, **CC BY-SA 4.0** —
keep the attribution), oriented along velocity, v-flipped when swimming
left so fish are never belly-up. Mip levels are uploaded as pre-scaled
ImageBitmaps (WebGPU has no auto mipgen; unmipped 4–10× minification
shimmers). Backing store is DPR-scaled (≤2); sim/NDC stay in CSS px via
P.res.
Files: `src/components/creatures/BoidSchool.jsx`, App mount, CSS.
NOTE: headless Edge may lack WebGPU — try launch flags
`--enable-unsafe-webgpu --use-webgpu-adapter=swiftshader`; if unavailable,
verify the no-WebGPU path headless and screenshot on best effort.

## 2. Interactive water ripples — REMOVED in wave 2.1

Two attempts, both retired. v1 was a top-down 2D height-field ripple
sim across the top 22vh — rejected by the owner: top-down rings are the
wrong physics for a side-on cross-section (exactly the reason caustic
webs were rejected), and it reacted to the mouse anywhere in the band,
even over hero text. v2 reworked it into a 1D wave equation along the
waterline rendered edge-on (crest displaces, disturbance propagates
left/right) — physically coherent, but the owner judged it didn't work
in practice either, so the whole feature came out. The SVG waves in
`WaterSurface.jsx` own the surface alone; SonarPing owns all open-water
clicks again (the surface-click carve-out is gone).
If surface interactivity ever returns, start from the wave-sim lessons
in the notes below and the two dead approaches in git history
(2D: pre-dc806e7, 1D edge-on: dc806e7..removal commit).

## 3. Volumetric ROV beam + GPU marine snow — [x] DONE

WebGL2 point sprites (~2000) whose positions are computed IN THE VERTEX
SHADER from seed+time (zero per-frame buffer uploads), drifting down with
slight sway. Brightness = dim base + strong boost inside the headlight cone
around the cursor (uniform), so the beam reveals swirling particulate —
volumetric feel. Active only depth > ~0.45, canvas z-index 5 (with the
darkness), fade via depth uniform. When active, add `gpu-snow` class on
:root hiding the CSS `.marine-snow-wrap` (which remains the fallback for
no-WebGL/reduced-motion). Touch devices: beam rests at the CSS default
spot (50vw/38vh) — use the same fallback position.
Files: `src/components/DeepParticles.jsx`, RovLight coordination, CSS.

## 4. WebXR dive mode — [x] DONE (rebuilt wave 2.2)

`three` as a DYNAMIC import (code-split; loads only on entry). The first
scene shipped placeholder-quality and was rebuilt after the owner called
it in July 2026. What went wrong, so it stays fixed:
- `clock.getElapsedTime()` then `clock.getDelta()` — getElapsedTime
  consumes the delta internally, so dt ≈ 0 and every creature was FROZEN;
  the 40 m/s descent constant only felt sane because it multiplied ~0.
  The loop now derives dt from `setAnimationLoop`'s timestamp.
- Billboards were `THREE.Sprite`s with a hardcoded 0.6 aspect: photos
  stretched, and full billboarding pitches fish flat when the wearer
  looks down. Now yaw-only planes sized from each texture's real aspect.
- No `SRGBColorSpace` on textures → washed-out colors (r152+ default).
- `squid.jpg` (white-background JPEG) floated as an opaque rectangle;
  dropped. `deepJellyfish.webp` (dark bg, screened in 2D) renders
  additive so the backdrop vanishes and the medusa glows.
Current scene: 26 m water column mapped to 0–6,000 m through
`depthAtMeters()` (creatures hang at their real zone depths, HUD meter
readout uses `metersAt()` like the page gauge), wander-steered swim paths
with smooth direction mirroring, whale silhouette in the fog band,
depth-driven water color + FogExp2 density, marine snow points, additive
surface light shafts + sun glow, speckled sand floor, wreck close enough
to loom through bottom fog. Controls: thumbstick Y (~2.4 m/s max),
trigger/pinch to sink + grip to rise (hand tracking exposes no gamepad).
Entry: terminal `vr` command + a fab shown ONLY when
`navigator.xr?.isSessionSupported('immersive-vr')` resolves true. Exit
disposes everything. Terminal debug `vr preview` renders the SAME scene
without a headset (drag look / scroll dive / Esc) — it exposes
`window.__xrPreview.{setSink,setView,close}` so headless Edge can
screenshot every depth band; that is the verification path.
Files: `src/components/XRDive.jsx` (+ lazy `src/lib/xrScene.js`), Terminal,
App, CSS, package.json (three).

## 5. View Transitions modal morph — [x] DONE

Case-study card ↔ modal morph via `document.startViewTransition` +
`flushSync`; assign a shared `view-transition-name: case-study` to the
clicked card and the modal while transitioning. When VT is supported,
suppress the framer scale/fade so animations don't double; without support,
current framer behavior unchanged. Respect reduced motion (skip VT).
Files: `src/components/Projects.jsx`, CSS (`::view-transition-*` tuning).

## 6. CSS scroll-driven animations — [x] DONE

Inside `@supports (animation-timeline: scroll())`: drive `.marine-snow-wrap`,
`.plankton-wrap`, `.water-surface`, `.caustics-canvas`, and `.rov-dark`
opacities from `scroll(root)` timelines (keyframes matching the current JS
ramps). CSS animations outrank the var-based declarations in the cascade,
so supported browsers get compositor-driven fades while the JS var path
remains as the universal fallback (JS keeps running — it feeds other
consumers). Verify: computed opacity at depths matches previous behavior.
Files: `src/index.css` only.

## 7. Gyroscope parallax (mobile) — [x] DONE

`src/components/GyroParallax.jsx`: on `(pointer: coarse)` devices, listen
to `deviceorientation` (iOS: request permission on first touchend —
requires a user gesture), lerp beta/gamma into `--tilt-x/--tilt-y` CSS vars
on :root (clamped ±1, smoothed via rAF). CSS consumes them under a coarse
pointer media query: creature layer + whale track translate ±18px, and the
`.rov-beam` resting position shifts with tilt (safe: RovLight never attaches
mousemove on touch, so CSS transform isn't overridden there). Verify by
dispatching synthetic DeviceOrientationEvents headless.
Files: GyroParallax.jsx, App, CreatureLayer (className hook), CSS.

## 8. OffscreenCanvas worker for the god rays — [x] DONE

Extract the ray renderer into `src/lib/raysRenderer.js` (takes canvas-like +
returns { setTod, setVisible, resize, drawOnce }). `Caustics.jsx` feature-
detects `transferControlToOffscreen`: supported → spin
`src/workers/rays.worker.js` (Vite `new Worker(new URL(...), {type:
'module'})`), post init/resize/tod/visibility messages, worker runs its own
rAF; unsupported → current main-thread path via the same renderer module.
CRITICAL StrictMode traps: `transferControlToOffscreen()` throws on second
call — mark the canvas (WeakSet) and reuse the worker on remount; never
terminate the worker in cleanup (the canvas can't be re-transferred), just
post a stop message. Depth/tab gating moves to messages.
Files: raysRenderer.js, rays.worker.js, Caustics.jsx.

## Completion log

| # | Feature | Commit | Verified |
|---|---------|--------|----------|
| 1 | Boids | feat: webgpu boids | headless Edge + swiftshader flags — schools verified in screenshot |
| 2 | Ripples | feat: interactive water ripples | ripple ring visible in zoomed screenshot; surface clicks no longer double-fire sonar |
| 3 | Beam+Snow | feat: gpu marine snow | beam-lit particle cloud verified in screenshot |
| 4 | WebXR | feat: webxr dive mode → feat: rebuild the VR dive scene | rebuilt wave 2.2 (frozen-dt bug, stretched sprites); verified via `vr preview` screenshots at 7 depths in headless Edge; chunk still lazy; needs a real Quest test by owner |
| 5 | View Transitions | feat: view-transition morph | morph captured mid-flight in screenshot; open/close/reopen verified |
| 6 | Scroll timelines | feat: scroll-driven fades | computed opacities match JS ramps exactly at 4 depths |
| 7 | Gyro | feat: gyro parallax | synthetic DeviceOrientationEvent shifts layers under mobile emulation |
| 8 | Worker rays | feat: worker rays + water sim hardening | worker path confirmed; tod messaging works |
| 2.1a | Boid re-skin | feat: boids wear a real anchovy photo | schools + upright orientation both directions verified in dpr-1 and dpr-2 screenshots |
| 2.1b | Edge-on splash | feat: ripples become an edge-on waterline splash | click splash, drag wake, and sonar handoff below the band all verified in screenshots |
| 2.1c | Ripples removed | refactor: retire the water ripple sim | owner call after trying 2.1b live; sonar owns surface clicks again, verified headless |

## Notes / decisions

- WebGPU IS testable headless: launch Edge with `--enable-unsafe-webgpu
  --enable-features=Vulkan --use-webgpu-adapter=swiftshader`. drawImage
  readback from a WebGPU canvas returns blank between frames — judge via
  page.screenshot (composited) instead.
- Wave-sim hard lessons: (1) texImage2D(null) is NOT reliably zero-filled
  on every driver — clear FBOs explicitly after allocation, and scrub
  NaN in the sim shader (NaN × damping = NaN forever). (2) FDTD stability
  limits are dimension-dependent: c² = 0.5 in 2D (run 0.42), c² = 1.0 in
  1D (run 0.9) — at the limit the field saturates with ringing. (3) R16F
  is LINEAR-filterable in core WebGL2 — NEAREST at low sim res reads as
  blocky confetti.
- Side-view physics is a real constraint, not a style note: top-down
  ripple fields joined caustic webs on the rejected list. If an effect's
  mental model is "seen from above", it doesn't belong on this site.
- WebGPU sprite textures: upload mips as pre-scaled ImageBitmaps
  (`createImageBitmap(blob, { resizeWidth, resizeHeight })` per level) —
  no blit pipeline needed, and minified sprites stop shimmering.
