# Graphics Expansion — Wave 2 Feature Plan

Branch: `feature/graphics-expansion`. Eight features, implemented in listed
order (ranked by impressiveness), one commit each, verified in headless
Edge before committing. This doc is the handoff artifact — update statuses
as you go. Conventions from CLAUDE.md apply everywhere: zero lint, reduced
motion, `data-no-ping` on interactive surfaces, real-photo art only,
feature-detect + graceful absence for every new API.

## 1. WebGPU boids — school of fish — [x] DONE

Compute-shader flocking (separation/alignment/cohesion) for ~400 fish,
rendered as instanced oriented triangles on a transparent canvas at the
creature layer (z-3). Mouse repels the school; sonar pings scatter it
(read `getPing()` and upload as uniforms). Depth-gated to the sunlit→
twilight band (~0.04–0.48) with creatureOpacity-style fade on the canvas
element. `navigator.gpu` absent → render nothing (sprite creatures remain).
Reduced motion → skip entirely. Pause when tab hidden or out of band.
Files: `src/components/creatures/BoidSchool.jsx`, App mount, CSS.
NOTE: headless Edge may lack WebGPU — try launch flags
`--enable-unsafe-webgpu --use-webgpu-adapter=swiftshader`; if unavailable,
verify the no-WebGPU path headless and screenshot on best effort.

## 2. Interactive water ripples — [x] DONE

WebGL2 height-field wave sim (ping-pong float FBOs: next = 2·curr − prev +
c²·∇²curr, damped) across the top ~22vh, opacity tied to `--beach-op`.
Cursor movement over the band drags wakes; clicks drop ripples (also listen
for `ocean:ping` in-band). Shade height→normal into soft white/cyan
highlights, transparent elsewhere. Needs `EXT_color_buffer_float` → without
it render nothing. Reduced motion → skip. z-index 1 with the water surface.
Files: `src/components/WaterSim.jsx`, App, CSS.

## 3. Volumetric ROV beam + GPU marine snow — [ ] TODO

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

## 4. WebXR dive mode — [ ] TODO

`three` as a DYNAMIC import (code-split; loads only on entry). Scene:
depth-gradient sky sphere, creature photo billboards drifting at their real
depths, wreck sprite on a sand plane, floating dive-log panel. Thumbstick
or gaze-drift descend. Entry points: terminal `vr` command + a fab shown
ONLY when `navigator.xr?.isSessionSupported('immersive-vr')` resolves true
(hidden on ordinary desktops). Exit returns cleanly, renderer disposed.
Headless can't test XR: verify support-detection path, chunk splitting in
the build, and that unsupported browsers never see the button.
Files: `src/components/XRDive.jsx` (+ lazy `src/lib/xrScene.js`), Terminal,
App, CSS, package.json (three).

## 5. View Transitions modal morph — [ ] TODO

Case-study card ↔ modal morph via `document.startViewTransition` +
`flushSync`; assign a shared `view-transition-name: case-study` to the
clicked card and the modal while transitioning. When VT is supported,
suppress the framer scale/fade so animations don't double; without support,
current framer behavior unchanged. Respect reduced motion (skip VT).
Files: `src/components/Projects.jsx`, CSS (`::view-transition-*` tuning).

## 6. CSS scroll-driven animations — [ ] TODO

Inside `@supports (animation-timeline: scroll())`: drive `.marine-snow-wrap`,
`.plankton-wrap`, `.water-surface`, `.caustics-canvas`, and `.rov-dark`
opacities from `scroll(root)` timelines (keyframes matching the current JS
ramps). CSS animations outrank the var-based declarations in the cascade,
so supported browsers get compositor-driven fades while the JS var path
remains as the universal fallback (JS keeps running — it feeds other
consumers). Verify: computed opacity at depths matches previous behavior.
Files: `src/index.css` only.

## 7. Gyroscope parallax (mobile) — [ ] TODO

`src/components/GyroParallax.jsx`: on `(pointer: coarse)` devices, listen
to `deviceorientation` (iOS: request permission on first touchend —
requires a user gesture), lerp beta/gamma into `--tilt-x/--tilt-y` CSS vars
on :root (clamped ±1, smoothed via rAF). CSS consumes them under a coarse
pointer media query: creature layer + whale track translate ±18px, and the
`.rov-beam` resting position shifts with tilt (safe: RovLight never attaches
mousemove on touch, so CSS transform isn't overridden there). Verify by
dispatching synthetic DeviceOrientationEvents headless.
Files: GyroParallax.jsx, App, CreatureLayer (className hook), CSS.

## 8. OffscreenCanvas worker for the god rays — [ ] TODO

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
| 3 | Beam+Snow | — | — |
| 4 | WebXR | — | — |
| 5 | View Transitions | — | — |
| 6 | Scroll timelines | — | — |
| 7 | Gyro | — | — |
| 8 | Worker rays | — | — |

## Notes / decisions

- WebGPU IS testable headless: launch Edge with `--enable-unsafe-webgpu
  --enable-features=Vulkan --use-webgpu-adapter=swiftshader`. drawImage
  readback from a WebGPU canvas returns blank between frames — judge via
  page.screenshot (composited) instead.
